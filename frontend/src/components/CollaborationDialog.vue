<template>
    <v-dialog v-model="showDialog" persistent width="500">
        <v-card>
            <v-card-title class="text-h5 grey lighten-2">Collaboration Menu</v-card-title>

            <qrcode-vue class="text-center pa-6" v-if="status" :value="link()" size="300"></qrcode-vue>

            <v-card-text>
                <v-row v-if="status">
                    <v-text-field disabled :value="collaborationManager.collaborationKey"></v-text-field>
                    <v-btn @click="copyCollaborationKey">
                        <v-icon>mdi-content-copy</v-icon>
                    </v-btn>
                </v-row>

                <v-row v-if="status">
                    <v-text-field disabled :value="link()"></v-text-field>
                    <v-btn @click="copyLink">
                        <v-icon>mdi-content-copy</v-icon>
                    </v-btn>
                </v-row>

                <v-btn class="primary" v-if="collaborationManager.isHost || collaborationManager.isClient" :disabled="collaborationManager.featureModel.editRights" @click="claimEditRights">Claim edit rights</v-btn>
                <v-btn class="green" v-if="!collaborationManager.isClient && !status" @click="create">Create collaboration</v-btn>
                <v-btn class="red" v-if="status" @click="close">Close collaboration</v-btn>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text @click="$emit('close')">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import Vue from "vue";
import QrcodeVue from "qrcode.vue";

export default Vue.extend({
    name: "Constraints",

    components: {
        QrcodeVue,
    },

    props: {
        show: Boolean,
        collaborationManager: undefined,
    },

    data: () => ({
        status: false,
    }),

    computed: {
        showDialog: {
            get() {
                return this.show;
            },
        },
    },

    methods: {
        link() {
            return `${process.env.VUE_APP_DOMAIN_FRONTEND}collaboration/${this.collaborationManager.collaborationKey}`;
        },

        copyCollaborationKey() {
            navigator.clipboard.writeText(this.collaborationManager.collaborationKey);
            this.$store.commit("updateSnackbar", {
                message: 'Collaboration-Key copied',
                variant: 'success',
                timeout: 5000,
                show: true,
            });
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

        create() {
            this.collaborationManager.createCollaboration();
            this.status = true;
        },

        close() {
            this.collaborationManager.closeCollaboration();
            this.status = false;
        },

        claimEditRights() {
            this.collaborationManager.sendClaimEditRightsRequest();
        },
    },
});
</script>
