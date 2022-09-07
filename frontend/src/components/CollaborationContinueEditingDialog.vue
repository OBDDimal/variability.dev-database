<template>
    <v-dialog v-model="showDialog" persistent width="auto">
        <v-card>
            <v-card-title>Do you want to stay and continue editing or close?</v-card-title>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text class="ma-2" @click="$emit('close')">Close</v-btn>
                <v-btn text class="ma-2" @click="$emit('continue-editing')">Continue editing</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
    name: "collaboration-continue-editing-dialog",

    props: {
        show: Boolean,
    },

    data: () => ({
        name: undefined,
        nameRules: [
            v => !!v || 'Name is required',
            v => v.length <= 15 || 'Name must be less than 10 characters',
        ],
    }),

    computed: {
        showDialog: {
            get() {
                return this.show;
            },
        },
    },
});
</script>
