import * as createPaths from '@/services/FeatureModel/createPaths.service.js';
import * as CONSTANTS from '@/classes/constants';
import * as collapse from '@/services/FeatureModel/collapse.service.js';
import { FeatureNode } from '@/classes/FeatureNode';
import { PseudoNode } from '@/classes/PseudoNode';
import * as count from '@/services/FeatureModel/count.service';
import { ghostNodeTouchMove } from '@/services/FeatureModel/dragAndDrop.service';
import { RECT_HEIGHT } from '@/classes/constants';

function updateFeatureNodes(d3Data, visibleD3Nodes) {
    const featureNode = d3Data.container.featureNodesContainer
        .selectAll('g.node')
        .data(
            visibleD3Nodes.filter(
                (d3Node) => d3Node.data instanceof FeatureNode
            ),
            (d3Node) => d3Node.id || (d3Node.id = ++d3Data.nodeIdCounter)
        );

    // Enter new nodes
    const featureNodeEnter = featureNode
        .enter()
        .append('g')
        .classed('node', true)
        .call(d3Data.drag.listener)
        // Highlight and reset highlighting of ghost-nodes during drag and drop of feature-nodes.
        .on('touchmove', (event) => ghostNodeTouchMove(event, d3Data), true)
        // Open contextmenu with right-click on d3Node.
        .on('contextmenu', (event, d3Node) => {
            // only use contextmenu on non-mobile devices
            if (!('ontouchstart' in window)) {
                event.preventDefault();
                d3Data.contextMenu.selectedD3Node = d3Node;
                d3Data.contextMenu.event = event;
            } else {
                event.preventDefault();
            }
        })
        // Toggle collapsing on double-clock on feature-node.
        .on('click', (event, d3Node) => {
            // Use click for contextmenu on mobile
            if ('ontouchstart' in window) {
                d3Data.contextMenu.selectedD3Node = d3Node;
                d3Data.contextMenu.event = event;
            }
            dblClickEvent(event, d3Data, d3Node);
            collapse.collapseShortcut(d3Data, event, d3Node); // Collapse d3Node with Ctrl + left-click on d3Node.
        });

    const rectAndTextEnter = featureNodeEnter
        .append('g')
        .classed('rect-and-text', true);
    rectAndTextEnter.append('rect').attr('height', CONSTANTS.RECT_HEIGHT);
    rectAndTextEnter
        .append('text')
        .attr('font-size', CONSTANTS.FEATURE_FONT_SIZE);

    featureNodeEnter
        .append('circle')
        .classed('and-group-circle', true)
        .attr('r', CONSTANTS.MANDATORY_CIRCLE_RADIUS);

    // Update nodes
    const featureNodeUpdate = featureNodeEnter.merge(featureNode);
    featureNodeUpdate.attr(
        'transform',
        (d3Node) => `translate(${d3Node.x}, ${d3Node.y})`
    );
    featureNodeUpdate
        .select('.and-group-circle')
        .classed(
            'mandatory-and-group-circle',
            (d3Node) =>
                d3Node.parent &&
                d3Node.parent.data.isAnd() &&
                d3Node.data.isMandatory
        )
        .classed(
            'optional-and-group-circle',
            (d3Node) =>
                d3Node.parent &&
                d3Node.parent.data.isAnd() &&
                !d3Node.data.isMandatory
        );

    const rectAndTextUpdate = featureNodeUpdate.select('.rect-and-text');
    rectAndTextUpdate
        .select('rect')
        .classed('is-searched-feature', (d3Node) => d3Node.data.isSearched)
        .attr('fill', (d3Node) => d3Node.data.color())
        .attr('x', (d3Node) =>
            d3Data.direction === 'v' ? -d3Node.width / 2 : 0
        )
        .attr('y', d3Data.direction === 'v' ? 0 : -CONSTANTS.RECT_HEIGHT / 2)
        .attr('width', (d3Node) => d3Node.width);
    rectAndTextUpdate
        .select('text')
        .attr('font-style', (d3Node) =>
            d3Node.data.isAbstract ? 'italic' : 'normal'
        )
        .attr(
            'dy',
            d3Data.direction === 'v' ? CONSTANTS.RECT_HEIGHT / 2 + 5.5 : 5.5
        )
        .attr('x', d3Data.direction === 'v' ? 0 : (d3Node) => d3Node.width / 2)
        .classed('whiteText', (d3Node) => {
            let color = d3Node.data.color();
            const rgb = color.replace(/[^\d,]/g, '').split(',');
            return rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 <= 186;
        })
        .text((d3Node) =>
            d3Data.isShortenedName ? d3Node.data.displayName : d3Node.data.name
        );

    // Remove old/invisible nodes.
    featureNode.exit().remove();

    featureNodeEnter.append('g').classed('children-count-container', true);
    featureNodeEnter.append('g').classed('quick-edit-actions-container', true);

    updateChildrenCount(d3Data, featureNodeUpdate);
    updateQuickEditActions(d3Data, featureNodeUpdate);
}

