import * as CONSTANTS from "./constants";

export class Constraint {

    constructor(xmlToParse, featureMap, rootConstraint = this) {
        this.isHighlighted = false;
        this.operator = CONSTANTS.operators[xmlToParse.tagName];
        this.xmlOperator = xmlToParse.tagName;
        this.children = [...xmlToParse.childNodes]
            .filter(node => node.tagName) // To remove #text nodes, as they don't have a tagName
            .map((node) => {
                if (node.tagName === 'var') {
                    return new VarConstraint(node.innerHTML, featureMap, rootConstraint);
                } else {
                    return new Constraint(node, featureMap, rootConstraint);
                }
            });
    }

    toggleHighlighted() {
        if (this.isHighlighted) {
            CONSTANTS.CONSTRAINT_HIGHLIGHT_COLORS.push(this.color);
            this.color = undefined;
            this.getAllVars().forEach((child) => {
                child.featureNode.constraintsHighlighted = child.featureNode.constraintsHighlighted.filter((constraint) => constraint !== this);
            });
        } else {
            this.color = CONSTANTS.CONSTRAINT_HIGHLIGHT_COLORS.pop();
            this.getAllVars().forEach((child) => {
                if (!child.featureNode.constraintsHighlighted.includes(this)) {
                    child.featureNode.constraintsHighlighted.push(this);
                    child.featureNode.uncollapse(true);
                }
            });
        }
        this.isHighlighted = !this.isHighlighted;
    }

    toString() {
        if (this.operator === CONSTANTS.operators.not) {
            return CONSTANTS.operators.not + "(" + this.children.map((child) => child.toString()) + ")";
        } else {
            return "(" + this.children.map((child) => child.toString()).join(` ${this.operator} `) + ")";
        }
    }

    getAllVars() {
        return this.children.map(child => (child instanceof VarConstraint) ? child : child.getAllVars()).flat();
    }
}

export class VarConstraint {
    constructor(featureNodeName, featureMap, rootConstraint) {
        this.featureNode = featureMap[featureNodeName];
        this.rootConstraint = rootConstraint;
        
        if (!this.featureNode.constraints.includes(rootConstraint)) {
            this.featureNode.constraints.push(rootConstraint);
        }
    }

    toString() {
        return this.featureNode.name;
    }
}