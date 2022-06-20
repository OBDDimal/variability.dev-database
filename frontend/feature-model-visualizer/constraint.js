class Constraint {

    operators = {
        imp: "⇒",
        conj: "∧",
        disj: "∨",
        eq: "⇔",
        not: "¬",
    }

    constructor(xmlToParse, featureMap, rootConstraint = this) {
        this.isHighlighted = false;
        this.operator = this.operators[xmlToParse.tagName];
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
            CONSTRAINT_HIGHLIGHT_COLORS.push(this.color);
        } else {
            this.color = CONSTRAINT_HIGHLIGHT_COLORS.pop();
        }
        this.isHighlighted = !this.isHighlighted;
        this.getAllVars().forEach((child) => {
            child.toggleHighlighted();
            child.featureNode.uncollapse(true);
        });
        updateCollapsing();
    }

    toString() {
        if (this.operator === this.operators.not) {
            return this.operators.not + "(" + this.children.map((child) => child.toString()) + ")";
        } else {
            return "(" + this.children.map((child) => child.toString()).join(` ${this.operator} `) + ")";
        }
    }

    getAllVars() {
        return this.children.map(child => (child instanceof VarConstraint) ? child : child.getAllVars()).flat();
    }
}

class VarConstraint {
    constructor(featureNodeName, featureMap, rootConstraint) {
        this.featureNode = featureMap[featureNodeName];
        this.rootConstraint = rootConstraint;
        
        if (!this.featureNode.constraints.includes(rootConstraint)) {
            this.featureNode.constraints.push(rootConstraint);
        }
    }

    toggleHighlighted() {
        if (this.rootConstraint.isHighlighted) {
            if (!this.featureNode.constraintsHighlighted.includes(this.rootConstraint)) {
                this.featureNode.constraintsHighlighted.push(this.rootConstraint);
            }
        } else {
            this.featureNode.constraintsHighlighted = this.featureNode.constraintsHighlighted.filter((constraint) => constraint !== this.rootConstraint);
        }
    }

    toString() {
        return this.featureNode.name;
    }
}