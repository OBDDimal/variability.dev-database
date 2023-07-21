<template>
    <div class="text-center">
        <v-dialog v-model="showDialog" persistent width="300">
            <v-card class="d-flex align-center justify-center">
                <v-form>
                    <v-card-text class="text-h5 text-center">{{ errorMessage }}</v-card-text>
                    <v-card-actions class="justify-center">
                        <v-btn color="primary" text @click="discard">
                            OK
                        </v-btn>
                    </v-card-actions>
                </v-form>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>

export default {
    name: "FeatureModelTreeErrorDialog",

    props: {
        show: Boolean,
        errorMessage: String,
    },

    computed: {
        showDialog: {
            get() {
                return this.show;
            },
        },
    },

    methods: {
        discard() {
            this.$emit('close')
        },
    }
}
</script>

<style scoped>

</style>
