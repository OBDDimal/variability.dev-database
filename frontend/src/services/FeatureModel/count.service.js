import * as d3 from 'd3';
import * as CONSTANTS from '@/classes/constants';
import * as update from "@/services/FeatureModel/update.service.js";

export function colorNodes(d3Data, coloringIndex) {
    const allNodes = d3Data.root.data.descendants();
    switch (coloringIndex) {
        case 0:
            coloring(allNodes, countNodes);
            break;
        case 1:
            coloring(allNodes, countDirectChildren);
            break;
        case 2:
            coloring(allNodes, countTotalChildren);
            break;
        default:
            resetColorNodes(allNodes);
            break;
    }
    update.updateSvg(d3Data);
}

function resetColorNodes(allD3Nodes) {
    for (const d3Node of allD3Nodes) {
        d3Node.data.color = d3Node.data.isAbstract ? CONSTANTS.NODE_ABSTRACT_COLOR : CONSTANTS.NODE_COLOR;
    }
}

function coloring(allD3Nodes, coloringFunction) {
    const [count, max] = coloringFunction(allD3Nodes); // Must return {"nodeName": integer}
    const colors = d3.scaleLinear().domain(d3.ticks(1, max, CONSTANTS.COLORING_MAP.length)).range(CONSTANTS.COLORING_MAP);

    for (const d3Node of allD3Nodes) {
        if (count[d3Node.data.name] !== undefined && !d3Node.data.isAbstract) {
            d3Node.data.color = colors(count[d3Node.data.name]);
        }
    }
}

/**
 * Counts all nodes
 * @returns [{"nodeName": integer}, maxAmount]
 */
function countNodes(allD3Nodes) {
    let count = {};
    let max = 0;
    for (const d3Node of allD3Nodes) {
        if (count[d3Node.data.name]) {
            count[d3Node.data.name] += 1;
            max = max < count[d3Node.data.name] ? count[d3Node.data.name] : max;
        } else {
            count[d3Node.data.name] = 1;
            max = max < count[d3Node.data.name] ? count[d3Node.data.name] : max;
        }
    }

    return [count, max];
}

function countDirectChildren(allD3Nodes) {
    let count = {};
    let max = 0;

    for (const d3Node of allD3Nodes) {
        count[d3Node.data.name] = d3Node.data.childrenCount();
        max = max < count[d3Node.data.name] ? count[d3Node.data.name] : max;
    }

    return [count, max];
}

function countTotalChildren(allD3Nodes) {
    let count = {};
    let max = 0;

    for (const d3Node of allD3Nodes) {
        count[d3Node.data.name] = d3Node.data.totalSubnodesCount();
        max = max < count[d3Node.data.name] ? count[d3Node.data.name] : max;
    }

    return [count, max];
}