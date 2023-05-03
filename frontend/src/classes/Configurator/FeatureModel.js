import {SelectionState} from "@/classes/Configurator/SelectionState";
import beautify from "xml-beautifier";
import {FeatureNode} from "@/classes/Configurator/FeatureNode";
import {Version} from "@/classes/Configurator/Version";
import {Feature} from "@/classes/Configurator/Feature";

export class FeatureModel {
    constructor(name, versions, features, featureDict) {
        this.name = name;
        this.versions = versions;
        this.features = features;
        this.featureDict = featureDict;
    }

    static create(xmlVersions, features) {
        const featureDict = {};
        const featureList = [];
        features.forEach(f => {
            const feature = new Feature(f.id, f.name);
            featureDict[f.name] = feature;
            featureList.push(feature);
        });

        const versions = xmlVersions.map(v => {
            const xml = beautify(v.model);

            // To remove the <?xml...?> line
            let m = xml.split('\n').splice(1).join('\n');

            const parser = new DOMParser();
            const xmlDocument = parser.parseFromString(m, 'text/xml');

            const struct = xmlDocument.querySelector('struct');
            const root = this.parseChildren(struct, null, featureDict)[0];

            const versionName = v.version.replace(".xml", "");
            return new Version(versionName, v.root, root);
        });

        return new FeatureModel("FM", versions, featureList, featureDict);
    }

    static parseChildren(struct, parent, featureDict) {
        let toReturn = [];

        for (const child of struct.childNodes) {
            // To remove #text nodes, as they don't have a tagName
            if (child.tagName) {
                const featureName = child.getAttribute('name');

                let toAppend = new FeatureNode(
                    featureDict[featureName],
                    parent,
                    featureName,
                    child.tagName,
                    child.getAttribute('mandatory') === 'true',
                    child.getAttribute('abstract') === 'true'
                );
                toAppend.children = this.parseChildren(child, toAppend, featureDict);
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