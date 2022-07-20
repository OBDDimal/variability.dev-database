import * as CONSTANTS from './constants';
import * as d3 from "d3";

export class FeatureNode {
	constructor(parent, name, groupType, mandatory, abstract) {
		this.parent = parent;
		this.name = name;
		this.displayName = name.slice(0, CONSTANTS.DISPLAY_NAME_LENGTH) + '...';
		this.children = [];
		this.groupType = groupType;
		this.isRoot = parent === null;
		this.isMandatory = mandatory;
		this.isAbstract = abstract;
		this.textColor = 'black';
		this.color = CONSTANTS.NODE_COLOR;
		this.constraints = [];
		this.constraintsHighlighted = [];
		this.isCollapsed = false;
		this.isHidden = false;
		this.d3Node = undefined;
	}

	childrenCount() {
		if (this.isLeaf()) {
			return 0;
		} else {
			return this.children.length;
		}
	}

	totalSubnodesCount() {
		if (this.isLeaf()) {
			return 0;
		} else {
			let totalSubnodesCount = this.children.length;
			this.children.forEach((node) => {
				totalSubnodesCount += node.totalSubnodesCount();
			});
			return totalSubnodesCount;
		}
	}

	isAnd() {
		return this.groupType === 'and';
	}

	isOr() {
		return this.groupType === 'or';
	}

	isAlt() {
		return this.groupType === 'alt';
	}

	isLeaf() {
		return this.children.length === 0;
	}

	uncollapse(toRoot = true) {
		if (this.isCollapsed && !this.isLeaf()) {
			this.d3Node.children = this.d3Node.collapsedChildren;
			this.d3Node.collapsedChildren = null;
		}

		if (!this.isRoot && toRoot) {
			this.parent.uncollapse();
		}

		this.isCollapsed = false;
	}

	collapse() {
		if (!this.isCollapsed && !this.isLeaf()) {
			this.d3Node.collapsedChildren = this.d3Node.children;
			this.d3Node.children = null;
		}

		this.isCollapsed = true;
	}

	toggleCollapse() {
		if (this.isCollapsed) {
			this.uncollapse();
		} else {
			this.collapse();
		}
	}

	getAllNodesToRoot() {
		if (this.isRoot) {
			return [this];
		} else {
			return [this, ...this.parent.getAllNodesToRoot()];
		}
	}

	getLeftSibling() {
		const index = this.parent.children.indexOf(this);
		if (index === 0) return null;
		return this.parent.children[index - 1];
	}

	getRightSibling() {
		const index = this.parent.children.indexOf(this);
		if (index === this.parent.children.length - 1) return null;
		return this.parent.children[index + 1];
	}

	getLeftSiblings() {
		const index = this.parent.children.indexOf(this);
		return this.parent.children.slice(0, index);
	}

	getRightSiblings() {
		const index = this.parent.children.indexOf(this);
		return this.parent.children.slice(index + 1);
	}

	hideLeftSiblings() {
		if (this.isRoot) return;

		const leftSiblings = this.getLeftSiblings();
		leftSiblings.forEach((node) => node.isHidden = true);

		const leftD3Siblings = leftSiblings.map((node) => node.d3Node);
		const pseudoNode = new PseudoNode(this.parent, leftD3Siblings);
		const d3PseudoNode = d3.hierarchy(pseudoNode);
		pseudoNode.d3Node = d3PseudoNode;

		const index = this.parent.d3Node.children.indexOf(this.d3Node);
		const rightD3Siblings = this.parent.d3Node.children.slice(index + 1);
		this.parent.d3Node.children = [d3PseudoNode, this.d3Node, ...rightD3Siblings];
	}

	hideRightSiblings() {
		if (this.isRoot) return;

		const rightSiblings = this.getRightSiblings();
		rightSiblings.forEach((node) => node.isHidden = true);

		const rightD3Siblings = rightSiblings.map((node) => node.d3Node);
		const pseudoNode = new PseudoNode(this.parent, rightD3Siblings);
		const d3PseudoNode = d3.hierarchy(pseudoNode);
		pseudoNode.d3Node = d3PseudoNode;

		const index = this.parent.d3Node.children.indexOf(this.d3Node);
		const leftD3Siblings = this.parent.d3Node.children.slice(0, index);
		this.parent.d3Node.children = [...leftD3Siblings, this.d3Node, d3PseudoNode];
	}

