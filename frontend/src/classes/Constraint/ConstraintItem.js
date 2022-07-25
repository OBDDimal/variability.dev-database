export class ConstraintItem {
   constructor() {}

   addPossibleBrackets(item) {
      if (item.count() === 1) {
         return `${item.toString()}`;
      } else {
         return `(${item.toString()})`;
      }
   }

   addPossibleBracketsForEdit(item) {
      if (item.count() === 1) {
         return `${item.toStringForEdit()}`;
      } else {
         return `(${item.toStringForEdit()})`;
      }
   }
}