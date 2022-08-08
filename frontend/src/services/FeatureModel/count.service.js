import * as d3 from 'd3';
import * as CONSTANTS from '@/classes/constants';

export function colorNodes(allNodes, coloringIndex) {
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
}

function resetColorNodes(allNodes) {
    for (const node of allNodes) {
        node.colorValue = node.isAbstract ? CONSTANTS.NODE_ABSTRACT_COLOR : CONSTANTS.NODE_COLOR;
    }
}

function coloring(allNodes, coloringFunction) {
    const {count, max} = coloringFunction(allNodes); // Must return {"nodeName": integer}
    const colors = d3.scaleLinear().domain(d3.ticks(1, max, CONSTANTS.COLORING_MAP.length)).range(CONSTANTS.COLORING_MAP);

    for (const node of allNodes) {
        if (count[node.name] !== undefined && !node.isAbstract) {
            node.colorValue = colors(count[node.name]);
        }
    }
}

/**
 * Counts all nodes
 * @returns {max: number, count: {}}
 */
function countNodes(allNodes) {
    let count = {};
    let max = 0;
    for (const node of allNodes) {
        if (count[node.name]) {
            count[node.name] += 1;
            max = max < count[node.name] ? count[node.name] : max;
        } else {
            count[node.name] = 1;
            max = max < count[node.name] ? count[node.name] : max;
        }
    }

    return {count: count, max: max};
}

function countDirectChildren(allNodes) {
    let count = {};
    let max = 0;

    for (const node of allNodes) {
        count[node.name] = node.childrenCount();
        max = max < count[node.name] ? count[node.name] : max;
    }

    return {count: count, max: max};
}

function countTotalChildren(allNodes) {
    let count = {};
    let max = 0;

    for (const node of allNodes) {
        count[node.name] = node.totalSubnodesCount();
        max = max < count[node.name] ? count[node.name] : max;
    }

    return {count: count, max: max};
}
