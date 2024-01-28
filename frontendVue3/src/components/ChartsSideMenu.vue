<template>
  <v-card variant="outlined">
    <v-card-title>Select Chart to Create</v-card-title>
    <v-divider class="border-opacity-100"></v-divider>
    <v-divider class="border-opacity-100" thickness="10"></v-divider>
    <!--  Data Table for Metrics: -->
    <v-data-table v-model:expanded="expandedRoot" :headers="expandableHeaders" :items="showMetrics" item-value="name" item-key="name">
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
                <td >
                <template v-if="item.raw.childs && item.raw.childs.length > 0">
                  <v-icon icon="mdi-chevron-down"></v-icon>
                </template>
                </td>
                <td>
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-btn
                        color="primary"
                        v-bind="props"
                      >
                        Select
                      </v-btn>
                    </template>

                    <v-list>
                      <v-list-item
                        v-for="(listitem, index) in items"
                        :key="index"
                        @click="generateChart(item.raw.datakey, item.raw.name, listitem.value)"
                      >
                        <v-list-item-title>{{ listitem.title }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </td>
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
                        <template v-slot:item="{ item }">
                          <tr>
                            <td>
                              <v-menu>
                                <template v-slot:activator="{ props }">
                                  <v-btn
                                    color="primary"
                                    v-bind="props"
                                  >
                                    Select
                                  </v-btn>
                                </template>

                                <v-list>
                                  <v-list-item
                                    v-for="(listitem, index) in items"
                                    :key="index"
                                    @click="generateChart(item.raw.datakey, item.raw.name, listitem.value)"
                                  >
                                    <v-list-item-title>{{ listitem.title }}</v-list-item-title>
                                  </v-list-item>
                                </v-list>
                              </v-menu>
                            </td>
                          <td>
                            {{item.value}}
                          </td>
                            </tr>
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
    <v-data-table :headers="factHeaders" :items="showAnalysis">
      <template v-slot:headers>
        Core Metrics
      </template>
      <template #item="{item}">
        <tr>
          <td>
            <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-btn
                        color="primary"
                        v-bind="props"
                      >
                        Select
                      </v-btn>
                    </template>

                    <v-list>
                      <v-list-item
                        v-for="(listitem, index) in items"
                        :key="index"
                        @click="generateChart(item.raw.datakey, item.raw.name, listitem.value)"
                      >
                        <v-list-item-title>{{ listitem.title }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
          </td>
          <td>
            {{item.raw.name}}
          </td>
        </tr>
      </template>
      <template v-slot:no-data>
        No Analysis available
      </template>
      <template v-slot:bottom>
      </template>
    </v-data-table>
    <v-divider class="border-opacity-100" thickness="10"></v-divider>
  </v-card>
</template>

<script setup>
import {computed, ref, toRefs} from 'vue';
import * as ChartsSideMenuFactory from "@/classes/ChartsSideMenuFactory";

const FM_CHAR_NAME_DESC = "Name";
const FM_CHAR_HREF_DESC = "Reference";
const FM_CHAR_DESC_DESC = "Description";
const EMPTY_VALUE = "";
const facts = ChartsSideMenuFactory.getEmptyFactLabel()
const analysis = ref(facts.analysis)
const metrics = ref(facts.metrics)

const name = ref("");
const fmHref = ref("");
const desc = ref("");
const expandedRoot = ref([]);
const expandedSubs = ref([]);
const expandedSubSubs = ref([]);
const factHeaders = ref([ { key: "name", sortable: false }]);
const expandableHeaders = ref([{ key: 'data-table-expand' }, { key: "name", sortable: false }, ]);
const hideMissing = ref(false);
const emit = defineEmits(['createChart'])
const items = ref([
  { title: 'LineChart', value: 'LineChart' },
  { title: 'BoxPlot', value: 'BoxPlot' },
]);
function generateChart(datakey, name, type){
  console.log(datakey)
  console.log(name)
  emit('createChart', datakey, name, type);
}

const showMetrics = computed(() => {
    if (hideMissing.value) {
        return updateMetrics().filter((entry) => checkEntryIfValueSet(entry));
    } else {
        return updateMetrics();
    }
});

const showAnalysis = computed(() => {
    if (hideMissing.value) {
        return updateAnalysis().filter((entry) => entry.value !== EMPTY_VALUE);
    } else {
        return updateAnalysis();
    }
});


const updateMetrics = () => {
    if (getMaxLevel() > 2) {
        console.error("incompatible Metrics, format only supported until depth of 3");
    }
    let root_entries = getEntriesOnLevel(metrics.value, 0);
    let sub_entries = getEntriesOnLevel(metrics.value, 1);
    let sub_sub_entries = getEntriesOnLevel(metrics.value, 2);
    sortInParent(sub_entries, sub_sub_entries);
    sortInParent(root_entries, sub_entries);
    return root_entries;
};

const updateAnalysis = () => {
    return analysis.value.map((entry) => {
        var obj = {};
        obj["name"] = entry.name;
        obj["datakey"] = entry.datakey;
        console.log(obj)
        return obj;
    });
};

const checkEntryIfValueSet = (entry) => {
    if (entry.value !== EMPTY_VALUE) {
        return true;
    } else if (entry.childs.length === 0) {
        return false;
    } else {
        let someSubValueSet = false;
        entry.childs.forEach((child) => {
            someSubValueSet = someSubValueSet || checkEntryIfValueSet(child);
        });
        return someSubValueSet;
    }
};

const sortInParent = (parentArray, childArray) => {
    childArray.forEach((child) => {
        parentArray.forEach((parent) => {
            if (child.parent === parent.name) {
                parent.childs.push(child);
            }
        });
    });
};

const getEntriesOnLevel = (arr, level) => {
    let entries = arr.filter((entry) => entry.level === level);
    return entries.map((entry) => {
        var obj = {};
        obj["name"] = entry.name;
        obj["value"] = getDisplayValue(entry);
        obj["parent"] = entry.parent;
        obj["datakey"] = entry.datakey;
        obj["childs"] = [];
        return obj;
    });
};

const getMaxLevel = () => {
    var maxLevel = 0;
    metrics.value.forEach(function (entry, index) {
        if (entry.level >= maxLevel) {
            maxLevel = entry.level;
        }
    });
    return maxLevel;
};

const getDisplayValue = (entry) => {
    try {
        var value_str = "";
        if (entry.size !== null) {
            value_str = "" + entry.size;
            if (entry.ratio !== null) {
                var rounded = Math.round(100 * entry.ratio);
                value_str = value_str + " (" + rounded + ")";
            }
        } else if (entry.value !== null) {
            value_str = entry.value;
        }
        return value_str
    } catch (e) {
        console.error(e);
        return "Failed to determine which value to display";
    }
};
</script>

<style scoped></style>