function updateQuickEditActions(d3Data, featureNodeUpdate) {
    const quickEditActions = featureNodeUpdate
        .select('g.quick-edit-actions-container')
        .selectAll('g.quick-edit-actions')
        .data(
            (d) => (d3Data.quickEdit && d3Data.featureModelTree.editRights ? [d] : []),
            (d) => d.data.id
        );

    const quickEditActionsEnter = quickEditActions
        .enter()
        .append('g')
        .classed('quick-edit-actions', true);
    const quickEditActionsUpdate =
        quickEditActionsEnter.merge(quickEditActions);

    // Bottom circle
    const bottomEnter = quickEditActionsEnter
        .append('g')
        .classed('quick-edit-action-child', true)
        .on('click', (e, d3Node) => {
            e.stopPropagation();
            d3Data.d3AddNodeIndex = d3Node.data.children.length;
            d3Data.featureModelTree.openAddAsChildDialog(d3Node);
        });
    drawQuickEditGroup(bottomEnter);
    quickEditActionsUpdate
        .select('g.quick-edit-action-child')
        .attr('transform', (d3Node) =>
            d3Data.direction === 'v'
                ? `translate(0, ${RECT_HEIGHT})`
                : `translate(${d3Node.width}, 0)`
        );

    // Left side circle
    const leftEnter = quickEditActionsEnter
        .filter((d3Node) => !d3Node.data.isRoot)
        .append('g')
        .classed('quick-edit-action-left', true)
        .on('click', (e, d3Node) => {
            e.stopPropagation();
            d3Data.d3AddNodeIndex = d3Node.data.parent.children.indexOf(
                d3Node.data
            );
            d3Data.featureModelTree.openAddAsSiblingDialog(d3Node);
        });
    drawQuickEditGroup(leftEnter);
    quickEditActionsUpdate
        .select('g.quick-edit-action-left')
        .attr('transform', (d3Node) =>
            d3Data.direction === 'v'
                ? `translate(${-d3Node.width / 2}, ${RECT_HEIGHT / 2})`
                : `translate(${d3Node.width / 2}, -${RECT_HEIGHT / 2})`
        );

    // Right side circle
    const rightEnter = quickEditActionsEnter
        .filter((d3Node) => !d3Node.data.isRoot)
        .append('g')
        .classed('quick-edit-action-right', true)
        .on('click', (e, d3Node) => {
            e.stopPropagation();
            d3Data.d3AddNodeIndex =
                d3Node.data.parent.children.indexOf(d3Node.data) + 1;
            d3Data.featureModelTree.openAddAsSiblingDialog(d3Node);
        });
    drawQuickEditGroup(rightEnter);
    quickEditActionsUpdate.select('g.quick-edit-action-right').attr(
        'transform',
        (d3Node) => `
    translate(${d3Node.width / 2}, ${RECT_HEIGHT / 2})`
    );

    quickEditActions.exit().remove();
}

