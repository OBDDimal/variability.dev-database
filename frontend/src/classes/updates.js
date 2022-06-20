import * as constants from "@/classes/constants.ts";
import { FeatureNode, PseudoNode } from "@/classes/featureNode.ts";
import { createGroupSegment, createLink } from "@/classes/createSvgPaths.js";

function updateFeatureNodes(visibleD3Nodes) {
    const featureNode = featureNodesContainer.selectAll("g.node").data(
        visibleD3Nodes.filter((d3Node) => d3Node.data instanceof FeatureNode),
        (d3Node) => d3Node.id || (d3Node.id = ++nodeIdCounter)
    );

    // Enter new nodes
    const featureNodeEnter = featureNode
        .enter()
        .append("g")
        .classed("node", true)
        .on("contextmenu", (event, d3Node) => contextMenu(event, d3Node)) // Open contextmenu with right-click on d3Node.
        .on("click", (event, d3Node) => collapseShortcut(event, d3Node)); // Collapse d3Node with Ctrl + left-click on d3Node.

    const rectAndTextEnter = featureNodeEnter
        .append("g")
        .classed("rect-and-text", true);
    rectAndTextEnter
        .append("rect")
        .attr("height", constants.RECT_HEIGHT);
    rectAndTextEnter
        .append("text")
        .attr("dy", constants.RECT_HEIGHT / 2 + 5.5)
        .attr("font-size", constants.FEATURE_FONT_SIZE);

    featureNodeEnter
        .filter((d3Node) => !d3Node.data.isRoot && d3Node.parent.data.isAnd())
        .append("circle")
        .classed("and-group-circle", true)
        .attr("r", constants.MANDATORY_CIRCLE_RADIUS);

    // Enter circle with number of direct and total children.
    const childrenCountEnter = featureNodeEnter
        .filter((d3Node) => !d3Node.data.isLeaf())
        .append("g")
        .classed("children-count", true);
    childrenCountEnter
        .append("polygon")
        .attr('fill', 'white')
        .attr("points", () => calculateTriangle());
    childrenCountEnter
        .append("text")
        .classed("children-count-text", true)
        .attr("dy", 5)
        .attr("font-size", constants.CHILREN_COUNT_FONT_SIZE)
        .text(
            (d3Node) => d3Node.data.childrenCount()
        );
    childrenCountEnter
        .append("text")
        .classed("children-count-text", true)
        .attr("dy", 15)
        .attr("font-size", constants.CHILREN_COUNT_FONT_SIZE)
        .text(
            (d3Node) => d3Node.data.totalSubnodesCount()
        );

    const pseudoNode = featureNodesContainer.selectAll("g.pseudo-node").data(
        visibleD3Nodes.filter((d3Node) => d3Node.data instanceof PseudoNode),
        (d3Node) => d3Node.id || (d3Node.id = ++nodeIdCounter)
    );
    const pseudoNodeEnter = pseudoNode
        .enter()
        .append("g")
        .classed("pseudo-node", true)
        .on("click", (_, d3Node) => { 
            d3Node.data.unhideHiddenNodes();
            updateHiding(d3Node.parent);
            updateSvg(); 
        });
    pseudoNodeEnter.append("circle").attr("r", constants.PSEUDO_NODE_SIZE);
    pseudoNodeEnter
        .append("text")
        .attr("font-size", 30)
        .attr("dy", 2)
        .attr("dx", -12)
        .text("...");

    // Update nodes
    const featureNodeUpdate = featureNodeEnter.merge(featureNode);
    featureNodeUpdate.attr(
        "transform",
        (d3Node) => "translate(" + d3Node.x + ", " + d3Node.y + ")"
    );
    featureNodeUpdate
        .select(".and-group-circle")
        .classed(
            "mandatory-and-group-circle",
            (d3Node) => d3Node.parent && d3Node.parent.data.isAnd() && d3Node.data.isMandatory
        )
        .classed(
            "optional-and-group-circle",
            (d3Node) =>
                d3Node.parent && d3Node.parent.data.isAnd() && !d3Node.data.isMandatory
        );

    const rectAndTextUpdate = featureNodeUpdate.select(".rect-and-text");
    rectAndTextUpdate
        .select("rect")
        .classed("is-searched-feature", (d3Node) => d3Node.data.isSearched)
        .attr("fill", (d3Node) => d3Node.data.isAbstract ? constants.NODE_ABSTRACT_COLOR : d3Node.data.color)
        .attr("x", (d3Node) => -calcRectWidth(d3Node) / 2)
        .attr("width", (d3Node) => calcRectWidth(d3Node));
    rectAndTextUpdate
        .select("text")
        .attr("font-style", (d3Node) => (d3Node.data.isAbstract ? "italic" : "normal"))
        .text((d3Node) => isShortenedName ? d3Node.data.displayName : d3Node.data.name);

    const childrenCountUpdate = featureNodeUpdate
    .select('g.children-count')
        .attr(
            "transform",
            (d3Node) =>
                "translate(" + calcRectWidth(d3Node) / 2 + ", " + constants.RECT_HEIGHT + ")"
        );

    const pseudoNodeUpdate = pseudoNodeEnter.merge(pseudoNode);
    pseudoNodeUpdate.attr(
        "transform",
        (d3Node) => "translate(" + d3Node.x + ", " + (d3Node.y + constants.RECT_HEIGHT / 2) + ")"
    );

    // Remove old/invisible nodes.
    featureNode.exit().remove();
    pseudoNode.exit().remove();
}

