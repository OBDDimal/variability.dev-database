<template>
    <div>
        <feature-model-tree-toolbar
            @search="onChangeSearch"
            @coloring="onChangeColoring"
            @fitToView="zoomFit"
            @resetView="(levels, maxChildren) => resetView(levels, maxChildren)"
            @shortName="onChangeShortName"
            @verticalSpacing="onChangeVerticalSpacing"
            @export="$emit('exportToXML')"
        ></feature-model-tree-toolbar>
        <div id="svg-container"></div>

        <feature-model-tree-context-menu
            :d3Node="contextMenuD3Node"
            :d3NodeEvent="contextMenuD3NodeEvent"
            @collapse="
				(d3Node) => {
					d3Node.data.toggleCollapse();
					updateCollapsing();
					updateSvg();
				}
			"
            @hideLeftSiblings="(d3Node) => hideLeftSiblings(d3Node)"
            @hideRightSiblings="(d3Node) => hideRightSiblings(d3Node)"
            @hideCurrentNode="(d3Node) => hideCurrentNode(d3Node)"
            @edit="(d3Node) => (editD3Node = d3Node)"
            @close="contextMenuD3Node = undefined"
            @add="(d3Node) => (d3ParentOfAddNode = d3Node)"
        ></feature-model-tree-context-menu>

        <feature-model-tree-edit-dialog
            :d3Node="editD3Node"
            @close="editD3Node = undefined"
            @update="updateSvg"
        ></feature-model-tree-edit-dialog>

        <feature-model-tree-add-dialog
            :parent="d3ParentOfAddNode ? d3ParentOfAddNode.data : undefined"
            @close="d3ParentOfAddNode = undefined"
            @add="(newNode) => addNode(newNode)"
        ></feature-model-tree-add-dialog>
    </div>
</template>

<script>
import Vue from 'vue';
import * as d3 from 'd3';
import levenshtein from 'js-levenshtein';
import {flextree} from 'd3-flextree';
import * as CONSTANTS from '../../classes/constants';
import {FeatureNode, PseudoNode} from '@/classes/featureNode';
import {createGroupSegment, createLink} from '@/classes/createSvgPaths';
import FeatureModelTreeToolbar from './FeatureModelTreeToolbar.vue';
import FeatureModelTreeContextMenu from './FeatureModelTreeContextMenu.vue';
import FeatureModelTreeEditDialog from './FeatureModelTreeEditDialog.vue';
import FeatureModelTreeAddDialog from "@/components/FeatureModel/FeatureModelTreeAddDialog";

