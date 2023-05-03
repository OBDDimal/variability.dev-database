<template>
  <div class="mainView">
    <v-container>
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
                      :disabled="item.selectionState === SelectionState.ImplicitlyDeselected || item.selectionState === SelectionState.ExplicitlyDeselected"
                      @input="select(item, SelectionState.ExplicitlySelected)"
                      :color="item.selectionState === SelectionState.ImplicitlySelected ? 'grey' : 'green'"
                  ></v-simple-checkbox>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-simple-checkbox
                      on-icon="mdi-close-box"
                      :value="item.selectionState === SelectionState.ImplicitlyDeselected || item.selectionState === SelectionState.ExplicitlyDeselected"
                      :disabled="item.selectionState === SelectionState.ExplicitlySelected"
                      @input="select(item, SelectionState.ExplicitlyDeselected)"
                      :color="item.selectionState === SelectionState.ImplicitlyDeselected ? 'grey' : 'red'"
                  ></v-simple-checkbox>
                </v-col>
              </v-row>
            </template>
          </v-data-table>
        </v-col>

        <!-- All features -->
        <v-col cols="12" sm="4">
          <v-data-table
              disable-pagination
              hide-default-footer
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
                      :disabled="item.selectionState === SelectionState.ImplicitlyDeselected || item.selectionState === SelectionState.ExplicitlyDeselected"
                      @input="select(item, SelectionState.ExplicitlySelected)"
                      :color="item.selectionState === SelectionState.ImplicitlySelected ? 'grey' : 'green'"
                  ></v-simple-checkbox>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-simple-checkbox
                      on-icon="mdi-close-box"
                      :value="item.selectionState === SelectionState.ImplicitlyDeselected || item.selectionState === SelectionState.ExplicitlyDeselected"
                      :disabled="item.selectionState === SelectionState.ImplicitlySelected || item.selectionState === SelectionState.ExplicitlySelected"
                      @input="select(item, SelectionState.ExplicitlyDeselected)"
                      :color="item.selectionState === SelectionState.ImplicitlyDeselected ? 'grey' : 'red'"
                  ></v-simple-checkbox>
                </v-col>
              </v-row>
            </template>
          </v-data-table>
        </v-col>

        <!-- Tree hierarchy table for one selected version -->
        <v-col cols="12" sm="4">
          <p>{{satCount}}</p>
          <v-treeview
              :items="[selectedVersion.root]"
              selection-type="independent">
            <template v-slot:prepend="{ item }">
              <v-row>
                <v-col cols="auto" sm="1">
                  <v-simple-checkbox
                      :value="item.feature.selectionState === SelectionState.ImplicitlySelected || item.feature.selectionState === SelectionState.ExplicitlySelected"
                      :disabled="item.feature.selectionState === SelectionState.ImplicitlyDeselected || item.feature.selectionState === SelectionState.ExplicitlyDeselected"
                      :color="item.feature.selectionState === SelectionState.ImplicitlySelected ? 'grey' : 'green'"
                      @input="select(item.feature, SelectionState.ExplicitlySelected)">
                  </v-simple-checkbox>
                </v-col>
                <v-col cols="auto" sm="1">
                  <v-simple-checkbox
                      on-icon="mdi-close-box"
                      :value="item.feature.selectionState === SelectionState.ImplicitlyDeselected || item.feature.selectionState === SelectionState.ExplicitlyDeselected"
                      :disabled="item.feature.selectionState === SelectionState.ImplicitlySelected || item.feature.selectionState === SelectionState.ExplicitlySelected"
                      :color="item.feature.selectionState === SelectionState.ImplicitlyDeselected ? 'grey' : 'red'"
                      @input="select(item.feature, SelectionState.ExplicitlyDeselected)">
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
        <v-col>
          <v-card>
            <v-card-title>Version {{selectedVersion.version}}</v-card-title>
            <v-card-text>
              <feature-model-viewer :version="selectedVersion">
              </feature-model-viewer>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

    </v-container>
  </div>
</template>

