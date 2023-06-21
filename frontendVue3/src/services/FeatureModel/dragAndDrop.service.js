import * as update from '@/services/FeatureModel/update.service.js';
import * as CONSTANTS from '@/classes/constants';
import * as d3 from 'd3';
import {SwapCommand} from "@/classes/Commands/FeatureModel/SwapCommand";

function overGhostNode(d3Data, ghostNode) {
    d3Data.drag.selectedGhostNode = ghostNode;

    // Highlight current ghostNode.
    d3Data.container.dragContainer
        .selectAll('circle.ghost-circle')
        .data([ghostNode], gN => gN.d3Node.id + gN.side)
        .classed('ghost-circle-highlighted', true);

    // Uncollapse features.
    if (ghostNode.side === 'b' && !ghostNode.d3Node.data.isLeaf()) {
        setTimeout(() => {
            if (d3Data.drag.selectedGhostNode === ghostNode) {
                ghostNode.d3Node.data.uncollapse();
                update.updateSvg(d3Data);
                updateGhostCircles(d3Data);
                translateD3NodeToMouse(d3Data, d3Data.drag.selectedD3Node);
            }
        }, 500);
    }
}

function outGhostNode(d3Data) {
    // Reset highlighting of current ghostNode.
    if (d3Data.drag.selectedGhostNode) {
        d3Data.container.dragContainer
            .selectAll('circle.ghost-circle')
            .data([d3Data.drag.selectedGhostNode], gN => gN.d3Node.id + gN.side)
            .classed('ghost-circle-highlighted', false);
    }

    d3Data.drag.selectedGhostNode = null;
}

export function updateGhostCircles(d3Data) {
    // Remove all children nodes under the current node and also the links between them.
    const dragChildren = d3Data.drag.selectedD3Node.descendants();
    d3Data.container.featureNodesContainer
        .selectAll('g.node')
        .data(dragChildren.slice(1), d3Node => d3Node.id)
        .remove();
    d3Data.container.linksContainer
        .selectAll('path.link')
        .data(dragChildren, d3Node => d3Node.id)
        .remove();
    d3Data.container.segmentsContainer
        .selectAll('path')
        .data(dragChildren, d3Node => d3Node.id)
        .remove();

    let dragNodes = [];
    if (d3Data.semanticEditing) {
        const allOtherNodes = d3Data.root
            .descendants()
            .slice(1)
            .filter(node => !dragChildren.includes(node) && !d3Data.drag.selectedD3Node.children?.includes(node) && node !== d3Data.drag.selectedD3Node);

        const rightGhostNodes = allOtherNodes.map(node => ({d3Node: node, side: 'r'}));
        const leftGhostNodes = allOtherNodes
            .filter(node => node === node.parent.children[0])
            .map(node => ({
                d3Node: node,
                side: 'l',
            }));

        const bottomGhostNodes = allOtherNodes
            .filter(node => node.data.isLeaf() || node.data.isCollapsed)
            .map(node => ({
                d3Node: node,
                side: 'b',
            }));

        dragNodes = [...rightGhostNodes, ...leftGhostNodes, ...bottomGhostNodes];
    }

    // Siblings on the same level.
    const leftGhostNodesOnSameLevel = d3Data.drag.selectedD3Node.data.getLeftSiblings().map(node => ({d3Node: node.d3Node, side: 'l'}));
    const rightGhostNodesOnSameLevel = d3Data.drag.selectedD3Node.data.getRightSiblings().map(node => ({d3Node: node.d3Node, side: 'r'}));
    dragNodes = [...dragNodes, ...leftGhostNodesOnSameLevel, ...rightGhostNodesOnSameLevel];
    d3Data.drag.ghostNodes = dragNodes;

    // Add ghost circles left and right to all nodes
    const ghostCircles = d3Data.container.dragContainer
        .selectAll('circle.ghost-circle')
        .data(dragNodes, ghostNode => ghostNode.d3Node.id + ghostNode.side);

    const ghostCirclesEnter = ghostCircles
        .enter()
        .append('circle')
        .attr('r', d3Data.drag.mode === 'mouse' ? CONSTANTS.GHOST_NODE_RADIUS_MOUSE : CONSTANTS.GHOST_NODE_RADIUS_TOUCH)
        .attr('ref', ghostNode => ghostNode.d3Node.id + ghostNode.side)
        .classed('ghost-circle', true)
        .on('mouseover', (_, ghostNode) => overGhostNode(d3Data, ghostNode))
        .on('mouseout', () => outGhostNode(d3Data));

    ghostCirclesEnter.merge(ghostCircles).attr('transform', ghostNode => calcGhostCircleTransform(d3Data, ghostNode));

    ghostCircles.exit().remove();
}

