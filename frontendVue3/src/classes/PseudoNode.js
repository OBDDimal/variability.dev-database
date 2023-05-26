export class PseudoNode {
    constructor(parent, hiddenD3Nodes) {
        this.hiddenD3Nodes = hiddenD3Nodes;
        this.parent = parent;
        this.d3Node = null;
    }

    unhideHiddenNodes() {
        // Unhide every node that is in this pseudo-node.
        this.hiddenD3Nodes.forEach(d3Node => d3Node.data.isHidden = false);

        // Move every node back to children of parent node.
        const parentD3Children = this.parent.d3Node.children;
        const index = parentD3Children.indexOf(this.d3Node);
        const leftD3Siblings = parentD3Children.slice(0, index);
        const rightD3Siblings = parentD3Children.slice(index + 1);
        this.parent.d3Node.children = [...leftD3Siblings, ...this.hiddenD3Nodes, ...rightD3Siblings];
    }
}
