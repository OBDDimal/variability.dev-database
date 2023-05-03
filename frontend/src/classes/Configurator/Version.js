import {SelectionState} from "@/classes/Configurator/SelectionState";

export class Version {
    constructor(version, id, root) {
        this.version = version;
        this.id = id;
        this.root = root;
        this.selectionState = SelectionState.Unselected;
    }

    getFeatures() {
        return this.root.descendants().map(node => node.feature);
    }
}