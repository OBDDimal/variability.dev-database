<template>
    <div class='justify-center'
        :style="
            smAndDown
                ? 'position: absolute; top: 85px; left: 5rem; width: inherit; transform: translate(0%, -50%)'
                : 'position: absolute; top: 85px; width: inherit; left: 50%; transform: translate(-50%, -50%)'
        "
    >
        <v-row
            class="mt-2"
            :justify="smAndDown ? 'start' : 'center'"
            align="center"
        >
            <v-btn
                v-if="smAndDown || !fab"
                @click="fab = !fab"
                style="background-color: rgb(var(--v-theme-primary))"
                theme="dark"
                small
                class="mr-2 mt-2"
            >
                <v-icon v-if="fab"> mdi-close </v-icon>
                <v-icon v-else> mdi-account-multiple </v-icon>
            </v-btn>
            <v-slide-x-transition>
                <v-toolbar
                    dense
                    v-show="fab"
                    class="rounded-pill mt-2"
                    elevation="9"
                    height="auto"
                    style="border: 2px solid white; width: inherit"
                >
                    <div
                        :style="
                            smAndDown
                                ? 'max-width: 20vw'
                                : 'max-width: 45vw'
                        "
                    >
                        <v-chip-group :disabled="true" mandatory class="ml-2 flex-nowrap" :column="false">
                            <v-chip
                                :class="
                                    collaborationManager.isClient
                                        ? 'collaboration-pill-disabled'
                                        : ''
                                "
                                color="primary"
                                :disabled="collaborationManager.isClient"
                                theme="dark"
                                style="background-color: rgb(var(--v-theme-primary))"
                                @click="
                                    collaborationManager.sendMemberData(
                                        collaborationManager.peer._id
                                    )
                                "
                            >
                                Me ({{ collaborationManager.name }})
                                <v-icon
                                    right
                                    v-if="
                                        collaborationManager.featureModel
                                            .editRights
                                    "
                                    >mdi-lead-pencil</v-icon
                                >
                            </v-chip>
                            <v-chip
                                v-for="member in collaborationManager.members"
                                :key="member.id"
                                :class="
                                    collaborationManager.isClient
                                        ? 'collaboration-pill-disabled'
                                        : ''
                                "
                                :color="
                                    member.name === 'Host' ? 'success' : 'none'
                                "
                                theme="dark"
                                :style="collaborationManager.editorId ===
                                        member.id ? 'background-color: rgb(var(--v-theme-success))' : ''"
                                :disabled="collaborationManager.isClient"
                                @click="
                                    collaborationManager.sendMemberData(
                                        member.id
                                    )
                                "
                            >
                                {{ member.name }}
                                <v-icon
                                    right
                                    v-if="
                                        collaborationManager.editorId ===
                                        member.id
                                    "
                                    >mdi-lead-pencil</v-icon
                                >
                            </v-chip>
                        </v-chip-group>
                    </div>

                    <v-tooltip
                        v-if="
                            collaborationManager.isClient &&
                            !collaborationManager.featureModel.editRights &&
                            !collaborationManager.blockEditRequests
                        "
                        bottom
                    >
                        <template v-slot:activator="{ props }">
                            <v-btn
                                icon="mdi-account-edit"
                                v-bind="props"
                                :disabled="claimButtonClickDisabled"
                                @click="claimEditRights()"
                            >
                            </v-btn>
                        </template>
                        <span>Claim edit rights</span>
                    </v-tooltip>

                    <v-tooltip v-if="collaborationManager.isHost" bottom>
                        <template v-slot:activator="{ props }">
                            <v-btn
                                icon="mdi-account-cancel"
                                v-bind="props"
                                :color="
                                    collaborationManager.blockEditRequests
                                        ? 'primary'
                                        : ''
                                "
                                @click="blockEditRequests"
                            >
                            </v-btn>
                        </template>
                        <span>Block edit claims</span>
                    </v-tooltip>

                    <v-tooltip v-if="collaborationManager.isHost" bottom>
                        <template v-slot:activator="{ props }">
                            <v-btn
                                icon="mdi-qrcode"
                                v-bind="props"
                                @click="showQrCode = true"
                            >
                            </v-btn>
                        </template>
                        <span>Show qr code</span>
                    </v-tooltip>

                    <v-tooltip v-if="collaborationManager.isHost" bottom>
                        <template v-slot:activator="{ props }">
                            <v-btn
                                icon="mdi-content-copy"
                                v-bind="props"
                                @click="copyLink"
                            >
                            </v-btn>
                        </template>
                        <span>Copy invitation link</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                        <template v-slot:activator="{ props }">
                            <v-btn
                                color="red"
                                icon="mdi-close"
                                v-bind="props"
                                @click="showCloseDialog = true"
                            >
                            </v-btn>
                        </template>
                        <span v-if="collaborationManager.isHost"
                            >Close session</span
                        >
                        <span v-else>Leave session</span>
                    </v-tooltip>
                </v-toolbar>
            </v-slide-x-transition>
        </v-row>

        <!-- QRCode -->
        <v-dialog v-model="showQrCode" width="auto">
            <v-card>
                <v-card-title>Collaboration</v-card-title>
                <qrcode-vue
                    :value="link()"
                    class="text-center pa-6"
                    size="300"
                ></qrcode-vue>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text color="error" @click="showQrCode = false"
                        >Close</v-btn
                    >
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Close/Leave dialog -->
        <v-dialog v-model="showCloseDialog" width="auto">
            <v-card>
                <v-card-title class="text-h5" v-if="collaborationManager.isHost"
                    >Do you really want to close the collaboration session?
                </v-card-title>
                <v-card-title class="text-h5" v-else
                    >Do you really want to leave the collaboration
                    session?</v-card-title
                >
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="error" variant="text" @click="showCloseDialog = false"
                        >Cancel</v-btn
                    >
                    <v-btn
                        v-if="collaborationManager.isHost"
                        color="primary"
                        variant="text"
                        @click="collaborationManager.closeCollaboration()"
                        >Close
                    </v-btn>
                    <v-btn
                        v-else
                        color="primary"
                        variant="text"
                        @click="collaborationManager.closeCollaboration()"
                        >Leave</v-btn
                    >
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Claim dialog that is only visible for host -->
        <v-dialog v-model="showClaimDialogWindow" persistent width="auto">
            <v-card>
                <v-card-title
                    >"{{ collaborationManager.getClaimerName() }}" wants to
                    claim edit rights</v-card-title
                >
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="error"
                        variant="text"
                        @click="
                            collaborationManager.sendClaimEditRightsResponse(
                                false
                            )
                        "
                    >
                        Disagree
                    </v-btn>

                    <v-btn
                        color="primary"
                        variant="text"
                        @click="
                            collaborationManager.sendClaimEditRightsResponse(
                                true
                            )
                        "
                    >
                        Agree
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
  import { useDisplay } from 'vuetify'

  const { smAndDown, mdAndDown } = useDisplay()
