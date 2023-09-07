import {SelectionState} from "@/classes/Configurator/SelectionState";

export class Version {
    constructor(version, rootId) {
        this.version = version;
        this.rootId = rootId;
        this.selectionState = SelectionState.Unselected;
        this.constraints = undefined;
        this.features = undefined;
        this.root = undefined;
    }

    getFeatures() {
        return this.root.descendants().map(node => node.feature);
    }

    empty() {
        this.constraints = [];
        this.features = [];
        this.root = undefined;
    }
}
