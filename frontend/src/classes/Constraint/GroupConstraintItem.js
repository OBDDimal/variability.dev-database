import {ConstraintItem} from "@/classes/Constraint/ConstraintItem";

export class GroupConstraintItem extends ConstraintItem {
    constructor(first, second, symbol, operator, tag) {
        super();
        this.first = first;
        this.second = second;
        this.operator = operator;
        this.symbol = symbol;
        this.tag = tag;
    }

    count() {
        return 2;
    }

    toString() {
        const firstText = this.first.constructor.name === this.constructor.name ? this.first.toString() : this.addPossibleBrackets(this.first);
        const secondText = this.second.constructor.name === this.constructor.name ? this.second.toString() : this.addPossibleBrackets(this.second);
        return `${firstText} ${this.symbol} ${secondText}`;
    }

    toStringPostfix() {
        return `${this.first.toStringPostfix()} ${this.second.toStringPostfix()} ${this.constructor.name}`;
    }

    toStringForEdit() {
        const firstText = this.first.constructor.name === this.constructor.name ? this.first.toStringForEdit() : this.addPossibleBracketsForEdit(this.first);
        const secondText = this.second.constructor.name === this.constructor.name ? this.second.toStringForEdit() : this.addPossibleBracketsForEdit(this.second);
        return `${firstText} ${this.operator} ${secondText}`;
    }

    toStringXML() {
        return `<${this.tag}>
        ${this.first.toStringXML()} 
        ${this.second.toStringXML()}
        </${this.tag}>`;
    }

    getFeatureNodes() {
        return [...this.first.getFeatureNodes(), ...this.second.getFeatureNodes()];
    }

    setConstraint(constraint) {
        this.first.setConstraint(constraint);
        this.second.setConstraint(constraint);
    }

    removeConstraint() {
        this.first.removeConstraint();
        this.second.removeConstraint();
    }
}