function drawQuickEditGroup(d3Element) {
    // Enlarge on mobile
    const radius =
        'ontouchstart' in window
            ? CONSTANTS.QUICK_EDIT_RADIUS * 1.75
            : CONSTANTS.QUICK_EDIT_RADIUS;
    d3Element.append('circle').attr('fill', '#4caf50').attr('r', radius);
    d3Element
        .append('path')
        .attr(
            'd',
            `M -0.5 ${-(2 * radius) / 3} h 1 v ${(4 * radius) / 3} h -1 z`
        )
        .attr('fill', 'white');
    d3Element
        .append('path')
        .attr(
            'd',
            `M ${-(2 * radius) / 3} -0.5 v 1 h ${(4 * radius) / 3} v -1 z`
        )
        .attr('fill', 'white');
}

function updateChildrenCount(d3Data, featureNodeUpdate) {
    // Enter triangle with number of direct and total children.
    const childrenCount = featureNodeUpdate
        .select('g.children-count-container')
        .selectAll('g.children-count')
        .data(
            (d) => (d.data.isLeaf() || !d.data.isCollapsed ? [] : [d]),
            (d) => d.id
        );
    
    const childrenCountEnter = childrenCount
        .enter()
        .append('g')
        .classed('children-count', true);
    childrenCountEnter
        .append('polygon')
        .attr('fill', 'white')
        .attr('points', createPaths.calculateTriangle());
    childrenCountEnter
        .append('text')
        .classed('children-count-text', true)
        .classed('direct-children', true)
        .attr('dy', 5)
        .attr('font-size', CONSTANTS.CHILDREN_COUNT_FONT_SIZE);
    childrenCountEnter
        .append('text')
        .classed('children-count-text', true)
        .classed('total-children', true)
        .attr('dy', 15)
        .attr('font-size', CONSTANTS.CHILDREN_COUNT_FONT_SIZE);

    const childrenCountUpdate = childrenCountEnter.merge(childrenCount);
    childrenCountUpdate.attr('transform', (d3Node) => {
        if(d3Data.direction === 'v'){
            const x = 0 ;
            const y = CONSTANTS.RECT_HEIGHT + CONSTANTS.TRIANGLE_BORDER_OFFSET;
            return `translate(${x}, ${y})`;
        }else{
            const angle= CONSTANTS.TRIANGLE_HORIZONTAL_ROTATION;
            const x = d3Node.width+CONSTANTS.TRIANGLE_BORDER_OFFSET;
            const y =   0;
            return `translate(${x}, ${y})rotate(${angle})`;
        }
        
    });
    childrenCountUpdate
        .selectAll('text.direct-children')
        .text((d3Node) => d3Node.data.childrenCount());
    childrenCountUpdate
        .selectAll('text.total-children')
        .text((d3Node) => d3Node.data.totalSubnodesCount());

    childrenCount.exit().remove();
}

function updatePseudoNodes(d3Data, visibleD3Nodes) {
    const pseudoNode = d3Data.container.featureNodesContainer
        .selectAll('g.pseudo-node')
        .data(
            visibleD3Nodes.filter(
                (d3Node) => d3Node.data instanceof PseudoNode
            ),
            (d3Node) => d3Node.id || (d3Node.id = ++d3Data.nodeIdCounter)
        );
    const pseudoNodeEnter = pseudoNode
        .enter()
        .append('g')
        .classed('pseudo-node', true)
        .on('click', (_, d3Node) => {
            d3Node.data.unhideHiddenNodes();
            updateSvg(d3Data);
        });
    pseudoNodeEnter.append('circle').attr('r', CONSTANTS.PSEUDO_NODE_SIZE);
    pseudoNodeEnter
        .append('text')
        .attr('font-size', 30)
        .attr('dy', 2)
        .attr('dx', -12)
        .text('...');

    const pseudoNodeUpdate = pseudoNodeEnter.merge(pseudoNode);
    pseudoNodeUpdate.attr('transform', (d3Node) => {
        let dx = d3Node.x;
        let dy = d3Node.y;
        if (d3Data.direction === 'v') {
            dy += CONSTANTS.RECT_HEIGHT / 2;
        } else {
            dx += d3Node.width / 2;
        }
        return `
    translate(${dx}, ${dy})`;
    });

    pseudoNode.exit().remove();
}

