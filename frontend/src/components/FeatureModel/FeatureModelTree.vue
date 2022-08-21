<template>
    <div>
        <div class="float-right mt-2 mr-3" style="position: absolute; right: 0;">
            <v-toolbar
                class="rounded-pill"
                elevation="9"
                height="auto"
                style="border: 2px solid white"
            >
                <v-btn
                    :disabled="search.foundNodeIndex === 0"
                    icon
                    @click="onChangeFoundNodeIndex(--search.foundNodeIndex)">
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>

                <v-btn
                    :disabled="search.foundNodeDistances.length <= search.foundNodeIndex + 1"
                    icon
                    @click="onChangeFoundNodeIndex(++search.foundNodeIndex)">
                    <v-icon>mdi-chevron-right</v-icon>
                </v-btn>

                <v-text-field
                    v-if="search.showSearch"
                    v-model="search.searchText"
                    class="px-4"
                    clearable
                    hide-details
                    placeholder="Search"
                    single-line
                    @input="onChangeSearchText"
                ></v-text-field>

                <v-badge
                    v-if="search.foundNodeDistances.length"
                    :content="search.foundNodeIndex + 1 + '/' + search.foundNodeDistances.length"
                    inline
                ></v-badge>

                <v-btn icon @click="search.showSearch = !search.showSearch">
                    <v-icon>mdi-magnify</v-icon>
                </v-btn>

            </v-toolbar>
        </div>

        <feature-model-tree-toolbar
            :direction="d3Data.direction"
            :is-redo-available="commandManager && commandManager.isRedoAvailable()"
            :is-undo-available="commandManager && commandManager.isUndoAvailable()"
            @show-collaboration-dialog="$emit('show-collaboration-dialog')"
            @coloring="coloringIndex => coloring(coloringIndex)"
            @export="$emit('exportToXML')"
            @fitToView="fitToView"
            @redo="redo"
            @reset="$emit('reset')"
            @resetView="(levels, maxChildren) => resetView(levels, maxChildren)"
            @save="$emit('save')"
            @semanticEditing="value => d3Data.semanticEditing = value"
            @shortName="changeShortName"
            @spaceBetweenParentChild="changeSpaceBetweenParentChild"
            @spaceBetweenSiblings="changeSpaceBetweenSiblings"
            @toggleDirection="toggleDirection"
            @undo="undo"
        ></feature-model-tree-toolbar>
        <div id="svg-container"></div>

        <feature-model-tree-context-menu
            :d3Node="d3Data.contextMenu.selectedD3Node"
            :d3NodeEvent="d3Data.contextMenu.event"
            @addAsChild="d3Node => openAddAsChildDialog(d3Node)"
            @addAsSibling="d3Node => openAddAsSiblingDialog(d3Node)"
            @close="d3Data.contextMenu.selectedD3Node = undefined"
            @collapse="collapse"
            @edit="d3Node => openEditDialog(d3Node)"
            @hideAllNodesOnThisLevel="d3Node => hideAllNodesOnThisLevel(d3Node)"
            @hideAllOtherNodes="d3Node => hideAllOtherNodes(d3Node)"
            @hideCurrentNode="d3Node => hideCurrentNode(d3Node)"
            @hideLeftSiblings="d3Node => hideLeftSiblings(d3Node)"
            @hideRightSiblings="d3Node => hideRightSiblings(d3Node)"
            @highlightConstraints="d3Node => highlightConstraints(d3Node)"
            @resetHighlightConstraints="d3Node => resetHighlightConstraints(d3Node)"
        ></feature-model-tree-context-menu>

        <feature-model-tree-edit-dialog
            :node="editNode"
            :show="showEditDialog"
            @close="showEditDialog = false"
            @edit="data => edit(data)">
        </feature-model-tree-edit-dialog>

        <feature-model-tree-add-dialog
            :parent="d3Data.d3ParentOfAddNode ? d3Data.d3ParentOfAddNode.data : undefined"
            :show="showAddDialog"
            @add="data => add(data)"
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
import {AddCommand} from "@/classes/Commands/FeatureModel/AddCommand";
import {EditCommand} from "@/classes/Commands/FeatureModel/EditCommand";
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
        commandManager: CommandManager,
        remoteCommands: undefined,
        rootNode: undefined,
        constraints: undefined,
    },

    data: () => ({
        d3Data: {
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
                mode: 'mouse', // touch or mouse
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
            spaceBetweenParentChild: 75,
            spaceBetweenSiblings: 20,
            d3ParentOfAddNode: undefined,
            coloringIndex: -1,
            semanticEditing: false,
            direction: 'v', // h = horizontally, v = vertically
            maxHorizontallyLevelWidth: [],
        },
        showAddDialog: false,
        showEditDialog: false,
        editNode: undefined,
        search: {
            showSearch: false,
            searchText: undefined,
            selectedNode: undefined,
            foundNodeIndex: 0,
            foundNodeDistances: [],
        },
    }),

    mounted() {
        init.initialize(this.d3Data, this.rootNode);
        dragAndDrop.init(this.d3Data, this.commandManager);
        view.reset(this.d3Data);

        this.commandManager.d3Data = this.d3Data;
        this.commandManager.executeRemoteCommands(this.rootNode, this.constraints);
        update.updateSvg(this.d3Data);
    },

    methods: {
        resetView(levels, maxChildren) {
            view.reset(this.d3Data, levels, maxChildren);
        },

        coloring(coloringIndex) {
            this.d3Data.coloringIndex = coloringIndex;
            update.updateSvg(this.d3Data);
        },

        onChangeFoundNodeIndex(index) {
            if (index < this.search.foundNodeDistances.length) {
                this.search.selectedNode = this.search.foundNodeDistances[index].node;
                search.markNodeAsSearched(this.d3Data, this.search.selectedNode);
            }
        },

        onChangeSearchText(searchText) {
            this.search.foundNodeDistances = search.search(this.d3Data, searchText);
            search.resetSearch(this.d3Data);
            if (this.search.foundNodeDistances.length) {
                this.onChangeFoundNodeIndex(0);
            } else {
                update.updateSvg(this.d3Data);
            }
        },

        updateSvg() {
            update.updateSvg(this.d3Data);
        },

        fitToView() {
            view.zoomFit(this.d3Data);
        },

        toggleDirection() {
            this.d3Data.direction = this.d3Data.direction === 'v' ? 'h' : 'v';
            update.updateSvg(this.d3Data);
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
            this.d3Data.contextMenu.selectedD3Node = null;
        },

        collapse(d3Node) {
            this.closeContextMenu();
            d3Node.data.toggleCollapse();
            update.updateSvg(this.d3Data);
        },


        edit(newData) {
            this.showEditDialog = false;

            const editCommand = new EditCommand(
                this.editNode,
                newData,
            );
            this.commandManager.execute(editCommand);

            update.updateSvg(this.d3Data);
        },

        changeShortName(isShortName) {
            this.d3Data.isShortenedName = isShortName;
            update.updateSvg(this.d3Data);
        },

        changeSpaceBetweenParentChild(spacing) {
            this.d3Data.spaceBetweenParentChild = spacing;
            update.updateSvg(this.d3Data);
        },

        changeSpaceBetweenSiblings(spacing) {
            this.d3Data.spaceBetweenSiblings = spacing;
            update.updateSvg(this.d3Data);
        },

        add(newNode) {
            this.showAddDialog = false;

            this.showAddDialog = false;

            const parent = this.d3Data.d3ParentOfAddNode.data;
            const addCommand = new AddCommand(
                parent,
                parent.children ? parent.children.length : 0,
                newNode,
            );
            this.commandManager.execute(addCommand);

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
            this.commandManager.undo();
            update.updateSvg(this.d3Data);
        },

        redo() {
            this.commandManager.redo();
            update.updateSvg(this.d3Data);
        },

        highlightConstraints(d3Node) {
            d3Node.data.constraints.forEach(constraint => constraint.highlight());
            update.updateSvg(this.d3Data);
            this.updateConstraints();
        },

        resetHighlightConstraints(d3Node) {
            d3Node.data.constraints.forEach(constraint => constraint.resetHighlight());
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
        },
    },
});
</script>

<style lang="scss">
.ghost-circle {
    fill: red;
    fill-opacity: 0.2;
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