export default Vue.extend({
    name: 'FeatureModelTree',

    components: {
        FeatureModelTreeToolbar,
        FeatureModelTreeContextMenu,
        FeatureModelTreeEditDialog,
        FeatureModelTreeAddDialog,
    },

    props: {
        rootNode: undefined,
    },

    data: () => ({
        flexLayout: undefined,
        rootD3Node: undefined,
        allD3Nodes: undefined,
        zoom: undefined,
        dragListener: undefined,
        dragStarted: false,
        dragSelectedNode: undefined,
        dragSelectedGhostNode: undefined,
        highlightedConstraintsContainer: undefined,
        linksContainer: undefined,
        segmentsContainer: undefined,
        featureNodesContainer: undefined,
        dragContainer: undefined,
        isShortenedName: false,
        nodeIdCounter: 0,
        isColorCoded: false,
        verticalSpacing: 75,
        contextMenuD3Node: undefined,
        contextMenuD3NodeEvent: undefined,
        editD3Node: undefined,
        d3ParentOfAddNode: undefined,
    }),

    computed: {},

    mounted() {
        this.initialize();
    },

    methods: {
        initialize() {
            // Flexlayout belongs to a d3-plugin that calculates the width between all nodes dynamically.
            this.flexLayout = flextree()
                .nodeSize((d3Node) => [
                    this.calcRectWidth(d3Node) + CONSTANTS.SPACE_BETWEEN_NODES_HORIZONTALLY,
                    CONSTANTS.RECT_HEIGHT + this.verticalSpacing,
                ])
                .spacing((d3NodeA, d3NodeB) => d3NodeA.path(d3NodeB).length)

            // Create root-feature-node with d3 and the data of the feature-model.
            this.rootD3Node = d3.hierarchy(this.rootNode, (d3Node) => d3Node.children);
            this.allD3Nodes = this.rootD3Node.descendants();
            this.allD3Nodes.forEach((d3Node) => (d3Node.allChildren = d3Node.children));

            this.zoom = d3
                .zoom()
                //.scaleExtent([0.1, 8])
                .on('zoom', (event) => svgContent.attr('transform', event.transform));

            // Create svg-container.
            const svg = d3
                .select('#svg-container')
                .append('svg')
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .attr(
                    'viewBox',
                    -CONSTANTS.SVG_WIDTH / 2 + ' ' + -CONSTANTS.SVG_MARGIN.top + ' ' + CONSTANTS.SVG_WIDTH + ' ' + CONSTANTS.SVG_HEIGHT
                )
                .on('click', () => (this.contextMenuD3Node = null)) // Click listener for closing all context-menus.
                .call(this.zoom); // Zooming and penning.

            const svgContent = svg.append('g');

            this.highlightedConstraintsContainer = svgContent.append('g').classed('highlighted-constraints-container', true);

            this.linksContainer = svgContent.append('g').classed('link-container', true);

            this.segmentsContainer = svgContent.append('g').classed('segments-container', true);

            this.featureNodesContainer = svgContent.append('g').classed('feature-node-container', true);

            this.dragContainer = svgContent.append('g').classed('drag-container', true);

            this.dragListener = d3
                .drag()
                .on('start', (event, d3Node) => {
                    if (d3Node === this.rootD3Node) return;
                    this.dragSelectedNode = d3Node;
                    this.dragStarted = true;
                })
                .on('drag', (event, d3Node) => {
                    if (d3Node === this.rootD3Node) return;

                    if (this.dragStarted) {
                        this.updateGhostCircles();
                        this.dragStarted = false;
                    }

                    // Transform current node.
                    this.featureNodesContainer.selectAll('g.node').data([d3Node], (d3Node) => d3Node.id).attr('transform', `translate(${event.x}, ${event.y})`)
                })
                .on('end', (_, d3Node) => {
                    if (d3Node === this.rootD3Node) return;
                    const nodeSelection = this.featureNodesContainer.selectAll('g.node').data([d3Node], (d3Node) => d3Node.id);
                    nodeSelection.select('g.rect-and-text').attr('pointer-events', 'mouseover');

                    // Remove ghost circles.
                    this.dragContainer.selectAll('circle.ghost-circle').remove();

                    if (this.dragSelectedGhostNode) {
                        // Remove dragged node from tree.
                        d3Node.parent.allChildren = d3Node.parent.allChildren.filter((node) => d3Node !== node);
                        d3Node.data.parent.children = d3Node.data.parent.children.filter((node) => d3Node.data !== node);

                        // Insert dragged node as neighbour of selected node.
                        if (this.dragSelectedGhostNode.side === 'l' || this.dragSelectedGhostNode.side === 'r') {
                            // Insert as new child.
                            const dIndex = this.dragSelectedGhostNode.side === 'l' ? 0 : 1;
                            let d3Index = this.dragSelectedGhostNode.d3Node.parent.allChildren.indexOf(this.dragSelectedGhostNode.d3Node) + dIndex;
                            let index = this.dragSelectedGhostNode.d3Node.data.parent.children.indexOf(this.dragSelectedGhostNode.d3Node.data) + dIndex;
                            this.dragSelectedGhostNode.d3Node.parent.allChildren.splice(d3Index, 0, d3Node);
                            this.dragSelectedGhostNode.d3Node.data.parent.children.splice(index, 0, d3Node.data);

                            // Update member variables of nodes.
                            d3Node.parent.children = d3Node.parent.allChildren;
                            this.dragSelectedGhostNode.d3Node.parent.children = this.dragSelectedGhostNode.d3Node.parent.allChildren;
                            d3Node.data.parent = this.dragSelectedGhostNode.d3Node.data.parent;
                            d3Node.parent = this.dragSelectedGhostNode.d3Node.parent;
                        } else if (this.dragSelectedGhostNode.side === 'b') {
                            if (this.dragSelectedGhostNode.d3Node.data.isLeaf()) {
                                d3Node.parent.children = d3Node.parent.allChildren;
                                d3Node.parent = this.dragSelectedGhostNode.d3Node;
                                this.dragSelectedGhostNode.d3Node.allChildren = [d3Node];
                                this.dragSelectedGhostNode.d3Node.children = this.dragSelectedGhostNode.d3Node.allChildren;

                                d3Node.data.parent = this.dragSelectedGhostNode.d3Node.data;
                                this.dragSelectedGhostNode.d3Node.data.children = [d3Node.data];
                            }
                        }

                        this.dragSelectedGhostNode = undefined;
                    }

                    this.updateSvg();
                });

            this.resetView();
            this.updateSvg();
        },

        updateGhostCircles() {
            const dragChildren = this.dragSelectedNode.descendants();
            const allOtherNodes = this.rootD3Node.descendants().slice(1).filter((node) => !dragChildren.includes(node));
            const rightGhostNodes = allOtherNodes.map((node) => ({d3Node: node, side: 'r'}));
            const leftGhostNodes = allOtherNodes.filter((node) => node === node.parent.children[0]).map((node) => ({
                d3Node: node,
                side: 'l'
            }));
            const bottomGhostNodes = allOtherNodes.filter((node) => node.data.isLeaf() || node.data.isCollapsed).map((node) => ({
                d3Node: node,
                side: 'b'
            }))
            const dragNodes = [...rightGhostNodes, ...leftGhostNodes, ...bottomGhostNodes];

            // Remove all children nodes under the current node and also the links between them.
            this.featureNodesContainer.selectAll('g.node').data(dragChildren.slice(1), (d3Node) => d3Node.id).remove();
            this.linksContainer.selectAll('path.link').data(dragChildren, (d3Node) => d3Node.id).remove();
            this.segmentsContainer.selectAll('path').data(dragChildren, (d3Node) => d3Node.id).remove();

            // Add ghost circles left and right to all nodes
            const ghostCircles = this.dragContainer
                .selectAll('circle.ghost-circle')
                .data(dragNodes, (ghostNode) => ghostNode.d3Node.id + ghostNode.side);

            const ghostCirclesEnter = ghostCircles
                .enter()
                .append('circle')
                .classed('ghost-circle', true)
                .on('mouseover', (_, ghostNode) => this.overGhostNode(ghostNode))
                .on('mouseout', () => this.outGhostNode());

            ghostCirclesEnter.merge(ghostCircles)
                .attr('transform', (ghostNode) => this.calcGhostCircleTransform(ghostNode));

            ghostCircles.exit().remove();
        },

        calcGhostCircleTransform(ghostNode) {
            const y = ghostNode.d3Node.y;
            let dx = 0;

            const x = ghostNode.d3Node.x;
            let dy = 0;

            switch (ghostNode.side) {
                case 'l':
                    dx += this.calcRectWidth(ghostNode.d3Node) / 2 + CONSTANTS.SPACE_BETWEEN_NODES_HORIZONTALLY / 2;
                    dx *= -1;
                    dy = CONSTANTS.RECT_HEIGHT / 2;
                    break;
                case 'r':
                    dx += this.calcRectWidth(ghostNode.d3Node) / 2 + CONSTANTS.SPACE_BETWEEN_NODES_HORIZONTALLY / 2;
                    dx *= 1;
                    dy = CONSTANTS.RECT_HEIGHT / 2;
                    break;
                case 'b':
                    dy = CONSTANTS.RECT_HEIGHT;
                    dx = 0;
                    break;
            }
            return `translate(${x + dx}, ${y + dy})`;
        },

        updateFeatureNodes(visibleD3Nodes) {
            const featureNode = this.featureNodesContainer.selectAll('g.node').data(
                visibleD3Nodes.filter((d3Node) => d3Node.data instanceof FeatureNode),
                (d3Node) => d3Node.id || (d3Node.id = ++this.nodeIdCounter)
            );

            // Enter new nodes
            const featureNodeEnter = featureNode
                .enter()
                .append('g')
                .classed('node', true)
                .call(this.dragListener)
                .on('contextmenu', (event, d3Node) => {
                    event.preventDefault();
                    this.contextMenuD3Node = d3Node;
                    this.contextMenuD3NodeEvent = event;
                }) // Open contextmenu with right-click on d3Node.
                .on('click', (event, d3Node) => this.collapseShortcut(event, d3Node)); // Collapse d3Node with Ctrl + left-click on d3Node.

            const rectAndTextEnter = featureNodeEnter
                .append('g')
                .classed('rect-and-text', true);
            rectAndTextEnter
                .append('rect')
                .attr('height', CONSTANTS.RECT_HEIGHT);
            rectAndTextEnter
                .append('text')
                .attr('dy', CONSTANTS.RECT_HEIGHT / 2 + 5.5)
                .attr('font-size', CONSTANTS.FEATURE_FONT_SIZE);

            featureNodeEnter.append('circle').classed('and-group-circle', true).attr('r', CONSTANTS.MANDATORY_CIRCLE_RADIUS);

            const pseudoNode = this.featureNodesContainer.selectAll('g.pseudo-node').data(
                visibleD3Nodes.filter((d3Node) => d3Node.data instanceof PseudoNode),
                (d3Node) => d3Node.id || (d3Node.id = ++this.nodeIdCounter)
            );
            const pseudoNodeEnter = pseudoNode
                .enter()
                .append('g')
                .classed('pseudo-node', true)
                .on('click', (_, d3Node) => {
                    d3Node.data.unhideHiddenNodes();
                    this.updateHiding(d3Node.parent);
                    this.updateSvg();
                });
            pseudoNodeEnter.append('circle').attr('r', CONSTANTS.PSEUDO_NODE_SIZE);
            pseudoNodeEnter.append('text').attr('font-size', 30).attr('dy', 2).attr('dx', -12).text('...');

            // Update nodes
            const featureNodeUpdate = featureNodeEnter.merge(featureNode);
            featureNodeUpdate.attr('transform', (d3Node) => 'translate(' + d3Node.x + ', ' + d3Node.y + ')');
            featureNodeUpdate
                .select('.and-group-circle')
                .classed('mandatory-and-group-circle', (d3Node) => d3Node.parent && d3Node.parent.data.isAnd() && d3Node.data.isMandatory)
                .classed('optional-and-group-circle', (d3Node) => d3Node.parent && d3Node.parent.data.isAnd() && !d3Node.data.isMandatory);

            const rectAndTextUpdate = featureNodeUpdate.select('.rect-and-text');
            rectAndTextUpdate
                .select('rect')
                .classed('is-searched-feature', (d3Node) => d3Node.data.isSearched)
                .attr('fill', (d3Node) => (d3Node.data.isAbstract ? CONSTANTS.NODE_ABSTRACT_COLOR : d3Node.data.color))
                .attr('x', (d3Node) => -this.calcRectWidth(d3Node) / 2)
                .attr('width', (d3Node) => this.calcRectWidth(d3Node));
            rectAndTextUpdate
                .select('text')
                .attr('font-style', (d3Node) => (d3Node.data.isAbstract ? 'italic' : 'normal'))
                .attr('class', (d3Node) => {
                    const rgb = d3Node.data.color.replace(/[^\d,]/g, '').split(',');
                    if (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 > 186) {
                        return 'blackText';
                    } else {
                        return 'whiteText';
                    }
                })
                .text((d3Node) => (this.isShortenedName ? d3Node.data.displayName : d3Node.data.name));

            // Enter triangle with number of direct and total children.
            const childrenCount = featureNodeUpdate
                .selectAll('g.children-count')
                .data((d) => d.data.isLeaf() ? [] : [d], (d) => d.id);

            const childrenCountEnter = childrenCount
                .enter()
                .append('g')
                .classed('children-count', true);
            childrenCountEnter
                .append('polygon')
                .attr('fill', 'white')
                .attr('points', this.calculateTriangle());
            childrenCountEnter
                .append('text')
                .classed('children-count-text', true)
                .classed('direct-children', true)
                .attr('dy', 5)
                .attr('font-size', CONSTANTS.CHILREN_COUNT_FONT_SIZE);
            childrenCountEnter
                .append('text')
                .classed('children-count-text', true)
                .classed('total-children', true)
                .attr('dy', 15)
                .attr('font-size', CONSTANTS.CHILREN_COUNT_FONT_SIZE);

            const childrenCountUpdate = childrenCountEnter.merge(childrenCount);
            childrenCountUpdate
                .attr('transform', (d3Node) => 'translate(' + this.calcRectWidth(d3Node) / 2 + ', ' + CONSTANTS.RECT_HEIGHT + ')');
            childrenCountUpdate
                .selectAll('text.direct-children')
                .text((d3Node) => d3Node.data.childrenCount());
            childrenCountUpdate
                .selectAll('text.total-children')
                .text((d3Node) => d3Node.data.totalSubnodesCount());

            childrenCount.exit().remove();

            const pseudoNodeUpdate = pseudoNodeEnter.merge(pseudoNode);
            pseudoNodeUpdate.attr('transform', (d3Node) => 'translate(' + d3Node.x + ', ' + (d3Node.y + CONSTANTS.RECT_HEIGHT / 2) + ')');

            // Remove old/invisible nodes.
            featureNode.exit().remove();
            pseudoNode.exit().remove();
        },

        updateHighlightedConstraints(visibleD3Nodes) {
            const highlightedConstraintNodes = this.highlightedConstraintsContainer.selectAll('g.highlighted-constraints').data(
                visibleD3Nodes.filter((d3Node) => d3Node.data instanceof FeatureNode && d3Node.data.constraintsHighlighted.length),
                (d3Node) => d3Node.id || (d3Node.id = ++this.nodeIdCounter)
            );

            const highlightedConstraintNodesEnter = highlightedConstraintNodes.enter().append('g').classed('highlighted-constraints', true);

            const highlightedConstraintNodeRects = highlightedConstraintNodesEnter
                .merge(highlightedConstraintNodes)
                .selectAll('rect')
                .data(
                    (d3Node) =>
                        d3Node.data.constraintsHighlighted.map((c) => ({
                            constraint: c,
                            d3Node: d3Node,
                        })),
                    (json) => json.constraint.toString() + json.d3Node.id
                );

            // Enter highlighted constraint rects
            const highlightedConstraintNodeRectsEnter = highlightedConstraintNodeRects
                .enter()
                .append('rect')
                .attr('stroke', (json) => json.constraint.color)
                .attr('stroke-width', CONSTANTS.STROKE_WIDTH_CONSTANT)
                .attr('fill', 'transparent');

            // Update highlighted constraint rects
            highlightedConstraintNodeRectsEnter
                .merge(highlightedConstraintNodeRects)
                .attr('x', (json) => -this.calcRectWidth(json.d3Node) / 2)
                .attr('height', (_, i) => CONSTANTS.RECT_HEIGHT + i * 2 * CONSTANTS.STROKE_WIDTH_CONSTANT + CONSTANTS.STROKE_WIDTH_CONSTANT)
                .attr(
                    'width',
                    (json, i) => this.calcRectWidth(json.d3Node) + i * 2 * CONSTANTS.STROKE_WIDTH_CONSTANT + CONSTANTS.STROKE_WIDTH_CONSTANT
                )
                .attr(
                    'transform',
                    (json, i) =>
                        'translate(' +
                        (json.d3Node.x - i * CONSTANTS.STROKE_WIDTH_CONSTANT - CONSTANTS.STROKE_WIDTH_CONSTANT / 2) +
                        ', ' +
                        (json.d3Node.y - i * CONSTANTS.STROKE_WIDTH_CONSTANT - CONSTANTS.STROKE_WIDTH_CONSTANT / 2) +
                        ')'
                );

            // Remove constraints highlighted nodes
            highlightedConstraintNodes.exit().remove();
            highlightedConstraintNodeRects.exit().remove();
        },

        updateLinks(visibleD3Nodes) {
            const links = visibleD3Nodes.slice(1).filter((d3Node) => d3Node.data instanceof FeatureNode);
            const link = this.linksContainer.selectAll('path.link').data(links, (d3Node) => d3Node.id);

            const linkEnter = link.enter().insert('path', 'g').classed('link', true);

            const linkUpdate = linkEnter.merge(link);
            linkUpdate
                .classed('is-searched-link', (d3Node) => d3Node.data.isSearched)
                .attr('d', (d3Node) => createLink(d3Node.parent, d3Node));

            link.exit().remove();
        },

        updateSegments(visibleD3Nodes) {
            const segment = this.segmentsContainer.selectAll('path.segment').data(
                visibleD3Nodes.filter((d3Node) => d3Node.data instanceof FeatureNode && (d3Node.data.isAlt() || d3Node.data.isOr())),
                (d3Node) => d3Node.id || (d3Node.id = ++this.nodeIdCounter)
            );

            const segmentEnter = segment.enter().append('path').classed('segment', true);

            // Segment update
            segmentEnter
                .merge(segment)
                .classed('alt-group', (d3Node) => d3Node.data.isAlt())
                .classed('or-group', (d3Node) => d3Node.data.isOr())
                .attr('d', (d3Node) => createGroupSegment(d3Node, CONSTANTS.GROUP_SEGMENT_RADIUS))
                .attr('transform', (d3Node) => 'translate(' + d3Node.x + ', ' + d3Node.y + ')');

            segment.exit().remove();
        },

        updateSvg() {
            const start = performance.now();

            // Flexlayout belongs to a d3-plugin that calculates the width between all nodes dynamically.
            const visibleD3Nodes = this.flexLayout(this.rootD3Node).descendants();

            this.updateHighlightedConstraints(visibleD3Nodes);
            this.updateSegments(visibleD3Nodes);
            this.updateFeatureNodes(visibleD3Nodes);
            this.updateLinks(visibleD3Nodes);

            console.log('Rendertime', performance.now() - start);
        },

        // Collapses all children of the specifed node with shortcut ALT + left-click.
        collapseShortcut(event, d3Node) {
            if (event.getModifierState('Alt')) {
                d3Node.data.toggleCollapse();
                this.updateCollapsing();
                this.updateSvg();
            }
        },

        // Calculates rect-witdh dependent on font-size dynamically.
        calcRectWidth(d3Node) {
            if (d3Node.data instanceof FeatureNode) {
                return (
                    (this.isShortenedName // TODO: Ask Lukas whether to use prop or not
                        ? d3Node.data.displayName.length
                        : d3Node.data.name.length) *
                    (CONSTANTS.FEATURE_FONT_SIZE * CONSTANTS.MONOSPACE_HEIGHT_WIDTH_FACTOR) +
                    CONSTANTS.RECT_MARGIN.left +
                    CONSTANTS.RECT_MARGIN.right
                );
            } else if (d3Node.data instanceof PseudoNode) {
                return CONSTANTS.PSEUDO_NODE_SIZE * 2;
            }
        },

        focusNode(d3Node) {
            d3.select('svg').call(this.zoom.translateTo, d3Node.x, d3Node.y);
        },

        updateCollapsing() {
            this.allD3Nodes.forEach((d3Node) => {
                if (!d3Node.data.isLeaf()) {
                    if (d3Node.data.isCollapsed && !d3Node.collapsedChildren) {
                        d3Node.collapsedChildren = d3Node.children;
                        d3Node.children = null;
                    } else if (!d3Node.data.isCollapsed && !d3Node.children) {
                        d3Node.children = d3Node.collapsedChildren;
                        d3Node.collapsedChildren = null;
                    }
                }
            });
        },

        calculateTriangle() {
            const base = 35;

            const h = Math.sin(60) * base;

            const [ax, ay] = [-(base / 2), base / 2];
            const [bx, by] = [base / 2, base / 2];
            const [cx, cy] = [0, h];

            return [`${ax},${ay}`, `${bx},${by}`, `${cx},${cy}`];
        },

        resetView(uncollapsedLevels = 4, maxChildrenCount = 3) {
            // Collapses all nodes after depth 1.
            this.allD3Nodes.forEach((d3Node) => d3Node.data.collapse());

            let currentChildren = [this.rootD3Node.data];
            for (let i = 1; i <= uncollapsedLevels; i++) {
                currentChildren.forEach((child) => {
                    if (child.children.length <= maxChildrenCount) {
                        child.uncollapse(false);
                    }
                });
                currentChildren = currentChildren
                    .map((parent) => (parent.children.length <= maxChildrenCount ? parent.children : []))
                    .flat();

                if (currentChildren.length === 0) {
                    break;
                }
            }

            this.updateCollapsing();
            this.updateSvg();
            this.zoomFit();
        },

        zoomFit(padding = 0.75) {
            let bounds = document.querySelector('svg > g').getBBox();
            let fullWidth = document.querySelector('svg').getBoundingClientRect().width,
                fullHeight = document.querySelector('svg').getBoundingClientRect().height;
            let width = bounds.width,
                height = bounds.height;
            let midX = bounds.x + width / 2,
                midY = bounds.y + height / 2;
            if (width == 0 || height == 0) return; // nothing to fit
            let scale = padding / Math.max(width / fullWidth, height / fullHeight);

            d3.select('svg').call(this.zoom.translateTo, midX, midY).call(this.zoom.scaleTo, scale);
        },

        updateHiding(d3Parent) {
            d3Parent.children = [];

            let isPreviousNodeHidden = false;
            let currentPseudoNode;
            d3Parent.allChildren.forEach((d3Child) => {
                if (d3Child.data.isHidden && !isPreviousNodeHidden) {
                    currentPseudoNode = new PseudoNode(d3Child);
                    const d3PseudoNode = d3.hierarchy(currentPseudoNode);
                    d3PseudoNode.parent = d3Parent;
                    d3Parent.children.push(d3PseudoNode);
                } else if (d3Child.data.isHidden && isPreviousNodeHidden) {
                    currentPseudoNode.hiddenD3Children.push(d3Child);
                } else {
                    d3Parent.children.push(d3Child);
                }
                isPreviousNodeHidden = d3Child.data.isHidden;
            });
        },

        onChangeSearch(search) {
            this.allD3Nodes.forEach((d3Node) => {
                d3Node.data.isSearched = false;
            });

            if (search !== '') {
                const foundD3Node = this.findD3Node(search);
                const paths = foundD3Node.data.getAllNodesToRoot();

                paths.forEach((node) => (node.isSearched = true));
                this.allD3Nodes.forEach((d3Node) => d3Node.data.collapse());

                foundD3Node.data.uncollapse(true);
                this.updateCollapsing();
                this.updateSvg();
                this.focusNode(foundD3Node);
            } else {
                this.updateSvg();
            }
        },

        findD3Node(search) {
            const [, d3Node] = this.allD3Nodes.reduce(([previousDistance, previousD3Node], currentD3Node) => {
                const currentNodeName = currentD3Node.data.name.toLowerCase();
                if (currentNodeName !== search.toLowerCase() && currentNodeName.includes(search.toLowerCase())) {
                    return [1, currentD3Node];
                }

                const currentDistance = levenshtein(currentD3Node.data.name.toLowerCase(), search.toLowerCase());

                if (previousDistance <= currentDistance) {
                    return [previousDistance, previousD3Node];
                } else {
                    return [currentDistance, currentD3Node];
                }
            });

            // TODO: If levenshtein distance is above a good value dont display anything?
            return d3Node;
        },

        onChangeColoring(coloringIndex) {
            switch (coloringIndex) {
                case 0:
                    this.colorNodes(this.countNodes);
                    break;
                case 1:
                    this.colorNodes(this.countDirectChildren);
                    break;
                case 2:
                    this.colorNodes(this.countTotalChildren);
                    break;
                default:
                    this.resetColorNodes();
                    break;
            }
        },

        resetColorNodes() {
            for (const d3Node of this.allD3Nodes) {
                d3Node.data.color = d3Node.data.isAbstract ? CONSTANTS.NODE_ABSTRACT_COLOR : CONSTANTS.NODE_COLOR;
            }
            this.updateSvg();
        },

        colorNodes(coloringFunction) {
            const [count, max] = coloringFunction(); // Must return {"nodeName": integer}
            const colors = d3.scaleLinear().domain(d3.ticks(1, max, CONSTANTS.COLORING_MAP.length)).range(CONSTANTS.COLORING_MAP);

            for (const d3Node of this.allD3Nodes) {
                if (count[d3Node.data.name] !== undefined && !d3Node.data.isAbstract) {
                    d3Node.data.color = colors(count[d3Node.data.name]);
                }
            }

            this.updateSvg();
        },

        /**
         * Counts all nodes
         * @returns [{"nodeName": integer}, maxAmount]
         */
        countNodes() {
            let count = {};
            let max = 0;
            for (const d3Node of this.allD3Nodes) {
                if (count[d3Node.data.name]) {
                    count[d3Node.data.name] += 1;
                    max = max < count[d3Node.data.name] ? count[d3Node.data.name] : max;
                } else {
                    count[d3Node.data.name] = 1;
                    max = max < count[d3Node.data.name] ? count[d3Node.data.name] : max;
                }
            }

            return [count, max];
        },

        countDirectChildren() {
            let count = {};
            let max = 0;

            for (const d3Node of this.allD3Nodes) {
                count[d3Node.data.name] = d3Node.data.childrenCount();
                max = max < count[d3Node.data.name] ? count[d3Node.data.name] : max;
            }

            return [count, max];
        },

        countTotalChildren() {
            let count = {};
            let max = 0;

            for (const d3Node of this.allD3Nodes) {
                count[d3Node.data.name] = d3Node.data.totalSubnodesCount();
                max = max < count[d3Node.data.name] ? count[d3Node.data.name] : max;
            }

            return [count, max];
        },

        onChangeShortName(isShortName) {
            this.isShortenedName = isShortName;
            this.updateSvg();
        },

        onChangeVerticalSpacing(verticalSpacing) {
            this.verticalSpacing = verticalSpacing;
            this.updateSvg();
        },

        hideLeftSiblings(d3Node) {
            if (d3Node.data.getLeftSibling().isHidden) {
                d3Node.data.unhideLeftSiblings();
            } else {
                d3Node.data.hideLeftSiblings();
            }

            this.updateHiding(d3Node.parent);
            this.updateSvg();
            this.focusNode(d3Node);
        },

        hideRightSiblings(d3Node) {
            if (d3Node.data.getRightSibling().isHidden) {
                d3Node.data.unhideRightSiblings();
            } else {
                d3Node.data.hideRightSiblings();
            }

            this.updateHiding(d3Node.parent);
            this.updateSvg();
            this.focusNode(d3Node);
        },

        hideCurrentNode(d3Node) {
            d3Node.data.hide();

            this.updateHiding(d3Node.parent);
            this.updateSvg();
            this.focusNode(d3Node);
        },

        overGhostNode(ghostNode) {
            this.dragSelectedGhostNode = ghostNode;

            // Uncollapse features.
            if (ghostNode.side === 'b' && !ghostNode.d3Node.data.isLeaf()) {
                setTimeout(() => {
                    if (this.dragSelectedGhostNode === ghostNode) {
                        ghostNode.d3Node.data.uncollapse();
                        this.updateCollapsing();
                        this.updateSvg();
                        this.updateGhostCircles();
                    }
                }, 500);
            }
        },

        outGhostNode() {
            this.dragSelectedGhostNode = undefined;
        },

        addNode(newNode) {
            this.d3ParentOfAddNode.data.uncollapse();
            this.updateCollapsing();

            this.d3ParentOfAddNode.data.unhideChildren();
            this.updateHiding(this.d3ParentOfAddNode);

            newNode.parent.children.push(newNode);

            const d3NewNode = d3.hierarchy(newNode);
            d3NewNode.parent = this.d3ParentOfAddNode;
            this.d3ParentOfAddNode.allChildren.push(d3NewNode);
            this.d3ParentOfAddNode.children = this.d3ParentOfAddNode.allChildren;

            console.log(this.d3ParentOfAddNode);
            this.d3ParentOfAddNode = undefined;
            this.updateSvg();
        },
    },
});
</script>

