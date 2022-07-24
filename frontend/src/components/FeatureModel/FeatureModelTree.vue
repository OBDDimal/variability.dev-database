<template>
    <div>
        <feature-model-tree-toolbar
            @coloring="(coloringIndex) => coloring(coloringIndex)"
            @export="$emit('exportToXML')"
            @fitToView="fitToView"
            @resetView="(levels, maxChildren) => resetView(levels, maxChildren)"
            @search="(search) => onChangeSearch(search)"
            @shortName="changeShortName"
            @verticalSpacing="changeVerticalSpacing"
        ></feature-model-tree-toolbar>
        <div id="svg-container"></div>

        <feature-model-tree-context-menu
            :d3Node="d3Data.contextMenu.selectedD3Node"
            :d3NodeEvent="d3Data.contextMenu.event"
            @add="(d3Node) => openAddDialog(d3Node)"
            @close="d3Data.contextMenu.selectedD3Node = undefined"
            @collapse="collapse"
            @edit="(d3Node) => openEditDialog(d3Node)"
            @hideCurrentNode="(d3Node) => hideCurrentNode(d3Node)"
            @hideLeftSiblings="(d3Node) => hideLeftSiblings(d3Node)"
            @hideRightSiblings="(d3Node) => hideRightSiblings(d3Node)"
        ></feature-model-tree-context-menu>

        <feature-model-tree-edit-dialog
            :node="editNode"
            :show="showEditDialog"
            @close="showEditDialog = false"
            @edit="edit">
        </feature-model-tree-edit-dialog>

        <feature-model-tree-add-dialog
            :parent="d3Data.d3ParentOfAddNode ? d3Data.d3ParentOfAddNode.data : undefined"
            :show="showAddDialog"
            @add="(newNode) => add(newNode)"
            @close="showAddDialog = false"
        ></feature-model-tree-add-dialog>
    </div>
</template>

<script>
import Vue from 'vue';
import FeatureModelTreeToolbar from './FeatureModelTreeToolbar.vue';
import FeatureModelTreeContextMenu from './FeatureModelTreeContextMenu.vue';
import FeatureModelTreeEditDialog from './FeatureModelTreeEditDialog.vue';
import FeatureModelTreeAddDialog from '@/components/FeatureModel/FeatureModelTreeAddDialog';

// Import feature-model-services
import * as add from "@/services/FeatureModel/add.service.js";
import * as collapse from "@/services/FeatureModel/collapse.service.js";
import * as count from '@/services/FeatureModel/count.service.js';
import * as dragAndDrop from "@/services/FeatureModel/dragAndDrop.service.js";
import * as hide from "@/services/FeatureModel/hide.service.js";
import * as update from '@/services/FeatureModel/update.service.js';
import * as init from '@/services/FeatureModel/init.service.js';
import * as view from "@/services/FeatureModel/view.service.js";
import * as search from "@/services/FeatureModel/search.service.js";
import {parse} from "@/services/booleanExpressionParser.service";

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
            container: {
                highlightedConstraintsContainer: undefined,
                linksContainer: undefined,
                segmentsContainer: undefined,
                featureNodesContainer: undefined,
                dragContainer: undefined,
            },
            verticalSpacing: 75,
            d3ParentOfAddNode: undefined,
        },
        showAddDialog: false,
        showEditDialog: false,
        editNode: undefined,
    }),

    mounted() {
        const output = parse('A or (B or C and D and (not E)) implies F');
        //const output = parse('A or B and C');
        console.log(output);
        console.log(output.toStringPostfix());

        init.initialize(this.d3Data, this.rootNode);
        dragAndDrop.init(this.d3Data);
        view.reset(this.d3Data);
        update.updateSvg(this.d3Data);
    },

    methods: {
        resetView(levels, maxChildren) {
            view.reset(this.d3Data, levels, maxChildren);
        },

        coloring(coloringIndex) {
            count.colorNodes(this.d3Data, coloringIndex);
        },

        onChangeSearch(searchText) {
            search.search(this.d3Data, searchText);
        },

        updateSvg() {
            update.updateSvg(this.d3Data);
        },

        fitToView() {
            view.zoomFit(this.d3Data);
        },

        hideCurrentNode(d3Node) {
            hide.hideCurrentNode(this.d3Data, d3Node);
        },

        hideRightSiblings(d3Node) {
            hide.hideRightSiblings(this.d3Data, d3Node);
        },

        hideLeftSiblings(d3Node) {
            hide.hideLeftSiblings(this.d3Data, d3Node);
        },

        collapse(d3Node) {
            d3Node.data.toggleCollapse();
            collapse.update(this.d3Data);
            update.updateSvg(this.d3Data);
        },

        add(newNode) {
            this.showAddDialog = false;
            add.addNode(this.d3Data, newNode);
        },

        edit() {
            this.showEditDialog = false;
            update.updateSvg(this.d3Data);
        },

        changeShortName(isShortName) {
            this.d3Data.isShortenedName = isShortName;
            update.updateSvg(this.d3Data);
        },

        changeVerticalSpacing(verticalSpacing) {
            this.d3Data.verticalSpacing = verticalSpacing;
            update.updateSvg(this.d3Data);
        },

        openAddDialog(d3Node) {
            this.d3Data.d3ParentOfAddNode = d3Node;
            this.showAddDialog = true;
        },

        openEditDialog(d3Node) {
            this.editNode = d3Node.data;
            this.showEditDialog = true;
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
