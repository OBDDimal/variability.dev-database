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
                <v-tabs
                    v-model="tab"
                    background-color="transparent"
                    color="primary"
                    centered
                >
                    <v-tab> Single Upload </v-tab>
                    <v-tab> Bulk Upload </v-tab>
                </v-tabs>

                <v-tabs-items v-model="tab" class="pt-4">
                    <v-tab-item>
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
                                <v-row align="end" justify="space-between">
                                    <v-col class="py-0" cols="12" md="6">
                                        <!-- Change back to v-combobox when new family upload is working properly -->
                                        <v-combobox
                                            v-model="family"
                                            :items="gottenFamilies"
                                            :required="true"
                                            dense
                                            hint="Add to or create new family"
                                            label="Family"
                                            outlined
                                        ></v-combobox>
                                        <v-text-field
                                            v-if="isNewFamily"
                                            v-model="newFamilyDescription"
                                            dense
                                            hint="Describe your new family"
                                            label="New Family Description"
                                            outlined
                                        ></v-text-field>
                                    </v-col>
                                    <v-col class="py-0" cols="12" md="6">
                                        <div
                                            class="mb-3"
                                            v-if="
                                                latestFeatureModelVersion ==
                                                    null && family !== null
                                            "
                                        >
                                            No feature models in this family yet
                                        </div>
                                        <div
                                            class="mb-3"
                                            v-else-if="
                                                latestFeatureModelVersion !==
                                                    null && family !== null
                                            "
                                        >
                                            Currently
                                            <span style="font-weight: bold">{{
                                                numberOfModelsInFamily
                                            }}</span>
                                            {{
                                                numberOfModelsInFamily === 1
                                                    ? 'Feature Model'
                                                    : 'Feature Models'
                                            }}
                                            in
                                            <span style="font-weight: bold">{{
                                                this.newFamilyIsObject
                                                    ? family.text
                                                    : family
                                            }}</span>
                                            family
                                            <br />
                                            Latest version:
                                            <span style="font-weight: bold">{{
                                                latestFeatureModelVersion
                                            }}</span>
                                        </div>
                                        <v-text-field
                                            v-model="version"
                                            :rules="versionRules"
                                            :required="true"
                                            dense
                                            hint="Version of feature model"
                                            label="Version"
                                            placeholder="1.0.0"
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
                                            @click:append-outer="
                                                editTagMenu = !editTagMenu
                                            "
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
                                            label="My email and a date will always be tied to the file upload (even after account deletion)"
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
                                            label="All information will be published according to your chosen license"
                                            outlined
                                            required
                                        >
                                        </v-checkbox>
                                    </v-col>
                                    <v-col class="pb-0" cols="12">
                                        <div class="d-flex align-center">
                                            <v-spacer></v-spacer>
                                            <span
                                                v-if="uploadStatus !== ''"
                                                class="text-subtitle-1"
                                                >{{ uploadStatus }}</span
                                            >
                                            <v-btn
                                                color="primary"
                                                text
                                                @click="close"
                                            >
                                                Cancel</v-btn
                                            >
                                            <v-btn
                                                :disabled="
                                                    !valid ||
                                                    !openSource ||
                                                    !userData ||
                                                    !legalShare
                                                "
                                                :loading="loading"
                                                color="primary"
                                                @click="uploadSingle"
                                            >
                                                Upload
                                            </v-btn>
                                        </div>
                                    </v-col>
                                </v-row>
                            </v-form>
                        </v-container>
                    </v-tab-item>
                    <v-tab-item>
                        <v-container>
                            <div class="mb-6">
                                <b>Name: </b> The name of the Feature Model is
                                derived from the individual file name. <br />
                                <b>Description: </b> The description of the
                                Feature Model will be a static notice with a
                                timestamp. <br />
                                <b>License: </b> The chosen license will be
                                applied to each individual Feature Model. <br />
                                <b>Version: </b> Versioning will start from
                                1.0.0 and from there on incrementing the major
                                number (2.0.0, 3.0.0, etc). <br />
                                <b>Tags: </b> The chosen tags will be applied to
                                each individual Feature Model. <br />
                            </div>
                            <v-form
                                ref="bulkform"
                                v-model="valid_bulk"
                                lazy-validation
                            >
                                <v-row>
                                    <v-col class="py-0" cols="12" md="6">
                                        <v-file-input
                                            v-model="file_bulk"
                                            :rules="fileRules"
                                            accept=".xml, .zip"
                                            multiple
                                            dense
                                            hint="Select the files as .xml"
                                            label="File Upload"
                                            outlined
                                            required
                                            show-size
                                        ></v-file-input>
                                    </v-col>
                                    <v-col class="py-0" cols="12" md="6">
                                        <v-select
                                            v-model="license_bulk"
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
                                    <v-col class="py-0" cols="12" md="6">
                                        <!-- Change back to v-combobox when new family upload is working properly -->
                                        <v-text-field
                                            v-model="family_bulk"
                                            :required="true"
                                            dense
                                            hint="Create new family"
                                            label="New Family"
                                            outlined
                                        ></v-text-field>
                                    </v-col>
                                    <v-col class="py-0" cols="12" md="6">
                                        <v-text-field
                                            v-model="newFamilyDescription_bulk"
                                            dense
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
                                            v-model="tags_bulk"
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
                                            @click:append-outer="
                                                editTagMenu = !editTagMenu
                                            "
                                        ></v-autocomplete>
                                    </v-col>
                                    <v-col class="pb-0" cols="12">
                                        <v-checkbox
                                            v-model="legalShare_bulk"
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
                                            v-model="userData_bulk"
                                            class="mt-0"
                                            hide-details
                                            label="My email and a date will always be tied to the file upload (even after account deletion)"
                                            outlined
                                            required
                                        >
                                        </v-checkbox>
                                    </v-col>
                                    <v-col class="py-0" cols="12">
                                        <v-checkbox
                                            v-model="openSource_bulk"
                                            class="mt-0"
                                            hide-details
                                            label="All information will be published according to your chosen license"
                                            outlined
                                            required
                                        >
                                        </v-checkbox>
                                    </v-col>
                                    <v-col class="pb-0" cols="12">
                                        <div class="d-flex align-center">
                                            <v-spacer></v-spacer>
                                            <span
                                                v-if="uploadStatus !== ''"
                                                class="text-subtitle-1"
                                                >{{ uploadStatus }}</span
                                            >
                                            <v-btn
                                                color="primary"
                                                text
                                                @click="close"
                                            >
                                                Cancel
                                            </v-btn>
                                            <v-btn
                                                :disabled="
                                                    !valid_bulk ||
                                                    !openSource_bulk ||
                                                    !userData_bulk ||
                                                    !legalShare_bulk
                                                "
                                                :loading="loading"
                                                color="primary"
                                                @click="uploadBulk()"
                                            >
                                                Upload
                                            </v-btn>
                                        </div>
                                    </v-col>
                                </v-row>
                            </v-form>
                        </v-container>
                    </v-tab-item>
                </v-tabs-items>
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
                    <v-btn
                        color="primary"
                        text
                        @click="editTagMenu = !editTagMenu"
                    >
                        Cancel
                    </v-btn>
                    <v-btn
                        :loading="loadingAddTag"
                        color="primary"
                        @click="uploadTag()"
                        >Upload Tag</v-btn
                    >
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import Vue from 'vue';
import api from '@/services/api.service';

