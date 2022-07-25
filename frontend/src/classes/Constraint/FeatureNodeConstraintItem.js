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

    toStringXML() {
        return `<var>${this.featureNode.name}</var>`;
    }

    getFeatureNodes() {
        return [this.featureNode];
    }
}
