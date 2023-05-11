import {GroupConstraintItem} from "@/classes/Constraint/GroupConstraintItem";

export class Conjunction extends GroupConstraintItem {
    constructor(items) {
        super(items, '∧', 'AND', 'conj');
    }

    evaluate() {
        const evaluations = this.items.map(i => i.evaluate());

        if (evaluations.some(x => x === false)) {
            return false;
        } else if (evaluations.some(x => x === undefined)) {
            return undefined;
        } else {
            return true;
        }
    }
}
