import SelectionState from './SelectionState';

export class Version {
    constructor(version, root) {
        this.version = version;
        this.root = root;
        this.selectionState = SelectionState.undefined;
    }

    getFeatures() {
        return this.root.descendants().map(node => node.feature);
    }
}