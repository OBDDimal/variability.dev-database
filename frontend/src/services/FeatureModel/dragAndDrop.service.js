import * as update from '@/services/FeatureModel/update.service.js';
import * as hide from '@/services/FeatureModel/hide.service.js';
import * as collapse from '@/services/FeatureModel/collapse.service.js';
import * as CONSTANTS from '@/classes/constants';
import * as d3 from 'd3';

function overGhostNode(d3Data, ghostNode) {
    d3Data.drag.selectedGhostNode = ghostNode;

    // Uncollapse features.
    if (ghostNode.side === 'b' && !ghostNode.d3Node.data.isLeaf()) {
        setTimeout(() => {
            if (d3Data.drag.selectedGhostNode === ghostNode) {
                ghostNode.d3Node.data.uncollapse();
                collapse.update(d3Data);
                update.updateSvg(d3Data);
                updateGhostCircles(d3Data);
            }
        }, 500);
    }
}

function outGhostNode(d3Data) {
    d3Data.drag.selectedGhostNode = undefined;
}

export function updateGhostCircles(d3Data) {
    const dragChildren = d3Data.drag.selectedD3Node.descendants();
    const allOtherNodes = d3Data.root
        .descendants()
        .slice(1)
        .filter((node) => !dragChildren.includes(node));
    const rightGhostNodes = allOtherNodes.map((node) => ({d3Node: node, side: 'r'}));
    const leftGhostNodes = allOtherNodes
        .filter((node) => node === node.parent.children[0])
        .map((node) => ({
            d3Node: node,
            side: 'l',
        }));
    const bottomGhostNodes = allOtherNodes
        .filter((node) => node.data.isLeaf() || node.data.isCollapsed)
        .map((node) => ({
            d3Node: node,
            side: 'b',
        }));
    const dragNodes = [...rightGhostNodes, ...leftGhostNodes, ...bottomGhostNodes];

    // Remove all children nodes under the current node and also the links between them.
    d3Data.container.featureNodesContainer
        .selectAll('g.node')
        .data(dragChildren.slice(1), (d3Node) => d3Node.id)
        .remove();
    d3Data.container.linksContainer
        .selectAll('path.link')
        .data(dragChildren, (d3Node) => d3Node.id)
        .remove();
    d3Data.container.segmentsContainer
        .selectAll('path')
        .data(dragChildren, (d3Node) => d3Node.id)
        .remove();

    // Add ghost circles left and right to all nodes
    const ghostCircles = d3Data.container.dragContainer
        .selectAll('circle.ghost-circle')
        .data(dragNodes, (ghostNode) => ghostNode.d3Node.id + ghostNode.side);

    const ghostCirclesEnter = ghostCircles
        .enter()
        .append('circle')
        .classed('ghost-circle', true)
        .on('mouseover', (_, ghostNode) => overGhostNode(d3Data, ghostNode))
        .on('mouseout', () => outGhostNode(d3Data));

    ghostCirclesEnter.merge(ghostCircles).attr('transform', (ghostNode) => calcGhostCircleTransform(d3Data, ghostNode));

    ghostCircles.exit().remove();
}

function calcGhostCircleTransform(d3Data, ghostNode) {
    const y = ghostNode.d3Node.y;
    let dx = 0;

    const x = ghostNode.d3Node.x;
    let dy = 0;

    switch (ghostNode.side) {
        case 'l':
            dx += update.calcRectWidth(d3Data, ghostNode.d3Node) / 2 + CONSTANTS.SPACE_BETWEEN_NODES_HORIZONTALLY / 2;
            dx *= -1;
            dy = CONSTANTS.RECT_HEIGHT / 2;
            break;
        case 'r':
            dx += update.calcRectWidth(d3Data, ghostNode.d3Node) / 2 + CONSTANTS.SPACE_BETWEEN_NODES_HORIZONTALLY / 2;
            dx *= 1;
            dy = CONSTANTS.RECT_HEIGHT / 2;
            break;
        case 'b':
            dy = CONSTANTS.RECT_HEIGHT;
            dx = 0;
            break;
    }
    return `translate(${x + dx}, ${y + dy})`;
}

export function init(d3Data) {
    d3Data.drag.listener = d3
        .drag()
        .on('start', (_, d3Node) => {
            if (d3Node === d3Data.root) return;
            d3Data.drag.selectedD3Node = d3Node;
            d3Data.drag.hasStarted = true;
        })
        .on('drag', (event, d3Node) => {
            if (d3Node === d3Data.root) return;

            if (d3Data.drag.hasStarted) {
                d3Node.data.parent.unhideChildren();
                hide.update(d3Node.parent);
                update.updateSvg(d3Data);

                updateGhostCircles(d3Data);
                d3Data.drag.hasStarted = false;
            }

            // Transform current node.
            d3Data.container.featureNodesContainer
                .selectAll('g.node')
                .data([d3Node], (d3Node) => d3Node.id)
                .attr('transform', `translate(${event.x}, ${event.y})`);
        })
        .on('end', (_, d3Node) => {
            if (d3Node === d3Data.root) return;
            const nodeSelection = d3Data.container.featureNodesContainer.selectAll('g.node').data([d3Node], (d3Node) => d3Node.id);
            nodeSelection.select('g.rect-and-text').attr('pointer-events', 'mouseover');

            // Remove ghost circles.
            d3Data.container.dragContainer.selectAll('circle.ghost-circle').remove();

            const ghost = d3Data.drag.selectedGhostNode;

            if (ghost) {
                // Remove dragged node from tree.
                d3Node.parent.allChildren = d3Node.parent.allChildren.filter((node) => d3Node !== node);
                d3Node.data.parent.children = d3Node.data.parent.children.filter((node) => d3Node.data !== node);

                // Insert dragged node as neighbour of selected node.
                if (ghost.side === 'l' || ghost.side === 'r') {
                    // Insert as new child.
                    const dIndex = ghost.side === 'l' ? 0 : 1;
                    let d3Index = ghost.d3Node.parent.allChildren.indexOf(ghost.d3Node) + dIndex;
                    let index = ghost.d3Node.data.parent.children.indexOf(ghost.d3Node.data) + dIndex;
                    ghost.d3Node.parent.allChildren.splice(d3Index, 0, d3Node);
                    ghost.d3Node.data.parent.children.splice(index, 0, d3Node.data);

                    // Update member variables of nodes.
                    d3Node.parent.children = d3Node.parent.allChildren;
                    ghost.d3Node.parent.children = ghost.d3Node.parent.allChildren;
                    d3Node.data.parent = ghost.d3Node.data.parent;
                    d3Node.parent = ghost.d3Node.parent;
                } else if (ghost.side === 'b') {
                    if (ghost.d3Node.data.isLeaf()) {
                        d3Node.parent.children = d3Node.parent.allChildren;
                        d3Node.parent = ghost.d3Node;
                        ghost.d3Node.allChildren = [d3Node];
                        ghost.d3Node.children = ghost.d3Node.allChildren;

                        d3Node.data.parent = ghost.d3Node.data;
                        ghost.d3Node.data.children = [d3Node.data];
                    }
                }

                d3Data.drag.selectedGhostNode = undefined;
            }

            update.updateSvg(d3Data);
        });
}