import {ConstraintItem} from "@/classes/Constraint/ConstraintItem";
import {SelectionState} from "@/classes/Configurator/SelectionState";

export class FeatureNodeConstraintItem extends ConstraintItem {
    constructor(featureNode) {
        super();
        this.featureNode = featureNode;
    }

    count() {
        return 1;
    }

    toString() {
        const str = this.featureNode.name;
        if (str.split(" ").length > 1) {
            return `"${str}"`;
        } else {
            return str;
        }
    }

    toList() {
        return [this];
    }

    toStringForEdit() {
        return this.toString();
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

    setConstraint(constraint) {
        this.constraint = constraint;
        if (!this.featureNode.constraints.includes(this.constraint)) {
            this.featureNode.constraints.push(this.constraint);
        }
    }

    removeConstraint() {
        this.featureNode.constraints = this.featureNode.constraints.filter((c) => c !== this.constraint);
        this.constraint = null;
    }

    evaluate() {
        if (this.featureNode.selectionState === SelectionState.ImplicitlySelected ||
            this.featureNode.selectionState === SelectionState.ExplicitlySelected
        ) {
            return true;
        } else if(this.featureNode.selectionState === SelectionState.Unselected) {
            return undefined;
        } else {
            return false;
        }
    }
}
