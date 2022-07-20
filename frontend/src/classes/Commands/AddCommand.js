import {Command} from "@/classes/Commands/Command";
import {createFeatureNode} from "@/classes/featureNode";

export class AddCommand extends Command {
    constructor(d3Data, dstParent, dstIndex, data) {
        super(d3Data);
        this.dstParent = dstParent;
        this.dstIndex = dstIndex;
        this.data = data;

        // Properties for undo.
        this.addedNode = undefined;
    }

    execute() {
        this.dstParent.uncollapse();
        this.dstParent.unhideChildren();

        if (!this.addedNode) {
            this.addedNode = createFeatureNode(this.dstParent, this.data.name, this.data.groupType, this.data.mandatory, this.data.abstract);
        }

        this.dstParent.insertChildAtIndex(this.addedNode, this.dstIndex);

        // Add to all-nodes
        this.d3Data.allNodes.push(this.addedNode.d3Node);
    }

    undo() {
        this.dstParent.uncollapse();
        this.dstParent.unhideChildren();

        this.dstParent.removeChild(this.addedNode);

        // Remove from all-nodes
        this.d3Data.allNodes = this.d3Data.allNodes.filter((d3Node) => d3Node.data !== this.addedNode);
    }
}