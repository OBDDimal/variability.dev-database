<template>
	<div>
		<feature-model-tree-toolbar
			@search="(search) => onChangeSearch(search)"
			@coloring="(coloringIndex) => coloring(coloringIndex)"
			@fitToView="zoomFit"
			@resetView="(levels, maxChildren) => resetView(levels, maxChildren)"
			@shortName="onChangeShortName"
			@verticalSpacing="onChangeVerticalSpacing"
			@export="$emit('exportToXML')"
		></feature-model-tree-toolbar>
		<div id="svg-container"></div>

		<feature-model-tree-context-menu
			:d3Node="contextMenu.selectedD3Node"
			:d3NodeEvent="contextMenu.event"
			@collapse="
				(d3Node) => {
					d3Node.data.toggleCollapse();
					updateCollapsing();
					updateSvg();
				}
			"
			@hideLeftSiblings="(d3Node) => hideLeftSiblings(d3Node)"
			@hideRightSiblings="(d3Node) => hideRightSiblings(d3Node)"
			@hideCurrentNode="(d3Node) => hideCurrentNode(d3Node)"
			@edit="(d3Node) => (editD3Node = d3Node)"
			@close="contextMenu.selectedD3Node = undefined"
			@add="(d3Node) => (d3ParentOfAddNode = d3Node)"
		></feature-model-tree-context-menu>

		<feature-model-tree-edit-dialog :d3Node="editD3Node" @close="editD3Node = undefined" @update="updateSvg">
		</feature-model-tree-edit-dialog>

		<feature-model-tree-add-dialog
			:parent="d3ParentOfAddNode ? d3ParentOfAddNode.data : undefined"
			@close="d3ParentOfAddNode = undefined"
			@add="(newNode) => addNode(newNode)"
		></feature-model-tree-add-dialog>
	</div>
</template>

<script>
import Vue from 'vue';
import * as d3 from 'd3';
import { PseudoNode } from '@/classes/featureNode';
import FeatureModelTreeToolbar from './FeatureModelTreeToolbar.vue';
import FeatureModelTreeContextMenu from './FeatureModelTreeContextMenu.vue';
import FeatureModelTreeEditDialog from './FeatureModelTreeEditDialog.vue';
import FeatureModelTreeAddDialog from '@/components/FeatureModel/FeatureModelTreeAddDialog';

// Import feature-model-services
// import * as addFeature from "@/services/FeatureModel/addFeature.service.js";
// import * as collapseFeatures from "@/services/FeatureModel/collapseFeatures.service.js";
import * as countFeatures from '@/services/FeatureModel/countFeatures.service.js';
// import * as dragAndDropFeatures from "@/services/FeatureModel/dragAndDropFeatures.service.js";
// import * as editFeature from "@/services/FeatureModel/editFeature.service.js";
// import * as hideFeature from "@/services/FeatureModel/hideFeature.service.js";
import * as searchFeature from '@/services/FeatureModel/searchFeature.service.js';
import * as updateSvg from '@/services/FeatureModel/updateSvg.service.js';
import * as init from '@/services/FeatureModel/init.service.js';
// import * as zoomSvg from "@/services/FeatureModel/zoomSvg.service.js";

