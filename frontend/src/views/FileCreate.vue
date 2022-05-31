<template>
    <div>
        <h3 class="text-h3 mb-2 mt-8">Upload new File</h3>
        <h5 class="text-h5 mb-4">
            Use this form to upload a new Feature Model publicly
        </h5>
        <v-row>
            <v-col cols="12" md="6">
                <v-text-field v-model="editedItem.label" label="Label"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
                <v-text-field v-model="editedItem.description" label="Description">
                </v-text-field>
            </v-col>
            <v-col cols="12" md="6">
                <v-file-input chips multiple label="File Upload" show-size></v-file-input>
            </v-col>
            <v-col cols="12" md="6">
                <v-autocomplete v-model="editedItem.license" :items="licenses" label="License"></v-autocomplete>
            </v-col>
            <v-col cols="12" md="6">
                <v-autocomplete :disabled="newFamily != ''" v-model="family" :items="existingFamilies"
                    label="New version of"></v-autocomplete>
            </v-col>
            <v-col cols="12" md="6">
                <v-text-field :disabled="family != null" v-model="newFamily" label="New family"></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-combobox v-model="editedItem.tags" :items="tags" label="Tags" multiple chips></v-combobox>
            </v-col>
            <v-col cols="12">
                <v-checkbox v-model="check1" label="Lorem Ipsum" hide-details></v-checkbox>
            </v-col>
            <v-col cols="12">
                <v-checkbox v-model="check2" label="Lorem Ipsum 2" hide-details>
                </v-checkbox>
            </v-col>
            <v-col cols="12">
                <v-checkbox v-model="check3" label="Lorem Ipsum 3" hide-details>
                </v-checkbox>
            </v-col>
            <v-col cols="12">
                <v-btn color="primary" :disabled="
                    !check1 ||
                    !check2 ||
                    !check3
                ">Upload</v-btn>
            </v-col>
        </v-row>
    </div>

</template>

<script lang="ts">
import Vue from "vue"
import { NewFile } from '../../types'

export default Vue.extend({
    name: 'FileCreate',

    components: {},

    props: {},

    data: () => ({
        label: "" as NewFile["label"],
        description: "" as NewFile["description"],
        file: undefined as NewFile["file"],
        gottenLicenses: [] as NewFile["gottenLicenses"],
        gottenTags: [] as NewFile["gottenTags"],
        gottenFiles: [] as NewFile["gottenFiles"],
        gottenFamilies: [] as NewFile["gottenFamilies"],
        newVersionOf: "" as NewFile["newVersionOf"],
        featureFamily: "" as NewFile["featureFamily"],
        license: "" as NewFile["license"],
        tags: "" as NewFile["tags"],
        loading: false as NewFile["loading"],
        legalShare: false as NewFile["legalShare"],
        userData: false as NewFile["userData"],
        openSource: false as NewFile["openSource"],
        newVersionOfSelection: false as NewFile["newVersionOfSelection"],
        featureModelFamilySelection: false as NewFile["featureModelFamilySelection"],
    }),

    computed: {
        
    },

    methods: {

    },
});
</script>

<style scoped>
</style>