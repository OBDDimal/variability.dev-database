import {ConstraintItem} from "@/classes/Constraint/ConstraintItem";

export class FeatureNodeConstraintItem extends ConstraintItem {
    constructor(featureNode, constraint) {
        super();
        this.featureNode = featureNode;
        this.constraint = constraint;
        if (!this.featureNode.constraints.includes(this.constraint))
            this.featureNode.constraints.push(this.constraint);
    }

    count() {
        return 1;
    }

    toString() {
        return this.featureNode.name;
    }

    toStringPostfix() {
        return this.toString();
    }

    getFeatureNodes() {
        return [this.featureNode];
    }
}
