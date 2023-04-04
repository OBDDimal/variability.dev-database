import {SelectionState} from "@/classes/Configuration/SelectionState";

export class Feature {
    constructor(name) {
        this.name = name;
        this.selectionState = SelectionState.Unselected;
        this.featureNodes = [];
    }
}
