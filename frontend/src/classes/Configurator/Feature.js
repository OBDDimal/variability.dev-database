import {SelectionState} from "@/classes/Configurator/SelectionState";

export class Feature {
    constructor(name) {
        this.name = name;
        this.selectionState = SelectionState.Unselected;
        this.featureNodes = [];
    }
}
