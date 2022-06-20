import { FeatureNode } from "@/classes/featureNode";
import * as constants from "@/classes/constants";

enum Operator {
  imp = "⇒",
  conj = "∧",
  disj = "∨",
  eq = "⇔",
  not = "¬",
}

export default class Constraint {
  isHighlighted: boolean;
  operator: Operator;
  xmlOperator: string;
  test: string = "imp";
  children: (Constraint | VarConstraint)[];
  color?: string;

  rootConstraint: Constraint = this;

  constructor(
    xmlToParse: Element,
    featureMap: { [key: string]: FeatureNode },
    rootConstraint?: Constraint
  ) {
    this.isHighlighted = false;
    this.rootConstraint = rootConstraint ?? this.rootConstraint;
    this.operator = Operator[xmlToParse.tagName as keyof typeof Operator];
    this.xmlOperator = xmlToParse.tagName;
    this.children = [...xmlToParse.children]
      .filter((node) => node.tagName) // To remove #text nodes, as they don't have a tagName
      .map((node) => {
        if (node.tagName === "var") {
          return new VarConstraint(
            node.innerHTML,
            featureMap,
            this.rootConstraint
          );
        } else {
          return new Constraint(
            node as Element,
            featureMap,
            this.rootConstraint
          );
        }
      });
  }

  toggleHighlighted() {
    if (this.isHighlighted && this.color) {
      constants.CONSTRAINT_HIGHLIGHT_COLORS.push(this.color);
    } else {
      this.color = constants.CONSTRAINT_HIGHLIGHT_COLORS.pop();
    }
    this.isHighlighted = !this.isHighlighted;
    this.getAllVars().forEach((child) => {
      child.toggleHighlighted();
      child.featureNode.uncollapse(true);
    });
    updateCollapsing();
  }

  toString(): string {
    if (this.operator === Operator.not) {
      return (
        Operator.not +
        "(" +
        this.children.map((child) => child.toString()) +
        ")"
      );
    } else {
      return (
        "(" +
        this.children
          .map((child) => child.toString())
          .join(` ${this.operator} `) +
        ")"
      );
    }
  }

  getAllVars(): VarConstraint[] {
    return this.children
      .map((child) =>
        child instanceof VarConstraint ? child : child.getAllVars()
      )
      .flat();
  }
}

export class VarConstraint {
  featureNode: FeatureNode;
  rootConstraint: Constraint;

  constructor(
    featureNodeName: string,
    featureMap: { [key: string]: FeatureNode },
    rootConstraint: Constraint
  ) {
    this.featureNode = featureMap[featureNodeName];
    this.rootConstraint = rootConstraint;

    if (!this.featureNode.constraints.includes(rootConstraint)) {
      this.featureNode.constraints.push(rootConstraint);
    }
  }

  toggleHighlighted() {
    if (this.rootConstraint.isHighlighted) {
      if (
        !this.featureNode.constraintsHighlighted.includes(this.rootConstraint)
      ) {
        this.featureNode.constraintsHighlighted.push(this.rootConstraint);
      }
    } else {
      this.featureNode.constraintsHighlighted =
        this.featureNode.constraintsHighlighted.filter(
          (constraint: Constraint) => constraint !== this.rootConstraint
        );
    }
  }

  toString(): string {
    return this.featureNode.name;
  }
}
