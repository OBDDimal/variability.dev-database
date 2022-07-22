import * as CONSTANTS from "./constants";

export class Constraint {

    constructor() {
        this.isHighlighted = false;
        this.rule = undefined;
    }

    toggleHighlighted() {
        if (this.isHighlighted) {
            CONSTANTS.CONSTRAINT_HIGHLIGHT_COLORS.push(this.color);
            this.color = undefined;
        } else {
            this.color = CONSTANTS.CONSTRAINT_HIGHLIGHT_COLORS.pop();
        }
        this.isHighlighted = !this.isHighlighted;
    }

    getFeatureNodes() {
        return this.rule.getFeatureNodes();
    }

    toString() {
        return this.rule.toString();
    }
}