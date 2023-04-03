import {SelectionState} from "@/classes/Configuration/SelectionState";

export class FeatureModel {
    constructor(name, versions) {
        this.name = name;
        this.versions = versions;
    }

    static create(versionsXML) {
        return [versionsXML];
    }

    getAllFeatures(versions) {
        return versions.flat().unique();
    }

    getCommonFeatures(versions) {
        const versionFeatures = versions.map(v => v.getFeatures());
        return versionFeatures.slice(1).reduce((acc, cur) => acc.filter(x => cur.includes(x)), versionFeatures[0]);
    }

    getNotCommonFeatures(versions) {
        const allFeatures = this.getAllFeatures(versions);
        const commonFeatures = this.getCommonFeatures(versions);
        return allFeatures.filter(x => !commonFeatures.includes(x));
    }

    getAvailableVersions() {
        return this.versions.filter(v => v.selectionState === SelectionState.Unselected);
    }

    getSelectedVersions() {
        return this.versions.filter(v => v.selectionState === SelectionState.ImplicitlySelected || v.selectionState === SelectionState.ExplicitlySelected);
    }

    getDeselectedVersions() {
        return this.versions.filter(v => v.selectionState === SelectionState.ImplicitlyDeselected || v.selectionState === SelectionState.ExplicitlyDeselected);
    }

    calcVersionDecisionPropagation() {
        console.log("VDP");
    }

    calcDecisionPropagation() {
        console.log("DP");
    }
}