<style lang="scss">

.ghost-circle {
    fill: red;
    fill-opacity: 0.2;
    r: 15px;
}

.ghost-circle:hover {
    fill-opacity: 0.8;
}

#svg-container {
    width: 100%;
    height: calc(100vh - 64px);
}

.node {
    cursor: pointer;
    vertical-align: middle;

    .is-searched-feature {
        fill: lightcoral;
    }

    rect {
        stroke: #888;
        stroke-width: 1px;
    }

    text {
        /* fill: black; */
        font-family: monospace;
        text-anchor: middle;
    }
}

.and-group-circle {
    stroke: #888;
    stroke-width: 1.5px;
    opacity: 0;
}

.optional-and-group-circle {
    fill: white;
    opacity: 1;
}

.mandatory-and-group-circle {
    fill: rgb(136, 136, 136);
    opacity: 1;
}

.alt-group {
    fill: white;
    stroke: #888;
    stroke-width: 1.5px;
}

.or-group {
    fill: #888;
    stroke: #888;
    stroke-width: 1.5px;
}

.link {
    fill: none;
    stroke: #888;
    stroke-width: 1.5px;
}

.is-searched-link {
    fill: none;
    stroke: lightcoral;
    stroke-width: 1.5px;
}

.children-count > circle {
    fill: white;
    stroke: #888;
    stroke-width: 1.5px;
}

.pseudo-node {
    cursor: pointer;
    vertical-align: middle;

    > circle {
        fill: white;
        stroke: #888;
        stroke-width: 1.5px;
    }
}

.feature-model-constraints {
    position: absolute;
    background-color: white;
    bottom: 0;
    width: 100%;
    box-shadow: 0px 10px 10px #888, 0px -10px 10px #888;
    padding: 2rem;
    min-height: 10%;
    max-height: 20%;
    overflow: scroll;
}

polygon {
    stroke: #888;
}

.children-count-text {
    fill: black !important;
}

.blackText {
    fill: black !important;
}

.whiteText {
    fill: white !important;
}
</style>
