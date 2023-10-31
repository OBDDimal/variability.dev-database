<template>
    <v-card variant="outlined">

        <v-divider class="border-opacity-100"></v-divider>
        <!--  Data Table for MetaData: -->
        <v-data-table :headers="factHeaders" :items="metadata" item-value="name">
            <template v-slot:headers>
            </template>
            <template v-slot:top>
                <v-toolbar flat>
                    <v-toolbar-title>{{ name }}</v-toolbar-title>
                    <a :href="fmHref" target="_blank" rel="noopener noreferrer">
                        <v-icon>mdi-link-variant</v-icon>
                    </a>
                </v-toolbar>
                <v-card flat align-center>
                    {{ desc }}
                </v-card>

            </template>
            <template v-slot:bottom>
            </template>
        </v-data-table>
        <v-divider class="border-opacity-100" thickness="10"></v-divider>
        <!--  Data Table for Metrics: -->
        <v-data-table v-model:expanded="expandedRoot" :headers="expandableHeaders" :items="metrics" item-value="name">
            <template v-slot:headers>
            </template>
            <template v-slot:expanded-row="{ item, columns }">
                <tr>
                    <td :colspan="columns.length">
                        <v-data-table v-model:expanded="expandedSubs" :headers="expandableHeaders" :items="item.raw.childs"
                            item-value="name" :expand-on-click="true">
                            <template v-slot:headers>
                            </template>
                            <template v-slot:item.data-table-expand="{ item }">
                                <template v-if="item.raw.childs && item.raw.childs.length > 0">
                                    <v-icon icon="mdi-chevron-down"></v-icon>
                                </template>
                            </template>
                            <template v-slot:expanded-row="{ item, columns }">
                                <template v-if="item.raw.childs && item.raw.childs.length > 0">
                                    <!-- only print when subitems exist-->
                <tr>
                    <td :colspan="columns.length">
                        <v-data-table :headers="factHeaders" :items="item.raw.childs" item-value="name"
                            :show-expand="false">
                            <template v-slot:headers>
                            </template>

                            <template v-slot:bottom>
                            </template>
                        </v-data-table>

                    </td>
                </tr>
            </template>
            </template>

            <template v-slot:bottom>
            </template>
        </v-data-table>

        </td>
        </tr>
        </template>

        <template v-slot:bottom>
        </template>
        </v-data-table>

        <v-divider class="border-opacity-100" thickness="10"></v-divider>
        <!--  Data Table for Analysis: -->
        <v-data-table :headers="factHeaders" :items="analysis" item-value="name">
            <template v-slot:headers>
            </template>
            <template v-slot:bottom>
            </template>
        </v-data-table>
        <v-divider class="border-opacity-100" thickness="10"></v-divider>
        <v-checkbox-btn v-model="hideMissing" label="Hide Missing" @update:modelValue="hideMissingFacts">
        </v-checkbox-btn>
    </v-card>
</template>

<script>
import * as FactLabelFactory from "@/classes/Factlabel/FactLabelFactory"
const FM_CHAR_NAME_DESC = "Name"; // FM Characterization Name Descriptor
const FM_CHAR_HREF_DESC = "Reference";
const FM_CHAR_DESC_DESC = "Description";


