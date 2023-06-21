import {GroupConstraintItem} from "@/classes/Constraint/GroupConstraintItem";

export class Conjunction extends GroupConstraintItem {
    constructor(first, second) {
        super(first, second, '∧', 'AND', 'conj');
    }
}
