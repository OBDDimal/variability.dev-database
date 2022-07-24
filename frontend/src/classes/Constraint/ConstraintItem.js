export class ConstraintItem {
   constructor() {
   }

   addPossibleBrackets(item) {
      if (item.count() === 1) {
         return `${item.toString()}`;
      } else {
         return `(${item.toString()})`;
      }
   }
}