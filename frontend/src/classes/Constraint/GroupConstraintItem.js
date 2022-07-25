import {ConstraintItem} from "@/classes/Constraint/ConstraintItem";

export class GroupConstraintItem extends ConstraintItem {
   constructor(items, symbol, operator) {
      super();
      this.items = items;
      this.operator = operator;
      this.symbol = symbol;
   }

   count() {
      return this.items.length;
   }

   toString() {
      return this.items
          .map((item) => this.addPossibleBrackets(item))
          .join(` ${this.symbol} `);
   }

   toStringForEdit() {
      return this.items
          .map((item) => this.addPossibleBracketsForEdit(item))
          .join(` ${this.operator} `);
   }

   getFeatureNodes() {
      return this.items
          .map((item) => item.getFeatureNodes())
          .flat();
   }

   setConstraint(constraint) {
      this.items.forEach((item) => item.setConstraint(constraint));
   }
}