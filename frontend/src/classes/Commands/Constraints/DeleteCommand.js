import {ConstraintCommand} from "@/classes/Commands/Constraints/ConstraintCommand";

export class DeleteCommand extends ConstraintCommand {
    constructor(allConstraints, constraint) {
        super(allConstraints, constraint);

        this.index = this.allConstraints.indexOf(constraint);
    }

    execute() {
        this.constraint.rule.removeConstraint();
        this.allConstraints.splice(this.index, 1);
    }

    undo() {
        this.allConstraints.splice(this.index, 0, this.constraint);
        this.constraint.rule.setConstraint(this.constraint);
    }

    createDTO() {
        return {
            commandType: 'delete',
            index: this.index,
        };
    }
}