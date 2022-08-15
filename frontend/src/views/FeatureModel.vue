<template>
    <div>
        <feature-model-tree
            v-if="rootNode"
            ref="featureModelTree"
            :key="reloadKey"
            :rootNode="rootNode"
            :command-manager="featureModelCommandManager"
            @exportToXML="exportToXML"
            @reset="reset"
            @save="save"
            @update-constraints="updateConstraints"
        >
        </feature-model-tree>

        <v-btn
            absolute
            bottom
            dark
            elevation="2"
            icon
            right
            style="background-color: var(--v-primary-base)"
            x-large
            @click="$store.commit('openConstraints', true)"
        >
            <v-icon>mdi-format-list-checks</v-icon>
        </v-btn>

        <constraints
            v-if="constraints"
            ref="constraints"
            :constraints="constraints"
            :rootNode="rootNode"
            :command-manager="constraintCommandManager"
            @update-feature-model="updateFeatureModel"
        ></constraints>
    </div>
</template>

<script>
import Vue from 'vue';
import FeatureModelTree from '../components/FeatureModel/FeatureModelTree.vue';
import Constraints from '../components/Constraints.vue';
import {Constraint} from '@/classes/Constraint';
import {FeatureNode} from '@/classes/FeatureNode';
import * as update from "@/services/FeatureModel/update.service";
import {FeatureNodeConstraintItem} from "@/classes/Constraint/FeatureNodeConstraintItem";
import {Disjunction} from "@/classes/Constraint/Disjunction";
import {Conjunction} from "@/classes/Constraint/Conjunction";
import {Implication} from "@/classes/Constraint/Implication";
import {Negation} from "@/classes/Constraint/Negation";
import api from "@/services/api.service";
import beautify from "xml-beautifier";
import CollaborationManager from "@/classes/CollaborationManager";
import {CommandManager} from "@/classes/Commands/CommandManager";