	unhideLeftSiblings() {
		if (this.isRoot) return;

		const leftSiblings = this.getLeftSiblings();
		leftSiblings.forEach((node) => node.isHidden = false);

		const index = this.parent.d3Node.children.indexOf(this.d3Node);
		const rightD3Siblings = this.parent.d3Node.children.slice(index + 1);
		const leftD3Siblings = leftSiblings.map((node) => node.d3Node);
		this.parent.d3Node.children = [...leftD3Siblings, this.d3Node, ...rightD3Siblings];
	}

	unhideRightSiblings() {
		if (this.isRoot) return;

		const rightSiblings = this.getRightSiblings();
		rightSiblings.forEach((node) => node.isHidden = false);

		const index = this.parent.d3Node.children.indexOf(this.d3Node);
		const leftD3Siblings = this.parent.d3Node.children.slice(index + 1);
		const rightD3Siblings = rightSiblings.map((node) => node.d3Node);
		this.parent.d3Node.children = [...leftD3Siblings, this.d3Node, ...rightD3Siblings];
	}

	hide() {
		if (this.isRoot) return;

		const index = this.parent.d3Node.children.indexOf(this.d3Node);

		// Check if the d3Node left is also a pseudo-node. If true merge with current one.
		let leftHiddenD3Nodes = [];
		let leftIndex = index;
		if (index !== 0) {
			const leftD3Node = this.parent.d3Node.children[index - 1];
			if (leftD3Node.data instanceof PseudoNode) {
				leftHiddenD3Nodes = leftD3Node.data.hiddenD3Nodes;
				leftIndex--;
			}
		}

		// Check if the d3Node right is also a pseudo-node. If true merge with current one.
		let rightHiddenD3Nodes = [];
		let rightIndex = index;
		if (index !== this.parent.d3Node.children.length - 1) {
			const rightD3Node = this.parent.d3Node.children[index + 1];
			if (rightD3Node.data instanceof PseudoNode) {
				rightHiddenD3Nodes = rightD3Node.data.hiddenD3Nodes;
				rightIndex++;
			}
		}

		const hiddenD3Nodes = [...leftHiddenD3Nodes, this.d3Node, ...rightHiddenD3Nodes];

		const pseudoNode = new PseudoNode(this.parent, hiddenD3Nodes);
		const d3PseudoNode = d3.hierarchy(pseudoNode);
		pseudoNode.d3Node = d3PseudoNode;

		const leftD3Siblings = this.parent.d3Node.children.slice(0, leftIndex);
		const rightD3Siblings = this.parent.d3Node.children.slice(rightIndex + 1);

		this.parent.d3Node.children = [...leftD3Siblings, d3PseudoNode, ...rightD3Siblings];
		this.isHidden = true;
	}

	unhideChildren() {
		if (this.isLeaf()) return;

		this.children.forEach((node) => node.isHidden = false);
		this.d3Node.children = this.children.map((node) => node.d3Node);
	}
}

export class PseudoNode {
	constructor(parent, hiddenD3Nodes) {
		this.hiddenD3Nodes = hiddenD3Nodes;
		this.parent = parent;
		this.d3Node = undefined;
	}

	unhideHiddenNodes() {
		// Unhide every node that is in this pseudo-node.
		this.hiddenD3Nodes.forEach((d3Node) => d3Node.data.isHidden = false);

		// Move every node back to children of parent node.
		const parentD3Children = this.parent.d3Node.children;
		const index = parentD3Children.indexOf(this.d3Node);
		const leftD3Siblings = parentD3Children.slice(0, index);
		const rightD3Siblings = parentD3Children.slice(index + 1);
		this.parent.d3Node.children = [...leftD3Siblings, ...this.hiddenD3Nodes, ...rightD3Siblings];
	}
}
