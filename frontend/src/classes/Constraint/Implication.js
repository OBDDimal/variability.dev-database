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
        return `${this.addPossibleBrackets(this.premise)} ⇒ ${this.addPossibleBrackets(this.conclusion)}`;
    }

    toStringPostfix() {
        return `${this.premise.toStringPostfix()} ${this.conclusion.toStringPostfix()} Implication`;
    }

    getFeatureNodes() {
        return [...this.premise.getFeatureNodes().flat(), ...this.conclusion.getFeatureNodes()];
    }
}
