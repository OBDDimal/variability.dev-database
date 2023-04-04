import {SelectionState} from "@/classes/Configurator/SelectionState";
import beautify from "xml-beautifier";
import {FeatureNode} from "@/classes/Configurator/FeatureNode";
import {Version} from "@/classes/Configurator/Version";
import {Feature} from "@/classes/Configurator/Feature";

export class FeatureModel {
    constructor(name, versions, features) {
        this.name = name;
        this.versions = versions;
        this.features = features;
    }

    static create(xmlVersions) {
        let versionIndex = 0;
        const features = [];
        const versions = xmlVersions.map(v => {
            const xml = beautify(v);

            // To remove the <?xml...?> line
            let m = xml.split('\n').splice(1).join('\n');

            const parser = new DOMParser();
            const xmlDocument = parser.parseFromString(m, 'text/xml');

            const struct = xmlDocument.querySelector('struct');
            const root = this.parseChildren(struct, null, features)[0];

            return new Version(versionIndex++, root);
        });

        return new FeatureModel("FM", versions, features);
    }

    static parseChildren(struct, parent, features) {
        let toReturn = [];

        for (const child of struct.childNodes) {
            // To remove #text nodes, as they don't have a tagName
            if (child.tagName) {
                const featureName = child.getAttribute('name');
                let feature = features.find(f => f.name === featureName);
                if (!feature) {
                    feature = new Feature(featureName);
                    features.push(feature);
                }

                let toAppend = new FeatureNode(
                    feature,
                    parent,
                    featureName,
                    child.tagName,
                    child.getAttribute('mandatory') === 'true',
                    child.getAttribute('abstract') === 'true'
                );
                toAppend.children = this.parseChildren(child, toAppend, features);
                toReturn.push(toAppend);
            }
        }

        return toReturn;
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