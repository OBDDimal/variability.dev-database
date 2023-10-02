import { GroupConstraintItem } from '@/classes/Constraint/GroupConstraintItem';

export class Equivalence extends GroupConstraintItem {
    constructor(items) {
        super(items, '⇔', 'EQUI', 'eq');
    }

    evaluate(tmp = false) {
        const evaluations = this.items.map(i => i.evaluate(tmp));

        if (evaluations.every(x => x === true) || evaluations.every(x => x === false)) {
            return true;
        } else if (evaluations.some(x => x === undefined)) {
            return undefined;
        } else {
            return false;
        }
    }

    quickFix(target) {
        if (target) {
            for (let i = 0; i < this.items.length; i++) {
                const evaluation = this.items[i].evaluate();
                if (evaluation === false) {
                    return this.items[i].quickFix(true);
                }
            }
        } else {
            return this.items.map(i => (i, i.evaluate())).filter(i => i[1] === true).forEach(i => i[0].quickFix(false));
        }

        console.error("Quick Fix, Equivalence")
        return [];
    }
}
