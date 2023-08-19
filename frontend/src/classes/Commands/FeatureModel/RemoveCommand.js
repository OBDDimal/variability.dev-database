import {FeatureNodeCommand} from "@/classes/Commands/FeatureModel/FeatureNodeCommand";

export class RemoveCommand extends FeatureNodeCommand {
    constructor(node, dstIndex) {
        super();
        this.node = node;
        this.parent = node.parent
        this.dstIndex = dstIndex

        // Properties for undo.
        this.oldData = {
            name: this.node.name,
            groupType: this.node.groupType,
            mandatory: this.node.isMandatory,
            abstract: this.node.isAbstract,
        };
    }

    undo() {
        this.parent.uncollapse();
        this.parent.unhideChildren();

        this.parent.insertChildAtIndex(this.node, this.dstIndex);
    }

    execute() {
        this.parent.uncollapse();
        this.parent.unhideChildren();

        this.parent.removeChild(this.node);
    }

    createDTO() {
        return {
            commandType: 'remove',
            nodeName: this.node.name,
            dstIndex: this.dstIndex,
        };
    }

    markChanges() {
        this.parent.markAsEdited()
    }

    unmarkChanges() {
        this.parent.unmarkAsEdited()
    }
}