export default Vue.extend({
	name: 'FeatureModelTree',

	components: {
		FeatureModelTreeToolbar,
		FeatureModelTreeContextMenu,
		FeatureModelTreeEditDialog,
		FeatureModelTreeAddDialog,
	},

	props: {
		rootNode: undefined,
	},

	data: () => ({
		d3Data: {
			root: undefined,
			allNodes: undefined,
			flexLayout: undefined,
			zoom: undefined,
			nodeIdCounter: 0,
			isShortenedName: false,
			verticalSpacing: 75,
		},
		drag: {
			listener: undefined,
			hasStarted: false,
			selectedD3Node: undefined,
			selectedGhostNode: undefined,
		},
		contextMenu: {
			selectedD3Node: undefined,
			event: undefined,
		},
		editD3Node: undefined,
		d3ParentOfAddNode: undefined,
		container: {
			highlightedConstraintsContainer: undefined,
			linksContainer: undefined,
			segmentsContainer: undefined,
			featureNodesContainer: undefined,
			dragContainer: undefined,
		},
	}),

	computed: {},

	mounted() {
		init.initialize(this.d3Data, this.container, this.drag, this.contextMenu, this.rootNode);
    dragAndDropFeature.defineDragListener(this.d3Data, this.container);
		this.resetView();
		this.updateSvg();
	},

	methods: {
		coloring(coloringIndex) {
			countFeatures.onChangeColoring(this.d3Data.allNodes, coloringIndex);
		},

		onChangeSearch(search) {
			searchFeature.onChangeSearch(this.d3Data, search);
		},

		updateSvg() {
			updateSvg.updateSvg(this.d3Data, this.container, this.drag, this.contextMenu);
		},


		// Collapses all children of the specifed node with shortcut ALT + left-click.
		collapseShortcut(event, d3Node) {
			if (event.getModifierState('Alt')) {
				d3Node.data.toggleCollapse();
				this.updateCollapsing();
				this.updateSvg();
			}
		},

		focusNode(d3Node) {
			d3.select('svg').call(this.d3Data.zoom.translateTo, d3Node.x, d3Node.y);
		},

		updateCollapsing() {
			this.d3Data.allNodes.forEach((d3Node) => {
				if (!d3Node.data.isLeaf()) {
					if (d3Node.data.isCollapsed && !d3Node.collapsedChildren) {
						d3Node.collapsedChildren = d3Node.children;
						d3Node.children = null;
					} else if (!d3Node.data.isCollapsed && !d3Node.children) {
						d3Node.children = d3Node.collapsedChildren;
						d3Node.collapsedChildren = null;
					}
				}
			});
		},

		resetView(uncollapsedLevels = 4, maxChildrenCount = 3) {
			// Collapses all nodes after depth 1.
			this.d3Data.allNodes.forEach((d3Node) => d3Node.data.collapse());

			let currentChildren = [this.d3Data.root.data];
			for (let i = 1; i <= uncollapsedLevels; i++) {
				currentChildren.forEach((child) => {
					if (child.children.length <= maxChildrenCount) {
						child.uncollapse(false);
					}
				});
				currentChildren = currentChildren
					.map((parent) => (parent.children.length <= maxChildrenCount ? parent.children : []))
					.flat();

				if (currentChildren.length === 0) {
					break;
				}
			}

			this.updateCollapsing();
			this.updateSvg();
			this.zoomFit();
		},

		zoomFit(padding = 0.75) {
			let bounds = document.querySelector('svg > g').getBBox();
			let fullWidth = document.querySelector('svg').getBoundingClientRect().width,
				fullHeight = document.querySelector('svg').getBoundingClientRect().height;
			let width = bounds.width,
				height = bounds.height;
			let midX = bounds.x + width / 2,
				midY = bounds.y + height / 2;
			if (width == 0 || height == 0) return; // nothing to fit
			let scale = padding / Math.max(width / fullWidth, height / fullHeight);

			d3.select('svg').call(this.d3Data.zoom.translateTo, midX, midY).call(this.d3Data.zoom.scaleTo, scale);
		},

		updateHiding(d3Parent) {
			d3Parent.children = [];

			let isPreviousNodeHidden = false;
			let currentPseudoNode;
			d3Parent.allChildren.forEach((d3Child) => {
				if (d3Child.data.isHidden && !isPreviousNodeHidden) {
					currentPseudoNode = new PseudoNode(d3Child);
					const d3PseudoNode = d3.hierarchy(currentPseudoNode);
					d3PseudoNode.parent = d3Parent;
					d3Parent.children.push(d3PseudoNode);
				} else if (d3Child.data.isHidden && isPreviousNodeHidden) {
					currentPseudoNode.hiddenD3Children.push(d3Child);
				} else {
					d3Parent.children.push(d3Child);
				}
				isPreviousNodeHidden = d3Child.data.isHidden;
			});
		},

		onChangeShortName(isShortName) {
			this.isShortenedName = isShortName;
			this.updateSvg();
		},

		onChangeVerticalSpacing(verticalSpacing) {
			this.verticalSpacing = verticalSpacing;
			this.updateSvg();
		},

		hideLeftSiblings(d3Node) {
			if (d3Node.data.getLeftSibling().isHidden) {
				d3Node.data.unhideLeftSiblings();
			} else {
				d3Node.data.hideLeftSiblings();
			}

			this.updateHiding(d3Node.parent);
			this.updateSvg();
			this.focusNode(d3Node);
		},

		hideRightSiblings(d3Node) {
			if (d3Node.data.getRightSibling().isHidden) {
				d3Node.data.unhideRightSiblings();
			} else {
				d3Node.data.hideRightSiblings();
			}

			this.updateHiding(d3Node.parent);
			this.updateSvg();
			this.focusNode(d3Node);
		},

		hideCurrentNode(d3Node) {
			d3Node.data.hide();

			this.updateHiding(d3Node.parent);
			this.updateSvg();
			this.focusNode(d3Node);
		},

		addNode(newNode) {
			if (this.d3ParentOfAddNode.data.isLeaf()) {
				this.d3ParentOfAddNode.allChildren = [];
			}

			this.d3ParentOfAddNode.data.collapse();
			this.updateCollapsing();

			this.d3ParentOfAddNode.data.unhideChildren();
			this.updateHiding(this.d3ParentOfAddNode);

			newNode.parent.children.push(newNode);

			const d3NewNode = d3.hierarchy(newNode);
			d3NewNode.parent = this.d3ParentOfAddNode;
			this.d3ParentOfAddNode.allChildren.push(d3NewNode);
			this.d3ParentOfAddNode.children = this.d3ParentOfAddNode.allChildren;

			console.log(this.d3ParentOfAddNode);
			this.d3ParentOfAddNode = undefined;
			this.updateSvg();
		},
	},
});
</script>

