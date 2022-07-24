import {Negation} from "@/classes/Constraint/Negation";
import {Implication} from "@/classes/Constraint/Implication";
import {Conjunction} from "@/classes/Constraint/Conjunction";
import {Disjunction} from "@/classes/Constraint/Disjunction";
import {FeatureNodeConstraintItem} from "@/classes/Constraint/FeatureNodeConstraintItem";
import {FeatureNode} from "@/classes/featureNode";

const operators = ['not', 'and', 'or', 'implies'];
const operatorPrecedence = {};
operators.forEach((operator, i) => operatorPrecedence[operator] = i);

export function parse(toParse) {
    const inputToken = toParse.replaceAll('(', '( ').replaceAll(')', ' )').split(' ');

    const operatorStack = [];
    let outputStack = [];
    inputToken.forEach((token) => {
        if (operators.includes(token)) {
            if(operatorStack.length) {
                let lastOperator = operatorStack.at(-1);
                while (lastOperator && lastOperator !== '(' && operatorPrecedence[token] > operatorPrecedence[lastOperator]) {
                    operatorStack.pop();
                    convertToConstraintItem(lastOperator, outputStack);
                    lastOperator = operatorStack.length ? operatorStack.at(-1) : undefined;
                }
            }
            operatorStack.push(token);

        } else if (token === '(') {
            operatorStack.push('(');

        } else if (token === ')') {
            let lastOperator = operatorStack.pop();
            while (lastOperator !== '(' && operatorStack.length !== 0) {
                convertToConstraintItem(lastOperator, outputStack);
                lastOperator = operatorStack.pop();
            }

        } else {
            outputStack.push(createFeatureNodeConstraintItem(token));
        }
    });

    // Push all operators that remains on operator-stack to output
    while (operatorStack.length) {
        convertToConstraintItem(operatorStack.pop(), outputStack);
    }

    return outputStack[0];
}

function convertToConstraintItem(operator, stack) {
    let constraintItem = undefined;
    if (operator === 'not') {
        constraintItem = new Negation(stack.pop());
    } else if (operator === 'and') {
        const second = stack.pop();
        const first = stack.pop();
        constraintItem = new Conjunction([first, second]);
    } else if (operator === 'or') {
        const second = stack.pop();
        const first = stack.pop();
        constraintItem = new Disjunction([first, second]);
    } else if (operator === 'implies') {
        const conclusion = stack.pop();
        const premise = stack.pop();
        constraintItem = new Implication(premise, conclusion);
    }

    stack.push(constraintItem);
}

function createFeatureNodeConstraintItem(featureNodeName) {
    return new FeatureNodeConstraintItem(new FeatureNode(undefined, featureNodeName), undefined);
}