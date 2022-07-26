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

   toStringXML() {
      return `<${this.tag}>${
          this.items
              .map((item) => item.toStringXML())
              .join(` `)
      }</${this.tag}>`;
   }

   getFeatureNodes() {
      return this.items
          .map((item) => item.getFeatureNodes())
          .flat();
   }

   setConstraint(constraint) {
      this.items.forEach((item) => item.setConstraint(constraint));
   }

   removeConstraint() {
      this.items.forEach((item) => item.removeConstraint());
   }
}