import {GroupConstraintItem} from "@/classes/Constraint/GroupConstraintItem";

export class Conjunction extends GroupConstraintItem {
    constructor(items) {
        super(items, '∧', 'AND', 'conj');
    }

    evaluate(tmp = false) {
        const evaluations = this.items.map(i => i.evaluate(tmp));

        if (evaluations.some(x => x === false)) {
            return false;
        } else if (evaluations.some(x => x === undefined)) {
            return undefined;
        } else {
            return true;
        }
    }

    quickFix(target) {
        if (target) {
            return this.items.map(i => (i, i.evaluate())).filter(i => i[1] === false).forEach(i => i[0].quickFix(true));
        } else {
            for (let i = 0; i < this.items.length; i++) {
                const evaluation = this.items[i].evaluate();
                if (evaluation === true) {
                    return this.items[i].quickFix(false);
                }
            }
        }

        console.error("Quick Fix, Equivalence")
        return [];
    }
}
