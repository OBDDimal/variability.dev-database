import SelectionState from './SelectionState';

export class Feature {
    constructor(name) {
        this.name = name;
        this.selectionState = SelectionState.Unselected;
        this.featureNodes = [];
    }
}
