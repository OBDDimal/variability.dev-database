<template>
    <v-dialog v-model="show" persistent width="500">
        <v-card>
            <v-card-title class="text-h5 grey lighten-2">Choose your name</v-card-title>

            <v-card-text>
                <v-row>
                    <v-text-field
                        class="ma-4"
                        v-model="name"
                        :counter="15"
                        label="Name"
                        required
                    ></v-text-field>
                </v-row>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text class="ma-2" @click="setName">Choose name</v-btn>
                <v-btn text class="ma-2" @click="() => this.show = false">Stay Anonymous</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
    name: "collaboration-name-dialog",

    props: {},

    data: () => ({
        show: true,
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

    methods: {
        setName() {
            this.show = false;
            this.$emit('change-name', this.name);
        },
    },
});
</script>