export default Vue.extend({
    name: 'FeatureModel',

    components: {
        FeatureModelTree,
        Constraints,
    },

    props: {
        id: undefined,
    },

    data: () => ({
        featureMap: [],
        constraints: [],
        properties: [],
        calculations: undefined,
        comments: [],
        featureOrder: undefined,
        rootNode: undefined,
        reloadKey: 0,
        connector: undefined,
        featureModelCommandManager: new CommandManager(),
        constraintCommandManager: new CommandManager(),
        collaborationManager: null,
    }),

    created() {
        this.initData();
    },

    methods: {
        save() {
            // TODO: Axios post request to update the xml file in the backend.
        },

        reset() {
            // TODO: Transpile the xml file new and restart viewer.
            this.initData();
            this.reloadKey++;
        },

        initData() {
            api.get(`${process.env.VUE_APP_DOMAIN}files/${this.id}/`)
                .then((data) => {
                    api.get(data.data.local_file)
                        .then((data) => {
                            const formattedJson = beautify(data.data)
                            const json = this.xmlToJson(formattedJson)
                            this.constraints = json.constraints;
                            this.properties = json.properties;
                            this.calculations = json.calculations;
                            this.comments = json.comments;
                            this.featureOrder = json.featureOrder;
                            this.rootNode = json.rootNode;

                            this.collaborationManager = new CollaborationManager(this.id, this.featureModelCommandManager, this.constraintCommandManager);
                            this.collaborationManager.rootNode = this.rootNode;
                            this.collaborationManager.allConstraints = this.constraints;
                        })
                });
        },

        updateFeatureModel() {
            update.updateSvg(this.$refs.featureModelTree.d3Data);
        },

        updateConstraints() {
            this.$refs.constraints.update();
        },

        xmlToJson(currentModel) {
            const start = performance.now();

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

            const toReturn = {
                rootNode: this.getChildrenOfFeature(struct, null)[0],
                constraints: this.readConstraints([...constraintsContainer.childNodes]),
                properties: this.getProperties(propertiesSection),
                calculations: this.getCalculations(calculationsSection),
                comments: this.getComments(commentsSection),
                featureOrder: this.getFeatureOrder(featureOrderSection),
            };
            console.log('Parsertime', performance.now() - start);
            return toReturn;
        },

        getChildrenOfFeature(struct, parent) {
            let toReturn = [];

            for (const child of struct.childNodes) {
                // To remove #text nodes, as they don't have a tagName
                if (child.tagName) {
                    let toAppend = new FeatureNode(
                        parent,
                        child.getAttribute('name'),
                        child.tagName,
                        child.getAttribute('mandatory') === 'true',
                        child.getAttribute('abstract') === 'true',
                    );
                    toAppend.children = this.getChildrenOfFeature(child, toAppend);

                    this.featureMap[toAppend.name] = toAppend;
                    toReturn.push(toAppend);
                }
            }

            return toReturn;
        },

        readConstraints(constraints) {
            return constraints
                .filter((rule) => rule.tagName)
                .map((rule) => {
                    return [...rule.childNodes]
                        .filter((item) => item.tagName)
                        .map((item) => new Constraint(this.readConstraintItem(item)))[0];
                });
        },

        readConstraintItem(item) {
            if (item.tagName === 'var') {
                return new FeatureNodeConstraintItem(this.featureMap[item.innerHTML.trim()]);
            } else {
                const childItems = [...item.childNodes]
                    .filter((childItem) => childItem.tagName)
                    .map((childItem) => this.readConstraintItem(childItem));

                switch (item.tagName) {
                    case 'disj':
                        return new Disjunction(childItems[0], childItems[1]);
                    case 'conj':
                        return new Conjunction(childItems[0], childItems[1]);
                    case 'imp':
                        return new Implication(childItems[0], childItems[1]);
                    case 'not':
                        return new Negation(childItems[0]);
                }
            }
        },

        getProperties(properties) {
            if (!properties) return null;

            return [...properties.childNodes]
                .filter((element) => element.tagName)
                .map((element) => ({
                    tag: element.tagName,
                    key: element.getAttribute('key'),
                    value: element.getAttribute('value'),
                }));
        },

        getCalculations(calculationsSection) {
            if (!calculationsSection) return null;

            return {
                Auto: calculationsSection.getAttribute('Auto'),
                Constraints: calculationsSection.getAttribute('Constraints'),
                Features: calculationsSection.getAttribute('Features'),
                Redundant: calculationsSection.getAttribute('Redundant'),
                Tautology: calculationsSection.getAttribute('Tautology'),
            };
        },

        getComments(commentsSection) {
            if (!commentsSection) return null;

            return [...commentsSection.childNodes]
                .filter((element) => element.tagName)
                .map((element) => element.innerHTML);
        },

        getFeatureOrder(featureOrder) {
            if (!featureOrder) return null;

            return {
                userDefined: featureOrder.getAttribute('userDefined'),
            };
        },

        exportToXML() {
            let root = {};

            Object.entries(this.featureMap).forEach(([, node]) => {
                if (node.isRoot) {
                    root = node;
                }
            });

            let xml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?><featureModel>`;

            xml += `<properties>${this.properties.reduce(
                (prev, prop) => prev + `<${prop.tag} key="${prop.key}" value="${prop.value}"/>`,
                ''
            )}</properties>`;

            xml += `<struct>${this.nodeToXML(root)}</struct>`;

            xml += `<constraints>${this.constraints.reduce(
                (prev, constraint) => `${prev}<rule>${this.constraintToXML(constraint)}</rule>`,
                '',
            )}</constraints>`;

            if (this.calculations) {
                xml += `<calculations
                    Auto="${this.calculations.Auto}"
                    Constraints="${this.calculations.Constraints}"
                    Redundant="${this.calculations.Redundant}"
                    Tautology="${this.calculations.Tautology}"
                    Features="${this.calculations.Features}"
                    />`;
            }

            xml += `<comments>${this.comments.map((comment) => "<c>" + comment + "</c>").join(' ')}</comments>`;

            if (this.featureOrder) {
                xml += `<featureOrder
                    userDefined="${this.featureOrder.userDefined}"
                    />`;
            }

            xml += `</featureModel>`;

            const filename = 'featureModel.xml';
            const pom = document.createElement('a');
            const bb = new Blob([xml], {type: 'application/xml'});

            pom.setAttribute('href', window.URL.createObjectURL(bb));
            pom.setAttribute('download', filename);

            pom.dataset.downloadurl = ['application/xml', pom.download, pom.href].join(':');

            pom.click();
        },

        nodeToXML(node) {
            if (node.isLeaf()) {
                return `<feature ${node.isAbstract ? 'abstract="true" ' : ''}${node.isMandatory ? 'mandatory="true" ' : ''}name="${
                    node.name
                }"/>`;
            } else {
                let toReturn = `<${node.groupType} ${node.isAbstract ? 'abstract="true" ' : ''}${
                    node.isMandatory ? 'mandatory="true" ' : ''
                }name="${node.name}">`;

                node.children.forEach(childNode => {
                    toReturn += this.nodeToXML(childNode);
                });

                toReturn += `</${node.groupType}>`;
                return toReturn;
            }
        },
    },
});
</script>
