import * as drawSvgPaths from '@/services/FeatureModel/drawSvgPaths.service.js';
import * as CONSTANTS from '@/classes/constants';
import { FeatureNode, PseudoNode } from '@/classes/featureNode';

function updateFeatureNodes(d3Data, featureNodesContainer, drag, contextMenu, visibleD3Nodes) {
	const featureNode = featureNodesContainer.selectAll('g.node').data(
		visibleD3Nodes.filter((d3Node) => d3Node.data instanceof FeatureNode),
		(d3Node) => d3Node.id || (d3Node.id = ++d3Data.nodeIdCounter)
	);

	// Enter new nodes
	const featureNodeEnter = featureNode
		.enter()
		.append('g')
		.classed('node', true)
		.call(drag.listener)
		.on('contextmenu', (event, d3Node) => {
			event.preventDefault();
			contextMenu.selectedD3Node = d3Node;
			contextMenu.event = event;
		}) // Open contextmenu with right-click on d3Node.
		.on('click', (event, d3Node) => d3Data.collapseShortcut(event, d3Node)); // Collapse d3Node with Ctrl + left-click on d3Node.

	const rectAndTextEnter = featureNodeEnter.append('g').classed('rect-and-text', true);
	rectAndTextEnter.append('rect').attr('height', CONSTANTS.RECT_HEIGHT);
	rectAndTextEnter
		.append('text')
		.attr('dy', CONSTANTS.RECT_HEIGHT / 2 + 5.5)
		.attr('font-size', CONSTANTS.FEATURE_FONT_SIZE);

	featureNodeEnter.append('circle').classed('and-group-circle', true).attr('r', CONSTANTS.MANDATORY_CIRCLE_RADIUS);

	const pseudoNode = featureNodesContainer.selectAll('g.pseudo-node').data(
		visibleD3Nodes.filter((d3Node) => d3Node.data instanceof PseudoNode),
		(d3Node) => d3Node.id || (d3Node.id = ++d3Data.nodeIdCounter)
	);
	const pseudoNodeEnter = pseudoNode
		.enter()
		.append('g')
		.classed('pseudo-node', true)
		.on('click', (_, d3Node) => {
			d3Node.data.unhideHiddenNodes();
			this.updateHiding(d3Node.parent);
			updateSvg();
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
		.attr('x', (d3Node) => -calcRectWidth(d3Node, d3Data.isShortenedName) / 2)
		.attr('width', (d3Node) => calcRectWidth(d3Node, d3Data.isShortenedName));
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
		.text((d3Node) => (d3Data.isShortenedName ? d3Node.data.displayName : d3Node.data.name));

	// Enter triangle with number of direct and total children.
	const childrenCount = featureNodeUpdate.selectAll('g.children-count').data(
		(d) => (d.data.isLeaf() ? [] : [d]),
		(d) => d.id
	);

	const childrenCountEnter = childrenCount.enter().append('g').classed('children-count', true);
	childrenCountEnter.append('polygon').attr('fill', 'white').attr('points', drawSvgPaths.calculateTriangle());
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
	childrenCountUpdate.attr('transform', (d3Node) => 'translate(' + calcRectWidth(d3Node, d3Data.isShortenedName) / 2 + ', ' + CONSTANTS.RECT_HEIGHT + ')');
	childrenCountUpdate.selectAll('text.direct-children').text((d3Node) => d3Node.data.childrenCount());
	childrenCountUpdate.selectAll('text.total-children').text((d3Node) => d3Node.data.totalSubnodesCount());

	childrenCount.exit().remove();

	const pseudoNodeUpdate = pseudoNodeEnter.merge(pseudoNode);
	pseudoNodeUpdate.attr('transform', (d3Node) => 'translate(' + d3Node.x + ', ' + (d3Node.y + CONSTANTS.RECT_HEIGHT / 2) + ')');

	// Remove old/invisible nodes.
	featureNode.exit().remove();
	pseudoNode.exit().remove();
}

function updateHighlightedConstraints(d3Data, highlightedConstraintsContainer, visibleD3Nodes) {
	const highlightedConstraintNodes = highlightedConstraintsContainer.selectAll('g.highlighted-constraints').data(
		visibleD3Nodes.filter((d3Node) => d3Node.data instanceof FeatureNode && d3Node.data.constraintsHighlighted.length),
		(d3Node) => d3Node.id || (d3Node.id = ++d3Data.nodeIdCounter)
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
		.attr('x', (json) => -calcRectWidth(json.d3Node, d3Data.isShortenedName) / 2)
		.attr('height', (_, i) => CONSTANTS.RECT_HEIGHT + i * 2 * CONSTANTS.STROKE_WIDTH_CONSTANT + CONSTANTS.STROKE_WIDTH_CONSTANT)
		.attr(
			'width',
			(json, i) => calcRectWidth(json.d3Node, d3Data.isShortenedName) + i * 2 * CONSTANTS.STROKE_WIDTH_CONSTANT + CONSTANTS.STROKE_WIDTH_CONSTANT
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
}

function updateLinks(linksContainer, visibleD3Nodes) {
	const links = visibleD3Nodes.slice(1).filter((d3Node) => d3Node.data instanceof FeatureNode);
	const link = linksContainer.selectAll('path.link').data(links, (d3Node) => d3Node.id);

	const linkEnter = link.enter().insert('path', 'g').classed('link', true);

	const linkUpdate = linkEnter.merge(link);
	linkUpdate
		.classed('is-searched-link', (d3Node) => d3Node.data.isSearched)
		.attr('d', (d3Node) => drawSvgPaths.createLink(d3Node.parent, d3Node));

	link.exit().remove();
}

function updateSegments(d3Data, segmentsContainer, visibleD3Nodes) {
	const segment = segmentsContainer.selectAll('path.segment').data(
		visibleD3Nodes.filter((d3Node) => d3Node.data instanceof FeatureNode && (d3Node.data.isAlt() || d3Node.data.isOr())),
		(d3Node) => d3Node.id || (d3Node.id = ++d3Data.nodeIdCounter)
	);

	const segmentEnter = segment.enter().append('path').classed('segment', true);

	// Segment update
	segmentEnter
		.merge(segment)
		.classed('alt-group', (d3Node) => d3Node.data.isAlt())
		.classed('or-group', (d3Node) => d3Node.data.isOr())
		.attr('d', (d3Node) => drawSvgPaths.createGroupSegment(d3Node, CONSTANTS.GROUP_SEGMENT_RADIUS))
		.attr('transform', (d3Node) => 'translate(' + d3Node.x + ', ' + d3Node.y + ')');

	segment.exit().remove();
}

export function updateSvg(d3Data, container, drag, contextMenu) {
	const start = performance.now();

	// Flexlayout belongs to a d3-plugin that calculates the width between all nodes dynamically.
	const visibleD3Nodes = d3Data.flexlayout(d3Data.root).descendants();

	updateHighlightedConstraints(d3Data, container.highlightedConstraintsContainer, visibleD3Nodes);
	updateSegments(d3Data, container.segmentsContainer, visibleD3Nodes);
	updateFeatureNodes(d3Data, container.featureNodesContainer, drag, contextMenu, visibleD3Nodes);
	updateLinks(container.linksContainer, visibleD3Nodes);

	console.log('Rendertime', performance.now() - start);
}

// Calculates rect-witdh dependent on font-size dynamically.
function calcRectWidth(d3Node, isShortenedName) {
	if (d3Node.data instanceof FeatureNode) {
		return (
			(isShortenedName // TODO: Ask Lukas whether to use prop or not
				? d3Node.data.displayName.length
				: d3Node.data.name.length) *
				(CONSTANTS.FEATURE_FONT_SIZE * CONSTANTS.MONOSPACE_HEIGHT_WIDTH_FACTOR) +
			CONSTANTS.RECT_MARGIN.left +
			CONSTANTS.RECT_MARGIN.right
		);
	} else if (d3Node.data instanceof PseudoNode) {
		return CONSTANTS.PSEUDO_NODE_SIZE * 2;
	}
}
