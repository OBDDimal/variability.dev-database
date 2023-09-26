import {SelectionState} from "@/classes/Configurator/SelectionState";
import beautify from "xml-beautifier";
import {FeatureNode} from "@/classes/Configurator/FeatureNode";
import {Version} from "@/classes/Configurator/Version";
import {Feature} from "@/classes/Configurator/Feature";
import {Constraint} from "@/classes/Constraint";
import {FeatureNodeConstraintItem} from "@/classes/Constraint/FeatureNodeConstraintItem";
import {Disjunction} from "@/classes/Constraint/Disjunction";
import {Conjunction} from "@/classes/Constraint/Conjunction";
import {Implication} from "@/classes/Constraint/Implication";
import {Negation} from "@/classes/Constraint/Negation";
import api from "@/services/api.service";
import { Equivalence } from '@/classes/Constraint/Equivalence';

export class FeatureModel {
    constructor(versions, featureDict, features) {
        this.featureDict = featureDict;
        this.features = features;
        this.satCount = 0;
        this.versions = versions;
        this.productLineName = undefined;
        this.name = undefined;
        this.loading = true;
        this.loadingOpacity = 0;
    }

    static create(versions, features) {
        const featureDict = {};
        const featureList = [];
        features.forEach(f => {
            const feature = new Feature(f["var-id"], f["var-name"]);
            featureDict[f["var-name"]] = feature;
            featureList.push(feature);
        });

        return new FeatureModel(versions.map(v => new Version(v["version-name"], v["root-id"])), featureDict, featureList);
    }

    loadXmlData(version) {
        return api.get(`${import.meta.env.VITE_APP_DOMAIN}configurator/feature-models/${this.productLineName}/${version.version}`)
            .then((xmlRaw) => {
                const xml = beautify(xmlRaw.data);

                // To remove the <?xml...?> line
                let m = xml.split('\n').splice(1).join('\n');

                const parser = new DOMParser();
                const xmlDocument = parser.parseFromString(m, 'text/xml');

                const struct = xmlDocument.querySelector('struct');
                const usedFeatures = [];
                const root = this.parseChildren(struct, null, usedFeatures)[0];

                const constraints = this.readConstraints(
                    [...xmlDocument.querySelector('constraints').childNodes],
                    this.featureDict
                );

                version.root = root;
                version.constraints = constraints;
                version.features = usedFeatures;
            });
    }

    parseChildren(struct, parent, usedFeatures) {
        let toReturn = [];

        for (const child of struct.childNodes) {
            // To remove #text nodes, as they don't have a tagName
            if (child.tagName) {
                const featureName = child.getAttribute('name');

                const feature = this.featureDict[featureName];
                usedFeatures.push(feature);
                let toAppend = new FeatureNode(
                    feature,
                    parent,
                    featureName,
                    child.tagName,
                    child.getAttribute('mandatory') === 'true',
                    child.getAttribute('abstract') === 'true'
                );
                toAppend.children = this.parseChildren(child, toAppend, usedFeatures);
                toReturn.push(toAppend);
            }
        }

        return toReturn;
    }

    readConstraints(constraints, featureMap) {
        return constraints
            .filter((rule) => rule.tagName)
            .map((rule) => {
                return [...rule.childNodes]
                    .filter((item) => item.tagName)
                    .map(
                        (item) => new Constraint(this.readConstraintItem(item, featureMap))
                    )[0];
            });
    }

    readConstraintItem(item, featureMap) {
        if (item.tagName === 'var') {
            return new FeatureNodeConstraintItem(
                featureMap[item.innerHTML.trim()]
            );
        } else {
            const childItems = [...item.childNodes]
                .filter((childItem) => childItem.tagName)
                .map((childItem) => this.readConstraintItem(childItem, featureMap));

            switch (item.tagName) {
                case 'disj':
                    return new Disjunction(childItems);
                case 'conj':
                    return new Conjunction(childItems);
                case 'imp':
                    return new Implication(childItems[0], childItems[1]);
                case 'not':
                    return new Negation(childItems[0]);
                case 'eq':
                    return new Equivalence(childItems);
            }
        }
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
