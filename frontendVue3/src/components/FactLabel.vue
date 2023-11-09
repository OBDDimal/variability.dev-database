<template>
    <v-card variant="outlined">

        <v-divider class="border-opacity-100"></v-divider>
        <!--  Data Table for MetaData: -->
        <v-data-table :headers="factHeaders" :items="showMetadata" item-value="name">
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
            <template v-slot:no-data>
                No Metadata available
            </template>
            <template v-slot:bottom>
            </template>
        </v-data-table>
        <v-divider class="border-opacity-100" thickness="10"></v-divider>
        <!--  Data Table for Metrics: -->
        <v-data-table v-model:expanded="expandedRoot" :headers="expandableHeaders" :items="showMetrics" item-value="name">
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
        <template v-slot:no-data>
            No Metrics available
        </template>
        <template v-slot:bottom>
        </template>
        </v-data-table>

        <v-divider class="border-opacity-100" thickness="10"></v-divider>
        <!--  Data Table for Analysis: -->
        <v-data-table :headers="factHeaders" :items="showAnalysis" item-value="name">
            <template v-slot:headers>
            </template>
            <template v-slot:no-data>
                No Analysis available
            </template>
            <template v-slot:bottom>
            </template>
        </v-data-table>
        <v-divider class="border-opacity-100" thickness="10"></v-divider>
        <v-checkbox-btn v-model="hideMissing" label="Hide Missing">
        </v-checkbox-btn>
    </v-card>
</template>

<script>
import * as FactLabelFactory from "@/classes/Factlabel/FactLabelFactory"
const FM_CHAR_NAME_DESC = "Name"; // FM Characterization Name Descriptor
const FM_CHAR_HREF_DESC = "Reference";
const FM_CHAR_DESC_DESC = "Description";
const EMPTY_VALUE="";

export default {
    name: 'FactLabel',

    components: {},

    props: {
        metadata: {
            type: Array,
            required: false,
            default: () => FactLabelFactory.getEmptyFactLabel().metadata,

        },
        analysis: {
            type: Array,
            required: false,
            default: () => FactLabelFactory.getEmptyFactLabel().analysis,

        },
        metrics: {
            type: Array,
            required: false,
            default: () => FactLabelFactory.getEmptyFactLabel().metrics,

        },
    },

    data: () => ({
        name: "",
        fmHref: "",
        desc: "",
        expandedRoot: [],
        expandedSubs: [],
        expandedSubSubs: [],
        factHeaders: [{ key: "name", sortable: false }, { key: "value", sortable: false }],
        expandableHeaders: [{ key: 'data-table-expand' }, { key: "name", sortable: false }, { key: "value", sortable: false }],
        hideMissing: false,
    }),
    watch: {},

    computed: {
        showMetadata() {
            if (this.hideMissing) {
                return this.updateMetadata().filter((entry) => {
                    return entry.value !== EMPTY_VALUE;
                });
            } else {
                return this.updateMetadata();
            }

        },
        showMetrics() {
            if (this.hideMissing) {
                return this.updateMetrics().filter((entry) => {
                    return this.checkEntryIfValueSet(entry);
                });
            } else {
                return this.updateMetrics();
            }
        },
        showAnalysis() {
            if (this.hideMissing) {
                return this.updateAnalysis().filter((entry) => {
                    return entry.value !== EMPTY_VALUE;
                });
            } else {
                return this.updateAnalysis();
            }
        }
    },
    created() {

    },
    methods: {
        updateMetadata() {
            return this.metadata.filter((entry) => {
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
            }).map((entry) => {
                var obj = {}; // temporry JSON object to fill for visualisation of metadata
                obj["name"] = entry.name;
                obj["value"] = this.getDisplayValue(entry);
                return obj;
            });
        },
        updateMetrics() {
            if (this.getMaxLevel > 2) {
                console.error("incompatible Metrics, format only supported until depth of 3");
            }
            let root_entries = this.getEntriesOnLevel(this.metrics, 0);
            let sub_entries = this.getEntriesOnLevel(this.metrics, 1);
            let sub_sub_entries = this.getEntriesOnLevel(this.metrics, 2);
            this.sortInParent(sub_entries, sub_sub_entries);
            this.sortInParent(root_entries, sub_entries);
            return root_entries;
        },
        updateAnalysis() {
            return this.analysis.map((entry) => {
                var obj = {}; // temporry JSON object to fill for visualisation of analysis
                obj["name"] = entry.name;
                // Value depends on if Size and Ratio are set
                obj["value"] = this.getDisplayValue(entry);
                return obj;
            });
        },
        checkEntryIfValueSet(entry) {
            // Iterate over entry, its childs and subchilds and check if some  value is set
            // Return True if any (sub) Value is set
            if(entry.value !== EMPTY_VALUE){
                return true; // own value set just return true
            }else if (entry.childs.length === 0) {
                return false; // No childs and own value not set
            }else{
                let someSubValueSet=false;
                entry.childs.forEach((child)=>{
                    someSubValueSet= someSubValueSet || this.checkEntryIfValueSet(child);
                });
                return someSubValueSet;
            }
        },
        sortInParent(parentArray, childArray) {
            // Iterate over given parentarray and add to each parent all childs with matching parent name
            childArray.forEach((child) => {
                parentArray.forEach((parent) => {
                    if (child.parent === parent.name) {
                        parent.childs.push(child);
                    }
                });
            });
        },
        getEntriesOnLevel(arr, level) {
            // Get all entries on certain level
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
            // if no value present set to an empty string
            try {
                var value_str = "";
                if (entry.size !== null) {
                    value_str = "" + entry.size;
                    if (entry.ratio !== null) { // append optional ratio
                        var rounded = Math.round(100 * entry.ratio);
                        value_str = value_str + " (" + rounded + "\%)";
                    }
                } else if (entry.value !== null) {
                    value_str = entry.value;
                }
                return value_str
            } catch (e) {
                console.error(e);
                return "Failed to determine which value to display";
            }

        },
    },
};
</script>

<style scoped></style>
