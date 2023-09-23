<template>
  <div class="main">
    <!-- Loading screen -->
    <v-overlay
        :contained=true
        class="align-center justify-center"
        :opacity="featureModel.loadingOpacity"
        :value="featureModel.loading"
        style="margin-top: 64px;"
    >
      <v-progress-circular
          color="primary"
          indeterminate
          size="64"
      ></v-progress-circular>
    </v-overlay>

    <!-- Main content of the configurator -->
    <v-container :fluid="true" v-if="featureModel.loadingOpacity !== 0">

      <!-- First row with the three columns: Versions, Features, Third Column (#SAT, Explanations, Configuration history) -->
      <v-row>
        <!-- Versions -->
        <v-col cols="4">
          <v-card>
            <v-card-title >
              <v-layout row class="align-center">
                <!-- Heading Versions -->
                <div class="mr-2" v-if="featureModel && featureModel.versions">
                  Versions ({{ featureModel.versions?.length }})
                </div>
                <!-- Statistics about the versions as tooltip-->
                <v-tooltip location="bottom">
                  <template v-slot:activator="{ props }">
                    <v-icon v-bind="props">mdi-information</v-icon>
                  </template>
                  <table>
                    <tr>
                      <th>Selection</th>
                      <th>All</th>
                    </tr>
                    <tr>
                      <td>All</td>
                      <td>{{ featureModel.versions?.length }}</td>
                    </tr>
                    <tr>
                      <td>Unselected</td>
                      <td>{{ countSelectionStateInList(featureModel.versions, SelectionState.Unselected) }}</td>
                    </tr>
                    <tr>
                      <td>Explicitly selected</td>
                      <td>{{ countSelectionStateInList(featureModel.versions, SelectionState.ExplicitlySelected) }}</td>
                    </tr>
                    <tr>
                      <td>Explicitly deselected</td>
                      <td>{{ countSelectionStateInList(featureModel.versions, SelectionState.ExplicitlyDeselected) }}</td>
                    </tr>
                    <tr>
                      <td>Implicitly selected</td>
                      <td>{{ countSelectionStateInList(featureModel.versions, SelectionState.ImplicitlySelected) }}</td>
                    </tr>
                    <tr>
                      <td>Implicitly deselected</td>
                      <td>{{ countSelectionStateInList(featureModel.versions, SelectionState.ImplicitlyDeselected) }}</td>
                    </tr>
                  </table>
                </v-tooltip>

                <!-- Search box for versions -->
                <v-text-field
                    v-model="searchVersions"
                    append-inner-icon="mdi-magnify"
                    :clearable=true
                    label="Search"
                    single-line
                    hide-details="auto"
                    class="mr-2 ml-2"
                ></v-text-field>
              </v-layout>
            </v-card-title>

            <v-data-table
                :search="searchVersions"
                :headers="headersVersions"
                :items="featureModel.versions"
                item-key="version"
                show-group-by
                fixed-header
                height="40vh"
                single-select
                disable-pagination
                hide-default-footer
                :item-class="v => v === selectedVersion ? 'selected-version clickable' : 'clickable'"
                @click:row="selectVersion"
            >
              <!-- Customization of the column VERSION -->
              <template v-slot:item.version="{ item }">
                <v-tooltip location="bottom">
                  <template v-slot:activator="{ props }">
                    <span v-bind="props">{{ item.selectable.version }}</span>
                  </template>
                  <span>BDD root ID: {{ item.selectable.rootId }}</span>
                </v-tooltip>
              </template>

              <!-- Customization of the column SELECTIONSTATE -->
              <template v-slot:item.selectionState="{ item }">
                <DoubleCheckbox v-bind:selection-item="item.selectable" @select="(selected) => decisionPropagation(item.selectable, selected)" @click.stop=""></DoubleCheckbox>
              </template>

              <!-- Customization of the column ACTIONS -->
              <template v-slot:item.actions="{ item }">
                <!-- Context menu for selected version -->
                <v-menu offset-y
                        v-if="item.selectable === selectedVersion">
                  <template v-slot:activator="{ props }">
                    <v-btn icon rounded outlined v-bind="props" >
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>

                  <v-list>
                    <!-- Filter features button -->
                    <v-list-item @click="filterFeaturesInVersion(item)">
                      <v-tooltip location="bottom">
                        <template v-slot:activator="{ props }">
                          <div v-bind="props">Filter included features</div>
                        </template>
                        <span>Filter features that are in this version</span>
                      </v-tooltip>
                    </v-list-item>

                    <!-- Filter inverted features button -->
                    <v-list-item @click="filterFeaturesNotInVersion(item)">
                      <v-tooltip location="bottom">
                        <template v-slot:activator="{ props }">
                          <div v-bind="props">Filter not included features</div>
                        </template>
                        <span>Filter features that are not in this version</span>
                      </v-tooltip>
                    </v-list-item>

                    <!-- Fix by rollback button -->
                    <v-list-item @click="rollbackFixVersion(item)" v-if="item.selectable.selectionState === SelectionState.ImplicitlyDeselected">
                      <v-tooltip location="bottom">
                        <template v-slot:activator="{ props }">
                          <div v-bind="props">Rollback Fix</div>
                        </template>
                        <span>Rollback all steps in the configuration history until this implicit decision was made</span>
                      </v-tooltip>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
            </v-data-table>
          </v-card>
        </v-col>

        <!-- Features -->
        <v-col cols="4">
          <v-card>
            <v-card-title>
              <v-layout row class="align-center">
                <!-- Heading features -->
                <div class="mr-2">
                  <span v-if="features?.length === featureModel.features?.length">Features ({{ featureModel.features?.length }}) </span>
                  <span v-else>Features ({{ features?.length }}/{{ featureModel.features?.length }}) </span>
                </div>

                <!-- Statistics about the features as tooltip-->
                <v-tooltip location="bottom">
                  <template v-slot:activator="{ props }">
                    <v-icon v-bind="props">mdi-information</v-icon>
                  </template>
                  <table>
                    <tr>
                      <th>Selection</th>
                      <th v-if="versionForFilteringFeatures">Filtered</th>
                      <th>All</th>
                    </tr>
                    <tr>
                      <td>All</td>
                      <td v-if="versionForFilteringFeatures">{{ features?.length }}</td>
                      <td>{{ featureModel.features?.length }}</td>
                    </tr>
                    <tr>
                      <td>Unselected</td>
                      <td v-if="versionForFilteringFeatures">{{
                          countSelectionStateInList(features, SelectionState.Unselected)
                        }}
                      </td>
                      <td>{{ countSelectionStateInList(featureModel.features, SelectionState.Unselected) }}</td>
                    </tr>
                    <tr>
                      <td>Explicitly selected</td>
                      <td v-if="versionForFilteringFeatures">
                        {{ countSelectionStateInList(features, SelectionState.ExplicitlySelected) }}
                      </td>
                      <td>{{ countSelectionStateInList(featureModel.features, SelectionState.ExplicitlySelected) }}</td>
                    </tr>
                    <tr>
                      <td>Explicitly deselected</td>
                      <td v-if="versionForFilteringFeatures">
                        {{ countSelectionStateInList(features, SelectionState.ExplicitlyDeselected) }}
                      </td>
                      <td>{{ countSelectionStateInList(featureModel.features, SelectionState.ExplicitlyDeselected) }}</td>
                    </tr>
                    <tr>
                      <td>Implicitly selected</td>
                      <td v-if="versionForFilteringFeatures">
                        {{ countSelectionStateInList(features, SelectionState.ImplicitlySelected) }}
                      </td>
                      <td>{{ countSelectionStateInList(featureModel.features, SelectionState.ImplicitlySelected) }}</td>
                    </tr>
                    <tr>
                      <td>Implicitly deselected</td>
                      <td v-if="versionForFilteringFeatures">
                        {{ countSelectionStateInList(features, SelectionState.ImplicitlyDeselected) }}
                      </td>
                      <td>{{ countSelectionStateInList(featureModel.features, SelectionState.ImplicitlyDeselected) }}</td>
                    </tr>
                  </table>
                </v-tooltip>

                <!-- Search box for features -->
                <v-text-field
                    v-model="searchFeatures"
                    append-inner-icon="mdi-magnify"
                    label="Search"
                    :clearable=true
                    single-line
                    hide-details
                    class="mr-2 ml-2"
                ></v-text-field>
              </v-layout>
            </v-card-title>

            <!-- Optional information when filtered by features initiated from on single version -->
            <v-card-subtitle v-if="versionForFilteringFeatures">
              Filtered by version {{ versionForFilteringFeatures.version }}
              {{ features?.length }}
            </v-card-subtitle>


            <!-- Table with all features that are currently fitlered and searched -->
            <v-data-table
                :headers="headersFeatures"
                :search="searchFeatures"
                :items="features"
                item-key="name"
                show-group-by
                fixed-header
                height="40vh"
                single-select
                disable-pagination
                hide-default-footer
            >
              <!-- Customization of the column NAME -->
              <template v-slot:item.name="{ item }">
                <v-tooltip location="bottom">
                  <template v-slot:activator="{ props }">
                    <span v-bind="props">{{ item.selectable.name }}</span>
                  </template>
                  <span>Var ID: {{ item.selectable.id }}</span>
                </v-tooltip>
              </template>

              <!-- Customization of the column SELECTIONSTATE -->
              <template v-slot:item.selectionState="{ item }">
                <DoubleCheckbox v-bind:selection-item="item.selectable" @select="(selection) => decisionPropagation(item.selectable, selection)"></DoubleCheckbox>
              </template>

              <!-- Customization of the column ACTIONS -->
              <template v-slot:item.actions="{ item }">
                <!-- Context menu -->
                <v-menu offset-y
                        v-if="!item.selectable.fix && (item.selectable.selectionState === SelectionState.ImplicitlyDeselected || item.selectable.selectionState === SelectionState.ImplicitlySelected)">
                  <template v-slot:activator="{ props }">
                    <v-btn icon rounded outlined v-bind="props">
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>

                  <v-list>
                    <!-- Fix feature by rollback button -->
                    <v-list-item @click="rollbackFixFeature(item.selectable)">
                      <v-tooltip bottom>
                        <template v-slot:activator="{ props }">
                          <div v-bind="props">Rollback Fix</div>
                        </template>
                        <span>Rollback all steps in the configuration history until this implicit decision was made</span>
                      </v-tooltip>
                    </v-list-item>

                    <!-- Fix feature by quick fix button -->
                    <v-list-item @click="quickFixFeature(item.selectable)">
                      <v-tooltip bottom>
                        <template v-slot:activator="{ props }">
                          <div v-bind="props">Quick Fix</div>
                        </template>
                        <span>Reselects the current config (versions and features) to allow a reselection of this feature</span>
                      </v-tooltip>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
            </v-data-table>
          </v-card>
        </v-col>

        <!-- Third column (#SAT, Explanations, Configuration history) -->
        <v-col cols="4">
          <!-- #SAT -->
          <v-card>
            <v-card-title>{{ featureModel.satCount }}</v-card-title>
            <v-card-subtitle>Number of possible configurations</v-card-subtitle>
            <v-card-actions>

              <!-- Reset config button -->
              <v-tooltip bottom>
                <template v-slot:activator="{ props }">
                  <v-btn
                      rounded
                      outlined
                      v-bind="props"
                      @click="resetCommand">
                    Reset Config
                  </v-btn>
                </template>
                <span>Reset all configuration steps and start with an empty selection. This step can be undone.</span>
              </v-tooltip>

              <!-- Undo button -->
              <v-tooltip bottom>
                <template v-slot:activator="{ props }">
                  <v-btn
                      icon
                      outlined
                      rounded
                      v-bind="props"
                      class="mx-2"
                      :disabled="!commandManager.isUndoAvailable()"
                      @click="commandManager.undo()">
                    <v-icon>mdi-undo</v-icon>
                  </v-btn>
                </template>
                <span>Undo last configuration step</span>
              </v-tooltip>

              <!-- Redo button -->
              <v-tooltip bottom>
                <template v-slot:activator="{ props }">
                  <v-btn
                      icon
                      outlined
                      rounded
                      v-bind="props"
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
          <v-card style="margin-top:1vh;" height="38vh">
            <v-card-title>
              <v-tabs v-model="tabsColumnTopRight">
                <v-tab key="explanations">Explanations</v-tab>
                <v-tab key="configurationHistory">Configuration history</v-tab>
              </v-tabs>
            </v-card-title>

            <v-card-text>
              <v-window v-model="tabsColumnTopRight" class="mt-2">

                <!-- Explanations tab -->
                <v-window-item key="explanations" style="height: 25vh;">
                  <div>
                    <!-- Reason 1 -->
                    <div class="text-h6" v-if="selectedVersion?.selectionState === SelectionState.ImplicitlySelected">
                      {{ selectedVersion.selectionStateDescription }}
                    </div>

                    <!-- Reason 2 -->
                    <div class="text-h6" v-if="conflictingCTCsOfSelectedVersion">
                      Conflicting Cross-Tree-Constraints
                      <v-btn icon outlined rounded @click="tabsBottom = 'ctc'">
                        <v-icon>mdi-arrow-top-right</v-icon>
                      </v-btn>
                    </div>

                    <!-- Reason 3 -->
                    <div v-if="missingFeaturesOfSelectedVersion?.length !== 0">
                      <div class="text-h6">These features are selected but are missing in the selected version</div>
                      <v-list lines="one">
                        <v-table>
                          <template v-slot:default>
                            <tbody>
                            <tr
                                v-for="item in missingFeaturesOfSelectedVersion"
                                :key="item.name"
                            >
                              <td>{{ item.name }}</td>
                            </tr>
                            </tbody>
                          </template>
                        </v-table>
                      </v-list>
                    </div>
                  </div>
                </v-window-item>

                <!-- Configuration history tab -->
                <v-window-item key="configurationHistory">
                  <v-data-table
                      :headers="[{title: 'Description', key: 'description'}, {title: '# Possible configs', key: 'newSatCount'}]"
                      :items="commandManager.commands"
                      single-select
                      class="elevation-1"
                      @click:row="redoCommand"
                      :item-class="command => command.marked ? 'active-command clickable' : 'clickable'"
                      disable-sort
                      disable-filtering
                      fixed-header
                      height="25vh"
                      disable-pagination
                      hide-default-footer
                  >
                  </v-data-table>
                </v-window-item>
              </v-window>
            </v-card-text>
          </v-card>

        </v-col>
      </v-row>

      <!-- Feature model viewer, Tree view and CTC-Viewer -->
      <v-row>
        <v-col>
          <!-- Details of the selected version -->
          <v-card height="47vh">
            <v-card-title>Details for version: {{ selectedVersion?.version }}</v-card-title>

            <!-- Tabs to select (Feature Model Viewer, List Tree, Cross-Tree Constraints -->
            <v-tabs v-model="tabsBottom">
              <v-tab key="featureModelViewer">Feature Model Viewer</v-tab>
              <v-tab key="listTree">List Tree</v-tab>
              <v-tab key="ctc">Cross Tree Constraints</v-tab>
            </v-tabs>

            <v-card-text v-if="selectedVersion?.root">
              <v-window v-model="tabsBottom">

                <!-- Feature Model Viewer -->
                <v-window-item key="featureModelViewer">
                  <feature-model-viewer :version="selectedVersion"></feature-model-viewer>
                </v-window-item>

                <!-- List Tree -->
                <v-window-item key="listTree">

                  <v-container class="fill-height">
                    <v-layout column class="fill-height">
                      <div class="flex overflow-auto">
                        Not implemented yet. Waiting for V-TreeView.
                        <!-- <v-treeview
                            style="height: 35vh;"
                            :items="[selectedVersion.root]"
                            selection-type="independent">
                          <template v-slot:prepend="{ item }">
                            <DoubleCheckbox :selection-item="item.feature"
                                            @select="decisionPropagation(item.feature, $event)"></DoubleCheckbox>
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
                        </v-treeview> -->
                      </div>
                    </v-layout>
                  </v-container>

                </v-window-item>

                <!-- Cross-Tree Constraint Viewer -->
                <v-window-item key="ctc">

                  <!-- Filter only the invalid ctcs and reset them to default -->
                  <v-btn rounded outlined @click="filteredConstraints = allConstraints.filter(c => c.evaluation === false)" class="mx-2">Only invalid </v-btn>
                  <v-btn rounded outlined @click="filteredConstraints = allConstraints">Reset</v-btn>

                  <!-- Table with all ctcs -->
                  <v-data-table
                      height="32vh"
                      :items="filteredConstraints"
                      show-group-by
                      :footer-props="{'items-per-page-options': [10, 20, 50, 100, 200]}"
                      :headers="[{title: 'Valid', value: 'evaluation', key: 'evaluation'}, {title: 'Constraints', key: 'formula', value: 'formula', groupable: false}, {title: 'Actions', key: 'actions', value: 'actions', groupable: false}]"
                      :sort-by="[{key: 'evaluation', ord: 'desc'}]"
                  >

                    <!-- Customization of the column FORMULA -->
                    <template v-slot:item.formula="{ item }">
                      <div v-for="(f, i) in item.selectable.formula" :key="i" style="display: inline;">
                        <v-chip
                            class="ml-2 mr-2"
                            v-if="f instanceof FeatureNodeConstraintItem"
                            :color="getColorOfConstraintItem(f)"
                            @click="searchFeatures = f.featureNode.name"
                        >
                          {{ f.featureNode.name }}
                        </v-chip>
                        <span v-else>{{ f }}</span>
                      </div>
                    </template>

                    <!-- Customization of the column EVALUATION -->
                    <template v-slot:item.evaluation="{ item }">
                      <v-avatar size="30"
                                :color="evaluateCTC(item.selectable)"></v-avatar>
                    </template>

                    <!-- Customization of the column ACTIONS -->
                    <template v-slot:item.actions="{ item }">
                      <!-- Context menu -->
                      <v-menu offset-y
                              v-if="item.selectable.evaluation === false">
                        <template v-slot:activator="{ props }">
                          <v-btn icon rounded outlined v-bind="props" >
                            <v-icon>mdi-dots-vertical</v-icon>
                          </v-btn>
                        </template>

                        <v-list>
                          <!-- Fix ctc by rollback button -->
                          <v-list-item @click="rollbackFixCTC(item.selectable)">
                            <v-tooltip location="bottom">
                              <template v-slot:activator="{ props }">
                                <div v-bind="props">Rollback Fix</div>
                              </template>
                              <span>Rollback all steps in the configuration history until this cross-tree constraint is valid or not invalid</span>
                            </v-tooltip>
                          </v-list-item>

                          <!-- Fix ctc by quick fix button -->
                          <v-list-item @click="quickFixCTC(item.selectable)">
                            <v-tooltip location="bottom">
                              <template v-slot:activator="{ props }">
                                <div v-bind="props">Quick Fix</div>
                              </template>
                              <span>Reselects the current config (versions and features) until this cross-tree constraint is valid</span>
                            </v-tooltip>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </template>

                  </v-data-table>

                </v-window-item>
              </v-window>

            </v-card-text>
          </v-card>

        </v-col>
      </v-row>

    </v-container>

  </div>
</template>

<script>
import DoubleCheckbox from '@/components/Configurator/DoubleCheckbox.vue';
import FeatureModelViewer from '@/components/Configurator/FeatureModelViewer.vue';
import { ConfiguratorManager } from '@/classes/Configurator/ConfiguratorManager';
import { FeatureModel } from '@/classes/Configurator/FeatureModel';
import api from "@/services/api.service";
import {QuickFixFeatureCommand} from "@/classes/Commands/Configurator/QuickFixFeatureCommand";
import {QuickFixCTCCommand} from "@/classes/Commands/Configurator/QuickFixCTCCommand";
import {RollbackFixFeatureCommand} from "@/classes/Commands/Configurator/RollbackFixFeatureCommand";
import {RollbackFixVersionCommand} from "@/classes/Commands/Configurator/RollbackFixVersionCommand";
import {RollbackFixCTCCommand} from "@/classes/Commands/Configurator/RollbackFixCTCCommand";
import { ResetCommand } from '@/classes/Commands/Configurator/ResetCommand';
import { DecisionPropagationCommand } from '@/classes/Commands/Configurator/DecisionPropagationCommand';
import { Feature } from '@/classes/Configurator/Feature';
import { FeatureNodeConstraintItem } from '@/classes/Constraint/FeatureNodeConstraintItem';
import { SelectionState } from '@/classes/Configurator/SelectionState';
import { tr } from 'vuetify/locale';

export default {
  name: 'FeatureModelConfiguration',

  components: {DoubleCheckbox, FeatureModelViewer},

  data: () => ({
    headersVersions: [
        {title: 'Selection', align:'start', key: 'selectionState', width: '10%'},
        {title: 'Version', key: 'version', groupable:false},
        {title: 'Actions', key: 'actions'}],
    headersFeatures: [
        {title: 'Selection', key: 'selectionState', width: '10%'},
        {title: 'Name', key: 'name', groupable: false},
        {title: 'Actions', groupable: false, key: 'actions'}
    ],
    commandManager: new ConfiguratorManager(),
    initialResetCommand: undefined,
    featureModel: FeatureModel,
    features: undefined,
    selectedVersion: undefined,
    filteredConstraints: undefined,
    allConstraints: undefined,
    searchFeatures: "",
    searchVersions: "",
    tabsColumnTopRight: undefined,
    tabsBottom: undefined,
    versionForFilteringFeatures: undefined,
  }),

  props: {
    productLineName: undefined
  },

  created() {
    this.initData();
  },

  methods: {
    initData() {
      api.get(`${import.meta.env.VITE_APP_DOMAIN}configurator/mappings/${this.productLineName}`)
          .then((mappings) => {
            this.featureModel = FeatureModel.create(mappings.data["root-mapping"], mappings.data["feature-mapping"]);
            this.featureModel.productLineName = this.productLineName;

            this.features = this.featureModel.features;

            this.featureModel.loadXmlData(this.featureModel.versions[0]);
            this.selectedVersion = this.featureModel.versions[0];
            this.initialResetCommand = new ResetCommand(this.featureModel);
            this.initialResetCommand.execute();
            this.featureModel.loadXmlData(this.selectedVersion).then(() => {
            this.allConstraints = this.selectedVersion.constraints.map((e) => ({
              constraint: e,
              formula: e.toList(),
              evaluation: e.evaluate()
            }));
            this.filteredConstraints = this.allConstraints;
            this.featureModel.loading = false;
          });

          })
          .catch(() => {
          });
    },

    quickFixCTC(item) {
      const pc = item.constraint.quickFix(true);

      const command = new QuickFixCTCCommand(this.featureModel, pc);
      this.commandManager.execute(command);
    },

    quickFixFeature(feature) {
      const command = new QuickFixFeatureCommand(this.featureModel, feature);
      this.commandManager.execute(command);
    },

    rollbackFixFeature(feature) {
      const command = new RollbackFixFeatureCommand(this.featureModel, this.commandManager, feature, this.initialResetCommand);
      this.commandManager.execute(command);
    },

    rollbackFixVersion(version) {
      const command = new RollbackFixVersionCommand(this.featureModel, this.commandManager, version, this.initialResetCommand);
      this.commandManager.execute(command);
    },

    rollbackFixCTC(item) {
      const constraint = item.constraint;

      const command = new RollbackFixCTCCommand(this.featureModel, this.commandManager, constraint, this.initialResetCommand);
      this.commandManager.execute(command);
    },

    filterFeaturesInVersion(version) {
      this.versionForFilteringFeatures = version;
      this.features = version.features;
    },

    filterFeaturesNotInVersion(version) {
      this.features = this.featureModel.features.filter(f => !version.features.includes(f))
    },

    selectVersion(event, row) {
      let version = row.item.selectable;
      this.featureModel.loading = true;
      this.featureModel.loadXmlData(version).then(() => {
        this.selectedVersion = version;
        this.allConstraints = this.selectedVersion.constraints.map((e) => ({
          constraint: e,
          formula: e.toList(),
          evaluation: e.evaluate()
        }))
        this.filteredConstraints = this.allConstraints;
        this.featureModel.loading = false;
      });
    },

    redoCommand(event, row) {
      let command = row.item.selectable;
      this.commandManager.redoCommand(command)
    },

    resetFeaturesTable() {
      this.searchFeatures = "";
      this.features = this.featureModel.features;
      this.versionForFilteringFeatures = undefined;
    },

    decisionPropagation(item, selectionState) {
      const command = new DecisionPropagationCommand(this.featureModel, item, selectionState);
      this.commandManager.execute(command);
    },

    resetCommand() {
      this.commandManager.execute(this.initialResetCommand.copy());
    },

    countSelectionStateInList(list, selectionState) {
      if (list) {
        return list.filter(x => x.selectionState === selectionState).length;
      } else {
        return 0;
      }
    },

    getColorOfConstraintItem(featureNodeConstraintItem) {
      const e = featureNodeConstraintItem.evaluate()
      if (e === undefined) {
        return undefined;
      } else if (e) {
        return 'green';
      } else {
        return 'red';
      }
    },

    evaluateCTC(item) {
      const evaluation = item.constraint.evaluate();
      return evaluation ? 'green' : (evaluation === undefined ? '' : 'red')
    }
  },

  computed: {
    tr() {
      return tr
    },
    Feature() {
      return Feature
    },

    FeatureNodeConstraintItem() {
      return FeatureNodeConstraintItem
    },

    SelectionState() {
      return SelectionState
    },

    missingFeaturesOfSelectedVersion() {
      if (!this.featureModel || !this.selectedVersion || !this.selectedVersion.root) {
        return [];
      }

      return this.featureModel.features
          .filter(f => f.selectionState === SelectionState.ExplicitlySelected || f.selectionState === SelectionState.ImplicitlySelected)
          .filter(f => !this.selectedVersion.features.includes(f));
    },

    conflictingCTCsOfSelectedVersion() {
      if (!this.featureModel || !this.selectedVersion || !this.selectedVersion.root) {
        return [];
      }

      return this.selectedVersion.constraints.some(c => c.evaluate() === false)
    }
  },

}
</script>


<style lang="scss">
.active-command {
  background-color: var(--v-accent-base);
  color: black;
}

.selected-version {
  background-color: var(--v-accent-base);
  color: black;
}

.clickable {
  cursor: pointer;
}
</style>
