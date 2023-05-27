import {ConstraintItem} from "@/classes/Constraint/ConstraintItem";

export class Negation extends ConstraintItem {
    constructor(item) {
        super();
        this.item = item;
    }

    count() {
        return 1;
    }

    toString() {
        return `¬${this.addPossibleBrackets(this.item)}`;
    }

    toList() {
        return ['¬', ...this.addPossibleBracketsToList(this.item)]
    }

    toStringForEdit() {
        return `NOT ${this.addPossibleBracketsForEdit(this.item)}`;
    }

    toStringPostfix() {
        return `${this.item.toStringPostfix()} Negation`;
    }

    toStringXML() {
        return `<not>${this.item.toStringXML()}</not>`;
    }

    getFeatureNodes() {
        return this.item.getFeatureNodes();
    }

    setConstraint(constraint) {
        this.item.setConstraint(constraint);
    }

    removeConstraint() {
        this.item.removeConstraint();
    }

    evaluate() {
        const item = this.item.evaluate();

        if (item === undefined) {
            return undefined;
        } else {
            return !item;
        }
    }

    quickFix(target) {
        if (this.item.evaluate() === target) {
            return this.item.quickFix(!target);
        }

        console.error("Quick fix, Negation")
        return [];
    }
}