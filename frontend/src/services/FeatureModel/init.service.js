import { flextree } from 'd3-flextree';
import * as CONSTANTS from '@/classes/constants';
import * as d3 from 'd3';
import * as update from '@/services/FeatureModel/update.service.js';

export function initialize(d3Data, data) {
	// Flexlayout belongs to a d3-plugin that calculates the width between all nodes dynamically.
	d3Data.flexlayout = flextree()
		.nodeSize((d3Node) => [
			update.calcRectWidth(d3Data, d3Node) + CONSTANTS.SPACE_BETWEEN_NODES_HORIZONTALLY,
			CONSTANTS.RECT_HEIGHT + d3Data.verticalSpacing,
		])
		.spacing((d3NodeA, d3NodeB) => d3NodeA.path(d3NodeB).length);

	// Create root-feature-node with d3 and the data of the feature-model.
	d3Data.root = d3.hierarchy(data, (node) =>node.children);
	d3Data.allNodes = d3Data.root.descendants();
	d3Data.allNodes.forEach((d3Node) => (d3Node.allChildren = d3Node.children));

	d3Data.zoom = d3
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
		.on('click', () => (d3Data.contextMenu.selectedD3Node = null)) // Click listener for closing all context-menus.
		.call(d3Data.zoom); // Zooming and penning.

	const svgContent = svg.append('g');

    d3Data.container.highlightedConstraintsContainer = svgContent.append('g').classed('highlighted-constraints-container', true);

    d3Data.container.linksContainer = svgContent.append('g').classed('link-container', true);

    d3Data.container.segmentsContainer = svgContent.append('g').classed('segments-container', true);

    d3Data.container.featureNodesContainer = svgContent.append('g').classed('feature-node-container', true);

    d3Data.container.dragContainer = svgContent.append('g').classed('drag-container', true);
}