function updateHighlightedConstraints(visibleD3Nodes) {
    const highlightedConstraintNodes = highlightedConstraintsContainer
        .selectAll("g.highlighted-constraints")
        .data(
            visibleD3Nodes.filter(
                (d3Node) =>
                    d3Node.data instanceof FeatureNode &&
                    d3Node.data.constraintsHighlighted.length
            ),
            (d3Node) => d3Node.id || (d3Node.id = ++nodeIdCounter)
        );

    const highlightedConstraintNodesEnter = highlightedConstraintNodes
        .enter()
        .append("g")
        .classed("highlighted-constraints", true);

    const highlightedConstraintNodeRects = highlightedConstraintNodesEnter
        .merge(highlightedConstraintNodes)
        .selectAll("rect")
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
        .append("rect")
        .attr("stroke", (json) => json.constraint.color)
        .attr("stroke-width", constants.STROKE_WIDTH_CONSTANT)
        .attr("fill", "transparent");

    // Update highlighted constraint rects
    highlightedConstraintNodeRectsEnter
        .merge(highlightedConstraintNodeRects)
        .attr("x", (json) => -calcRectWidth(json.d3Node) / 2)
        .attr(
            "height",
            (_, i) =>
                RECT_HEIGHT + i * 2 * constants.STROKE_WIDTH_CONSTANT + constants.STROKE_WIDTH_CONSTANT
        )
        .attr(
            "width",
            (json, i) =>
                calcRectWidth(json.d3Node) +
                i * 2 * constants.STROKE_WIDTH_CONSTANT +
                constants.STROKE_WIDTH_CONSTANT
        )
        .attr(
            "transform",
            (json, i) =>
                "translate(" +
                (json.d3Node.x -
                    i * constants.STROKE_WIDTH_CONSTANT -
                    constants.STROKE_WIDTH_CONSTANT / 2) +
                ", " +
                (json.d3Node.y -
                    i * constants.STROKE_WIDTH_CONSTANT -
                    constants.STROKE_WIDTH_CONSTANT / 2) +
                ")"
        );

    // Remove constraints highlighted nodes
    highlightedConstraintNodes.exit().remove();
    highlightedConstraintNodeRects.exit().remove();
}

function updateLinks(visibleD3Nodes) {
    const links = visibleD3Nodes
        .slice(1)
        .filter((d3Node) => d3Node.data instanceof FeatureNode);
    const link = linksContainer
        .selectAll("path.link")
        .data(links, (d3Node) => d3Node.id);

    const linkEnter = link.enter().insert("path", "g").classed("link", true);

    const linkUpdate = linkEnter.merge(link);
    linkUpdate
        .classed("is-searched-link", (d3Node) => d3Node.data.isSearched)
        .attr("d", (d3Node) => createLink(d3Node.parent, d3Node));

    const linkExit = link.exit().remove();
}

