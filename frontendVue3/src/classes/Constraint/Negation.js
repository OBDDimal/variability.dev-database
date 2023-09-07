import {ConstraintItem} from "@/classes/Constraint/ConstraintItem";

export class Negation extends ConstraintItem {
    constructor(item) {
        super();
        this.item = item;
    }

    count() {
        return 1;
    }

    toList() {
        return ['¬', ...this.addPossibleBracketsToList(this.item)]
    }

    toString() {
        return `¬${this.addPossibleBrackets(this.item)}`;
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

    evaluate(tmp = false) {
        const item = this.item.evaluate(tmp);

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
