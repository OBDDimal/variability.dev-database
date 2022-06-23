class FeatureNode {
  constructor(parent, name, groupType, mandatory, abstract) {
    this.parent = parent;
    this.name = name;
    this.displayName = name.slice(0, DISPLAY_NAME_LENGTH) + '...';
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
    return this.groupType === "and";
  }

  isOr() {
    return this.groupType === "or";
  }

  isAlt() {
    return this.groupType === "alt";
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

  getAllNodesToRoot() {
    if (this.isRoot) {
      return [this];
    } else {
      return [this, ...this.parent.getAllNodesToRoot()];
    }
  }

  getLeftSibling() {
    const index = this.parent.children.indexOf(this);
    if (index == 0) return null;
    return this.parent.children[index - 1];
  }

  getRightSibling() {
    const index = this.parent.children.indexOf(this);
    if (index == this.parent.children.length - 1) return null;
    return this.parent.children[index + 1];
  }

  getLeftSiblings() {
    const index = this.parent.children.indexOf(this);
    return this.parent.children.slice(0, index);
  }

  getRightSiblings() {
    const index = this.parent.children.indexOf(this);
    return this.parent.children.slice(index + 1);
  }

  hideLeftSiblings() {
    this.getLeftSiblings().forEach((sibling) => sibling.hide());
  }

  hideRightSiblings() {
    this.getRightSiblings().forEach((sibling) => sibling.hide());
  }

  unhideLeftSiblings() {
    this.getLeftSiblings().forEach((sibling) => sibling.unhide());
  }

  unhideRightSiblings() {
    this.getRightSiblings().forEach((sibling) => sibling.unhide());
  }

  hide() {
    this.isHidden = true;
  }

  unhide() {
    this.isHidden = false;
  }
}

class PseudoNode {
  constructor(d3Node) {
    this.hiddenD3Children = [d3Node];
  }

  unhideHiddenNodes() {
    this.hiddenD3Children.forEach((d3Node) => d3Node.data.unhide());
  }
}
