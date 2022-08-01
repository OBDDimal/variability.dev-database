import {Command} from "@/classes/Commands/Command";

export class FeatureNodeCommand extends Command {
    constructor(d3Data, node) {
        super();
        this.node = node;
        this.d3Data = d3Data;
    }

    markChanges() {
        this.node.markAsEdited();
    }

    unmarkChanges() {
        this.node.unmarkAsEdited();
    }
}