function calcGhostCircleTransform(d3Data, ghostNode) {
    const y = ghostNode.d3Node.y;
    let dx = 0;

    const x = ghostNode.d3Node.x;
    let dy = 0;

    if (d3Data.direction === 'v') {
        switch (ghostNode.side) {
            case 'l':
                dx += ghostNode.d3Node.width / 2 + d3Data.spaceBetweenSiblings / 2;
                dx *= -1;
                dy = CONSTANTS.RECT_HEIGHT / 2;
                break;
            case 'r':
                dx += ghostNode.d3Node.width / 2 + d3Data.spaceBetweenSiblings / 2;
                dx *= 1;
                dy = CONSTANTS.RECT_HEIGHT / 2;
                break;
            case 'b':
                dy = CONSTANTS.RECT_HEIGHT;
                break;
            default:
                dx = 0;
                dy = 0;
        }
    } else {
        switch (ghostNode.side) {
            case 'l':
                dy += CONSTANTS.RECT_HEIGHT / 2 + d3Data.spaceBetweenSiblings / 2 + 1;
                dy *= -1;
                break;
            case 'r':
                dy += CONSTANTS.RECT_HEIGHT / 2 + d3Data.spaceBetweenSiblings / 2 + 1;
                dy *= 1;
                break;
            case 'b':
                dx = ghostNode.d3Node.width;
                break;
            default:
                dx = 0;
                dy = 0;
        }
    }
    return `translate(${x + dx}, ${y + dy})`;
}

export function init(d3Data, commandManager) {
    d3Data.drag.listener = d3
        .drag()
        .on('start', (_, d3Node) => {
            if (!commandManager.collaborationManager.featureModel.editRights || d3Node === d3Data.root) {
                return;
            }
            d3Data.drag.selectedD3Node = d3Node;
            d3Data.drag.hasStarted = true;
        })
        .on('drag', (event, d3Node) => {
            if (!commandManager.collaborationManager.featureModel.editRights || d3Node === d3Data.root) {
                return;
            }

            if (d3Data.drag.hasStarted) {
                d3Data.drag.mode = event.sourceEvent instanceof MouseEvent ? 'mouse' : 'touch';
                d3Node.data.parent.unhideChildren();
                d3Node.data.collapse();

                // Get all nodes to root without root.
                d3Node.data.getAllNodesToRoot().slice(1).forEach(node => {
                    node.unhideChildren();
                });

                update.updateSvg(d3Data);

                updateGhostCircles(d3Data);
                d3Data.drag.hasStarted = false;
            }

            d3Data.drag.selectedD3NodePosition = {x: event.x, y: event.y};
            translateD3NodeToMouse(d3Data, d3Node);
        })
        .on('end', (_, d3Node) => {
            if (d3Node === d3Data.root) {
                return;
            }
            const nodeSelection = d3Data.container.featureNodesContainer.selectAll('g.node').data([d3Node], d => d.id);
            nodeSelection.select('g.rect-and-text').attr('pointer-events', 'all');

            // Remove ghost circles.
            d3Data.container.dragContainer.selectAll('circle.ghost-circle').remove();

            const ghost = d3Data.drag.selectedGhostNode;

            if (ghost) {
                let dstParent = null;
                let dstIndex = null;
                let valid = false;
                if (ghost.side === 'l' || ghost.side === 'r') {
                    const dIndex = ghost.side === 'l' ? 0 : 1;
                    dstIndex = ghost.d3Node.data.parent.children.indexOf(ghost.d3Node.data) + dIndex;
                    dstParent = ghost.d3Node.data.parent;

                    valid = true;
                } else if (ghost.side === 'b' && ghost.d3Node.data.isLeaf()) {
                    dstIndex = 0;
                    dstParent = ghost.d3Node.data;
                    valid = true;
                }

                if (valid) {
                    const swapCommand = new SwapCommand(
                        d3Node.data,
                        dstParent,
                        dstIndex,
                    );
                    commandManager.execute(swapCommand);
                }

                d3Data.drag.selectedGhostNode = null;
                d3Data.drag.ghostNodes = [];
            }

            update.updateSvg(d3Data);
        });
}

function translateD3NodeToMouse(d3Data, d3Node) {
    d3Data.container.featureNodesContainer
        .selectAll('g.node')
        .data([d3Node], d => d.id)
        .attr('transform', `translate(${d3Data.drag.selectedD3NodePosition.x}, ${d3Data.drag.selectedD3NodePosition.y})`);
}

export function ghostNodeTouchMove(event, d3Data) {
    const htmlElement = document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
    const ghostNodeRef = htmlElement.getAttribute('ref');
    if (ghostNodeRef) {
        const ghostNode = d3Data.drag.ghostNodes.find(gN => gN.d3Node.id + gN.side === ghostNodeRef);
        overGhostNode(d3Data, ghostNode);
    } else {
        outGhostNode(d3Data);
    }
}
