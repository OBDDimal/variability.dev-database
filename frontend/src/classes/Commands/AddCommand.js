import {Command} from "@/classes/Commands/Command";
import {createFeatureNode} from "@/classes/FeatureNode";

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

        this.d3Data.updateTrigger.coloring = true;
    }

    undo() {
        this.dstParent.uncollapse();
        this.dstParent.unhideChildren();

        this.dstParent.removeChild(this.addedNode);

        this.d3Data.updateTrigger.coloring = true;
    }
}