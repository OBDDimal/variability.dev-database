import {ConstraintItem} from "@/classes/Constraint/ConstraintItem";

export class GroupConstraintItem extends ConstraintItem {
    constructor(items, symbol, operator, tag) {
        super();
        this.items = items;
        this.operator = operator;
        this.symbol = symbol;
        this.tag = tag;
    }

    count() {
        return 2;
    }

    toString() {
        return this.items.map(item => item.constructor.name === this.constructor.name ? item.toString() : this.addPossibleBrackets(item)).join(this.symbol);
    }

    toList() {
      return this.items
        .map(item => item.constructor.name === this.constructor.name ? item.toList() : this.addPossibleBracketsToList(item))
        .reduce((a, b) => [...a, ' ' + this.symbol + ' ', ...b], [])
        .slice(1)
    }

    toStringPostfix() {
        return `${this.items.forEach(i => i.toStringPostfix())} ${this.constructor.name}`;
    }

    toStringForEdit() {
        return this.items
            .map(item => item.constructor.name === this.constructor.name ? item.toStringForEdit() : this.addPossibleBracketsForEdit(item))
            .join(" " + this.operator + " ");
    }

    toStringXML() {
        return `<${this.tag}>
        ${this.items.map(i => i.toStringXML()).join("\n")}
        </${this.tag}>`;
    }

    getFeatureNodes() {
        return this.items.map(i => i.getFeatureNodes()).flatten();
    }

    setConstraint(constraint) {
        this.items.forEach(i => i.setConstraint(constraint));
    }

    removeConstraint() {
        this.items.forEach(i => i.removeConstraint());
    }
}
