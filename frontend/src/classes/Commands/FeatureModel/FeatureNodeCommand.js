import {Command} from "@/classes/Commands/Command";

export class FeatureNodeCommand extends Command {
    constructor(node) {
        super();
        this.node = node;
    }

    markChanges() {
        this.node.markAsEdited();
    }

    unmarkChanges() {
        this.node.unmarkAsEdited();
    }
}
