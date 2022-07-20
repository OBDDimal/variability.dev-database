import {Command} from "@/classes/Commands/Command";
import * as d3 from "d3";
import {FeatureNode} from "@/classes/featureNode";

export class AddCommand extends Command {
    constructor(d3Data, dstD3Parent, dstIndex, data) {
        super(d3Data);
        this.dstD3Parent = dstD3Parent;
        this.dstIndex = dstIndex;
        this.data = data;

        // Properties for undo.
        this.addedNode = undefined;
    }

    execute() {
        this.dstD3Parent.data.uncollapse();
        this.dstD3Parent.data.unhideChildren();

        if (!this.addedNode) {
            // Create new feature-node.
            const node = new FeatureNode(this.dstD3Parent.data, this.data.name, this.data.groupType, this.data.mandatory, this.data.abstract);
            const d3Node = d3.hierarchy(node);
            node.d3Node = d3Node;
            d3Node.parent = this.dstD3Parent;

            // Save properties for undo.
            this.addedNode = node;
        }

        // Update d3-children
        let leftD3Nodes = [];
        let rightD3Nodes = [];
        if (this.dstD3Parent.allChildren) {
            leftD3Nodes = this.dstD3Parent.allChildren.slice(0, this.dstIndex);
            rightD3Nodes = this.dstD3Parent.allChildren.slice(this.dstIndex);
        }
        this.dstD3Parent.allChildren = [...leftD3Nodes, this.addedNode.d3Node, ...rightD3Nodes];
        this.dstD3Parent.children = this.dstD3Parent.allChildren;

        // Update feature-node-children
        const leftNodes = this.addedNode.parent.children.slice(0, this.dstIndex);
        const rightNodes = this.addedNode.parent.children.slice(this.dstIndex);
        this.addedNode.parent.children = [...leftNodes, this.addedNode, ...rightNodes];

        // Add to all-nodes
        this.d3Data.allNodes.push(this.addedNode.d3Node);
    }

    undo() {
        this.dstD3Parent.data.uncollapse();
        this.dstD3Parent.data.unhideChildren();

        this.addedNode.parent.children = this.addedNode.parent.children.filter((node) => node !== this.addedNode);
        this.dstD3Parent.allChildren = this.dstD3Parent.allChildren.filter((d3Node) => d3Node.data !== this.addedNode);
        this.dstD3Parent.children = this.dstD3Parent.allChildren;

        this.d3Data.allNodes = this.d3Data.allNodes.filter((d3Node) => d3Node.data !== this.addedNode);
    }
}