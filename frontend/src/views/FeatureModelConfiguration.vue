<template>
  <div class="main">
    <v-container fluid>
      <v-row>

        <!-- Versions -->
        <v-col cols="4">
          <v-card>
            <v-card-title>
              Versions ({{ featureModel.versions.length }})

              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon v-on="on" v-bind="attrs">mdi-information</v-icon>
                </template>
                <table>
                  <tr>
                    <th>Selection</th>
                    <th>All</th>
                  </tr>
                  <tr>
                    <td>All</td>
                    <td>{{ featureModel.versions.length }}</td>
                  </tr>
                  <tr>
                    <td>Unselected</td>
                    <td>{{ countSelectionState(featureModel.versions, SelectionState.Unselected) }}</td>
                  </tr>
                  <tr>
                    <td>Explicitly selected</td>
                    <td>{{ countSelectionState(featureModel.versions, SelectionState.ExplicitlySelected) }}</td>
                  </tr>
                  <tr>
                    <td>Explicitly deselected</td>
                    <td>{{countSelectionState(featureModel.versions, SelectionState.ExplicitlyDeselected)}}</td>
                  </tr>
                  <tr>
                    <td>Implicitly selected</td>
                    <td>{{countSelectionState(featureModel.versions, SelectionState.ImplicitlySelected)}}</td>
                  </tr>
                  <tr>
                    <td>Implicitly deselected</td>
                    <td>{{countSelectionState(featureModel.versions, SelectionState.ImplicitlyDeselected)}}</td>
                  </tr>
                </table>
              </v-tooltip>

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
                :headers="[{text: 'Selection', value: 'selectionState'}, {text: 'Version', value: 'version', groupable: false}, {text: '', value: 'actions', groupable: false}]"
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
                          @click="filterFeaturesInVersion(item)">
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
                          @click="filterFeaturesNotInVersion(item)">
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
              Features ({{ features.length }}/{{ featureModel.features.length }})

              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon v-on="on" v-bind="attrs">mdi-information</v-icon>
                </template>
                <table>
                  <tr>
                    <th>Selection</th>
                    <th v-if="filteredFeaturesVersion">Filtered</th>
                    <th>All</th>
                  </tr>
                  <tr>
                    <td>All</td>
                    <td v-if="filteredFeaturesVersion">{{ features.length }}</td>
                    <td>{{ featureModel.features.length }}</td>
                  </tr>
                  <tr>
                    <td>Unselected</td>
                    <td v-if="filteredFeaturesVersion">{{ countSelectionState(features, SelectionState.Unselected) }}</td>
                    <td>{{ countSelectionState(featureModel.features, SelectionState.Unselected) }}</td>
                  </tr>
                  <tr>
                    <td>Explicitly selected</td>
                    <td v-if="filteredFeaturesVersion">{{ countSelectionState(features, SelectionState.ExplicitlySelected) }}</td>
                    <td>{{ countSelectionState(featureModel.features, SelectionState.ExplicitlySelected) }}</td>
                  </tr>
                  <tr>
                    <td>Explicitly deselected</td>
                    <td v-if="filteredFeaturesVersion">{{countSelectionState(features, SelectionState.ExplicitlyDeselected)}}</td>
                    <td>{{countSelectionState(featureModel.features, SelectionState.ExplicitlyDeselected)}}</td>
                  </tr>
                  <tr>
                    <td>Implicitly selected</td>
                    <td v-if="filteredFeaturesVersion">{{countSelectionState(features, SelectionState.ImplicitlySelected)}}</td>
                    <td>{{countSelectionState(featureModel.features, SelectionState.ImplicitlySelected)}}</td>
                  </tr>
                  <tr>
                    <td>Implicitly deselected</td>
                    <td v-if="filteredFeaturesVersion">{{countSelectionState(features, SelectionState.ImplicitlyDeselected)}}</td>
                    <td>{{countSelectionState(featureModel.features, SelectionState.ImplicitlyDeselected)}}</td>
                  </tr>
                </table>
              </v-tooltip>

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

            <v-card-subtitle v-if="filteredFeaturesVersion">
              Filtered by version {{ filteredFeaturesVersion.version }}
              {{ features.length }}
            </v-card-subtitle>

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

        <!-- Third column -->
        <v-col cols="4">
          <!-- #SAT -->
          <v-card height="5vh;">
            <v-card-title>{{ featureModel.satCount }}</v-card-title>
            <v-card-subtitle>Number of possible configurations</v-card-subtitle>
            <v-card-actions>

              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                      rounded
                      v-on="on"
                      v-bind="attrs"
                      @click="reset">
                    Reset Config
                  </v-btn>
                </template>
                <span>Reset all configuration steps and start with an empty selection. This step can be undone.</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                      rounded
                      v-on="on"
                      v-bind="attrs"
                      :disabled="!commandManager.isUndoAvailable()"
                      @click="commandManager.undo()">
                    <v-icon>mdi-undo</v-icon>
                  </v-btn>
                </template>
                <span>Undo last configuration step</span>
              </v-tooltip>


              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                      rounded
                      v-on="on"
                      v-bind="attrs"
                      :disabled="!commandManager.isRedoAvailable()"
                      @click="commandManager.redo()">
                    <v-icon>mdi-redo</v-icon>
                  </v-btn>
                </template>
                <span>Redo last undone configuration step</span>
              </v-tooltip>

            </v-card-actions>
          </v-card>

          <!-- Explanations and configuration history -->
          <v-card style="margin-top:1vh;" height="35.4vh">
            <v-card-title>
              <v-tabs v-model="tabTopRight">
                <v-tab key="explanations">Explanations</v-tab>
                <v-tab key="configurationHistory">Configuration history</v-tab>
              </v-tabs>
            </v-card-title>

            <v-card-text>
              <v-tabs-items v-model="tabTopRight">
                <v-tab-item key="explanations" style="height: 29vh;">
                  <div>
                    <div v-if="selectedVersion?.selectionState === SelectionState.ImplicitlySelected">Impliziert
                      selektiert, weil
                      {{
                        featureModel.versions.filter(v => selectedVersion.id === v.id && v.selectionState === SelectionState.ExplicitlySelected).map(v => v.version)
                      }}
                    </div>
                    <div class="text-h5" v-if="crossTreeConstraintsSindSchuld">
                      Conflicting Cross-Tree-Constraints
                      <v-btn @click="tabBottom = 'ctc'">
                        <v-icon>mdi-arrow-top-right</v-icon>
                      </v-btn>
                    </div>
                    <div v-if="schuldigeFeaturesWeilNichtVorhanden.length !== 0">
                      <div class="text-h5">These features are selected but are missing in this version</div>
                      <v-list lines="one">
                        <v-simple-table>
                          <template v-slot:default>
                            <tbody>
                            <tr
                                v-for="item in schuldigeFeaturesWeilNichtVorhanden"
                                :key="item.name"
                            >
                              <td>{{ item.name }}</td>
                            </tr>
                            </tbody>
                          </template>
                        </v-simple-table>
                      </v-list>
                    </div>
                  </div>

                  <div v-if="featureExplanations">
                    <v-data-table
                      :headers="[{text: 'Versions', value: 'versions'}, {text: 'Features', value: 'features'}]"
                      :items="featureExplanations"
                      single-select
                  >
                  </v-data-table>
                  </div>
                </v-tab-item>

                <v-tab-item key="configurationHistory">
                  <v-data-table
                      :headers="[{text: 'Description', value: 'description'}, {text: '# Possible configs', value: 'newSatCount'}]"
                      :items="commandManager.commands"
                      single-select
                      class="elevation-1"
                      @click:row="command => commandManager.redoCommand(command)"
                      :item-class="command => command.marked ? 'active-command clickable' : 'clickable'"
                      disable-sort
                      disable-filtering
                      fixed-header
                      height="29vh"
                      disable-pagination
                      hide-default-footer
                  >
                  </v-data-table>
                </v-tab-item>
              </v-tabs-items>
            </v-card-text>
          </v-card>


        </v-col>
      </v-row>

      <!-- feature model viewer, ctc and tree view -->
      <v-row>
        <v-col>
          <v-card height="47vh">
            <v-card-title>Details for version: {{ selectedVersion?.version }}</v-card-title>
            <v-tabs v-model="tabBottom">
              <v-tab key="featureModelViewer" href="#featureModelViewer">Feature Model Viewer</v-tab>
              <v-tab key="listTree" href="#listTree">List Tree</v-tab>
              <v-tab key="ctc" href="#ctc">Cross Tree Constraints</v-tab>
            </v-tabs>

            <v-card-text v-if="selectedVersion?.root">
              <v-tabs-items v-model="tabBottom">
                <v-tab-item value="featureModelViewer" key="featureModelViewer">
                  <feature-model-viewer :version="selectedVersion"></feature-model-viewer>
                </v-tab-item>

                <v-tab-item value="listTree" key="listTree">

                  <v-container class="fill-height">
                    <v-layout column class="fill-height">
                      <v-flex class="flex overflow-auto">
                        <v-treeview
                            style="height: 35vh;"
                            :items="[selectedVersion.root]"
                            selection-type="independent">
                          <template v-slot:prepend="{ item }">
                            <DoubleCheckbox :selection-item="item.feature"
                                            @select="select(item.feature, $event)"></DoubleCheckbox>
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
                      </v-flex>
                    </v-layout>
                  </v-container>

                </v-tab-item>

                <v-tab-item value="ctc" key="ctc">

                  <v-btn @click="filteredConstraints = allConstraints.filter(c => c.evaluation === false)">Only
                    invalid
                  </v-btn>
                  <v-btn @click="filteredConstraints = allConstraints">Reset</v-btn>

                  <v-data-table
                      height="32vh"
                      :items="filteredConstraints"
                      show-group-by
                      :footer-props="{'items-per-page-options': [10, 20, 50, 100, 200]}"
                      :headers="[{text: 'Valid', value: 'evaluation', key: 'evaluation'}, {text: 'Constraints', value: 'formula', groupable: false}]"
                      :sort-by="[{key: 'evaluation', ord: 'desc'}]"
                  >

                    <template v-slot:item.formula="{ item }">
                      <div v-for="(f, i) in item.formula" :key="i" style="display: inline;">
                        <v-chip
                            class="ml-2 mr-2"
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
    selectedVersion: undefined,
    filteredConstraints: undefined,
    allConstraints: undefined,
    searchFeatures: "",
    searchVersions: "",
    hoveredVersion: undefined,
    tabBottom: undefined,
    tabTopRight: undefined,
    filteredFeaturesVersion: undefined,
    featureExplanations: undefined,
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

    filterFeaturesInVersion(version) {
      this.filteredFeaturesVersion = version;
      this.features = version.features;
    },

    filterFeaturesNotInVersion(version) {
      this.features = this.featureModel.features.filter(f => !version.features.includes(f))
    },

    resetFilterFeatures() {
      this.features = this.featureModel.features;
      this.filteredFeaturesVersion = undefined;
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
      this.filteredFeaturesVersion = undefined;
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
            this.featureExplanations = explanations.data;
            console.log(explanations.data)
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

    countSelectionState(list, selectionState) {
      return list.filter(x => x.selectionState === selectionState).length;
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
