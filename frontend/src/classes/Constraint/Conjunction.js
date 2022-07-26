import {GroupConstraintItem} from "@/classes/Constraint/GroupConstraintItem";

export class Conjunction extends GroupConstraintItem {
    constructor(items) {
        super(items, '∧', 'and', 'conj');
    }

    toStringPostfix() {
        return this.items
            .map((item) => item.toStringPostfix())
            .join(` `) + ' Conjunction';
    }

}
