import {ConstraintCommand} from "@/classes/Commands/Constraints/ConstraintCommand";

export class EditCommand extends ConstraintCommand {
    constructor(allConstraints, constraint, newConstraintItem) {
        super(allConstraints, constraint);

        this.newConstraintItem = newConstraintItem;
        this.oldConstraintItem = constraint.rule;
    }

    execute() {
        this.constraint.rule.removeConstraint();  // Remove Constraints on  outdatet FeaturenodeConstraintItems
        this.constraint.rule = this.newConstraintItem;
        this.constraint.rule.setConstraint(this.constraint);
    }

    undo() {
        this.constraint.rule.removeConstraint(); // Remove Constraints on  outdatet FeaturenodeConstraintItems
        this.constraint.rule = this.oldConstraintItem;
        this.constraint.rule.setConstraint(this.constraint);
    }

    createDTO() {
        return {
            commandType: 'edit',
            constraintItemInfix: this.oldConstraintItem.toStringForEdit(),
            newConstraintItemInfix: this.newConstraintItem.toStringForEdit(),
        };
    }
}