<style lang="scss">
.ghost-circle {
	fill: red;
	fill-opacity: 0.2;
	r: 15px;
}

.ghost-circle:hover {
	fill-opacity: 0.8;
}

#svg-container {
	width: 100%;
	height: calc(100vh - 64px);
}

.node {
	cursor: pointer;
	vertical-align: middle;

	.is-searched-feature {
		fill: lightcoral;
	}

	rect {
		stroke: #888;
		stroke-width: 1px;
	}

	text {
		/* fill: black; */
		font-family: monospace;
		text-anchor: middle;
	}
}

.and-group-circle {
	stroke: #888;
	stroke-width: 1.5px;
	opacity: 0;
}

.optional-and-group-circle {
	fill: white;
	opacity: 1;
}

.mandatory-and-group-circle {
	fill: rgb(136, 136, 136);
	opacity: 1;
}

.alt-group {
	fill: white;
	stroke: #888;
	stroke-width: 1.5px;
}

.or-group {
	fill: #888;
	stroke: #888;
	stroke-width: 1.5px;
}

.link {
	fill: none;
	stroke: #888;
	stroke-width: 1.5px;
}

.is-searched-link {
	fill: none;
	stroke: lightcoral;
	stroke-width: 1.5px;
}

.children-count > circle {
	fill: white;
	stroke: #888;
	stroke-width: 1.5px;
}

.pseudo-node {
	cursor: pointer;
	vertical-align: middle;

	> circle {
		fill: white;
		stroke: #888;
		stroke-width: 1.5px;
	}
}

.feature-model-constraints {
	position: absolute;
	background-color: white;
	bottom: 0;
	width: 100%;
	box-shadow: 0px 10px 10px #888, 0px -10px 10px #888;
	padding: 2rem;
	min-height: 10%;
	max-height: 20%;
	overflow: scroll;
}

polygon {
	stroke: #888;
}

.children-count-text {
	fill: black !important;
}

.blackText {
	fill: black !important;
}

.whiteText {
	fill: white !important;
}
</style>
