import {ConstraintItem} from "@/classes/Constraint/ConstraintItem";

export class GroupConstraintItem extends ConstraintItem {
   constructor(items, operator) {
      super();
      this.items = items;
      this.operator = operator;
   }

   count() {
      return this.items.length;
   }

   toString() {
      return this.items
          .map((item) => this.addPossibleBrackets(item))
          .join(` ${this.operator} `);
   }
}