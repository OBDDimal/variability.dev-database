import * as updateSvg from '@/services/FeatureModel/updateSvg.service.js';
import * as CONSTANTS from '@/classes/constants';

function overGhostNode(drag, ghostNode) {
	drag.selectedGhostNode = ghostNode;

	// Uncollapse features.
	if (ghostNode.side === 'b' && !ghostNode.d3Node.data.isLeaf()) {
		setTimeout(() => {
			if (drag.selectedGhostNode === ghostNode) {
				ghostNode.d3Node.data.uncollapse();
				updateCollapsing();
				updateSvg();
				updateGhostCircles();
			}
		}, 500);
	}
}

function outGhostNode(drag) {
	drag.selectedGhostNode = undefined;
}

export function updateGhostCircles(d3Data, container, drag) {
	const dragChildren = drag.selectedD3Node.descendants();
	const allOtherNodes = d3Data.root
		.descendants()
		.slice(1)
		.filter((node) => !dragChildren.includes(node));
	const rightGhostNodes = allOtherNodes.map((node) => ({ d3Node: node, side: 'r' }));
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
	container.featureNodesContainer
		.selectAll('g.node')
		.data(dragChildren.slice(1), (d3Node) => d3Node.id)
		.remove();
	container.linksContainer
		.selectAll('path.link')
		.data(dragChildren, (d3Node) => d3Node.id)
		.remove();
	container.segmentsContainer
		.selectAll('path')
		.data(dragChildren, (d3Node) => d3Node.id)
		.remove();

	// Add ghost circles left and right to all nodes
	const ghostCircles = container.dragContainer
		.selectAll('circle.ghost-circle')
		.data(dragNodes, (ghostNode) => ghostNode.d3Node.id + ghostNode.side);

	const ghostCirclesEnter = ghostCircles
		.enter()
		.append('circle')
		.classed('ghost-circle', true)
		.on('mouseover', (_, ghostNode) => overGhostNode(ghostNode))
		.on('mouseout', () => outGhostNode());

	ghostCirclesEnter.merge(ghostCircles).attr('transform', (ghostNode) => calcGhostCircleTransform(ghostNode));

	ghostCircles.exit().remove();
}

function calcGhostCircleTransform(ghostNode) {
	const y = ghostNode.d3Node.y;
	let dx = 0;

	const x = ghostNode.d3Node.x;
	let dy = 0;

	switch (ghostNode.side) {
		case 'l':
			dx += updateSvg.calcRectWidth(ghostNode.d3Node) / 2 + CONSTANTS.SPACE_BETWEEN_NODES_HORIZONTALLY / 2;
			dx *= -1;
			dy = CONSTANTS.RECT_HEIGHT / 2;
			break;
		case 'r':
			dx += updateSvg.calcRectWidth(ghostNode.d3Node) / 2 + CONSTANTS.SPACE_BETWEEN_NODES_HORIZONTALLY / 2;
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

function defineDragListener(d3Data, container, drag) {
	drag.listener = d3
		.drag()
		.on('start', (_, d3Node) => {
			if (d3Node === d3Data.root) return;
			drag.selectedD3Node = d3Node;
			drag.hasStarted = true;
		})
		.on('drag', (event, d3Node) => {
			if (d3Node === d3Data.root) return;

			if (drag.hasStarted) {
				updateGhostCircles();
				drag.hasStarted = false;
			}

			// Transform current node.
			container.featureNodesContainer
				.selectAll('g.node')
				.data([d3Node], (d3Node) => d3Node.id)
				.attr('transform', `translate(${event.x}, ${event.y})`);
		})
		.on('end', (_, d3Node) => {
			if (d3Node === d3Data.root) return;
			const nodeSelection = container.featureNodesContainer.selectAll('g.node').data([d3Node], (d3Node) => d3Node.id);
			nodeSelection.select('g.rect-and-text').attr('pointer-events', 'mouseover');

			// Remove ghost circles.
			container.dragContainer.selectAll('circle.ghost-circle').remove();

			if (drag.selectedGhostNode) {
				// Remove dragged node from tree.
				d3Node.parent.allChildren = d3Node.parent.allChildren.filter((node) => d3Node !== node);
				d3Node.data.parent.children = d3Node.data.parent.children.filter((node) => d3Node.data !== node);

				// Insert dragged node as neighbour of selected node.
				if (drag.selectedGhostNode.side === 'l' || drag.selectedGhostNode.side === 'r') {
					// Insert as new child.
					const dIndex = drag.selectedGhostNode.side === 'l' ? 0 : 1;
					let d3Index = drag.selectedGhostNode.d3Node.parent.allChildren.indexOf(drag.selectedGhostNode.d3Node) + dIndex;
					let index = drag.selectedGhostNode.d3Node.data.parent.children.indexOf(drag.selectedGhostNode.d3Node.data) + dIndex;
					drag.selectedGhostNode.d3Node.parent.allChildren.splice(d3Index, 0, d3Node);
					drag.selectedGhostNode.d3Node.data.parent.children.splice(index, 0, d3Node.data);

					// Update member variables of nodes.
					d3Node.parent.children = d3Node.parent.allChildren;
					drag.selectedGhostNode.d3Node.parent.children = drag.selectedGhostNode.d3Node.parent.allChildren;
					d3Node.data.parent = drag.selectedGhostNode.d3Node.data.parent;
					d3Node.parent = drag.selectedGhostNode.d3Node.parent;
				} else if (drag.selectedGhostNode.side === 'b') {
					if (drag.selectedGhostNode.d3Node.data.isLeaf()) {
						d3Node.parent.children = d3Node.parent.allChildren;
						d3Node.parent = drag.selectedGhostNode.d3Node;
						drag.selectedGhostNode.d3Node.allChildren = [d3Node];
						drag.selectedGhostNode.d3Node.children = drag.selectedGhostNode.d3Node.allChildren;

						d3Node.data.parent = drag.selectedGhostNode.d3Node.data;
						drag.selectedGhostNode.d3Node.data.children = [d3Node.data];
					}
				}

				drag.selectedGhostNode = undefined;
			}

			updateSvg();
		});
}