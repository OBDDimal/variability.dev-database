import {Negation} from "@/classes/Constraint/Negation";
import {Implication} from "@/classes/Constraint/Implication";
import {Conjunction} from "@/classes/Constraint/Conjunction";
import {Disjunction} from "@/classes/Constraint/Disjunction";
import {FeatureNodeConstraintItem} from "@/classes/Constraint/FeatureNodeConstraintItem";
import {Constraint} from "@/classes/constraint";

const operators = ['not', 'and', 'or', 'implies'];
const operatorPrecedence = {};
operators.forEach((operator, i) => operatorPrecedence[operator] = i);

export function parse(toParse, allNodes) {
    const constraint = new Constraint();
    const inputToken = toParse.replaceAll('(', '( ').replaceAll(')', ' )').split(' ');

    const operatorStack = [];
    let outputStack = [];
    inputToken.forEach((token) => {
        if (operators.includes(token)) {
            if(operatorStack.length) {
                let lastOperator = operatorStack.at(-1);
                while (lastOperator && lastOperator !== '(' && operatorPrecedence[token] > operatorPrecedence[lastOperator]) {
                    operatorStack.pop();
                    convertToConstraintItem(lastOperator, outputStack, allNodes);
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
            outputStack.push(createFeatureNodeConstraintItem(token, constraint, allNodes));
        }
    });

    // Push all operators that remains on operator-stack to output
    while (operatorStack.length) {
        convertToConstraintItem(operatorStack.pop(), outputStack, allNodes);
    }

    constraint.rule = outputStack[0];
    return constraint;
}

function convertToConstraintItem(operator, stack) {
    let constraintItem = undefined;
    if (operator === 'not') {
        constraintItem = new Negation(stack.pop());
    } else if (operator === 'and') {
        const second = stack.pop();
        const first = stack.pop();

        let items;
        if (second instanceof Conjunction) {
            items = [first, ...second.items]
        } else {
            items = [first, second];1
        }
        constraintItem = new Conjunction(items);
    } else if (operator === 'or') {
        const second = stack.pop();
        const first = stack.pop();

        let items;
        if (second instanceof Disjunction) {
            items = [first, ...second.items]
        } else {
            items = [first, second];
        }
        constraintItem = new Disjunction(items);
    } else if (operator === 'implies') {
        const conclusion = stack.pop();
        const premise = stack.pop();
        constraintItem = new Implication(premise, conclusion);
    }

    stack.push(constraintItem);
}

function createFeatureNodeConstraintItem(featureNodeName, constraint, allNodes) {
    debugger;
    const foundNode = allNodes.find((node) => node.name === featureNodeName);
    if (!foundNode) {
        console.error('constraint-parser', featureNodeName + ' was not found');
    }
    return new FeatureNodeConstraintItem(foundNode, constraint);
}