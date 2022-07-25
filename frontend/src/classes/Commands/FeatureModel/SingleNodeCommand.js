import {Command} from "@/classes/Commands/Command";

export class SingleNodeCommand extends Command {
    constructor(d3Data, node) {
        super(d3Data);
        this.node = node;
    }

    markChanges() {
        this.node.markAsEdited();
    }

    unmarkChanges() {
        this.node.unmarkAsEdited();
    }
}
