<template>
    <div>
        <v-card>
            <v-card-title>
                <span class="text-h5">Upload Feature Model</span>
            </v-card-title>
            <v-card-subtitle>
                Use this form to upload a new Feature Model publicly
            </v-card-subtitle>

            <v-card-text>
                <v-container>
                    <v-form ref="form" v-model="valid" lazy-validation>
                        <v-row>
                            <v-col class="py-0" cols="12">
                                <v-text-field
                                    v-model="label"
                                    :rules="labelRules"
                                    dense
                                    hint="Name your feature model"
                                    label="File name"
                                    outlined
                                    placeholder="Leave a filename"
                                    required
                                ></v-text-field>
                            </v-col>
                            <v-col class="py-0" cols="12">
                                <v-textarea
                                    v-model="description"
                                    :rules="descriptionRules"
                                    counter="250"
                                    dense
                                    hint="Add a description to your feature model"
                                    label="Description"
                                    outlined
                                    placeholder="Leave a comment here"
                                    rows="2"
                                >
                                </v-textarea>
                            </v-col>
                            <v-col class="py-0" cols="12" md="6">
                                <v-file-input
                                    v-model="file"
                                    :rules="fileRules"
                                    accept=".xml"
                                    chips
                                    dense
                                    hint="Select the file as .xml"
                                    label="File Upload"
                                    outlined
                                    required
                                    show-size
                                    small-chips
                                ></v-file-input>
                            </v-col>
                            <v-col class="py-0" cols="12" md="6">
                                <v-select
                                    v-model="license"
                                    :items="getLicenses"
                                    :rules="licenseRules"
                                    dense
                                    hint="Select the license of the feature model"
                                    label="License"
                                    outlined
                                    required
                                >
                                </v-select>
                            </v-col>
                        </v-row>
                        <v-row align="center" justify="space-between">
                            <v-col class="py-0 mb-7" cols="12" md="5">
                                <v-autocomplete
                                    v-model="newVersionOf"
                                    :disabled="family != null"
                                    :items="gottenFiles"
                                    :required="family == null"
                                    dense
                                    hide-details
                                    hint="If your feature model is a new version of an existing one"
                                    label="New version of"
                                    outlined
                                ></v-autocomplete>
                            </v-col>
                            <v-col class="py-0 mb-7 text-center" cols="12" md="auto">
                                OR
                            </v-col>
                            <v-col class="py-0" cols="12" md="5">
                                <!-- Change back to v-combobox when new family upload is working properly -->
                                <v-combobox
                                    v-model="family"
                                    :disabled="newVersionOf != null"
                                    :items="gottenFamilies"
                                    :required="newVersionOf == null"
                                    class="mb-7"
                                    dense
                                    hide-details
                                    hint="Add to or create new family"
                                    label="Family"
                                    outlined
                                ></v-combobox>
                                <v-text-field
                                    v-if="isNewFamily"
                                    v-model="newFamilyDescription"
                                    class="mb-7"
                                    dense
                                    hide-details
                                    hint="Describe your new family"
                                    label="New Family Description"
                                    outlined
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col class="py-0" cols="12">
                                <!-- Change back to v-combobox once sequential axios requests are implemented -->
                                <v-autocomplete
                                    v-model="tags"
                                    :items="getTags"
                                    append-outer-icon="mdi-plus"
                                    chips
                                    dense
                                    hide-details
                                    hint="Choose or create tags for your feature model"
                                    label="Tags"
                                    multiple
                                    outlined
                                    small-chips
                                    @click:append-outer="editTagMenu = !editTagMenu"
                                ></v-autocomplete>
                            </v-col>
                            <v-col class="pb-0" cols="12">
                                <v-checkbox
                                    v-model="legalShare"
                                    class="mt-0"
                                    hide-details
                                    label="I am legally allowed to share this model"
                                    outlined
                                    required
                                >
                                </v-checkbox>
                            </v-col>
                            <v-col class="py-0" cols="12">
                                <v-checkbox
                                    v-model="userData"
                                    class="mt-0"
                                    hide-details
                                    label="My email and a date will always be tied to the file
                 upload (even after account deletion)"
                                    outlined
                                    required
                                >
                                </v-checkbox>
                            </v-col>
                            <v-col class="py-0" cols="12">
                                <v-checkbox
                                    v-model="openSource"
                                    class="mt-0"
                                    hide-details
                                    label="All information will be published according to your
                 chosen license"
                                    outlined
                                    required
                                >
                                </v-checkbox>
                            </v-col>
                            <v-col class="pb-0" cols="12">
                                <div class="d-flex align-center">
                                    <v-spacer></v-spacer>
                                    <span v-if="uploadStatus != ''" class="text-subtitle-1">{{ uploadStatus }}</span>
                                    <v-btn color="primary" text @click="close"> Cancel</v-btn>
                                    <v-btn
                                        :disabled="!valid || !openSource || !userData || !legalShare"
                                        :loading="loading"
                                        color="primary"
                                        @click="upload"
                                    >
                                        Upload
                                    </v-btn>
                                </div>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-container>
            </v-card-text>
        </v-card>
        <v-dialog v-model="editTagMenu" max-width="350">
            <v-card>
                <v-card-title>Add new Tag</v-card-title>
                <v-card-text>
                    <v-row no-gutters>
                        <v-col cols="12">
                            <v-text-field
                                v-model="newTag.label"
                                hide-details
                                label="Label"
                            >
                            </v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field
                                v-model="newTag.description"
                                hide-details
                                label="Description"
                            >
                            </v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-checkbox
                                v-model="newTag.is_public"
                                hide-details
                                label="Public"
                            ></v-checkbox>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions class="pa-4">
                    <v-spacer></v-spacer>
                    <v-btn color="primary" text @click="editTagMenu = !editTagMenu">
                        Cancel
                    </v-btn>
                    <v-btn :loading="loadingAddTag" color="primary" @click="uploadTag()">Upload Tag</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
    name: "FileCreate",

    components: {},

    props: {},

    data: () => ({
        valid: false,

        label: "",
        labelRules: [(v) => !!v || "Label is required"],

        description: "",
        descriptionRules: [(v) => !!v || "Description is required", (v) => v.length <= 250 || "Max 250 characters please"],

        file: null,
        fileRules: [(v) => !!v || "File is required"],

        gottenLicenses: [],
        license: "",
        licenseRules: [(v) => !!v || "License is required"],

        gottenFamilies: [],
        gottenFiles: [],
        newVersionOf: null,

        family: null,
        newFamilyDescription: "",
        isNewFamily: false,

        gottenTags: [],
        tags: [],
        newTag: {label: "", description: "", is_public: false},

        legalShare: false,
        userData: false,
        openSource: false,

        loading: false,
        uploadStatus: '',

        editTagMenu: false,
        loadingAddTag: false,

        /* gottenFiles: [],
        newVersionOf: "",
        featureFamily: "",
        tags: "",
        loading: false,
        newVersionOfSelection: false,
        featureModelFamilySelection: false, */
    }),

    watch: {
        "$store.state.licenses": function () {
            this.gottenLicenses = this.$store.state.licenses;
        },
        "$store.state.tags": function () {
            this.gottenTags = this.$store.state.tags;
        },
        "$store.state.families": function () {
            this.gottenFamilies = this.$store.state.families;
        },
        "$store.state.files": function () {
            this.gottenFiles = this.$store.state.files;
        },
        family: function (newValue) {
            console.log(newValue)
            if (typeof (newValue) == "string") {
                this.isNewFamily = !this.gottenFamilies.map(x => x.text).includes(newValue)
            } else if (typeof (newValue) == "object" && newValue != null) {
                this.isNewFamily = !this.gottenFamilies.map(x => x.text).includes(newValue.text)
            } else {
                this.isNewFamily = false
            }
        },
        tags: function (newValue) {
            console.log(newValue)
        }
    },

    computed: {
        getLicenses() {
            return this.gottenLicenses
                .map((element) => ({text: element.label, value: element.id}));
        },
        getFamilies() {
            return this.gottenFamilies
                .filter((element) => element.owner)
                .map((element) => ({text: element.label, value: element.id}));
        },
        getFiles() {
            return this.gottenFiles
                .filter((element) => element.owner)
                .map((element) => ({text: element.label, value: element.id}));
        },
        getTags() {
            return this.gottenTags
                .map((element) => ({text: element.label, value: {label: element.label, id: element.id}}));
        },
    },

    methods: {
        close() {
            this.$emit("close");
        },
        transferToDropdown(objects) {
            return objects
                .filter((element) => element.owner)
                .map((element) => ({text: element.label, value: element.id}));
        },
        async upload() {
            if (this.$refs.form.validate() !== false) {
                this.loading = true;
                const data = new FormData();

                data.append("label", this.label);
                data.append("description", this.description);
                data.append("local_file", this.file);
                data.append("license", this.license);
                if (this.newVersionOf !== null && this.newVersionOf) {
                    data.append("new_version_of", this.newVersionOf);
                }
                if (this.family !== "" && this.family) {
                    if (!this.isNewFamily) {
                        //change back to this.family.value when using v-combobox again
                        data.append("family", this.family.value);
                    } else {
                        this.uploadStatus = 'Uploading new family...'
                        const uploadedFamily = await this.$store.dispatch("uploadFamily", {
                            label: this.family,
                            description: this.newFamilyDescription
                        })
                        data.append("family", uploadedFamily.id);
                    }
                }
                data.append("tags", JSON.stringify(this.tags));
                this.uploadStatus = 'Uploading file...'
                await this.$store.dispatch("uploadFeatureModel", data)
                this.uploadStatus = ''
                this.loading = false
                this.close()
            }
        },
        async uploadTag() {
            this.loadingAddTag = true
            const uploadedTag = await this.$store.dispatch("uploadTag", this.newTag)
            await this.$store.dispatch("fetchTags");
            this.tags.push({label: uploadedTag.label, id: uploadedTag.id})
            this.newTag = {label: "", description: "", is_public: false}
            this.editTagMenu = false
            this.loadingAddTag = false
        }
        /*uploadFile() {

        },
        uploadFamily() {

        },
        uploadTags() {

        }*/
    },

    mounted() {
        this.$store.dispatch("fetchLicenses");
        if (this.$store.state.families !== []) {
            this.gottenFamilies = this.$store.state.families.map(x => {
                return {text: x.label, value: x.id}
            })
        } else {
            this.$store.dispatch("fetchFamilies");
        }
        if (this.$store.state.files !== []) {
            this.gottenFiles = this.$store.state.files.map(x => {
                return {text: x.label, value: x.id}
            })
        } else {
            this.$store.dispatch("fetchFiles");
        }
        this.$store.dispatch("fetchTags");
    },
});
</script>
