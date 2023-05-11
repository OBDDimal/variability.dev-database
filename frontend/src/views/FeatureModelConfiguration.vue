<template>
  <div class="main">

    <v-container fluid>
      <v-row>

        <!-- Left column -->
        <v-col cols="2">
          <v-card>
            <v-card-title>Number of possible configurations</v-card-title>
            <v-card-subtitle>{{ featureModel.satCount }}</v-card-subtitle>
            <v-card-actions>
              <v-btn @click="reset">Reset Config</v-btn>
              <v-btn :disabled="!commandManager.isUndoAvailable()" @click="commandManager.undo()">
                <v-icon>mdi-undo</v-icon>
              </v-btn>
              <v-btn :disabled="!commandManager.isRedoAvailable()" @click="commandManager.redo()">
                <v-icon>mdi-redo</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>

          <v-card>
            <v-card-title>Configuration history</v-card-title>
            <v-data-table
                :headers="headersCommands"
                :items="commandManager.commands"
                single-select
                class="elevation-1"
                @click:row="command => commandManager.redoCommand(command)"
                :item-class="command => command.marked ? 'active-command clickable' : 'clickable'"
                disable-sort
                disable-filtering
                fixed-header
                height="400px"
                disable-pagination
                hide-default-footer
            >
            </v-data-table>
          </v-card>
        </v-col>

        <!-- Right column -->
        <v-col cols="10">
          <v-container fluid>
            <v-row>

              <!-- Versions -->
              <v-col cols="4">
                <v-card>
                  <v-card-title>
                    Versions
                    <v-spacer></v-spacer>
                    <v-text-field
                        v-model="searchVersions"
                        append-icon="mdi-magnify"
                        label="Search"
                        single-line
                        hide-details
                    ></v-text-field>
                  </v-card-title>

                  <v-data-table
                      :search="searchVersions"
                      :headers="[{text: 'Selection', value: 'selectionState'}, {text: 'Version', value: 'version', groupable: false}, {text: '', value: 'actions'}]"
                      :items="featureModel.versions"
                      item-key="version"
                      show-group-by
                      fixed-header
                      height="40vh"
                      single-select
                      disable-pagination
                      hide-default-footer
                      :item-class="v => v === selectedVersion ? 'selected-version clickable' : 'clickable'"
                      @click:row="selectVersion($event)"
                  >
                    <template v-slot:item.version="{ item }">
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <span v-bind="attrs" v-on="on">{{ item.version }}</span>
                        </template>
                        <span>BDD root ID: {{ item.rootId }}</span>
                      </v-tooltip>
                    </template>

                    <template v-slot:item.selectionState="{ item }">
                      <DoubleCheckbox v-bind:selection-item="item" @select="select(item, $event)"></DoubleCheckbox>
                    </template>

                    <template v-slot:item.actions="{ item }">
                      <div v-if="item === selectedVersion">
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                v-on="on"
                                v-bind="attrs"
                                rounded
                                @click="features = item.features">
                              <v-icon>mdi-filter</v-icon>
                            </v-btn>
                          </template>
                          <span>Filter features in this version</span>
                        </v-tooltip>

                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                rounded
                                v-on="on"
                                v-bind="attrs"
                                @click="features = featureModel.features.filter(f => !item.features.includes(f))">
                              <v-icon>mdi-filter-off</v-icon>
                            </v-btn>
                          </template>
                          <span>Filter features not in this version</span>
                        </v-tooltip>
                      </div>

                    </template>
                  </v-data-table>
                </v-card>
              </v-col>

              <!-- Features -->
              <v-col cols="4">
                <v-card>
                  <v-card-title>
                    Features
                    <v-spacer></v-spacer>
                    <v-text-field
                        v-model="searchFeatures"
                        append-icon="mdi-magnify"
                        label="Search"
                        single-line
                        hide-details
                    ></v-text-field>

                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            rounded
                            v-bind="attrs"
                            v-on="on"
                            @click="resetFeaturesTable()">
                          <v-icon>mdi-close</v-icon>
                        </v-btn>
                      </template>
                      <span>Reset search and filter</span>
                    </v-tooltip>
                  </v-card-title>

                  <v-data-table
                      :headers="[{text: 'Selection', value: 'selectionState'}, {text: 'Name', value: 'name', groupable: false}]"
                      :search="searchFeatures"
                      :items="features"
                      item-key="name"
                      show-group-by
                      fixed-header
                      height="40vh"
                      single-select
                      disable-pagination
                      hide-default-footer
                      @click:row="getFeatureExplanations($event)"
                  >
                    <template v-slot:item.name="{ item }">
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <span v-bind="attrs" v-on="on">{{ item.name }}</span>
                        </template>
                        <span>Var ID: {{ item.id }}</span>
                      </v-tooltip>
                    </template>

                    <template v-slot:item.selectionState="{ item }">
                      <DoubleCheckbox v-bind:selection-item="item" @select="select(item, $event)"></DoubleCheckbox>
                    </template>
                  </v-data-table>
                </v-card>
              </v-col>

              <!-- Tree hierarchy table for one selected version -->
              <v-col cols="4">
                <v-card>
                  <v-card-title style="height:80px">Explanations</v-card-title>
                  <div style="height:40vh">
                    <div v-if="selectedVersion?.selectionState === SelectionState.ImplicitlySelected">Impliziert
                      selektiert, weil
                      {{
                        featureModel.versions.filter(v => selectedVersion.id === v.id && v.selectionState === SelectionState.ExplicitlySelected).map(v => v.version)
                      }}
                    </div>
                    <div v-if="crossTreeConstraintsSindSchuld">Cross-Tree-Constraints sind schuld:
                      {{ crossTreeConstraintsSindSchuld }}
                    </div>
                    <div v-if="schuldigeFeaturesWeilNichtVorhanden.length !== 0">Fehlende Features:
                      {{ schuldigeFeaturesWeilNichtVorhanden.map(f => f.name) }}
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <!-- feature model viewer, ctc and tree view -->
            <v-row v-if="selectedVersion?.root">
              <v-col>
                <v-card>
                  <v-card-title>Details for version: {{ selectedVersion.version }}</v-card-title>
                  <v-tabs v-model="tab">
                    <v-tab key="featureModelViewer">Feature Model Viewer</v-tab>
                    <v-tab key="listTree">List Tree</v-tab>
                    <v-tab key="ctc">Cross Tree Constraints</v-tab>
                  </v-tabs>
                </v-card>

                <v-tabs-items v-model="tab">
                  <v-tab-item key="featureModelViewer">
                    <feature-model-viewer :version="selectedVersion"></feature-model-viewer>
                  </v-tab-item>

                  <v-tab-item key="listTree">
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
                  </v-tab-item>

                  <v-tab-item key="ctc">

                    <v-btn @click="filteredConstraints = allConstraints.filter(c => c.evaluation === false)">Only
                      invalid
                    </v-btn>
                    <v-btn @click="filteredConstraints = allConstraints">Reset</v-btn>

                    <v-data-table
                        :items="filteredConstraints"
                        show-group-by
                        disable-pagination
                        hide-default-footer
                        height="400px"
                        fixed-header
                        :headers="[{text: 'Valid', value: 'evaluation', key: 'evaluation'}, {text: 'Constraints', value: 'formula', groupable: false}]"
                        :sort-by="[{key: 'evaluation', ord: 'desc'}]"
                    >

                      <template v-slot:item.formula="{ item }">
                        <div v-for="(f, i) in item.formula" :key="i" style="display: inline;">
                          <v-chip
                              class="ma-2"
                              v-if="f instanceof FeatureNodeConstraintItem"
                              :color="color(f)"
                              @click="searchFeatures = f.featureNode.name"
                          >
                            {{ f.featureNode.name }}
                          </v-chip>
                          <span v-else>{{ f }}</span>
                        </div>
                      </template>

                      <template v-slot:item.evaluation="{ item }">
                        <v-avatar size="30"
                                  :color="item.evaluation ? 'green' : (item.evaluation === undefined ? '' : 'red')"></v-avatar>
                      </template>

                    </v-data-table>

                  </v-tab-item>
                </v-tabs-items>

              </v-col>
            </v-row>

          </v-container>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import Vue from 'vue';