const API_URL = process.env.VUE_APP_DOMAIN;

export default Vue.extend({
    name: 'FileCreate',

    components: {},

    props: {},

    data: () => ({
        valid: false,
        valid_bulk: false,

        label: '',
        labelRules: [(v) => !!v || 'Label is required'],

        description: '',
        descriptionRules: [
            (v) => !!v || 'Description is required',
            (v) => v.length <= 250 || 'Max 250 characters please',
        ],

        file: null,
        file_bulk: [],
        fileRules: [(v) => !!v || 'File is required'],

        gottenLicenses: [],
        license: '',
        license_bulk: '',
        licenseRules: [(v) => !!v || 'License is required'],

        gottenFamilies: [],
        gottenFiles: [],

        version: '',
        allVersions: [],
        versionRules: [(v) => !!v || 'Version is required'],

        family: null,
        family_bulk: null,
        newFamilyDescription: '',
        newFamilyDescription_bulk: '',
        isNewFamily: false,

        gottenTags: [],
        tags: [],
        tags_bulk: [],
        newTag: { label: '', description: '', is_public: false },

        legalShare: false,
        userData: false,
        openSource: false,

        legalShare_bulk: false,
        userData_bulk: false,
        openSource_bulk: false,

        loading: false,
        uploadStatus: '',

        editTagMenu: false,
        loadingAddTag: false,

        latestFeatureModelVersion: null,
        numberOfModelsInFamily: 0,
        newFamilyIsObject: false,

        tab: 0,

        /* gottenFiles: [],
        newVersionOf: "",
        featureFamily: "",
        tags: "",
        loading: false,
        newVersionOfSelection: false,
        featureModelFamilySelection: false, */
    }),

    watch: {
        '$store.state.licenses': function () {
            this.gottenLicenses = this.$store.state.licenses;
        },
        '$store.state.tags': function () {
            this.gottenTags = this.$store.state.tags;
        },
        '$store.state.families': function () {
            this.gottenFamilies = this.$store.state.families;
        },
        '$store.state.files': function () {
            this.gottenFiles = this.$store.state.files;
        },
        family: function (newValue) {
            console.log(newValue);
            this.newFamilyIsObject = false;
            if (typeof newValue == 'string') {
                this.isNewFamily = !this.gottenFamilies
                    .map((x) => x.text)
                    .includes(newValue);
            } else if (typeof newValue == 'object' && newValue != null) {
                this.isNewFamily = !this.gottenFamilies
                    .map((x) => x.text)
                    .includes(newValue.text);
                !this.isNewFamily
                    ? (this.newFamilyIsObject = true)
                    : (this.newFamilyIsObject = false);
            } else {
                this.isNewFamily = false;
            }

            if (this.isNewFamily) {
                this.latestFeatureModelVersion = null;
            } else {
                if (this.newFamilyIsObject) {
                    this.fetchFeatureModelOfFamily(newValue.value);
                } else {
                    this.fetchFeatureModelOfFamily(
                        this.gottenFamilies.find(
                            (family) => family.text === newValue
                        ).value
                    );
                }
            }
        },
        tags: function (newValue) {
            console.log(newValue);
        },
        allVersions: function (newValue) {
            this.versionRules = [
                (v) => !!v || 'Version is required',
                (v) => !newValue.includes(v) || 'Version already exists',
            ];
        },
    },

    computed: {
        getLicenses() {
            return this.gottenLicenses.map((element) => ({
                text: element.label,
                value: element.id,
            }));
        },
        getFamilies() {
            return this.gottenFamilies
                .filter((element) => element.owner)
                .map((element) => ({ text: element.label, value: element.id }));
        },
        getFiles() {
            return this.gottenFiles
                .filter((element) => element.owner)
                .map((element) => ({ text: element.label, value: element.id }));
        },
        getTags() {
            return this.gottenTags.map((element) => ({
                text: element.label,
                value: { label: element.label, id: element.id },
            }));
        },
    },

    methods: {
        close() {
            this.$emit('close');
        },
        transferToDropdown(objects) {
            return objects
                .filter((element) => element.owner)
                .map((element) => ({ text: element.label, value: element.id }));
        },
        async uploadBulk() {
            if (this.$refs.bulkform.validate() !== false) {
                this.loading = true;
                let versionMajor = 1;
                const data = new FormData();
                let file_data = [];
                let uploaded_family_id = -1;
                for (let i = 0; i < this.file_bulk.length; i++) {
                    let file_object = {};
                    file_object['label'] = this.file_bulk[i].name.slice(0, -4);
                    /*console.log('LABEL')
					console.log(this.file_bulk[i].name.slice(0, -4))*/
                    const event = new Date();
                    const options = {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                    };
                    file_object[
                        'description'
                    ] = `Added in bulk upload on ${event.toLocaleDateString(
                        'en-US',
                        options
                    )}`;
                    /*console.log('DESCRIPTION')
					console.log(
						`Added in bulk upload on ${event.toLocaleDateString(
							'en-US',
							options
						)}`
					)*/
                    //data.append('local_file', this.file_bulk[i])
                    file_object['license'] = this.license_bulk;
                    /*console.log('LICENSE')
					console.log(this.license_bulk)*/
                    file_object['version'] = `${versionMajor}.0.0`;
                    /*console.log('VERSION')
					console.log(`${versionMajor}.0.0`)*/
                    if (i !== 0) {
                        //change back to this.family.value when using v-combobox again
                        file_object['family'] = uploaded_family_id;
                        /*console.log('FAMILY (not new)')
						console.log(uploaded_family_id)*/
                    } else {
                        this.uploadStatus = 'Uploading new family...';
                        const uploadedFamily = await this.$store.dispatch(
                            'uploadFamily',
                            {
                                label: this.family_bulk,
                                description: this.newFamilyDescription_bulk,
                            }
                        );
                        uploaded_family_id = uploadedFamily.id;
                        file_object['family'] = uploaded_family_id;
                        /*console.log('FAMILY (new) id:')
						console.log(uploadedFamily.id)*/
                    }
                    file_object['tags'] = this.tags_bulk.map((x) => x.id);
                    /*console.log('TAGS')
					console.log(this.tags_bulk.map((x) => x.id))*/
                    file_object['file'] = `${i}`;
                    /*console.log('FILE (reference):')
					console.log(`${i}`)*/
                    versionMajor++;
                    file_data.push(file_object);
                }
                data.append('files', JSON.stringify(file_data));
                /*console.log('FILES (in total finished):')
				console.log(JSON.stringify(file_data))*/
                for (let i = 0; i < this.file_bulk.length; i++) {
                    data.append(`${i}`, this.file_bulk[i]);
                }
                /*console.log('DATA (in total finished):')
				console.log(data)*/
                this.uploadStatus =
                    'Uploading bulk files. This may take a while...';
                await this.$store.dispatch('uploadBulkFeatureModels', data);
                /*console.log('finished uploading files')*/
                this.uploadStatus = '';
                this.loading = false;
                this.close();
            }
        },
        async uploadSingle() {
            if (this.$refs.form.validate() !== false) {
                this.loading = true;
                const data = new FormData();

                data.append('label', this.label);
                /*console.log('LABEL')
				console.log(this.label)*/
                data.append('description', this.description);
                /*console.log('DESCRIPTION')
				console.log(this.description)*/
                data.append('local_file', this.file);
                data.append('license', this.license);
                /*console.log('LICENSE')
				console.log(this.license)*/
                data.append('version', this.version);
                /*console.log('VERSION')
				console.log(this.version)*/
                if (!this.isNewFamily) {
                    //change back to this.family.value when using v-combobox again
                    data.append('family', this.family.value);
                    /*console.log('FAMILY (not new)')
					console.log(this.family.value)*/
                } else {
                    this.uploadStatus = 'Uploading new family...';
                    const uploadedFamily = await this.$store.dispatch(
                        'uploadFamily',
                        {
                            label: this.family,
                            description: this.newFamilyDescription,
                        }
                    );
                    data.append('family', uploadedFamily.id);
                    /*console.log('FAMILY (new)')
					console.log(uploadedFamily.id)*/
                }
                data.append(
                    'tags',
                    JSON.stringify(this.tags.map((x) => parseInt(x.id)))
                );
                console.log('TAGS');
                console.log(
                    JSON.stringify(this.tags.map((x) => parseInt(x.id)))
                );
                this.uploadStatus = 'Uploading file...';
                await this.$store.dispatch('uploadFeatureModel', data);
                /*console.log('finished uploading file')*/
                this.uploadStatus = '';
                this.loading = false;
                this.close();
            }
        },
        async uploadTag() {
            this.loadingAddTag = true;
            const uploadedTag = await this.$store.dispatch(
                'uploadTag',
                this.newTag
            );
            await this.$store.dispatch('fetchTags');
            this.tags.push({ label: uploadedTag.label, id: uploadedTag.id });
            this.newTag = { label: '', description: '', is_public: false };
            this.editTagMenu = false;
            this.loadingAddTag = false;
        },
        async fetchFeatureModelOfFamily(value) {
            /*console.log(`${API_URL}files/uploaded/confirmed/?family=${value}`)*/
            await api
                .get(`${API_URL}files/uploaded/confirmed/?family=${value}`)
                .then((response) => {
                    if (response.data.length === 0) {
                        this.latestFeatureModelVersion = null;
                    } else {
                        this.numberOfModelsInFamily = response.data.length;
                        this.allVersions = response.data.map(
                            (item) => item.version
                        );
                        this.latestFeatureModelVersion =
                            response.data[response.data.length - 1].version;
                    }
                });
        },
        /*uploadFile() {

        },
        uploadFamily() {

        },
        uploadTags() {

        }*/
    },

    mounted() {
        this.$store.dispatch('fetchLicenses');
        if (this.$store.state.families !== []) {
            this.gottenFamilies = this.$store.state.families.map((x) => {
                return { text: x.label, value: x.id };
            });
        } else {
            this.$store.dispatch('fetchFamilies');
        }
        if (this.$store.state.files !== []) {
            this.gottenFiles = this.$store.state.files.map((x) => {
                return { text: x.label, value: x.id };
            });
        } else {
            this.$store.dispatch('fetchFiles');
        }
        this.$store.dispatch('fetchTags');
    },
});
</script>
