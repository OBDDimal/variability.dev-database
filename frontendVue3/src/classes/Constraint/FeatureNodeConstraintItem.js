import {ConstraintItem} from "@/classes/Constraint/ConstraintItem";
import { SelectionState } from '@/classes/Configurator/SelectionState';

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

    toStringForEdit() {
        return this.toString();
    }

    toList() {
        return [this];
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

    evaluate(tmp = false) {
        if (!tmp) {
            if (this.featureNode.selectionState === SelectionState.ImplicitlySelected ||
                this.featureNode.selectionState === SelectionState.ExplicitlySelected
            ) {
                return true;
            } else if (this.featureNode.selectionState === SelectionState.Unselected) {
                return undefined;
            } else {
                return false;
            }
        } else {
            if (this.featureNode.selectionStateTmp === SelectionState.ImplicitlySelected ||
                this.featureNode.selectionStateTmp === SelectionState.ExplicitlySelected
            ) {
                return true;
            } else if(this.featureNode.selectionStateTmp === SelectionState.Unselected) {
                return undefined;
            } else {
                return false;
            }
        }
    }

    quickFix(target) {
        if (this.evaluate() === !target) {
            return [(target ? 1 : -1) * this.featureNode.id];
        }
        return [];
    }
}
