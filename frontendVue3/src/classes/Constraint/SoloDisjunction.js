import {ConstraintItem} from "../../../../frontend/src/classes/Constraint/ConstraintItem";

export class SoloDisjunction extends ConstraintItem {
    constructor(item) {
        super();
        this.item = item;
    }

    count() {
        return 1;
    }

    toString() {
        return `${this.addPossibleBrackets(this.item)}`;
    }

    toStringForEdit() {
        return `${this.addPossibleBracketsForEdit(this.item)}`;
    }

    toStringPostfix() {
        return `${this.item.toStringPostfix()}`;
    }

    toStringXML() {
        return `<disj>${this.item.toStringXML()}</disj>`;
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
}
