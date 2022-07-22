import {ConstraintItem} from "@/classes/Constraint/ConstraintItem";

export class FeatureNodeConstraintItem extends ConstraintItem {
    constructor(featureNode) {
        super();
        this.featureNode = featureNode;
    }

    count() {
        return 1;
    }

    toString() {
        return this.featureNode.name;
    }
}
