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
}