export default {
    name: 'FactLabel',

    components: {},

    props: {},

    data: () => ({
        name: "",
        fmHref: "",
        desc: "",
        expandedRoot: [],
        expandedSubs: [],
        expandedSubSubs: [],
        factHeaders: [{ key: "name", sortable: false }, { key: "value", sortable: false }],
        expandableHeaders: [{ key: 'data-table-expand' }, { key: "name", sortable: false }, { key: "value", sortable: false }],
        facts: null,
        hideMissing: false,
        metadata: [], // Array of simple k,v pairs
        metrics: [],
        analysis: [],
    }),


    computed: {},
    created() {
        this.initialize();
    },
    methods: {
        initialize() {
            this.facts = FactLabelFactory.getEmptyFactLabel(); // TODO load only when not set via props
            this.fillMetaData();
            this.fillAnalysis();
            this.fillMetrics();
            return;
        },
        fillMetaData() {
            this.metadata = this.facts.metadata.filter((entry) => {
                if (entry.name === FM_CHAR_NAME_DESC) {
                    this.name = entry.value; //handle special entry Name which defines Name of FM
                    return false;
                } else if (entry.name === FM_CHAR_HREF_DESC) {
                    this.fmHref = entry.value; //handle special entry Name which defines Name of FM
                    return false;
                } else if (entry.name === FM_CHAR_DESC_DESC) {
                    this.desc = entry.value; //handle special entry Name which defines Name of FM
                    return false;
                } else {
                    return true;
                }
            });
            this.metadata = this.metadata.map((entry) => {
                var obj = {}; // temporry JSON object to fill for visualisation of metadata
                obj["name"] = entry.name;
                obj["value"] = this.getDisplayValue(entry);
                return obj;
            });
        },

        fillAnalysis() {
            this.analysis = this.facts.analysis.map((entry) => {
                var obj = {}; // temporry JSON object to fill for visualisation of analysis
                obj["name"] = entry.name;
                // Value depends on if Size and Ratio are set

                obj["value"] = this.getDisplayValue(entry);
                return obj;
            });
        },
        fillMetrics() {
            if (this.getMaxLevel > 2) {
                console.error("incompatible Metrics, format only supported until depth of 3");
            }
            let root_entries = this.getEntriesOnLevel(this.facts.metrics, 0);
            let sub_entries = this.getEntriesOnLevel(this.facts.metrics, 1);
            let sub_sub_entries = this.getEntriesOnLevel(this.facts.metrics, 2);
            this.sortInParent(sub_entries, sub_sub_entries);
            this.sortInParent(root_entries, sub_entries);
            this.metrics = root_entries;
        },
        sortInParent(parentArray, childArray) {
            // TODO desc
            childArray.forEach((child) => {
                parentArray.forEach((parent) => {
                    if (child.parent === parent.name) {
                        parent.childs.push(child);
                    }
                });
            });
        },
        getEntriesOnLevel(arr, level) {
            let entries = arr.filter((entry) => entry.level === level);
            return entries.map((entry) => {
                var obj = {};
                obj["name"] = entry.name;
                obj["value"] = this.getDisplayValue(entry);
                obj["parent"] = entry.parent;
                obj["childs"] = [];
                return obj;
            });
        },
        getMaxLevel(arr) {
            // Iterate over an Array of metric  entries and return the highest found level
            var maxLevel = 0;
            arr.forEach(function (entry, index) {
                if (entry.level >= maxLevel) {
                    maxLevel = entry.level;
                }
            });
            return maxLevel;
        },
        getDisplayValue(entry) {
            // Determine which value of an entry should be displayed ( size and ratio attributes overwrite value)
            try {
                var value_str = "";
                if (entry.size !== null) {
                    value_str = "" + entry.size;
                    if (entry.ratio !== null) { // append optional ratio
                        var rounded = Math.round(100 * entry.ratio);
                        value_str = value_str + " (" + rounded + "\%)";
                    }
                } else {
                    value_str = entry.value;
                }
                return value_str
            } catch (e) {
                console.error(e);
                return "Failed to determine which value to display";
            }

        },
        hideMissingFacts() {
            if (!this.hideMissing) {
                // restore initial state
                this.initialize();
            } else {
                this.metadata = this.facts.metadata.filter((entry) => {
                    return entry.value !== null;
                });
                this.analysis = this.facts.analysis.filter((entry) => {
                    return entry.value !== null;
                });
                this.metrics = this.facts.metrics.filter((entry) => {
                    return entry.value !== null;
                });
            }
        },
    },
};
</script>

<style scoped></style>
