import {GroupConstraintItem} from "@/classes/Constraint/GroupConstraintItem";

export class Disjunction extends GroupConstraintItem {
    constructor(items) {
        super(items, '∨', 'OR', 'disj');
    }

    evaluate() {
        const evaluations = this.items.map(i => i.evaluate());

        if (evaluations.some(x => x === true)) {
            return true;
        } else if (evaluations.every(x => x === false)) {
            return false;
        } else {
            return undefined;
        }
    }
}
