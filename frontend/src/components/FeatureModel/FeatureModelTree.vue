<template>
    <div>
        <div class="float-right mt-2 mr-3" style="position: absolute; right: 0;">
            <v-toolbar
                height="auto"
                class="rounded-pill"
                elevation="9"
                style="border: 2px solid white"
            >
                <v-btn icon>
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>

                <v-btn icon>
                    <v-icon>mdi-chevron-right</v-icon>
                </v-btn>

                <!--<v-combobox
                    v-if="showSearch"
                    v-model="searchText"
                    :item-text="(node) => node.name"
                    :item-value="(node) => node.name"
                    :items="allNodes"
                    class="px-4"
                    clearable
                    hide-details
                    label="Search"
                    placeholder="Search"
                    single-line
                >
                </v-combobox>-->

                <v-text-field
                    v-if="showSearch"
                    v-model="searchText"
                    class="px-4"
                    clearable
                    hide-details
                    placeholder="Search"
                    single-line
                ></v-text-field>

                <v-btn icon @click="showSearch = !showSearch">
                    <v-icon>mdi-magnify</v-icon>
                </v-btn>
            </v-toolbar>
        </div>

        <feature-model-tree-toolbar
            :is-redo-available="d3Data.commandManager.isRedoAvailable()"
            :is-undo-available="d3Data.commandManager.isUndoAvailable()"
            @coloring="(coloringIndex) => coloring(coloringIndex)"
            @export="$emit('exportToXML')"
            @fitToView="fitToView"
            @redo="redo"
            @reset="$emit('reset')"
            @resetView="(levels, maxChildren) => resetView(levels, maxChildren)"
            @save="$emit('save')"
            @semanticEditing="(value) => d3Data.semanticEditing = value"
            @shortName="changeShortName"
            @undo="undo"
            @verticalSpacing="changeVerticalSpacing"
        ></feature-model-tree-toolbar>
        <div id="svg-container"></div>

        <feature-model-tree-context-menu
            :d3Node="d3Data.contextMenu.selectedD3Node"
            :d3NodeEvent="d3Data.contextMenu.event"
            @addAsChild="(d3Node) => openAddAsChildDialog(d3Node)"
            @addAsSibling="(d3Node) => openAddAsSiblingDialog(d3Node)"
            @close="d3Data.contextMenu.selectedD3Node = undefined"
            @collapse="collapse"
            @edit="(d3Node) => openEditDialog(d3Node)"
            @hideAllNodesOnThisLevel="(d3Node) => hideAllNodesOnThisLevel(d3Node)"
            @hideAllOtherNodes="(d3Node) => hideAllOtherNodes(d3Node)"
            @hideCurrentNode="(d3Node) => hideCurrentNode(d3Node)"
            @hideLeftSiblings="(d3Node) => hideLeftSiblings(d3Node)"
            @hideRightSiblings="(d3Node) => hideRightSiblings(d3Node)"
            @highlightConstraints="(d3Node) => highlightConstraints(d3Node)"
            @resetHighlightConstraints="(d3Node) => resetHighlightConstraints(d3Node)"
        ></feature-model-tree-context-menu>

        <feature-model-tree-edit-dialog
            :node="editNode"
            :show="showEditDialog"
            @close="showEditDialog = false"
            @edit="(data) => edit(data)">
        </feature-model-tree-edit-dialog>

        <feature-model-tree-add-dialog
            :parent="d3Data.d3ParentOfAddNode ? d3Data.d3ParentOfAddNode.data : undefined"
            :show="showAddDialog"
            @add="(data) => add(data)"
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
import * as dragAndDrop from "@/services/FeatureModel/dragAndDrop.service.js";
import * as update from '@/services/FeatureModel/update.service.js';
import * as init from '@/services/FeatureModel/init.service.js';
import * as view from "@/services/FeatureModel/view.service.js";
import * as search from "@/services/FeatureModel/search.service.js";
import {CommandManager} from "@/classes/Commands/CommandManager";
import {AddCommand} from "@/classes/Commands/AddCommand";
import {EditCommand} from "@/classes/Commands/EditCommand";
import * as update_service from "@/services/FeatureModel/update.service";

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
            commandManager: new CommandManager(),
            root: undefined,
            flexLayout: undefined,
            zoom: undefined,
            nodeIdCounter: 0,
            isShortenedName: false,
            drag: {
                listener: undefined,
                hasStarted: false,
                ghostNodes: [],
                selectedD3Node: undefined,
                selectedGhostNode: undefined,
                selectedD3NodePosition: undefined,
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
            updateTrigger: {
                coloring: false,
            },
            verticalSpacing: 75,
            d3ParentOfAddNode: undefined,
            coloringIndex: -1,
            semanticEditing: false,
        },
        showAddDialog: false,
        showEditDialog: false,
        editNode: undefined,
        searchText: undefined,
        showSearch: false,
    }),

    mounted() {
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
            this.d3Data.coloringIndex = coloringIndex;
            this.d3Data.updateTrigger.coloring = true;
            update.updateSvg(this.d3Data);
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
            this.closeContextMenu();
            d3Node.data.hide();
            update_service.updateSvg(this.d3Data);
            view.focusNode(this.d3Data, d3Node);
        },

        hideRightSiblings(d3Node) {
            this.closeContextMenu();
            d3Node.data.toggleHideRightSiblings();
            update_service.updateSvg(this.d3Data);
            view.focusNode(this.d3Data, d3Node);
        },

        hideLeftSiblings(d3Node) {
            this.closeContextMenu();
            d3Node.data.toggleHideLeftSiblings();
            update_service.updateSvg(this.d3Data);
            view.focusNode(this.d3Data, d3Node);
        },

        hideAllOtherNodes(d3Node) {
            this.closeContextMenu();
            d3Node.data.hideAllOtherNodes();
            update_service.updateSvg(this.d3Data);
            view.focusNode(this.d3Data, d3Node);
        },

        hideAllNodesOnThisLevel(d3Node) {
            this.closeContextMenu();
            d3Node.data.hideAllNodesOnThisLevel();
            update_service.updateSvg(this.d3Data);
            view.focusNode(this.d3Data, d3Node);
        },

        closeContextMenu() {
            this.d3Data.contextMenu.selectedD3Node = undefined;
        },

        collapse(d3Node) {
            this.closeContextMenu();
            d3Node.data.toggleCollapse();
            update.updateSvg(this.d3Data);
        },


        edit(newData) {
            this.showEditDialog = false;

            const editCommand = new EditCommand(
                this.d3Data,
                this.editNode,
                newData
            );
            this.d3Data.commandManager.execute(editCommand);

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

        add(newNode) {
            this.showAddDialog = false;

            this.showAddDialog = false;

            const parent = this.d3Data.d3ParentOfAddNode.data;
            const addCommand = new AddCommand(
                this.d3Data,
                parent,
                parent.children ? parent.children.length : 0,
                newNode
            );
            this.d3Data.commandManager.execute(addCommand);

            update.updateSvg(this.d3Data);
            this.addType = "";
        },

        openAddAsChildDialog(d3Node) {
            this.d3Data.d3ParentOfAddNode = d3Node;
            this.showAddDialog = true;
        },

        openAddAsSiblingDialog(d3Node) {
            this.d3Data.d3ParentOfAddNode = d3Node.parent;
            this.showAddDialog = true;
        },

        openEditDialog(d3Node) {
            this.closeContextMenu();
            this.editNode = d3Node.data;
            this.showEditDialog = true;
        },

        undo() {
            this.d3Data.commandManager.undo();
            update.updateSvg(this.d3Data);
        },

        redo() {
            this.d3Data.commandManager.redo();
            update.updateSvg(this.d3Data);
        },

        highlightConstraints(d3Node) {
            d3Node.data.constraints.forEach((constraint) => constraint.highlight());
            update.updateSvg(this.d3Data);
            this.updateConstraints();
        },

        resetHighlightConstraints(d3Node) {
            d3Node.data.constraints.forEach((constraint) => constraint.resetHighlight());
            update.updateSvg(this.d3Data);
            this.updateConstraints();
        },

        updateConstraints() {
            this.$emit('update-constraints');
        },
    },

    computed: {
        allNodes() {
            if (this.d3Data.root) {
                return this.d3Data.root.data.descendants();
            } else {
                return [];
            }
        }
    },

    watch: {
        searchText() {
            this.onChangeSearch(this.searchText);
        }
    }
});
</script>

<style lang="scss">
.ghost-circle {
    fill: red;
    fill-opacity: 0.2;
    r: 15px;
}

@media only screen and (max-width: 400px) {
    .ghost-circle {
        r: 30px;
    }
}

.ghost-circle-highlighted {
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
        user-select: none;
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
