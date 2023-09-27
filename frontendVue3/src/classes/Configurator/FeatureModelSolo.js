import beautify from "xml-beautifier";
import {FeatureNode} from "@/classes/Configurator/FeatureNode";
import {Feature} from "@/classes/Configurator/Feature";
import {Constraint} from "@/classes/Constraint";
import {FeatureNodeConstraintItem} from "@/classes/Constraint/FeatureNodeConstraintItem";
import {Disjunction} from "@/classes/Constraint/Disjunction";
import {Conjunction} from "@/classes/Constraint/Conjunction";
import {Implication} from "@/classes/Constraint/Implication";
import {Negation} from "@/classes/Constraint/Negation";
import { Equivalence } from '@/classes/Constraint/Equivalence';
import { SelectionState } from '@/classes/Configurator/SelectionState';

export class FeatureModelSolo {
    constructor(features, constraints, root, featureDict) {
        this.features = features;
        this.constraints = constraints;
        this.root = root;
        this.featureDict = featureDict;
        this.satCount = 0;
        this.name = '';
        this.loading = true;
        this.loadingOpacity = 0;
    }

    static loadXmlDataFromFile(fileText) {
        const xml = beautify(fileText);
        // To remove the <?xml...?> line
        let m = xml.split('\n').splice(1).join('\n');

        const parser = new DOMParser();
        const xmlDocument = parser.parseFromString(m, 'text/xml');

        const struct = xmlDocument.querySelector('struct');
        const usedFeatures = [];
        const featureDict = {};
        const root = FeatureModelSolo.parseChildren(struct, null, usedFeatures, 0, featureDict)[0];

        const constraints = FeatureModelSolo.readConstraints(
            [...xmlDocument.querySelector('constraints').childNodes],
            featureDict
        );

        return new FeatureModelSolo(usedFeatures, constraints, root, featureDict);
    }

    static loadXmlDataFromConfig(fileText) {
        const xml = beautify(fileText);
        // To remove the <?xml...?> line
        let m = xml.split('\n').splice(1).join('\n');

        const parser = new DOMParser();
        const xmlDocument = parser.parseFromString(m, 'text/xml');

        const struct = xmlDocument.querySelector('configuration');
        const usedFeatures = [];
        FeatureModelSolo.parseChildrenFromConfig(struct, usedFeatures, 0);

        return usedFeatures;
    }

    static parseChildren(struct, parent, usedFeatures, count, featureDict) {
        let toReturn = [];

        for (const child of struct.childNodes) {
            // To remove #text nodes, as they don't have a tagName
            if (child.tagName) {
                const featureName = child.getAttribute('name');

                const feature = new Feature(count, featureName);
                count++;
                usedFeatures.push(feature);
                featureDict[featureName] = feature;
                let toAppend = new FeatureNode(
                    feature,
                    parent,
                    featureName,
                    child.tagName,
                    child.getAttribute('mandatory') === 'true',
                    child.getAttribute('abstract') === 'true'
                );
                toAppend.children = FeatureModelSolo.parseChildren(child, toAppend, usedFeatures, count, featureDict);
                toReturn.push(toAppend);
            }
        }

        return toReturn;
    }

    static parseChildrenFromConfig(struct, usedFeatures, count) {

        for (const child of struct.childNodes) {
            // To remove #text nodes, as they don't have a tagName
            if (child.tagName) {
                const featureName = child.getAttribute('name');
                const automatic = child.getAttribute('automatic');
                const manual = child.getAttribute('manual');

                const feature = new Feature(count, featureName);
                count++;
                if(automatic === 'selected') {
                  feature.selectionState = SelectionState.ImplicitlySelected;
                }

                if(manual === 'selected') {
                  feature.selectionState = SelectionState.ExplicitlySelected;
                }

                if(automatic === 'deselected') {
                  feature.selectionState = SelectionState.ImplicitlyDeselected;
                }

                if(manual === 'deselected') {
                  feature.selectionState = SelectionState.ExplicitlyDeselected;
                }
                usedFeatures.push(feature);
            }
        }
    }

    static readConstraints(constraints, featureMap) {
        return constraints
            .filter((rule) => rule.tagName)
            .map((rule) => {
                return [...rule.childNodes]
                    .filter((item) => item.tagName)
                    .map(
                        (item) => new Constraint(FeatureModelSolo.readConstraintItem(item, featureMap))
                    )[0];
            });
    }

    static readConstraintItem(item, featureMap) {
        if (item.tagName === 'var') {
            return new FeatureNodeConstraintItem(
                featureMap[item.innerHTML.trim()]
            );
        } else {
            const childItems = [...item.childNodes]
                .filter((childItem) => childItem.tagName)
                .map((childItem) => FeatureModelSolo.readConstraintItem(childItem, featureMap));

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

    parseToConfig(){
      let xml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n`;

      xml += '<configuration>\n';
      this.features.forEach((f) => {
        xml += f.toConfigString() + "\n"
      });
      xml += '</configuration>';

      return xml;
    }

    downloadXMLConfig() {
      const xml = this.parseToConfig();

      const filename = `${this.name}_config.xml`;
      const pom = document.createElement('a');
      const bb = new Blob([xml], { type: 'application/xml' });

      pom.setAttribute('href', window.URL.createObjectURL(bb));
      pom.setAttribute('download', filename);

      pom.dataset.downloadurl = ['application/xml', pom.download, pom.href].join(
          ':'
      );

      pom.click();
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

    calcVersionDecisionPropagation() {
        console.log("VDP");
    }

    calcDecisionPropagation() {
        console.log("DP");
    }
}