<script>
import Vue from 'vue';
import {FeatureModel} from "@/classes/Configurator/FeatureModel";
import {xmlVersions, features} from "@/classes/Configurator/example";
import {SelectionState} from "@/classes/Configurator/SelectionState";
import {Version} from "@/classes/Configurator/Version";
import FeatureModelViewer from "@/components/Configurator/FeatureModelViewer.vue";
import api from "@/services/api.service";

const API_URL = process.env.VUE_APP_DOMAIN;

export default Vue.extend({
  name: 'FeatureModelConfiguration',
  components: {FeatureModelViewer},
  computed: {
    SelectionState() {
      return SelectionState
    }
  },

  data: () => ({
    featureModel: FeatureModel,
    headersVersions: [{text: 'Version', value: 'version'}, {text: 'RootId', value: 'id'}],
    headersFeatures: [{text: 'All features', value: 'name'}, {text: 'Id', value: 'id'}],
    selectedVersion: Version,
    satCount: 0,
  }),

  created() {
    this.initData();
  },

  methods: {
    initData() {
      this.featureModel = FeatureModel.create(xmlVersions, features);
      this.selectedVersion = this.featureModel.versions[0];

      this.updateFeatureModel([], [], []);
    },

    updateFeatureModel: function (config, selected_roots, available_roots) {
      console.log(available_roots)
      api.post(`${API_URL}configurator/`, ({"config": config, "selected_roots": selected_roots, "available_roots": available_roots}))
          .then((d) => {
            const data = d.data;

            this.satCount = data.count;

            this.featureModel.versions.forEach(v => {
              if (data.deselected_roots.includes(v.id) && v.selectionState !== SelectionState.ExplicitlyDeselected) {
                v.selectionState = SelectionState.ImplicitlyDeselected;
              } else if (data.selected_roots.includes(v.id) && v.selectionState !== SelectionState.ExplicitlyDeselected) {
                if (v.selectionState === SelectionState.ExplicitlySelected) {
                  v.selectionState = SelectionState.ExplicitlySelected;
                } else {
                  v.selectionState = SelectionState.ImplicitlySelected;
                }
              } else if (v.selectionState === SelectionState.ExplicitlyDeselected) {
                v.selectionState = SelectionState.ExplicitlyDeselected;
              } else {
                v.selectionState = SelectionState.Unselected;
              }
            });

            this.featureModel.features.forEach(f => {
              if (data.implicit_selected_vars.includes(f.id)) {
                f.selectionState = SelectionState.ImplicitlySelected;
              } else if (data.implicit_deselected_vars.includes(f.id)) {
                f.selectionState = SelectionState.ImplicitlyDeselected;
              } else if (data.config.includes(f.id)) {
                f.selectionState = SelectionState.ExplicitlySelected;
              } else if (data.config.includes(-f.id)) {
                f.selectionState = SelectionState.ExplicitlyDeselected;
              } else {
                f.selectionState = SelectionState.Unselected;
              }
            });
          })
          .catch(() => {
            this.addLoading = false;
          });
    }, select(item, selectionState) {
      if (item.selectionState === selectionState) {
        item.selectionState = SelectionState.Unselected;
      } else {
        item.selectionState = selectionState;
      }

      const selected_roots = this.featureModel.versions.filter(v => v.selectionState === SelectionState.ExplicitlySelected).map(v => v.id);
      const available_roots = this.featureModel.versions.filter(v => !selected_roots.includes(v) && v.selectionState !== SelectionState.ExplicitlyDeselected).map(v => v.id)
      const selected_vars = this.featureModel.features.filter(f => f.selectionState === SelectionState.ExplicitlySelected).map(f => f.id);
      const deselected_vars = this.featureModel.features.filter(f => f.selectionState === SelectionState.ExplicitlyDeselected).map(f => -f.id);
      const config = [...selected_vars, ...deselected_vars];

      this.updateFeatureModel(config, selected_roots, available_roots);
    }
  },


});
</script>

<style lang="scss">
</style>
