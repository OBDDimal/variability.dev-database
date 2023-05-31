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
            @show-collaboration-dialog="
                showStartCollaborationSessionDialog = true
            "
            @show-claim-dialog="showClaimDialog"
            @new-empty-model="newEmptyModel"
            @show-tutorial="showTutorial = true"
        >
        </feature-model-tree>

        <v-btn
            id="feature-model-information"
            absolute
            bottom
            dark
            elevation="2"
            icon
            right
            :x-large="$vuetify.breakpoint.mdAndUp"
            style="background-color: var(--v-primary-base)"
            @click="openInformation = !openInformation"
            class="mr-15"
        >
            <v-icon>mdi-information</v-icon>
        </v-btn>

        <v-btn
            data-cy="feature-model-constraints-button"
            id="feature-model-constraints"
            absolute
            bottom
            dark
            elevation="2"
            icon
            right
            :x-large="$vuetify.breakpoint.mdAndUp"
            style="background-color: var(--v-primary-base)"
            @click="openConstraints = true"
        >
            <v-icon>mdi-format-list-checks</v-icon>
        </v-btn>

        <constraints
            v-if="data.constraints"
            ref="constraints"
            :is-open="openConstraints"
            @close="openConstraints = false"
            :command-manager="constraintCommandManager"
            :constraints="data.constraints"
            :editRights="editRights"
            :rootNode="data.rootNode"
            @update-feature-model="updateFeatureModel"
        ></constraints>

        <collaboration-toolbar
            v-if="collaborationStatus"
            :key="collaborationReloadKey"
            :collaboration-manager="collaborationManager"
            :show-claim-dialog="showClaimDialog"
        ></collaboration-toolbar>

        <v-dialog
            v-model="showStartCollaborationSessionDialog"
            persistent
            width="auto"
        >
            <v-card>
                <v-card-title
                    >Do you want to start a new collaboration
                    session?</v-card-title
                >
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="red"
                        text
                        @click="showStartCollaborationSessionDialog = false"
                    >
                        Cancel
                    </v-btn>

                    <v-btn data-cy="feature-model-start-collaboration-button" color="primary" text @click="createCollaboration">
                        Start
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <collaboration-name-dialog
            v-if="collaborationKey"
            @change-name="(name) => collaborationManager.sendName(name)"
        ></collaboration-name-dialog>

        <collaboration-continue-editing-dialog
            :show="showContinueEditingDialog"
            @close="closeFeatureModel"
            @continue-editing="continueEditing"
        >
        </collaboration-continue-editing-dialog>

        <feature-model-information
            v-if="openInformation"
        ></feature-model-information>

        <tutorial-mode
            :show="showTutorial"
            @close="showTutorial = false"
        ></tutorial-mode>
    </div>
</template>

<script>
import Vue from 'vue';
import FeatureModelTree from '../components/FeatureModel/FeatureModelTree.vue';
import Constraints from '../components/Constraints.vue';
import * as update from '@/services/FeatureModel/update.service';
import api from '@/services/api.service';
import beautify from 'xml-beautifier';
import CollaborationManager from '@/classes/CollaborationManager';
import { CommandManager } from '@/classes/Commands/CommandManager';
import * as xmlTranspiler from '@/services/xmlTranspiler.service';
import { jsonToXML } from '@/services/xmlTranspiler.service';
import CollaborationToolbar from '@/components/CollaborationToolbar';
import CollaborationNameDialog from '@/components/CollaborationNameDialog';
import CollaborationContinueEditingDialog from '@/components/CollaborationContinueEditingDialog';
import { EXAMPLE_FEATURE_MODEL_XML } from '@/classes/constants';
import TutorialMode from '@/components/TutorialMode';
import { NewEmptyModelCommand } from '@/classes/Commands/FeatureModel/NewEmptyModelCommand';
import FeatureModelInformation from '@/components/FeatureModel/FeatureModelInformation';

export default Vue.extend({
    name: 'FeatureModel',

    components: {
        TutorialMode,
        FeatureModelInformation,
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
        openConstraints: false,
        openInformation: false,
        showTutorial: false,
    }),

    created() {
        this.collaborationManager = new CollaborationManager(
            this.featureModelCommandManager,
            this.constraintCommandManager,
            this
        );
        this.featureModelCommandManager.commandEvent = this.commandEvent;
        this.constraintCommandManager.commandEvent = this.commandEvent;

        if (this.id === 'local') {
            const xml = beautify(localStorage.featureModelData);
            xmlTranspiler.xmlToJson(xml, this.data);
            this.xml = xml;
        } else if (this.id === 'new') {
            const xml = beautify(EXAMPLE_FEATURE_MODEL_XML);
            xmlTranspiler.xmlToJson(xml, this.data);
            this.xml = xml;
        } else if (this.id) {
            this.initData();
        } else if (this.collaborationKey) {
            const uuid = this.collaborationKey.substring(
                0,
                this.collaborationKey.length - 1
            );
            const checksum = this.collaborationKey.slice(-1);
            const condition =
                checksum ===
                (
                    Array.from(uuid).reduce(
                        (last, curr) => parseInt(last, 16) + parseInt(curr, 16)
                    ) % 16
                ).toString(16);
            if (condition) {
                this.collaborationManager.joinCollaboration(
                    this.collaborationKey
                );
            } else {
                alert('Wrong key!');
            }
        }

        // Start tutorial mode if it has not been completed before
        this.showTutorial = !localStorage.featureModelTutorialCompleted;
    },

    beforeRouteLeave(to, from, next) {
        // If session gets closed by host, don't ask for confirmation
        if (this.collaborationManager.noConfirm) {
            const answer = window.confirm(
                'Do you really want to leave the page? Collaboration sessions will be closed and data will be lost!'
            );

            if (answer) {
                // If user wants to close page
                this.collaborationManager.closeCollaboration();
                next();
            } else {
                // If user doesn't want to close page
                next(false);
            }
        } else {
            // Don't prevent default site changes without collaboration
            next();
        }
    },

    methods: {
        save() {
            localStorage.featureModelData = jsonToXML(this.data);
            window.onbeforeunload = null;

            this.$store.commit('updateSnackbar', {
                message: 'Successfully saved in local storage',
                variant: 'success',
                timeout: 5000,
                show: true,
            });
        },

        reset() {
            // TODO: Transpile the xml file new and restart viewer.
            this.initData();
            this.reloadKey++;
        },

        newEmptyModel() {
            const command = new NewEmptyModelCommand(
                this,
                this.$refs.featureModelTree.d3Data
            );
            this.featureModelCommandManager.execute(command);
            this.updateFeatureModel();
        },

        initData() {
            api.get(`${process.env.VUE_APP_DOMAIN}files/${this.id}/`).then(
                (data) => {
                    api.get(data.data.local_file).then((rawData) => {
                        const xml = beautify(rawData.data);
                        xmlTranspiler.xmlToJson(xml, this.data);
                        this.xml = xml;
                    });
                }
            );
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
                return 'Do you really want to leave the page? Collaboration sessions will be closed and data will be lost!';
            };
        },

        createCollaboration() {
            this.showStartCollaborationSessionDialog = false;
            this.collaborationManager.createCollaboration();
            navigator.clipboard.writeText(
                `${process.env.VUE_APP_DOMAIN_FRONTEND}collaboration/${this.collaborationManager.collaborationKey}`
            );
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
