import {FeatureNodeCommand} from "@/classes/Commands/FeatureModel/FeatureNodeCommand";

export class SwapCommand extends FeatureNodeCommand {
    constructor(d3Data, node, dstParent, dstIndex) {
        super(d3Data, node);
        this.dstParent = dstParent;
        this.dstIndex = dstIndex;

        // Properties for undo.
        this.srcParent = undefined;
        this.srcIndex = undefined;
    }

    execute() {
        this.dstParent.uncollapse();
        this.dstParent.unhideChildren();

        this.srcParent = this.node.parent;
        this.srcIndex = this.srcParent.children.indexOf(this.node);

        // Special case: If node is on same level and left of the ghost the index has to be decreased.
        let tmp = 0;
        if (this.srcParent === this.dstParent && this.srcIndex < this.dstIndex) {
            tmp = 1;
        }

        this.srcParent.removeChild(this.node);
        this.dstParent.insertChildAtIndex(this.node, this.dstIndex - tmp);

        this.d3Data.updateTrigger.coloring = true;
    }

    undo() {
        this.dstParent.uncollapse();
        this.dstParent.unhideChildren();

        this.dstParent.removeChild(this.node);
        this.srcParent.insertChildAtIndex(this.node, this.srcIndex);

        this.d3Data.updateTrigger.coloring = true;
    }
}