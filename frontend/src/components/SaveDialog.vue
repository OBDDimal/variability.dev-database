<template>
    <v-dialog v-model="show" persistent width="auto">
        <v-card>
            <v-card-title class="text-h5 grey lighten-2">Do you really want to overwrite the current feature model in local storage?</v-card-title>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn class="ma-2" text @click="$emit('close')">Close</v-btn>
                <v-btn class="ma-2" text @click="$emit('save')">Save</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
    name: "SaveDialog",

    props: {
        show: Boolean,
    },

    data: () => ({}),

    computed: {
        showDialog: {
            get() {
                return this.show;
            },
        },
    },
});
</script>
