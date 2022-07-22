export class ConstraintItem {
   constructor() {
   }

   addPossibleBrackets(item) {
      if (item.count() === 1) {
         return `¬${item.print()}`;
      } else {
         return `¬(${item.print()})`;
      }
   }
}