import {Negation} from "@/classes/Constraint/Negation";
import {Implication} from "@/classes/Constraint/Implication";
import {Conjunction} from "@/classes/Constraint/Conjunction";
import {Disjunction} from "@/classes/Constraint/Disjunction";
import {FeatureNodeConstraintItem} from "@/classes/Constraint/FeatureNodeConstraintItem";
import { Equivalence } from '@/classes/Constraint/Equivalence';

const operators = ['not', 'implies', 'and', 'or', 'equi'];
export const operatorPrecedence = {};
operators.forEach((operator, i) => operatorPrecedence[operator] = i);

export function parse(toParse, allNodes) {
    const inputToken = toParse
        .replaceAll('(', '( ')
        .replaceAll(')', ' )')
        .match(/(?:[^\s"]+|"[^"]*")+/g) // Split by space except double-quotes
        .map(str => str.replaceAll("\"", ""))
        .filter((str) => str); // Remove the undefined tokens

    const operatorStack = [];
    let outputStack = [];
    inputToken.forEach((token) => {
        if (operators.includes(token.toLowerCase())) {
            parseOperator(token.toLowerCase(), operatorStack, outputStack);
        } else if (token === '(') {
            operatorStack.push('(');
        } else if (token === ')') {
            parseClosingBracket(operatorStack, outputStack);
        } else {
            outputStack.push(createFeatureNodeConstraintItem(token, allNodes));
        }
    });

    // Push all operators to output that remains on operator-stack
    while (operatorStack.length) {
        convertToConstraintItem(operatorStack.pop(), outputStack);
    }

    if (outputStack.length > 1) {
        throw Error(`Missing operator between ${outputStack[0].toString()} and ${outputStack[1].toString()}`);
    } else {
        return outputStack[0];
    }
}

function parseOperator(token, operatorStack, outputStack) {
    if (operatorStack.length) {
        let lastOperator = operatorStack.at(-1);
        while (lastOperator && lastOperator !== '(' && operatorPrecedence[token] > operatorPrecedence[lastOperator]) {
            operatorStack.pop();
            convertToConstraintItem(lastOperator, outputStack);
            lastOperator = operatorStack.length ? operatorStack.at(-1) : undefined;
        }
    }
    operatorStack.push(token);
}

function parseClosingBracket(operatorStack, outputStack) {
    let lastOperator = operatorStack.pop();
    while (lastOperator !== '(' && operatorStack.length !== 0) {
        convertToConstraintItem(lastOperator, outputStack);
        lastOperator = operatorStack.pop();
    }
}

function convertToConstraintItem(operator, stack) {
    operator = operator.toLowerCase();
    let constraintItem;
    if (operator === 'not') {
        if (stack.length < 1) {
            throw Error('Too few arguments: Expected 1 argument for not');
        }
        constraintItem = new Negation(stack.pop());
    } else {
        if (stack.length < 2) {
            throw Error(`Too few arguments: Expected 2 arguments for ${operator}`);
        }
        const second = stack.pop();
        const first = stack.pop();

        if (operator === 'and') {
            constraintItem = new Conjunction([first, second]);
        } else if (operator === 'or') {
            constraintItem = new Disjunction([first, second]);
        } else if (operator === 'implies') {
            constraintItem = new Implication(first, second);
        } else if (operator === 'equi') {
            constraintItem = new Equivalence([first, second]);
        }
    }

    stack.push(constraintItem);
}

function createFeatureNodeConstraintItem(featureNodeName, allNodes) {
    const foundNode = allNodes.find((node) => node.name === featureNodeName);
    if (!foundNode) {
        throw Error(`FeatureNode '${featureNodeName} cannot be found`);
    }
    return new FeatureNodeConstraintItem(foundNode);
}
