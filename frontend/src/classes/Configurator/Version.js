import {SelectionState} from "@/classes/Configurator/SelectionState";

export class Version {
    constructor(version, root) {
        this.version = version;
        this.root = root;
        this.selectionState = SelectionState.Unselected;
    }

    getFeatures() {
        return this.root.descendants().map(node => node.feature);
    }
}