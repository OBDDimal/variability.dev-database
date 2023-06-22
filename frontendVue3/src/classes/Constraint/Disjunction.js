import {GroupConstraintItem} from "@/classes/Constraint/GroupConstraintItem";

export class Disjunction extends GroupConstraintItem {
    constructor(first, second) {
        super(first, second, '∨', 'OR', 'disj');
    }
}
