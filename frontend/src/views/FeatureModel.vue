<template>
    <div>
        <feature-model-tree
            v-if="data.rootNode"
            :key="reloadKey"
            ref="featureModelTree"
            :command-manager="featureModelCommandManager"
            :constraints="data.constraints"
            :rootNode="data.rootNode"
            @exportToXML="exportToXML"
            @reset="reset"
            @save="save"
            @update-constraints="updateConstraints"
            @show-collaboration-dialog="showCollaborationDialog = true"
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
            v-if="data.constraints"
            ref="constraints"
            :command-manager="constraintCommandManager"
            :constraints="data.constraints"
            :rootNode="data.rootNode"
            @update-feature-model="updateFeatureModel"
        ></constraints>

        <collaboration-dialog
            @close="showCollaborationDialog = false"
            :show="showCollaborationDialog"
            :collaborationManager="collaborationManager">
        </collaboration-dialog>
    </div>
</template>

<script>
import Vue from 'vue';
import FeatureModelTree from '../components/FeatureModel/FeatureModelTree.vue';
import Constraints from '../components/Constraints.vue';
import * as update from "@/services/FeatureModel/update.service";
import api from "@/services/api.service";
import beautify from "xml-beautifier";
import CollaborationManager from "@/classes/CollaborationManager";
import {CommandManager} from "@/classes/Commands/CommandManager";
import * as xmlTranspiler from "@/services/xmlTranspiler.service";
import CollaborationDialog from "@/components/CollaborationDialog";

export default Vue.extend({
    name: 'FeatureModel',

    components: {
        FeatureModelTree,
        Constraints,
        CollaborationDialog,
    },

    props: {
        id: undefined,
        collaborationKey: undefined,
    },

    data: () => ({
        data: {
            featureMap: [],
            constraints: [],
            properties: [],
            calculations: undefined,
            comments: [],
            featureOrder: undefined,
            rootNode: undefined,
        },
        xml: undefined,
        reloadKey: 0,
        featureModelCommandManager: new CommandManager(),
        constraintCommandManager: new CommandManager(),
        collaborationManager: null,
        showCollaborationDialog: false,
    }),

    created() {
        this.collaborationManager = new CollaborationManager(this.featureModelCommandManager, this.constraintCommandManager, this);

        if (this.id) {
            this.initData();
        } else if (this.collaborationKey) {
            const uuid = this.collaborationKey.substring(0, this.collaborationKey.length - 1);
            const checksum = this.collaborationKey.slice(-1);
            const condition = checksum === (Array.from(uuid).reduce((last, curr) => parseInt(last, 16) + parseInt(curr, 16)) % 16).toString(16);
            if (condition) {
                this.joinCollaboration();
            } else {
                alert("Wrong key!");
            }
        }
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
                .then(data => {
                    api.get(data.data.local_file)
                        .then(rawData => {
                            const xml = beautify(rawData.data);
                            xmlTranspiler.xmlToJson(xml, this.data);
                            this.xml = xml;
                        });
                });
        },

        updateFeatureModel() {
            update.updateSvg(this.$refs.featureModelTree.d3Data);
        },

        updateConstraints() {
            this.$refs.constraints.update();
        },

        exportToXML() {
            xmlTranspiler.downloadXML(this.data);
        },

        createCollaboration() {
            const key = this.collaborationManager.createCollaboration();
            navigator.clipboard.writeText(`${process.env.VUE_APP_DOMAIN_FRONTEND}collaboration/${key}`);
        },

        joinCollaboration() {
            this.collaborationManager.joinCollaboration(this.collaborationKey);
        },

    },
});
</script>
