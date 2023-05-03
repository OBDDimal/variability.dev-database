import {SelectionState} from "@/classes/Configurator/SelectionState";

export class Feature {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.selectionState = SelectionState.Unselected;
        this.featureNodes = [];
    }
}
