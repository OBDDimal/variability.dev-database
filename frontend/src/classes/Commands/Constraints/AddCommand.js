import {ConstraintCommand} from "@/classes/Commands/Constraints/ConstraintCommand";
import {Constraint} from "@/classes/Constraint";

export class AddCommand extends ConstraintCommand {
    constructor(allConstraints, newConstraintItem) {
        const newConstraint = new Constraint(newConstraintItem)
        super(allConstraints, newConstraint);
    }

    execute() {
        this.allConstraints.push(this.constraint);
    }

    undo() {
        const index = this.allConstraints.indexOf(this.constraint);
        this.allConstraints.splice(index, 1);
    }
}