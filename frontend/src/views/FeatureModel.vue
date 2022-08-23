<template>
	<div>
		<feature-model-tree
			ref="featureModelTree"
			:rootNode="rootNode"
			@exportToXML="exportToXML"
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
			ref="constraints"
			:constraints="constraints"
			@update-feature-model="updateFeatureModel"
		></constraints>
	</div>
</template>

<script>
import Vue from 'vue'
import FeatureModelTree from '../components/FeatureModel/FeatureModelTree.vue'
import Constraints from '../components/Constraints.vue'
import { Constraint, VarConstraint } from '@/classes/constraint'
import { littleModel2 } from '@/classes/featureModelData'
import { FeatureNode } from '@/classes/FeatureNode'
import * as update from '@/services/FeatureModel/update.service'

export default Vue.extend({
	name: 'FeatureModel',

	components: {
		FeatureModelTree,
		Constraints,
	},

	data: () => ({
		featureMap: [],
		constraints: [],
		properties: [],
		calculations: undefined,
		comments: [],
		featureOrder: undefined,
		rootNode: undefined,
	}),

	created() {
		// TODO: Axios request for xml

		const json = this.xmlToJson(littleModel2)
		this.rootNode = json.rootNode
		this.constraints = json.constraints
		this.properties = json.properties
		this.calculations = json.calculations
		this.comments = json.comments
		this.featureOrder = json.featureOrder
	},

	methods: {
		updateFeatureModel() {
			update.updateSvg(this.$refs.featureModelTree.d3Data)
		},

		updateConstraints() {
			this.$refs.constraints.update()
		},

		xmlToJson(currentModel) {
			const start = performance.now()

			// To remove the <?xml...?> line
			let m = currentModel.split('\n').splice(1).join('\n')

			const parser = new DOMParser()
			const xmlDocument = parser.parseFromString(m, 'text/xml')

			const struct = xmlDocument.querySelector('struct')
			const constraintsContainer =
				xmlDocument.querySelector('constraints')
			const propertiesSection = xmlDocument.querySelector('properties')
			const calculationsSection =
				xmlDocument.querySelector('calculations')
			const commentsSection = xmlDocument.querySelector('comments')
			const featureOrderSection =
				xmlDocument.querySelector('featureOrder')

			const toReturn = {
				rootNode: this.getChildrenOfFeature(struct, null)[0],
				constraints: this.getConstraints(constraintsContainer),
				properties: this.getProperties(propertiesSection),
				calculations: this.getCalculations(calculationsSection),
				comments: this.getComments(commentsSection),
				featureOrder: this.getFeatureOrder(featureOrderSection),
			}
			console.log('Parsertime', performance.now() - start)
			return toReturn
		},

		getChildrenOfFeature(struct, parent) {
			let toReturn = []

			for (const child of struct.childNodes) {
				// To remove #text nodes, as they don't have a tagName
				if (child.tagName) {
					let toAppend = new FeatureNode(
						parent,
						child.getAttribute('name'),
						child.tagName,
						child.getAttribute('mandatory') === 'true',
						child.getAttribute('abstract') === 'true'
					)
					toAppend.children = this.getChildrenOfFeature(
						child,
						toAppend
					)

					this.featureMap[toAppend.name] = toAppend
					toReturn.push(toAppend)
				}
			}

			return toReturn
		},

		getConstraints(constraints) {
			if (!constraints) return null

			return [...constraints.childNodes]
				.filter((element) => element.tagName)
				.map(
					(element) =>
						new Constraint(
							[...element.childNodes].filter((e) => e.tagName)[0],
							this.featureMap
						)
				)
		},

		getProperties(properties) {
			if (!properties) return null

			return [...properties.childNodes]
				.filter((element) => element.tagName)
				.map((element) => ({
					tag: element.tagName,
					key: element.getAttribute('key'),
					value: element.getAttribute('value'),
				}))
		},

		getCalculations(calculationsSection) {
			if (!calculationsSection) return null

			return {
				Auto: calculationsSection.getAttribute('Auto'),
				Constraints: calculationsSection.getAttribute('Constraints'),
				Features: calculationsSection.getAttribute('Features'),
				Redundant: calculationsSection.getAttribute('Redundant'),
				Tautology: calculationsSection.getAttribute('Tautology'),
			}
		},

		getComments(commentsSection) {
			if (!commentsSection) return null

			return [...commentsSection.childNodes]
				.filter((element) => element.tagName)
				.map((element) => element.innerHTML)
		},

		getFeatureOrder(featureOrder) {
			if (!featureOrder) return null

			return {
				userDefined: featureOrder.getAttribute('userDefined'),
			}
		},

		exportToXML() {
			let root = {}

			Object.entries(this.featureMap).forEach(([, node]) => {
				if (node.isRoot) {
					root = node
				}
			})

			let xml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?><featureModel>`

			xml += `<properties>${this.properties.reduce(
				(prev, prop) =>
					prev +
					`<${prop.tag} key="${prop.key}" value="${prop.value}"/>`,
				''
			)}</properties>`

			xml += `<struct>${this.nodeToXML(root)}</struct>`

			xml += `<constraints>${this.constraints.reduce(
				(prev, constraint) =>
					prev +
					'<rule>' +
					this.constraintToXML(constraint) +
					'</rule>',
				''
			)}</constraints>`

			if (this.calculations) {
				xml += `<calculations
                    Auto="${this.calculations.Auto}"
                    Constraints="${this.calculations.Constraints}"
                    Redundant="${this.calculations.Redundant}"
                    Tautology="${this.calculations.Tautology}"
                    Features="${this.calculations.Features}"
                    />`
			}

			xml += `<comments>${this.comments
				.map((comment) => '<c>' + comment + '</c>')
				.join(' ')}</comments>`

			if (this.featureOrder) {
				xml += `<featureOrder
                    userDefined="${this.featureOrder.userDefined}"
                    />`
			}

			xml += `</featureModel>`

			const filename = 'featureModel.xml'
			const pom = document.createElement('a')
			const bb = new Blob([xml], { type: 'application/xml' })

			pom.setAttribute('href', window.URL.createObjectURL(bb))
			pom.setAttribute('download', filename)

			pom.dataset.downloadurl = [
				'application/xml',
				pom.download,
				pom.href,
			].join(':')

			pom.click()
		},

		nodeToXML(node) {
			if (node.isLeaf()) {
				return `<feature ${node.isAbstract ? 'abstract="true" ' : ''}${
					node.isMandatory ? 'mandatory="true" ' : ''
				}name="${node.name}"/>`
			} else {
				let toReturn = `<${node.groupType} ${
					node.isAbstract ? 'abstract="true" ' : ''
				}${node.isMandatory ? 'mandatory="true" ' : ''}name="${
					node.name
				}">`

				node.children.forEach((childNode) => {
					toReturn += this.nodeToXML(childNode)
				})

				toReturn += `</${node.groupType}>`
				return toReturn
			}
		},

		constraintToXML(constraint) {
			if (constraint instanceof VarConstraint) {
				return `<var>${constraint.featureNode.name}</var>`
			} else if (constraint instanceof Constraint) {
				let toReturn = `<${constraint.xmlOperator}>`
				constraint.children.forEach((childConstraint) => {
					toReturn += this.constraintToXML(childConstraint)
				})
				toReturn += `</${constraint.xmlOperator}>`
				return toReturn
			}
		},
	},
})
</script>
