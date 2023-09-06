import * as CONSTANTS from "./constants";

export class Constraint {

    constructor(rule) {
        this.isHighlighted = false;
        this.rule = rule;
        this.rule.setConstraint(this);
    }

    highlight() {
        if (!this.isHighlighted) {
            this.color = CONSTANTS.CONSTRAINT_HIGHLIGHT_COLORS.pop();
            this.isHighlighted = true;
        }
    }

    resetHighlight() {
        if (this.isHighlighted) {
            CONSTANTS.CONSTRAINT_HIGHLIGHT_COLORS.push(this.color);
            this.color = undefined;
            this.isHighlighted = false;
        }
    }

    toggleHighlighted() {
        if (this.isHighlighted) {
            this.resetHighlight();
        } else {
            this.highlight();
        }
    }

    getFeatureNodes() {
        return this.rule.getFeatureNodes();
    }

    toString() {
        return this.rule.toString();
    }

    toList() {
        return this.rule.toList();
    }

    toStringForEdit() {
        return this.rule.toStringForEdit();
    }

    toStringPostfix() {
        return this.rule.toStringPostfix();
    }

    toStringXML() {
        return this.rule.toStringXML();
    }

    evaluate(tmp = false) {
        return this.rule.evaluate(tmp);
    }

    quickFix(target) {
        return this.rule.quickFix(target);
    }
}
