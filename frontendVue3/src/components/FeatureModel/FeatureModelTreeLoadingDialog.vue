<template>
    <div class="text-center">
        <v-dialog v-model="showDialog" persistent width="300">
            <v-card class="d-flex align-center justify-center">
                <v-form>
                    <v-card-text class="text-h5 text-center">Loading...</v-card-text>
                    <v-card-text class="text-center"><v-icon medium>mdi-reload</v-icon></v-card-text>
                </v-form>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>

export default {
    name: "FeatureModelTreeLoadingDialog",

    props: {
        show: Boolean,
    },

    computed: {
        showDialog: {
            get() {
                return this.show
            },
        },
    },
}
</script>

<style scoped>

</style>
