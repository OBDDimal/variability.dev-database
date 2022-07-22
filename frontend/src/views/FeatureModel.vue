<template>
	<div>
		<feature-model-tree :rootNode="rootNode" @exportToXML="exportToXML" ref="featureModelTree"></feature-model-tree>
		<v-btn
			icon
			x-large
			elevation="2"
			style="background-color: var(--v-primary-base)"
			dark
			absolute
			bottom
			right
			@click="$store.commit('openConstraints', true)"
			><v-icon>mdi-format-list-checks</v-icon></v-btn
		>
		<constraints :constraints="constraints"
                     :root-node="rootNode"
                     @update-feature-model="updateFeatureModel"
        ></constraints>
	</div>
</template>

<script>
import Vue from 'vue';
import FeatureModelTree from '../components/FeatureModel/FeatureModelTree.vue';
import Constraints from '../components/Constraints.vue';
import { Constraint, VarConstraint } from '@/classes/constraint';
import { berkeley } from '@/classes/featureModelData';
import { FeatureNode } from '@/classes/featureNode';
import * as update from "@/services/FeatureModel/update.service";
import * as collapse from "@/services/FeatureModel/collapse.service";
import {Disjunction} from "@/classes/Constraint/Disjunction";
import {Conjunction} from "@/classes/Constraint/Conjunction";
import {Implication} from "@/classes/Constraint/Implication";
import {Negation} from "@/classes/Constraint/Negation";
import {FeatureNodeConstraintItem} from "@/classes/Constraint/FeatureNodeConstraintItem";

export default Vue.extend({
	name: 'FeatureModel',

	components: {
		FeatureModelTree,
		Constraints,
	},

	props: {},

	data: () => ({
		featureMap: [],
		constraints: [],
		rootNode: undefined,
	}),

	created() {
		// TODO: Axios request for xml

		const [rootNode, constraints] = this.xmlToJson(berkeley);
		this.rootNode = rootNode;
		this.constraints = constraints;
	},

	computed: {},

	methods: {
		updateFeatureModel() {
			collapse.update(this.$refs.featureModelTree.d3Data);
			update.updateSvg(this.$refs.featureModelTree.d3Data);
		},

		xmlToJson(currentModel) {
			const start = performance.now();

			// To remove the <?xml...?> line
			let m = currentModel.split('\n').splice(1).join('\n');

			const parser = new DOMParser();
			const xmlDocument = parser.parseFromString(m, 'text/xml');

			const struct = xmlDocument.querySelector('struct');
			const constraintSection = xmlDocument.querySelector('constraints');

			const featuresToReturn = this.getChildrenOfFeature(struct, null);
			const constraintsToReturn = this.readConstraints([...constraintSection.childNodes]);
			console.log('Parsertime', performance.now() - start);
			return [featuresToReturn[0], constraintsToReturn];
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
						child.getAttribute('abstract') === 'true'
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
                        .map((item) => {
                            const constraint = new Constraint();
                            constraint.rule = this.readConstraintItem(item, constraint);
                            return constraint;
                        })[0];
                });
		},

        readConstraintItem(item, constraint) {
            if (item.tagName === 'var') {
                return new FeatureNodeConstraintItem(this.featureMap[item.innerHTML], constraint);
            } else {
                const childItems = [...item.childNodes]
                    .filter((childItem) => childItem.tagName)
                    .map((childItem) => this.readConstraintItem(childItem, constraint));

                switch (item.tagName) {
                    case 'disj': return new Disjunction(childItems);
                    case 'conj': return new Conjunction(childItems);
                    case 'imp':  return new Implication(childItems[0], childItems[1]);
                    case 'not':  return new Negation(childItems[0]);
                }
            }
        },

		exportToXML() {
			let root = {};

			Object.entries(this.featureMap).forEach(([, node]) => {
				if (node.isRoot) {
					root = node;
				}
			});

			let xml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?><featureModel>`;
			xml += `<struct>${this.nodeToXML(root)}</struct>`;
			xml += `<constraints>${this.constraints.reduce(
				(prev, constraint) => prev + '<rule>' + this.constraintToXML(constraint) + '</rule>',
				''
			)}</constraints>`;
			xml += `</featureModel>`;

			const filename = 'featureModel.xml';
			const pom = document.createElement('a');
			const bb = new Blob([xml], { type: 'application/xml' });

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

				node.children.forEach((childNode) => {
					toReturn += this.nodeToXML(childNode);
				});

				toReturn += `</${node.groupType}>`;
				return toReturn;
			}
		},

		constraintToXML(constraint) {
			if (constraint instanceof VarConstraint) {
				return `<var>${constraint.featureNode.name}</var>`;
			} else if (constraint instanceof Constraint) {
				let toReturn = `<${constraint.xmlOperator}>`;
				constraint.children.forEach((childConstraint) => {
					toReturn += this.constraintToXML(childConstraint);
				});
				toReturn += `</${constraint.xmlOperator}>`;
				return toReturn;
			}
		},
	},
});
</script>

<style scoped></style>
