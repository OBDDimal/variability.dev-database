<template>
  <div class="mainView">
    <v-row>

      <!-- Versions -->
      <v-col cols="12" sm="4">
        <v-data-table
            :headers="headersVersions"
            :items="featureModel.versions"
            item-key="version"
            show-select
            single-select
            class="elevation-1"
            @click:row="selectedVersion = $event"
        >
          <template v-slot:item.data-table-select="{ item }">
            <v-row>
              <v-col cols="12" sm="4">
                <v-simple-checkbox
                    :value="item.selectionState === SelectionState.ImplicitlySelected || item.selectionState === SelectionState.ExplicitlySelected"
                    :readonly="item.selectionState === SelectionState.ImplicitlySelected || item.selectionState === SelectionState.ImplicitlyDeselected"
                    :disabled="item.selectionState === SelectionState.ImplicitlySelected || item.selectionState === SelectionState.ImplicitlyDeselected"
                    @input="select(item, SelectionState.ExplicitlySelected)"
                    color="green"
                ></v-simple-checkbox>
              </v-col>
              <v-col cols="12" sm="4">
                <v-simple-checkbox
                    on-icon="mdi-close-box"
                    :value="item.selectionState === SelectionState.ImplicitlyDeselected || item.selectionState === SelectionState.ExplicitlyDeselected"
                    :readonly="item.selectionState === SelectionState.ImplicitlySelected || item.selectionState === SelectionState.ImplicitlyDeselected"
                    :disabled="item.selectionState === SelectionState.ImplicitlySelected || item.selectionState === SelectionState.ImplicitlyDeselected"
                    @input="select(item, SelectionState.ExplicitlyDeselected)"
                    color="red"
                ></v-simple-checkbox>
              </v-col>
            </v-row>
          </template>
        </v-data-table>
      </v-col>


      <!-- All features -->
      <v-col cols="12" sm="4">
        <v-data-table
            :headers="headersFeatures"
            :items="featureModel.features"
            item-key="name"
            show-select
            single-select
            class="elevation-1"
        >
          <template v-slot:item.data-table-select="{ item }">
            <v-row>
              <v-col cols="12" sm="4">
                <v-simple-checkbox
                    :value="item.selectionState === SelectionState.ImplicitlySelected || item.selectionState === SelectionState.ExplicitlySelected"
                    :readonly="item.selectionState === SelectionState.ImplicitlySelected || item.selectionState === SelectionState.ImplicitlyDeselected"
                    :disabled="item.selectionState === SelectionState.ImplicitlySelected || item.selectionState === SelectionState.ImplicitlyDeselected"
                    @input="select(item, SelectionState.ExplicitlySelected)"
                    color="green"
                ></v-simple-checkbox>
              </v-col>
              <v-col cols="12" sm="4">
                <v-simple-checkbox
                    on-icon="mdi-close-box"
                    :value="item.selectionState === SelectionState.ImplicitlyDeselected || item.selectionState === SelectionState.ExplicitlyDeselected"
                    :readonly="item.selectionState === SelectionState.ImplicitlySelected || item.selectionState === SelectionState.ImplicitlyDeselected"
                    :disabled="item.selectionState === SelectionState.ImplicitlySelected || item.selectionState === SelectionState.ImplicitlyDeselected"
                    @input="select(item, SelectionState.ExplicitlyDeselected)"
                    color="red"
                ></v-simple-checkbox>
              </v-col>
            </v-row>
          </template>
        </v-data-table>
      </v-col>

      <!-- Tree hierarchy table for one selected version -->
      <v-col cols="12" sm="4">
        <v-treeview
            :items="[selectedVersion.root]"
            selection-type="independent">
          <template v-slot:prepend="{ item }">
            <v-row>
              <v-col cols="auto" sm="1">
                <v-simple-checkbox
                    color="green"
                    :value="item.feature.selectionState === SelectionState.ImplicitlySelected || item.feature.selectionState === SelectionState.ExplicitlySelected"
                    :disabled="item.feature.selectionState === SelectionState.ImplicitlySelected || item.feature.selectionState === SelectionState.ImplicitlyDeselected"
                    @click="select(item.feature, SelectionState.ExplicitlySelected)">
                </v-simple-checkbox>
              </v-col>
              <v-col cols="auto" sm="1">
                <v-simple-checkbox
                    on-icon="mdi-close-box"
                    color="red"
                    :value="item.feature.selectionState === SelectionState.ImplicitlyDeselected || item.feature.selectionState === SelectionState.ExplicitlyDeselected"
                    :disabled="item.feature.selectionState === SelectionState.ImplicitlySelected || item.feature.selectionState === SelectionState.ImplicitlyDeselected"
                    @click="select(item.feature, SelectionState.ExplicitlyDeselected)">
                </v-simple-checkbox>
              </v-col>
            </v-row>
          </template>

          <template v-slot:label="{item}">
            <span class="v-treeview-node__label">{{ item.feature.name }}</span>
            <span
                class="v-treeview-node__label">{{
                item.isAnd() ? " (AND)" : item.isOr() ? " (OR)" : item.isAlt() ? " (ALT)" : ""
              }}</span>
            <span class="v-treeview-node__label">{{
                item.parent?.isAnd() && item.isMandatory ? " (MANDATORY)" : ""
              }}</span>
          </template>
        </v-treeview>
      </v-col>
    </v-row>

    <!-- feature model viewer -->
    <v-row>

    </v-row>
  </div>
</template>

<script>
import Vue from 'vue';
import {FeatureModel} from "@/classes/Configuration/FeatureModel";
import {xmlVersions} from "@/classes/Configuration/example";
import {SelectionState} from "@/classes/Configuration/SelectionState";
import {Version} from "@/classes/Configuration/Version";

export default Vue.extend({
  name: 'FeatureModelConfiguration',
  computed: {
    SelectionState() {
      return SelectionState
    }
  },

  data: () => ({
    featureModel: FeatureModel,
    headersVersions: [{text: 'Version', value: 'version'}],
    headersFeatures: [{text: 'All features', value: 'name'}],
    selectedVersion: Version,
  }),

  created() {
    this.initData();
  },

  methods: {
    initData() {
      this.featureModel = FeatureModel.create(xmlVersions);
      this.selectedVersion = this.featureModel.versions[0];
    },

    select(item, selectionState) {
      if (item.selectionState === selectionState) {
        item.selectionState = SelectionState.Unselected;
      } else {
        item.selectionState = selectionState;
      }
    }
  },


});
</script>

<style lang="scss">
</style>
