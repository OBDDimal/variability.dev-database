import {FeatureNodeCommand} from "@/classes/Commands/FeatureModel/FeatureNodeCommand";

export class EditCommand extends FeatureNodeCommand {
    constructor(node, newData) {
        super();
        this.node = node;
        this.newData = newData;

        // Properties for undo.
        this.oldData = {
            name: this.node.name,
            groupType: this.node.groupType,
            mandatory: this.node.isMandatory,
            abstract: this.node.isAbstract,
        };
    }

    execute() {
        if (this.node.parent) {
            this.node.parent.uncollapse();
            this.node.parent.unhideChildren();
        }
        this.node.name = this.newData.name;
        this.node.setDisplayName(this.newData.name);
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
        this.node.setDisplayName(this.oldData.name);
        this.node.groupType = this.oldData.groupType;
        this.node.isMandatory = this.oldData.mandatory;
        this.node.isAbstract = this.oldData.abstract;
    }

    createDTO() {
        return {
            commandType: 'edit',
            nodeName: this.oldData.name,
            newData: this.newData,
        };
    }
}
