import {ConstraintItem} from "@/classes/Constraint/ConstraintItem";

export class Implication extends ConstraintItem {
    constructor(premise, conclusion) {
        super();
        this.premise = premise;
        this.conclusion = conclusion;
    }

    count() {
        return 2;
    }

    toList() {
        return [...this.addPossibleBracketsToList(this.premise), '⇒', ...this.addPossibleBracketsToList(this.conclusion)]
    }

    toString() {
        return `${this.addPossibleBrackets(this.premise)} ⇒ ${this.addPossibleBrackets(this.conclusion)}`;
    }

    toStringForEdit() {
        return `${this.addPossibleBracketsForEdit(this.premise)} IMPLIES ${this.addPossibleBracketsForEdit(this.conclusion)}`;
    }

    toStringPostfix() {
        return `${this.premise.toStringPostfix()} ${this.conclusion.toStringPostfix()} Implication`;
    }

    toStringXML() {
        return `<imp>${this.premise.toStringXML()} ${this.conclusion.toStringXML()}</imp>`;
    }

    getFeatureNodes() {
        return [...this.premise.getFeatureNodes().flat(), ...this.conclusion.getFeatureNodes()];
    }

    setConstraint(constraint) {
        this.premise.setConstraint(constraint);
        this.conclusion.setConstraint(constraint);
    }

    removeConstraint() {
        this.premise.removeConstraint();
        this.conclusion.removeConstraint();
    }

    evaluate(tmp = false) {
        const premise = this.premise.evaluate(tmp);
        const conclusion = this.conclusion.evaluate(tmp);

        if (premise === undefined) {
            if (conclusion) {
                return true;
            } else {
                return undefined;
            }
        } else if (!premise) {
            return true;
        } else if (premise) {
            return conclusion;
        }
    }

    quickFix(target) {
        const premise = this.premise.evaluate();
        const conclusion = this.conclusion.evaluate();

        if (target) {
            if (premise === true && conclusion === false) {
                // Try to evaluate conclusion to true
                return this.conclusion.quickFix(true);
            } else {
                console.error("Implication error 1, Quick Fix")
                return [];
            }
        } else {
           if (premise === true) {
               return [...this.premise.quickFix(true), ...this.conclusion.quickFix(false)];
           } else {
               console.error("Implication error 2, Quick Fix")
               return [];
           }
        }
    }
}
