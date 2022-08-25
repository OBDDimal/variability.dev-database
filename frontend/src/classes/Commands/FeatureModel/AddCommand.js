import {FeatureNodeCommand} from "@/classes/Commands/FeatureModel/FeatureNodeCommand";
import {createFeatureNode} from "@/classes/FeatureNode";

export class AddCommand extends FeatureNodeCommand {
    constructor(dstParent, dstIndex, data) {
        const node = createFeatureNode(dstParent, data.name, data.groupType, data.mandatory, data.abstract);
        super(node);
        this.dstParent = dstParent;
        this.dstIndex = dstIndex;
        this.data = data;
    }

    execute() {
        this.dstParent.uncollapse();
        this.dstParent.unhideChildren();

        this.dstParent.insertChildAtIndex(this.node, this.dstIndex);
    }

    undo() {
        this.dstParent.uncollapse();
        this.dstParent.unhideChildren();

        this.dstParent.removeChild(this.node);
    }

    createDTO() {
        return {
            commandType: 'add',
            dstParentName: this.dstParent.name,
            dstIndex: this.dstIndex,
            data: this.data,
        };
    }
}