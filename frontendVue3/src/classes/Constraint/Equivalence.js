import { GroupConstraintItem } from '@/classes/Constraint/GroupConstraintItem';

export class Equivalence extends GroupConstraintItem {
    constructor(first, second) {
        super(first, second, '⇔', 'EQUI', 'eq');
    }
}
