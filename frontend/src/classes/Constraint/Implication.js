import {ConstraintItem} from "@/classes/Constraint/ConstraintItem";

export class Implication extends ConstraintItem {
    constructor(premise, conclusion) {
        super();
        this.premise = premise;
        this.conclusion = conclusion;
    }

    count() {
        return 2;
    }

    toString() {
        return `${this.addPossibleBrackets(this.premise)} ⇒ ${this.addPossibleBrackets(this.conclusion)}`;
    }

    toStringForEdit() {
        return `${this.addPossibleBracketsForEdit(this.premise)} IMPLIES ${this.addPossibleBracketsForEdit(this.conclusion)}`;
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
