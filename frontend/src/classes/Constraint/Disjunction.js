import {GroupConstraintItem} from "@/classes/Constraint/GroupConstraintItem";

export class Disjunction extends GroupConstraintItem {
    constructor(items) {
        super(items, '∨');
    }

    toStringPostfix() {
        return this.items
            .map((item) => item.toStringPostfix())
            .join(` `) + ' Disjunction';
    }

    toStringXML() {
        return `<disj>${
            this.items
            .map((item) => item.toStringXML())
            .join(` `)
        }</disj>`;
    }
}
