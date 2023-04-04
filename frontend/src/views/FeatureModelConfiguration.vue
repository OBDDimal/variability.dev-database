<template>
  <div class="mainView">
    <v-data-table
        :headers="headersVersions"
        :items="featureModel.versions"
        item-key="version"
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
  </div>
</template>

<script>
import Vue from 'vue';
import {FeatureModel} from "@/classes/Configuration/FeatureModel";
import {xmlVersions} from "@/classes/Configuration/example";
import {SelectionState} from "@/classes/Configuration/SelectionState";

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
    headersFeatures: [{text: 'Feature', value: 'name'}],
  }),

  created() {
    this.initData();
  },

  methods: {
    initData() {
      this.featureModel = FeatureModel.create(xmlVersions);
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
