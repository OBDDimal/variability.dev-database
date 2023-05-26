import {Command} from "@/classes/Commands/Command";

export class ConstraintCommand extends Command {
    constructor(allConstraints, constraint) {
        super();
        this.constraint = constraint;
        this.allConstraints = allConstraints;
    }

    markChanges() { /* Do nothing */ }

    unmarkChanges() { /* Do nothing */ }
}