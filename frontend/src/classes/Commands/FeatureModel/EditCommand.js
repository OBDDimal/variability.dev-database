import {FeatureNodeCommand} from "@/classes/Commands/FeatureModel/FeatureNodeCommand";

export class EditCommand extends FeatureNodeCommand {
    constructor(d3Data, node, newData) {
        super(d3Data);
        this.node = node;
        this.newData = newData;

        // Properties for undo.
        this.oldData = null;
    }

    execute() {
        if (this.node.parent) {
            this.node.parent.uncollapse();
            this.node.parent.unhideChildren();
        }

        if (!this.oldData) {
            this.oldData = {
                name: this.node.name,
                groupType: this.node.groupType,
                mandatory: this.node.isMandatory,
                abstract: this.node.isAbstract,
            };
        }

        this.node.name = this.newData.name;
        this.node.groupType = this.newData.groupType;
        this.node.isMandatory = this.newData.mandatory;
        this.node.isAbstract = this.newData.abstract;
    }

    undo() {
        if (this.node.parent) {
            this.node.parent.uncollapse();
            this.node.parent.unhideChildren();
        }

        this.node.name = this.oldData.name;
        this.node.groupType = this.oldData.groupType;
        this.node.isMandatory = this.oldData.mandatory;
        this.node.isAbstract = this.oldData.abstract;
    }
}
