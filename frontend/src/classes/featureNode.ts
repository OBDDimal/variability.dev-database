import {
  DISPLAY_NAME_LENGTH,
  NODE_ABSTRACT_COLOR,
  NODE_COLOR,
} from "./constants";
import Constraint from "./constraint";

export enum GroupType {
  and = "and",
  or = "or",
  alt = "alt",
}

export class FeatureNode {
  parent?: FeatureNode;
  name: string;
  displayName: string;
  children: FeatureNode[];
  groupType: GroupType;
  isRoot: boolean;
  isMandatory: boolean;
  isAbstract: boolean;
  color: string;
  constraints: Constraint[];
  constraintsHighlighted: Constraint[];
  isCollapsed: boolean;
  isHidden: boolean;

  constructor(
    name: string,
    groupType: GroupType,
    mandatory: boolean,
    abstract: boolean,
    parent?: FeatureNode
  ) {
    this.parent = parent;
    this.name = name;
    this.displayName = name.slice(0, DISPLAY_NAME_LENGTH) + "...";
    this.children = [];
    this.groupType = groupType;
    this.isRoot = parent === null;
    this.isMandatory = mandatory;
    this.isAbstract = abstract;
    this.color = this.isAbstract ? NODE_ABSTRACT_COLOR : NODE_COLOR;
    this.constraints = [];
    this.constraintsHighlighted = [];
    this.isCollapsed = true;
    this.isHidden = false;
  }

  childrenCount() {
    if (this.isLeaf()) {
      return 0;
    } else {
      return this.children.length;
    }
  }

  totalSubnodesCount() {
    if (this.isLeaf()) {
      return 0;
    } else {
      let totalSubnodesCount = this.children.length;
      this.children.forEach((node) => {
        totalSubnodesCount += node.totalSubnodesCount();
      });
      return totalSubnodesCount;
    }
  }

  isAnd() {
    return this.groupType === GroupType.and;
  }

  isOr() {
    return this.groupType === GroupType.or;
  }

  isAlt() {
    return this.groupType === GroupType.alt;
  }

  isLeaf() {
    return this.children.length === 0;
  }

  uncollapse(toRoot = true) {
    this.isCollapsed = false;
    if (this.parent && toRoot) {
      this.parent.uncollapse();
    }
  }

  collapse() {
    this.isCollapsed = true;
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  getAllNodesToRoot(): FeatureNode[] {
    if (this.isRoot) {
      return [this];
    } else if (this.parent) {
      return [this, ...this.parent.getAllNodesToRoot()];
    } else {
      return [];
    }
  }

  getLeftSibling() {
    if (this.parent) {
      const index = this.parent.children.indexOf(this);
      if (index == 0) return null;
      return this.parent.children[index - 1];
    }
  }

  getRightSibling() {
    if (this.parent) {
      const index = this.parent.children.indexOf(this);
      if (index == this.parent.children.length - 1) return null;
      return this.parent.children[index + 1];
    }
  }

  getLeftSiblings() {
    if (this.parent) {
      const index = this.parent.children.indexOf(this);
      return this.parent.children.slice(0, index);
    }
  }

  getRightSiblings() {
    if (this.parent) {
      const index = this.parent.children.indexOf(this);
      return this.parent.children.slice(index + 1);
    }
  }

  hideLeftSiblings() {
    this.getLeftSiblings()?.forEach((sibling) => sibling.hide());
  }

  hideRightSiblings() {
    this.getRightSiblings()?.forEach((sibling) => sibling.hide());
  }

  unhideLeftSiblings() {
    this.getLeftSiblings()?.forEach((sibling) => sibling.unhide());
  }

  unhideRightSiblings() {
    this.getRightSiblings()?.forEach((sibling) => sibling.unhide());
  }

  hide() {
    this.isHidden = true;
  }

  unhide() {
    this.isHidden = false;
  }
}

export class PseudoNode {
  hiddenD3Children: any[];
  constructor(d3Node: any) {
    this.hiddenD3Children = [d3Node];
  }

  unhideHiddenNodes() {
    this.hiddenD3Children.forEach((d3Node) => d3Node.data.unhide());
  }
}
