<template>
    <div >
        <v-row class="mt-2" justify="center">
            <v-toolbar
                absolute
                class="rounded-pill mt-3"
                elevation="9"
                height="auto"
                style="border: 2px solid white"
            >
                <v-chip-group active-class="primary" mandatory>
                    <v-chip>Me</v-chip>
                    <v-chip v-for="client in collaborationManager.connections"
                            :key="client.connectionId">
                        {{ client.name }}
                    </v-chip>
                </v-chip-group>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            icon
                            v-bind="attrs"
                            v-on="on"
                        >
                            <v-icon>mdi-access-point</v-icon>
                        </v-btn>
                    </template>
                    <span>Claim edit rights</span>
                </v-tooltip>

                <v-tooltip bottom v-if="collaborationManager.isHost">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            icon
                            v-bind="attrs"
                            v-on="on"
                            @click="showQrCode = true"
                        >
                            <v-icon>mdi-qrcode</v-icon>
                        </v-btn>
                    </template>
                    <span>Show qr code</span>
                </v-tooltip>

                <v-tooltip bottom v-if="collaborationManager.isHost">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            icon
                            v-bind="attrs"
                            v-on="on"
                            @click="copyLink"
                        >
                            <v-icon>mdi-content-copy</v-icon>
                        </v-btn>
                    </template>
                    <span>Copy invitation link</span>
                </v-tooltip>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            color="red"
                            icon
                            v-bind="attrs"
                            v-on="on"
                            @click="showCloseDialog = true"
                        >
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </template>
                    <span v-if="collaborationManager.isHost">Close session</span>
                    <span v-else>Leave session</span>
                </v-tooltip>
            </v-toolbar>
        </v-row>

        <!-- QRCode -->
        <v-dialog v-model="showQrCode" width="auto">
            <v-card>
                <v-card-title>Collaboration</v-card-title>
                <qrcode-vue class="text-center pa-6" :value="link()" size="300"></qrcode-vue>
                <v-card-actions>
                    <v-btn text @click="showQrCode = false">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Close/Leave dialog -->
        <v-dialog v-model="showCloseDialog" width="auto">
            <v-card>
                <v-card-title v-if="collaborationManager.isHost">Do you really want to close the collaboration session?</v-card-title>
                <v-card-title v-else>Do you really want to leave the collaboration session?</v-card-title>
                <v-card-actions>
                    <v-btn color="primary" text @click="showCloseDialog= false">Cancel</v-btn>
                    <v-btn color="red" v-if="collaborationManager.isHost" text @click="collaborationManager.closeCollaboration()">Close</v-btn>
                    <v-btn color="red" v-else text @click="collaborationManager.closeCollaboration()">Leave</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Claim dialog that only visible for host -->
        <v-dialog v-model="showClaimDialog" persistent width="500">
            <v-card>
                <v-card-title>Claim collaboration edit rights</v-card-title>
                <v-card-actions>
                    <v-btn
                        color="red darken-1"
                        text
                        @click="collaborationManager.sendClaimEditRightsResponse(false)"
                    >
                        Disagree
                    </v-btn>

                    <v-btn
                        color="primary darken-1"
                        text
                        @click="collaborationManager.sendClaimEditRightsResponse(true)"
                    >
                        Agree
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import Vue from 'vue';
import QrcodeVue from "qrcode.vue";

export default Vue.extend({
    name: 'CollaborationToolbar',

    components: {
        QrcodeVue,
    },

    props: {
        collaborationManager: undefined,
    },

    data: () => ({
        showClaimDialog: false,
        showQrCode: false,
        showCloseDialog: false,
    }),

    methods: {
        link() {
            return `${process.env.VUE_APP_DOMAIN_FRONTEND}collaboration/${this.collaborationManager.collaborationKey}`;
        },

        copyLink() {
            navigator.clipboard.writeText(this.link());
            this.$store.commit("updateSnackbar", {
                message: 'Link copied',
                variant: 'success',
                timeout: 5000,
                show: true,
            });
        },
    },

    created() {
    },
});
</script>