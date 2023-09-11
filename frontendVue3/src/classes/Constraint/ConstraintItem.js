const operatorPrecedence = {};
const operators = ['not', 'implies', 'and', 'or'];
operators.forEach((operator, i) => operatorPrecedence[operator] = i);

export class ConstraintItem {

    addPossibleBrackets(item) {
        if (item.count() === 1 || this.getPrecedence() >= item.getPrecedence()) {
            return `${item.toString()}`;
        } else {
            return `(${item.toString()})`;
        }
    }

    addPossibleBracketsToList(item) {
        if (item.count() === 1 || this.getPrecedence() >= item.getPrecedence()) {
            return item.toList();
        } else {
            return ['(', ...item.toList(), ')'];
        }
    }

    addPossibleBracketsForEdit(item) {
        if (item.count() === 1 || this.getPrecedence() >= item.getPrecedence()) {
            return `${item.toStringForEdit()}`;
        } else {
            return `(${item.toStringForEdit()})`;
        }
    }

    getPrecedence() {
        if (this.constructor.name === 'Disjunction') {
            return operatorPrecedence['or'];
        } else if (this.constructor.name === 'Conjunction') {
            return operatorPrecedence['and'];
        } else if (this.constructor.name === 'Implication') {
            return operatorPrecedence['implies'];
        } else if (this.constructor.name === 'Negation') {
            return operatorPrecedence['neg'];
        }
    }
}
