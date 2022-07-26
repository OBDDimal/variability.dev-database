import {ConstraintItem} from "@/classes/Constraint/ConstraintItem";

export class Implication extends ConstraintItem {
    constructor(premise, conclusion) {
        super();
        this.premise = premise;
        this.conclusion = conclusion;
    }

    count() {
        return 1;
    }

    toString() {
        return `${this.premise.toString()} ⇒ ${this.conclusion.toString()}`;
    }

    toStringForEdit() {
        return `${this.premise.toStringForEdit()} IMPLIES ${this.conclusion.toStringForEdit()}`;
    }

    toStringPostfix() {
        return `${this.premise.toStringPostfix()} ${this.conclusion.toStringPostfix()} Implication`;
    }

    toStringXML() {
        return `<imp>${this.premise.toStringXML()} ${this.conclusion.toStringXML()}</imp>`;
    }

    getFeatureNodes() {
        return [...this.premise.getFeatureNodes().flat(), ...this.conclusion.getFeatureNodes()];
    }

    setConstraint(constraint) {
        this.premise.setConstraint(constraint);
        this.conclusion.setConstraint(constraint);
    }

    removeConstraint() {
        this.premise.removeConstraint();
        this.conclusion.removeConstraint();
    }
}