function updateSegments(visibleD3Nodes) {
    const segment = segmentsContainer.selectAll("path.segment").data(
        visibleD3Nodes.filter((d3Node) => d3Node.data instanceof FeatureNode && (d3Node.data.isAlt() || d3Node.data.isOr())),
        (d3Node) => d3Node.id || (d3Node.id = ++nodeIdCounter)
    );

    const segmentEnter = segment
        .enter()
        .append("path")
        .classed("segment", true);

    const segmentUpdate = segmentEnter.merge(segment)
        .classed("alt-group", (d3Node) => d3Node.data.isAlt())
        .classed("or-group", (d3Node) => d3Node.data.isOr())
        .attr("d", (d3Node) => createGroupSegment(d3Node, constants.GROUP_SEGMENT_RADIUS))
        .attr(
            "transform",
            (d3Node) => "translate(" + d3Node.x + ", " + d3Node.y + ")"
        );

    segment.exit().remove();
}

export function updateSvg() {
    const start = performance.now();

    // Flexlayout belongs to a d3-plugin that calculates the width between all nodes dynamically.
    const visibleD3Nodes = flexLayout(rootD3Node).descendants();

    updateHighlightedConstraints(visibleD3Nodes);
    updateSegments(visibleD3Nodes);
    updateFeatureNodes(visibleD3Nodes);
    updateLinks(visibleD3Nodes);

    console.log("Rendertime", performance.now() - start);
}

// Collapses all children of the specifed node with shortcut CTRL + left-click.
export function collapseShortcut(event, d3Node) {
    if (event.getModifierState("Control")) {
        d3Node.data.toggleCollapse();
        updateCollapsing();
        updateSvg();
    }
}

// Calculates rect-witdh dependent on font-size dynamically.
export function calcRectWidth(d3Node) {
    if (d3Node.data instanceof FeatureNode) {
        return (
            (isShortenedName ? d3Node.data.displayName.length : d3Node.data.name.length) *
            (constants.FEATURE_FONT_SIZE * constants.MONOSPACE_HEIGHT_WIDTH_FACTOR) +
            constants.RECT_MARGIN.left +
            constants.RECT_MARGIN.right
        );
    } else if (d3Node.data instanceof PseudoNode) {
        return constants.PSEUDO_NODE_SIZE * 2;
    }
}

export function focusNode(d3Node) {
    d3.select("svg").call(zoom.translateTo, d3Node.x, d3Node.y);
}

export function updateCollapsing() {
    allD3Nodes.forEach((d3Node) => {
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
}

export function calculateTriangle() {
    const base = 35;

    const h = (Math.sin(60) * base);

    const [ax, ay] = [-(base / 2), base / 2];
    const [bx, by] = [base / 2, base / 2];
    const [cx, cy] = [0, h]

     
    return [`${ax},${ay}`, `${bx},${by}`, `${cx},${cy}`]
}

export function initialize(uncollapsedLevels = 4, maxChildrenCount = 3) {
    // Collapses all nodes after depth 1.
    allD3Nodes.forEach(d3Node => d3Node.data.collapse());

    let currentChildren = [rootD3Node.data];
    for (let i = 1; i <= uncollapsedLevels; i++) {
        currentChildren.forEach(child => {
            if (child.children.length <= maxChildrenCount) {
                child.uncollapse(false);
            }
        });
        currentChildren = currentChildren.map((parent) => parent.children.length <= maxChildrenCount ? parent.children : []).flat();

        if (currentChildren.length === 0) {
            break;
        }
    }

    // TODO: Reset zoom and translation

    updateCollapsing();
    updateSvg();
}

export function zoomFit(padding = 0.75) {
	let bounds = document.querySelector("svg > g").getBBox();
	let fullWidth = document.querySelector('svg').getBoundingClientRect().width,
	    fullHeight = document.querySelector('svg').getBoundingClientRect().height;
	let width = bounds.width,
	    height = bounds.height;
	let midX = bounds.x + width / 2,
	    midY = bounds.y + height / 2;
	if (width == 0 || height == 0) return; // nothing to fit
	let scale = padding / Math.max(width / fullWidth, height / fullHeight);

	d3.select("svg")
        .call(zoom.translateTo, midX, midY)
        .call(zoom.scaleTo, scale);
}

export function updateHiding(d3Parent) {
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
}