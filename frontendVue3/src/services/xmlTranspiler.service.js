import { FeatureNode } from '@/classes/FeatureNode';
import { Constraint } from '@/classes/Constraint';
import { FeatureNodeConstraintItem } from '@/classes/Constraint/FeatureNodeConstraintItem';
import { Disjunction } from '@/classes/Constraint/Disjunction';
import { Conjunction } from '@/classes/Constraint/Conjunction';
import { Implication } from '@/classes/Constraint/Implication';
import { Negation } from '@/classes/Constraint/Negation';
import { SoloDisjunction } from '@/classes/Constraint/SoloDisjunction';
import { Equivalence } from '@/classes/Constraint/Equivalence';

export function xmlToJson(currentModel, data) {
    /*const start = performance.now();*/

    // To remove the <?xml...?> line
    let m = currentModel.split('\n').splice(1).join('\n');

    const parser = new DOMParser();
    const xmlDocument = parser.parseFromString(m, 'text/xml');

    const struct = xmlDocument.querySelector('struct');
    const constraintsContainer = xmlDocument.querySelector('constraints');
    const propertiesSection = xmlDocument.querySelector('properties');
    const calculationsSection = xmlDocument.querySelector('calculations');
    const commentsSection = xmlDocument.querySelector('comments');
    const featureOrderSection = xmlDocument.querySelector('featureOrder');

    data.calculations = getCalculations(calculationsSection);

    data.rootNode = getChildrenOfFeature(struct, null, data)[0];
    data.constraints = readConstraints(constraintsContainer, data);
    data.properties = getProperties(propertiesSection);
    data.comments = getComments(commentsSection);
    data.featureOrder = getFeatureOrder(featureOrderSection);

    /*console.log('Parsertime', performance.now() - start);*/
}

function getChildrenOfFeature(struct, parent, data) {
    let toReturn = [];

    for (const child of struct.childNodes) {
        // To remove #text nodes, as they don't have a tagName
        if (child.tagName) {
            let toAppend = new FeatureNode(
                parent,
                child.getAttribute('name'),
                child.tagName,
                child.getAttribute('mandatory') === 'true',
                child.getAttribute('abstract') === 'true'
            );
            if(child.tagName === 'feature'){
              toAppend.setGroupType('and')
            }
            toAppend.children = getChildrenOfFeature(child, toAppend, data);

            data.featureMap[toAppend.name] = toAppend;
            toReturn.push(toAppend);
        }
    }

    return toReturn;
}

function readConstraints(constraints, data) {
    if (!constraints) return [];

    const childNodes = [...constraints.childNodes]
    return childNodes
        .filter((rule) => rule.tagName)
        .map((rule) => {
            return [...rule.childNodes]
                .filter((item) => item.tagName)
                .map(
                    (item) => new Constraint(readConstraintItem(item, data))
                )[0];
        });
}

function readConstraintItem(item, data) {
    if (item.tagName === 'var') {
        return new FeatureNodeConstraintItem(
            data.featureMap[item.innerHTML.trim()]
        );
    } else {
        const childItems = [...item.childNodes]
            .filter((childItem) => childItem.tagName)
            .map((childItem) => readConstraintItem(childItem, data));

        if (childItems.length > 1 || item.tagName === 'not') {
            switch (item.tagName) {
                case 'disj':
                    return new Disjunction(childItems);
                case 'conj':
                    return new Conjunction(childItems);
                case 'imp':
                    return new Implication(childItems[0], childItems[1]);
                case 'eq':
                    return new Equivalence(childItems);
                case 'not':
                    return new Negation(childItems[0]);
            }
        } else {
            return new SoloDisjunction(childItems[0]);
        }
    }
}

function getProperties(properties) {
    if (!properties) return [];

    return [...properties.childNodes]
        .filter((element) => element.tagName)
        .map((element) => ({
            tag: element.tagName,
            key: element.getAttribute('key'),
            value: element.getAttribute('value'),
        }));
}

function getCalculations(calculationsSection) {
    if (!calculationsSection) return null;

    return {
        Auto: calculationsSection.getAttribute('Auto'),
        Constraints: calculationsSection.getAttribute('Constraints'),
        Features: calculationsSection.getAttribute('Features'),
        Redundant: calculationsSection.getAttribute('Redundant'),
        Tautology: calculationsSection.getAttribute('Tautology'),
    };
}

function getComments(commentsSection) {
    if (!commentsSection) return [];

    return [...commentsSection.childNodes]
        .filter((element) => element.tagName)
        .map((element) => element.innerHTML);
}

function getFeatureOrder(featureOrder) {
    if (!featureOrder) return null;

    return {
        userDefined: featureOrder.getAttribute('userDefined'),
    };
}

export function jsonToXML(data) {
    let xml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?><featureModel>`;

    xml += `<properties>${data.properties.reduce(
        (prev, prop) =>
            prev + `<${prop.tag} key="${prop.key}" value="${prop.value}"/>`,
        ''
    )}</properties>`;

    xml += `<struct>${nodeToXML(data.rootNode)}</struct>`;

    xml += `<constraints>${data.constraints.reduce(
        (prev, constraint) => `${prev}<rule>${constraint.toStringXML()}</rule>`,
        ''
    )}</constraints>`;

    if (data.calculations) {
        xml += `<calculations
                    Auto="${data.calculations.Auto}"
                    Constraints="${data.calculations.Constraints}"
                    Redundant="${data.calculations.Redundant}"
                    Tautology="${data.calculations.Tautology}"
                    Features="${data.calculations.Features}"
                    />`;
    }

    xml += `<comments>${data.comments
        .map((comment) => '<c>' + comment + '</c>')
        .join(' ')}</comments>`;

    if (data.featureOrder) {
        xml += `<featureOrder
                    userDefined="${data.featureOrder.userDefined}"
                    />`;
    }

    xml += `</featureModel>`;

    return xml;
}

export function downloadXML(data) {
    const xml = jsonToXML(data);

    const filename = 'featureModel.xml';
    const pom = document.createElement('a');
    const bb = new Blob([xml], { type: 'application/xml' });

    pom.setAttribute('href', window.URL.createObjectURL(bb));
    pom.setAttribute('download', filename);

    pom.dataset.downloadurl = ['application/xml', pom.download, pom.href].join(
        ':'
    );

    pom.click();
}

function nodeToXML(node) {
    if (node.isLeaf()) {
        return `<feature ${node.isAbstract ? 'abstract="true" ' : ''}${
            node.isMandatory ? 'mandatory="true" ' : ''
        }name="${node.name}"/>`;
    } else {
        let toReturn = `<${node.groupType} ${
            node.isAbstract ? 'abstract="true" ' : ''
        }${node.isMandatory ? 'mandatory="true" ' : ''}name="${node.name}">`;

        node.children.forEach((childNode) => {
            toReturn += nodeToXML(childNode);
        });

        toReturn += `</${node.groupType}>`;
        return toReturn;
    }
}
