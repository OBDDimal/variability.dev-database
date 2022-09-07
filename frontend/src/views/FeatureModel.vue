<template>
    <div>
        <feature-model-tree
            v-if="data.rootNode"
            :key="reloadKey"
            ref="featureModelTree"
            :collaborationStatus="collaborationStatus"
            :command-manager="featureModelCommandManager"
            :constraints="data.constraints"
            :editRights="editRights"
            :rootNode="data.rootNode"
            @exportToXML="exportToXML"
            @reset="reset"
            @save="save"
            @update-constraints="updateConstraints"
            @show-collaboration-dialog="showStartCollaborationSessionDialog = true"
            @show-claim-dialog="showClaimDialog"
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
            :editRights="editRights"
            :rootNode="data.rootNode"
            @update-feature-model="updateFeatureModel"
        ></constraints>

        <collaboration-toolbar v-if="collaborationStatus" :key="collaborationReloadKey"
                               :collaboration-manager="collaborationManager"
                               :show-claim-dialog="showClaimDialog"></collaboration-toolbar>

        <v-dialog v-model="showStartCollaborationSessionDialog" persistent width="auto">
            <v-card>
                <v-card-title>Do you want to start a new collaboration session?</v-card-title>
                <v-card-actions>
                    <v-btn
                        color="red darken-1"
                        text
                        @click="showStartCollaborationSessionDialog = false"
                    >
                        Cancel
                    </v-btn>

                    <v-btn
                        color="primary darken-1"
                        text
                        @click="createCollaboration"
                    >
                        Start
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <collaboration-name-dialog v-if="collaborationKey"
                                   @change-name="name => collaborationManager.sendName(name)"></collaboration-name-dialog>

        <collaboration-continue-editing-dialog
            :show="showContinueEditingDialog"
            @close="closeFeatureModel"
            @continue-editing="continueEditing">
        </collaboration-continue-editing-dialog>
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
import {jsonToXML} from "@/services/xmlTranspiler.service";
import CollaborationToolbar from "@/components/CollaborationToolbar";
import CollaborationNameDialog from "@/components/CollaborationNameDialog";
import {FeatureNode} from "@/classes/FeatureNode";
import CollaborationContinueEditingDialog from "@/components/CollaborationContinueEditingDialog";

export default Vue.extend({
    name: 'FeatureModel',

    components: {
        CollaborationContinueEditingDialog,
        CollaborationToolbar,
        FeatureModelTree,
        Constraints,
        CollaborationNameDialog,
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
        collaborationReloadKey: 10000,
        featureModelCommandManager: new CommandManager(),
        constraintCommandManager: new CommandManager(),
        collaborationManager: null,
        editRights: true,
        showStartCollaborationSessionDialog: false,
        showClaimDialog: false,
        showContinueEditingDialog: false,
        collaborationStatus: false,

    }),

    created() {
        this.collaborationManager = new CollaborationManager(this.featureModelCommandManager, this.constraintCommandManager, this);
        this.featureModelCommandManager.commandEvent = this.commandEvent;
        this.constraintCommandManager.commandEvent = this.commandEvent;

        if (this.id === 'local') {
            const xml = beautify(localStorage.featureModelData);
            xmlTranspiler.xmlToJson(xml, this.data);
            this.xml = xml;
        } else if (this.id === 'new') {
            this.data.rootNode = new FeatureNode(null, 'Root', 'and', false, false);
            this.xml = jsonToXML(this.data);
        } else if (this.id) {
            this.initData();
        } else if (this.collaborationKey) {
            const uuid = this.collaborationKey.substring(0, this.collaborationKey.length - 1);
            const checksum = this.collaborationKey.slice(-1);
            const condition = checksum === (Array.from(uuid).reduce((last, curr) => parseInt(last, 16) + parseInt(curr, 16)) % 16).toString(16);
            if (condition) {
                this.collaborationManager.joinCollaboration(this.collaborationKey);
            } else {
                alert("Wrong key!");
            }
        }
    },


    beforeRouteLeave(to, from, next) {
        // If session gets closed by host, don't ask for confirmation
        if (this.collaborationManager.noConfirm) {
            const answer = window.confirm('Do you really want to leave the page? Collaboration sessions will be closed and data will be lost!')

            if (answer) {
                // If user wants to close page
                if (this.collaborationManager.isHost) {
                    this.collaborationManager.closeCollaboration();
                } else {
                    this.collaborationManager.leaveCollaboration();
                }
                next()
            } else {
                // If user doesn't want to close page
                next(false)
            }
        } else {
            // Don't prevent default site changes without collaboration
            next();
        }
    },

    methods: {
        save() {
            // TODO: Axios post request to update the xml file in the backend ???
            const xml = jsonToXML(this.data);
            localStorage.featureModelData = xml;
            window.onbeforeunload = null;
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

        commandEvent() {
            // Can't override text for Chrome & Edge
            window.onbeforeunload = function () {
                return "Do you really want to leave the page? Collaboration sessions will be closed and data will be lost!";
            };
        },

        createCollaboration() {
            this.showStartCollaborationSessionDialog = false;
            this.collaborationManager.createCollaboration();
            navigator.clipboard.writeText(`${process.env.VUE_APP_DOMAIN_FRONTEND}collaboration/${this.collaborationManager.collaborationKey}`);
        },

        continueEditing() {
            this.showContinueEditingDialog = false;
            this.collaborationManager.closeCollaboration();
            this.editRights = true;
        },

        closeFeatureModel() {
            this.showContinueEditingDialog = false;
            this.collaborationManager.closeCollaboration();
            this.collaborationManager.noConfirm = false;
            this.$router.push('/');
        },
    },
});
</script>
