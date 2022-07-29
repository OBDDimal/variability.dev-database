import {flextree} from 'd3-flextree';
import * as CONSTANTS from '@/classes/constants';
import * as d3 from 'd3';
import * as update from '@/services/FeatureModel/update.service.js';
import * as windowResize from '@/services/FeatureModel/windowResize.service.js';

export function initialize(d3Data, data) {
    // Flexlayout belongs to a d3-plugin that calculates the width between all nodes dynamically.
    d3Data.flexlayout = flextree()
        .nodeSize((d3Node) => calcNodeSize(d3Data, d3Node))
        .spacing((d3NodeA, d3NodeB) => d3NodeA.path(d3NodeB).length);

    // Create root-feature-node with d3 and the data of the feature-model.
    d3Data.root = d3.hierarchy(data, (node) => node.children);
    d3Data.root.each((d3Node) => d3Node.data.d3Node = d3Node);

    d3Data.zoom = d3
        .zoom()
        //.scaleExtent([0.1, 8])
        .on('zoom', (event) => svgContent.attr('transform', event.transform));

    // Create svg-container.
    const svg = d3
        .select('#svg-container')
        .append('svg')
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .call(d3Data.zoom); // Zooming and penning.

    const svgContent = svg.append('g');

    d3Data.container.highlightedConstraintsContainer = svgContent.append('g').classed('highlighted-constraints-container', true);

    d3Data.container.linksContainer = svgContent.append('g').classed('link-container', true);

    d3Data.container.segmentsContainer = svgContent.append('g').classed('segments-container', true);

    d3Data.container.featureNodesContainer = svgContent.append('g').classed('feature-node-container', true);

    d3Data.container.dragContainer = svgContent.append('g').classed('drag-container', true);


    // Listen to window resize.
    window.onresize = () => windowResize.update(d3Data);
    windowResize.update(d3Data);
}

function calcNodeSize(d3Data, d3Node) {
    let width, height;
    switch (d3Data.direction) {
        case 'v':
            width = update.calcRectWidth(d3Data, d3Node) + CONSTANTS.SPACE_BETWEEN_NODES_HORIZONTALLY;
            height = CONSTANTS.RECT_HEIGHT + d3Data.spaceBetweenNodes;
            break;
        case 'h':
            width = CONSTANTS.RECT_HEIGHT + CONSTANTS.SPACE_BETWEEN_NODES_VERTICALLY;
            height = 200 +  d3Data.spaceBetweenNodes;
            break;
    }

    return [width, height];
}