function updateHighlightedConstraints(d3Data, visibleD3Nodes) {
    const highlightedNodes = visibleD3Nodes
        .filter((d3Node) => d3Node.data instanceof FeatureNode)
        .map((d3Node) => ({
            d3Node: d3Node,
            highlightedConstraints: d3Node.data.getHighlightedConstraints(),
        }))
        .filter((d) => d.highlightedConstraints.length);

    const highlightedConstraintNodes =
        d3Data.container.highlightedConstraintsContainer
            .selectAll('g.highlighted-constraints')
            .data(
                highlightedNodes,
                (d) => d.d3Node.id || (d.d3Node.id = ++d3Data.nodeIdCounter)
            );

    const highlightedConstraintNodesEnter = highlightedConstraintNodes
        .enter()
        .append('g')
        .classed('highlighted-constraints', true);

    const highlightedConstraintNodeRects = highlightedConstraintNodesEnter
        .merge(highlightedConstraintNodes)
        .selectAll('rect')
        .data(
            (d) =>
                d.highlightedConstraints.map((c) => ({
                    constraint: c,
                    d3Node: d.d3Node,
                })),
            (d) => d.constraint.toString() + d.d3Node.id
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
        .attr('x', (constraint) =>
            d3Data.direction === 'v' ? -constraint.d3Node.width / 2 : 0
        )
        .attr('y', d3Data.direction === 'v' ? 0 : -CONSTANTS.RECT_HEIGHT / 2)
        .attr(
            'height',
            (_, i) =>
                CONSTANTS.RECT_HEIGHT +
                i * 2 * CONSTANTS.STROKE_WIDTH_CONSTANT +
                CONSTANTS.STROKE_WIDTH_CONSTANT
        )
        .attr(
            'width',
            (constraint, i) =>
                constraint.d3Node.width +
                i * 2 * CONSTANTS.STROKE_WIDTH_CONSTANT +
                CONSTANTS.STROKE_WIDTH_CONSTANT
        )
        .attr(
            'transform',
            (json, i) => `
    translate(${
        json.d3Node.x -
        i * CONSTANTS.STROKE_WIDTH_CONSTANT -
        CONSTANTS.STROKE_WIDTH_CONSTANT / 2
    },
        ${
            json.d3Node.y -
            i * CONSTANTS.STROKE_WIDTH_CONSTANT -
            CONSTANTS.STROKE_WIDTH_CONSTANT / 2
        })`
        );

    // Remove constraints highlighted nodes
    highlightedConstraintNodes.exit().remove();
    highlightedConstraintNodeRects.exit().remove();
}

function updateLinks(d3Data, visibleD3Nodes) {
    const links = visibleD3Nodes
        .slice(1)
        .filter((d3Node) => d3Node.data instanceof FeatureNode);
    const link = d3Data.container.linksContainer
        .selectAll('path.link')
        .data(links, (d3Node) => d3Node.id);

    const linkEnter = link.enter().insert('path', 'g').classed('link', true);

    const linkUpdate = linkEnter.merge(link);
    linkUpdate
        .classed('is-searched-link', (d3Node) => d3Node.data.isSearched)
        .attr('d', (d3Node) => {
            if (d3Data.direction === 'v') {
                return createPaths.createLinkVertically(d3Node.parent, d3Node);
            } else {
                return createPaths.createLinkHorizontally(
                    d3Node.parent,
                    d3Node
                );
            }
        });

    link.exit().remove();
}

function updateColoring(d3Data) {
    const allNodes = d3Data.root.data.descendants();
    count.colorNodes(allNodes, d3Data.coloringIndex);
}

function updateSegments(d3Data, visibleD3Nodes) {
    const segment = d3Data.container.segmentsContainer
        .selectAll('path.segment')
        .data(
            visibleD3Nodes.filter(
                (d3Node) =>
                    d3Node.data instanceof FeatureNode &&
                    (d3Node.data.isAlt() || d3Node.data.isOr())
            ),
            (d3Node) => d3Node.id || (d3Node.id = ++d3Data.nodeIdCounter)
        );

    const segmentEnter = segment
        .enter()
        .append('path')
        .classed('segment', true);

    // Segment update.service.js
    segmentEnter
        .merge(segment)
        .classed('alt-group', (d3Node) => d3Node.data.isAlt())
        .classed('or-group', (d3Node) => d3Node.data.isOr())
        .attr('d', (d3Node) => {
            if (d3Data.direction === 'h') {
                return createPaths.createGroupSegmentHorizontally(
                    d3Node,
                    CONSTANTS.GROUP_SEGMENT_RADIUS
                );
            } else {
                return createPaths.createGroupSegmentVertically(
                    d3Node,
                    CONSTANTS.GROUP_SEGMENT_RADIUS
                );
            }
        })
        .attr('transform', (d3Node) => {
            let dx = d3Node.x;
            let dy = d3Node.y;
            if (d3Data.direction === 'h') {
                dx += d3Node.width;
            } else {
                dy += CONSTANTS.RECT_HEIGHT;
            }
            return `
    translate(${dx}, ${dy})`;
        });

    segment.exit().remove();
}

export function updateSvg(d3Data) {

    // Calculate rect widths of all d3Nodes once for better performance instead of repeatedly during update.
    d3Data.root.descendants().forEach((d3Node) => {
        d3Node.width = calcRectWidth(d3Data, d3Node);

        if (d3Node.data instanceof FeatureNode) {
            const level = d3Node.data.level();
            if (d3Data.maxHorizontallyLevelWidth.length <= level) {
                d3Data.maxHorizontallyLevelWidth.push(0);
            }

            if (d3Data.maxHorizontallyLevelWidth[level] < d3Node.width) {
                d3Data.maxHorizontallyLevelWidth[level] = d3Node.width;
            }
        }
    });

    // Flexlayout belongs to a d3-plugin that calculates the width between all nodes dynamically.
    const visibleD3Nodes = d3Data.flexlayout(d3Data.root).descendants();

    // Swap x and y to draw from left to right instead of drawing from top to bottom
    if (d3Data.direction === 'h') {
        visibleD3Nodes.forEach((d3Node) => {
            const x = d3Node.x;
            d3Node.x = d3Node.y;
            d3Node.y = x;
        });
    }

    updateColoring(d3Data);
    updateHighlightedConstraints(d3Data, visibleD3Nodes);
    updateSegments(d3Data, visibleD3Nodes);
    updateFeatureNodes(d3Data, visibleD3Nodes);
    updatePseudoNodes(d3Data, visibleD3Nodes);
    updateLinks(d3Data, visibleD3Nodes);
}

// Calculates rect-width dependent on font-size dynamically.
export function calcRectWidth(d3Data, d3Node) {
    if (d3Node.data instanceof FeatureNode) {
        return (
            (d3Data.isShortenedName
                ? d3Node.data.displayName.length
                : d3Node.data.name.length) *
                (CONSTANTS.FEATURE_FONT_SIZE *
                    CONSTANTS.MONOSPACE_HEIGHT_WIDTH_FACTOR) +
            CONSTANTS.RECT_MARGIN.left +
            CONSTANTS.RECT_MARGIN.right
        );
    } else {
        return CONSTANTS.PSEUDO_NODE_SIZE * 2;
    }
}

let touchtime = 0;

function dblClickEvent(event, d3Data, d3Node) {
    if (touchtime === 0) {
        // set first click
        touchtime = new Date().getTime();
    } else {
        // compare first click to this click and see if they occurred within double click threshold
        if (new Date().getTime() - touchtime < 300) {
            // double click occurred
            event.preventDefault();
            d3Node.data.toggleCollapse();
            updateSvg(d3Data);
            touchtime = 0;
        } else {
            // not a double click so set as a new first click
            touchtime = new Date().getTime();
        }
    }
}
