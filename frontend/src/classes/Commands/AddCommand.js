import {SingleNodeCommand} from "@/classes/Commands/SingleNodeCommand";
import {createFeatureNode} from "@/classes/FeatureNode";

export class AddCommand extends SingleNodeCommand {
    constructor(d3Data, dstParent, dstIndex, data) {
        const node = createFeatureNode(dstParent, data.name, data.groupType, data.mandatory, data.abstract);
        super(d3Data, node);
        this.dstParent = dstParent;
        this.dstIndex = dstIndex;
        this.data = data;
    }

    execute() {
        this.dstParent.uncollapse();
        this.dstParent.unhideChildren();

        this.dstParent.insertChildAtIndex(this.node, this.dstIndex);

        this.d3Data.updateTrigger.coloring = true;
    }

    undo() {
        this.dstParent.uncollapse();
        this.dstParent.unhideChildren();

        this.dstParent.removeChild(this.node);

        this.d3Data.updateTrigger.coloring = true;
    }
}