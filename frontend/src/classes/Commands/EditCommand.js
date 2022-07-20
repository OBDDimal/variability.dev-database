import {Command} from "@/classes/Commands/Command";

export class EditCommand extends Command {
    constructor(d3Data, node, newData) {
        super(d3Data);
        this.node = node;
        this.newData = newData;

        // Properties for undo.
        this.oldData = undefined;
    }

    execute() {
        this.node.parent.uncollapse();
        this.node.parent.unhideChildren();

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
        this.node.parent.uncollapse();
        this.node.parent.unhideChildren();

        this.node.name = this.oldData.name;
        this.node.groupType = this.oldData.groupType;
        this.node.isMandatory = this.oldData.mandatory;
        this.node.isAbstract = this.oldData.abstract;
    }
}