</script>

<script>
import QrcodeVue from 'qrcode.vue';
import { useAppStore } from '@/store/app';

const appStore = useAppStore();

export default {
    name: 'CollaborationToolbar',

    components: {
        QrcodeVue,
    },

    props: {
        collaborationManager: undefined,
        showClaimDialog: false,
    },

    data: () => ({
        showQrCode: false,
        showCloseDialog: false,
        claimButtonClickDisabled: false,
        fab: true,
    }),

    computed: {
      showClaimDialogWindow: {
            get() {
                return this.showClaimDialog;
            },
        },
    },

    methods: {



        link() {
            return `${import.meta.env.VITE_APP_DOMAIN_FRONTEND}collaboration/${this.collaborationManager.collaborationKey}`;
        },

        copyLink() {
            navigator.clipboard.writeText(this.link());
            appStore.updateSnackbar(
                'Link copied',
                'success',
                5000,
                true,
            );
        },

        claimEditRights() {
            this.collaborationManager.sendClaimEditRightsRequest();
            this.claimButtonClickDisabled = true;
            setTimeout(() => (this.claimButtonClickDisabled = false), 5000);
        },

        blockEditRequests() {
            this.collaborationManager.blockEditRequests =
                !this.collaborationManager.blockEditRequests;
            this.collaborationManager.sendMemberData();
        },
    },
};
</script>

<style scoped>
.collaboration-pill-disabled {
    opacity: 1;
}
</style>