import {FeatureModel} from "@/classes/Configurator/FeatureModel";
import FeatureModelViewer from "@/components/Configurator/FeatureModelViewer.vue";
import {CommandManager} from "@/classes/Commands/CommandManager";
import {SelectionCommand} from "@/classes/Commands/Configurator/SelectionCommand";
import {ResetCommand} from "@/classes/Commands/Configurator/ResetCommand";
import {SelectionState} from "@/classes/Configurator/SelectionState";
import {FeatureNodeConstraintItem} from "@/classes/Constraint/FeatureNodeConstraintItem";
import {Feature} from "@/classes/Configurator/Feature";
import api from "@/services/api.service";
import DoubleCheckbox from "@/components/Configurator/DoubleCheckbox.vue";


export default Vue.extend({
  name: 'FeatureModelConfiguration',
  components: {DoubleCheckbox, FeatureModelViewer},

  data: () => ({
    commandManager: new CommandManager(),
    resetCommand: undefined,
    featureModel: FeatureModel,
    features: undefined,
    headersCommands: [{text: 'Command', value: 'featureOrVersion.id'}, {text: '#SAT', value: 'newSatCount'}],
    selectedVersion: undefined,
    filteredConstraints: undefined,
    allConstraints: undefined,
    searchFeatures: "",
    searchVersions: "",
    hoveredVersion: undefined,
    tab: undefined,
  }),

  props: {
    name
  },

  created() {
    this.initData();
  },

  methods: {
    initData() {
      api.get(`${process.env.VUE_APP_DOMAIN}configurator/mappings/${this.name}`)
          .then((mappings) => {
            this.featureModel = FeatureModel.create(mappings.data["root-mapping"], mappings.data["feature-mapping"]);
            this.featureModel.name = this.name;

            this.features = this.featureModel.features;

            this.featureModel.loadXmlData(this.featureModel.versions[0]);
            this.selectedVersion = this.featureModel.versions[0];
            this.resetCommand = new ResetCommand(this.featureModel);
            this.resetCommand.execute()
          })
          .catch(() => {
          });
    },

    selectVersion(version) {
      this.selectedVersion.empty();
      this.featureModel.loadXmlData(version).then(() => {
        this.selectedVersion = version;
        this.allConstraints = this.selectedVersion.constraints.map((e) => ({
          constraint: e,
          formula: e.toList(),
          evaluation: e.evaluate()
        }))
        this.filteredConstraints = this.allConstraints;
      });
    },

    resetFeaturesTable() {
      this.searchFeatures = "";
      this.features = this.featureModel.features;
    },

    getFeatureExplanations(feature) {
      if (feature.selectionState === SelectionState.Unselected || feature.selectionState === SelectionState.ExplicitlySelected || feature.selectionState === SelectionState.ExplicitlyDeselected) {
        return;
      }

      const selected_roots = this.featureModel.versions.filter(v => v.selectionState === SelectionState.ExplicitlySelected).map(v => v.rootId);
      const selected_vars = this.featureModel.features.filter(f => f.selectionState === SelectionState.ExplicitlySelected).map(f => f.id);
      const deselected_vars = this.featureModel.features.filter(f => f.selectionState === SelectionState.ExplicitlyDeselected).map(f => -f.id);
      const config = [...selected_vars, ...deselected_vars];

      const variable = feature.selectionState === SelectionState.ImplicitlyDeselected ? -feature.id : feature.id;

      console.log(feature)
      api.post(`${process.env.VUE_APP_DOMAIN}configurator/feature-explanations/${this.name}`, ({
        "var": variable,
        "config": config,
        "selected_roots": selected_roots
      }))
          .then((explanations) => {
            console.log(explanations.data);
          })
          .catch(() => {
          });
    },

    select(item, selectionState) {
      const command = new SelectionCommand(this.featureModel, item, selectionState);
      this.commandManager.execute(command);
    },

    reset() {
      this.commandManager.execute(this.resetCommand.copy());
    },

    color(featureNodeConstraintItem) {
      const e = featureNodeConstraintItem.evaluate()
      if (e === undefined) {
        return undefined;
      } else if (e) {
        return 'green';
      } else {
        return 'red';
      }
    }
  },

  computed: {
    Feature() {
      return Feature
    },

    FeatureNodeConstraintItem() {
      return FeatureNodeConstraintItem
    },

    SelectionState() {
      return SelectionState
    },

    schuldigeFeaturesWeilNichtVorhanden() {
      if (!this.featureModel || !this.selectedVersion || !this.selectedVersion.root) {
        return [];
      }

      return this.featureModel.features
          .filter(f => f.selectionState === SelectionState.ExplicitlySelected || f.selectionState === SelectionState.ImplicitlySelected)
          .filter(f => !this.selectedVersion.features.includes(f));
    },

    crossTreeConstraintsSindSchuld() {
      if (!this.featureModel || !this.selectedVersion || !this.selectedVersion.root) {
        return [];
      }

      return this.selectedVersion.constraints.some(c => c.evaluate() === false)
    }
  },

});
</script>


<style lang="scss">
.active-command {
  background-color: lightcyan;
  color: black;
}

.selected-version {
  background-color: lightcyan;
  color: black;
}

.clickable {
  cursor: pointer;
}
</style>
