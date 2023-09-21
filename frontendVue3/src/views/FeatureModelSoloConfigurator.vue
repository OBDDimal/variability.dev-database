<template>
  <v-container :fluid='true'>

    <!-- First row with the three columns: Versions, Features, Third Column (#SAT, Explanations, Configuration history) -->
    <v-row>
      <v-col cols='4'>
        <v-card height='89.5vh'>
          <v-card-title>
            <v-layout class='align-center' row>
              <!-- Heading features -->
              <div class='mr-2'>
                <span>Features ({{ featureModelSolo.features?.length }}) </span>
              </div>

              <!-- Statistics about the features as tooltip-->
              <v-tooltip location='bottom'>
                <template v-slot:activator='{ props }'>
                  <v-icon v-bind='props'>mdi-information</v-icon>
                </template>
                <table>
                  <tr>
                    <th>Selection</th>
                    <th>All</th>
                  </tr>
                  <tr>
                    <td>All</td>
                    <td>{{ featureModelSolo.features?.length }}</td>
                  </tr>
                  <tr>
                    <td>Unselected</td>
                    <td>{{ countSelectionStateInList(featureModelSolo.features, SelectionState.Unselected) }}</td>
                  </tr>
                  <tr>
                    <td>Explicitly selected</td>
                    <td>{{ countSelectionStateInList(featureModelSolo.features, SelectionState.ExplicitlySelected) }}</td>
                  </tr>
                  <tr>
                    <td>Explicitly deselected</td>
                    <td>{{ countSelectionStateInList(featureModelSolo.features, SelectionState.ExplicitlyDeselected) }}</td>
                  </tr>
                  <tr>
                    <td>Implicitly selected</td>
                    <td>{{ countSelectionStateInList(featureModelSolo.features, SelectionState.ImplicitlySelected) }}</td>
                  </tr>
                  <tr>
                    <td>Implicitly deselected</td>
                    <td>{{ countSelectionStateInList(featureModelSolo.features, SelectionState.ImplicitlyDeselected) }}</td>
                  </tr>
                </table>
              </v-tooltip>
            </v-layout>
          </v-card-title>

          <!-- Tabs to select (Feature Model Viewer, List Tree, Cross-Tree Constraints -->
          <v-tabs v-model='tabsFirstColumn'>
            <v-tab key='dataTable'>Data Table</v-tab>
            <v-tab key='treeView'>Tree View</v-tab>
          </v-tabs>
          <!-- Search box for features -->
          <v-text-field
            v-model='searchFeatures'
            :clearable=true
            append-inner-icon='mdi-magnify'
            class='mr-2 ml-2'
            hide-details
            label='Search'
            single-line
          ></v-text-field>
          <v-window v-model='tabsFirstColumn'>

            <!-- Feature Model Viewer -->
            <v-window-item key='dataTable'>


              <!-- Table with all features that are currently fitlered and searched -->
              <v-data-table
                :headers='headersFeatures'
                :items='features'
                :search='searchFeatures'
                disable-pagination
                fixed-header
                height='68vh'
                hide-default-footer
                item-key='name'
                show-group-by
                single-select
              >
                <!-- Customization of the column NAME -->
                <template v-slot:item.name='{ item }'>
                  <v-tooltip location='bottom'>
                    <template v-slot:activator='{ props }'>
                      <span v-bind='props'>{{ item.selectable.name }}</span>
                    </template>
                    <span>Var ID: {{ item.selectable.id }}</span>
                  </v-tooltip>
                </template>

                <!-- Customization of the column SELECTIONSTATE -->
                <template v-slot:item.selectionState='{ item }'>
                  <DoubleCheckbox v-bind:selection-item='item.selectable'
                                  @select='(selection) => decisionPropagation(item.selectable, selection)'></DoubleCheckbox>
                </template>

                <!-- Customization of the column ACTIONS -->
                <template v-slot:item.actions='{ item }'>
                  <!-- Context menu -->
                  <v-menu
                    v-if='!item.selectable.fix && (item.selectable.selectionState === SelectionState.ImplicitlyDeselected || item.selectable.selectionState === SelectionState.ImplicitlySelected)'
                    offset-y>
                    <template v-slot:activator='{ props }'>
                      <v-btn icon outlined rounded v-bind='props'>
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>

                    <v-list>
                      <!-- Fix feature by rollback button -->
                      <v-list-item @click='rollbackFixFeature(item.selectable)'>
                        <v-tooltip bottom>
                          <template v-slot:activator='{ props }'>
                            <div v-bind='props'>Rollback Fix</div>
                          </template>
                          <span>Rollback all steps in the configuration history until this implicit decision was made</span>
                        </v-tooltip>
                      </v-list-item>

                      <!-- Fix feature by quick fix button -->
                      <v-list-item @click='quickFixFeature(item.selectable)'>
                        <v-tooltip bottom>
                          <template v-slot:activator='{ props }'>
                            <div v-bind='props'>Quick Fix</div>
                          </template>
                          <span>Reselects the current config (versions and features) to allow a reselection of this feature</span>
                        </v-tooltip>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>
              </v-data-table>
            </v-window-item>
            <v-window-item key='treeView'>
              Not Implemented yet. Waiting for V-TreeView Component
            </v-window-item>
          </v-window>

        </v-card>
      </v-col>

      <v-col cols='5'>
        <!-- Details of the selected version -->
        <v-card height='89.5vh'>
          <v-card-title>Details for {{featureModelName}}:</v-card-title>

          <!-- Tabs to select (Feature Model Viewer, List Tree, Cross-Tree Constraints -->
          <v-tabs v-model='tabsSecondColumn'>
            <v-tab key='featureModelViewer'>Feature Model Viewer</v-tab>
            <v-tab key='ctc'>Cross Tree Constraints</v-tab>
          </v-tabs>

          <v-card-text v-if='featureModelSolo?.root'>
            <v-window v-model='tabsSecondColumn'>

              <!-- Feature Model Viewer -->
              <v-window-item key='featureModelViewer'>
                <feature-model-viewer-solo :feature-model='featureModelSolo'></feature-model-viewer-solo>
              </v-window-item>

              <!-- Cross-Tree Constraint Viewer -->
              <v-window-item key='ctc'>

                <!-- Filter only the invalid ctcs and reset them to default -->
                <v-btn class='mx-2' outlined
                       rounded @click='filteredConstraints = allConstraints.filter(c => c.evaluation === false)'>
                  Only invalid
                </v-btn>
                <v-btn outlined rounded @click='filteredConstraints = allConstraints'>Reset</v-btn>

                <!-- Table with all ctcs -->
                <v-data-table
                  :footer-props="{'items-per-page-options': [10, 20, 50, 100, 200]}"
                  :headers="[{title: 'Valid', value: 'evaluation', key: 'evaluation'}, {title: 'Constraints', key: 'formula', value: 'formula', groupable: false}, {title: 'Actions', key: 'actions', value: 'actions', groupable: false}]"
                  :items='filteredConstraints'
                  :sort-by="[{key: 'evaluation', ord: 'desc'}]"
                  height='68vh'
                  show-group-by
                >

                  <!-- Customization of the column FORMULA -->
                  <template v-slot:item.formula='{ item }'>
                    <div v-for='(f, i) in item.selectable.formula' :key='i' style='display: inline;'>
                      <v-chip
                        v-if='f instanceof FeatureNodeConstraintItem'
                        :color='getColorOfConstraintItem(f)'
                        class='ml-2 mr-2'
                        @click='searchFeatures = f.featureNode.name'
                      >
                        {{ f.featureNode.name }}
                      </v-chip>
                      <span v-else>{{ f }}</span>
                    </div>
                  </template>

                  <!-- Customization of the column EVALUATION -->
                  <template v-slot:item.evaluation='{ item }'>
                    <v-avatar :color='evaluateCTC(item.selectable)'
                              size='30'></v-avatar>
                  </template>

                  <!-- Customization of the column ACTIONS -->
                  <template v-slot:item.actions='{ item }'>
                    <!-- Context menu -->
                    <v-menu v-if='item.selectable.evaluation === false'
                            offset-y>
                      <template v-slot:activator='{ props }'>
                        <v-btn icon outlined rounded v-bind='props'>
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>

                      <v-list>
                        <!-- Fix ctc by rollback button -->
                        <v-list-item @click='rollbackFixCTC(item.selectable)'>
                          <v-tooltip location='bottom'>
                            <template v-slot:activator='{ props }'>
                              <div v-bind='props'>Rollback Fix</div>
                            </template>
                            <span>Rollback all steps in the configuration history until this cross-tree constraint is valid or not invalid</span>
                          </v-tooltip>
                        </v-list-item>

                        <!-- Fix ctc by quick fix button -->
                        <v-list-item @click='quickFixCTC(item.selectable)'>
                          <v-tooltip location='bottom'>
                            <template v-slot:activator='{ props }'>
                              <div v-bind='props'>Quick Fix</div>
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
      <!-- Third column (#SAT, Explanations, Configuration history) -->
      <v-col cols='3'>
        <!-- #SAT -->
        <v-card height='21vh'>
          <v-card-title>{{ featureModelSolo.satCount }}</v-card-title>
          <v-card-subtitle>Number of possible configurations</v-card-subtitle>
          <v-card-actions>

            <!-- Reset config button -->
            <v-tooltip bottom>
              <template v-slot:activator='{ props }'>
                <v-btn
                  outlined
                  rounded
                  v-bind='props'
                  @click='resetCommand'>
                  Reset Config
                </v-btn>
              </template>
              <span>Reset all configuration steps and start with an empty selection. This step can be undone.</span>
            </v-tooltip>

            <!-- Undo button -->
            <v-tooltip bottom>
              <template v-slot:activator='{ props }'>
                <v-btn
                  :disabled='!commandManager.isUndoAvailable()'
                  class='mx-2'
                  icon
                  outlined
                  rounded
                  v-bind='props'
                  @click='commandManager.undo()'>
                  <v-icon>mdi-undo</v-icon>
                </v-btn>
              </template>
              <span>Undo last configuration step</span>
            </v-tooltip>

            <!-- Redo button -->
            <v-tooltip bottom>
              <template v-slot:activator='{ props }'>
                <v-btn
                  :disabled='!commandManager.isRedoAvailable()'
                  icon
                  outlined
                  rounded
                  v-bind='props'
                  @click='commandManager.redo()'>
                  <v-icon>mdi-redo</v-icon>
                </v-btn>
              </template>
              <span>Redo last undone configuration step</span>
            </v-tooltip>

          </v-card-actions>
          <v-layout class='align-center justify-center' row>
            <v-btn class='ma-2' @click='openFileDialog'>
              Open
            </v-btn>
            <v-btn class='ma-2'>
              Save
            </v-btn>
          </v-layout>
        </v-card>

        <!-- Explanations and configuration history -->
        <v-card height='67.5vh' style='margin-top:1vh;'>
          <v-card-title>
            <v-tabs v-model='tabsColumnTopRight'>
              <v-tab key='explanations'>Explanations</v-tab>
              <v-tab key='configurationHistory'>Configuration history</v-tab>
            </v-tabs>
          </v-card-title>

          <v-card-text>
            <v-window v-model='tabsColumnTopRight' class='mt-2'>

              <!-- Explanations tab -->
              <v-window-item key='explanations' style='height: 25vh;'>
                <div>
                </div>
              </v-window-item>

              <!-- Configuration history tab -->
              <v-window-item key='configurationHistory'>
                <v-data-table
                  :headers="[{title: 'Description', key: 'description'}, {title: '# Possible configs', key: 'newSatCount'}]"
                  :item-class="command => command.marked ? 'active-command clickable' : 'clickable'"
                  :items='commandManager.commands'
                  class='elevation-1'
                  disable-filtering
                  disable-pagination
                  disable-sort
                  fixed-header
                  height='47vh'
                  hide-default-footer
                  single-select
                  @click:row='redoCommand'
                >
                </v-data-table>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>

      </v-col>
    </v-row>

  </v-container>

  <configurator-open-file-dialog
    :show='showOpenDialog'
    @close='showOpenDialog = false'
    @open='(file) => openFile(file)'
  >
  </configurator-open-file-dialog>

</template>

<script>
import DoubleCheckbox from '@/components/Configurator/DoubleCheckbox.vue';
import { ConfiguratorManager } from '@/classes/Configurator/ConfiguratorManager';
import { QuickFixCTCCommand } from '@/classes/Commands/Configurator/QuickFixCTCCommand';
import { QuickFixFeatureCommand } from '@/classes/Commands/Configurator/QuickFixFeatureCommand';
import { RollbackFixFeatureCommand } from '@/classes/Commands/Configurator/RollbackFixFeatureCommand';
import { RollbackFixVersionCommand } from '@/classes/Commands/Configurator/RollbackFixVersionCommand';
import { RollbackFixCTCCommand } from '@/classes/Commands/Configurator/RollbackFixCTCCommand';
import { DecisionPropagationCommand } from '@/classes/Commands/Configurator/DecisionPropagationCommand';
import { tr } from 'vuetify/locale';
import { Feature } from '@/classes/Configurator/Feature';
import { FeatureNodeConstraintItem } from '@/classes/Constraint/FeatureNodeConstraintItem';
import { SelectionState } from '@/classes/Configurator/SelectionState';
import ConfiguratorOpenFileDialog from '@/components/Configurator/ConfiguratorOpenFileDialog.vue';
import FeatureModelViewerSolo from '@/components/Configurator/FeatureModelViewerSolo.vue';
import { FeatureModelSolo } from '@/classes/Configurator/FeatureModelSolo';

export default {
  name: 'FeatureModelSoloConfigurator',
  components: { ConfiguratorOpenFileDialog, FeatureModelViewerSolo, DoubleCheckbox },

  data: () => ({
    headersVersions: [
      { title: 'Selection', align: 'start', key: 'selectionState', width: '10%' },
      { title: 'Version', key: 'version', groupable: false },
      { title: 'Actions', key: 'actions' }],
    headersFeatures: [
      { title: 'Selection', key: 'selectionState', width: '10%' },
      { title: 'Name', key: 'name', groupable: false },
      { title: 'Actions', groupable: false, key: 'actions' }
    ],
    commandManager: new ConfiguratorManager(),
    initialResetCommand: undefined,
    featureModelSolo: FeatureModelSolo,
    featureModelName: '',
    features: undefined,
    filteredConstraints: undefined,
    allConstraints: undefined,
    searchFeatures: '',
    tabsColumnTopRight: undefined,
    tabsFirstColumn: undefined,
    tabsSecondColumn: undefined,
    showOpenDialog: true
  }),

  props: {
    productLineName: undefined
  },

  created() {
    this.openFileDialog();
  },

  methods: {
    /*initData() {
      api.get(`${import.meta.env.VITE_APP_DOMAIN}configurator/mappings/${this.productLineName}`)
        .then((mappings) => {
          this.featureModel = FeatureModel.create(mappings.data['root-mapping'], mappings.data['feature-mapping']);
          this.featureModel.productLineName = this.productLineName;

          this.features = this.featureModel.features;

          this.featureModel.loadXmlData(this.featureModel.versions[2]);
          this.selectedVersion = this.featureModel.versions[2];
          this.initialResetCommand = new ResetCommand(this.featureModel);
          this.initialResetCommand.execute();
          this.featureModel.loading = true;
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
    },*/

    quickFixCTC(item) {
      const pc = item.constraint.quickFix(true);

      const command = new QuickFixCTCCommand(this.featureModelSolo, pc);
      this.commandManager.execute(command);
    },

    quickFixFeature(feature) {
      const command = new QuickFixFeatureCommand(this.featureModelSolo, feature);
      this.commandManager.execute(command);
    },

    rollbackFixFeature(feature) {
      const command = new RollbackFixFeatureCommand(this.featureModelSolo, this.commandManager, feature, this.initialResetCommand);
      this.commandManager.execute(command);
    },

    rollbackFixVersion(version) {
      const command = new RollbackFixVersionCommand(this.featureModelSolo, this.commandManager, version, this.initialResetCommand);
      this.commandManager.execute(command);
    },

    rollbackFixCTC(item) {
      const constraint = item.constraint;

      const command = new RollbackFixCTCCommand(this.featureModelSolo, this.commandManager, constraint, this.initialResetCommand);
      this.commandManager.execute(command);
    },

    filterFeaturesInVersion(version) {
      this.versionForFilteringFeatures = version;
      this.features = version.features;
    },

    filterFeaturesNotInVersion(version) {
      this.features = this.featureModelSolo.features.filter(f => !version.features.includes(f));
    },

    selectVersion(event, row) {
      let version = row.item.selectable;
      this.featureModelSolo.loading = true;
      this.featureModelSolo.loadXmlData(version).then(() => {
        this.selectedVersion = version;
        this.allConstraints = this.selectedVersion.constraints.map((e) => ({
          constraint: e,
          formula: e.toList(),
          evaluation: e.evaluate()
        }));
        this.filteredConstraints = this.allConstraints;
        this.featureModelSolo.loading = false;
      });
    },

    redoCommand(event, row) {
      let command = row.item.selectable;
      this.commandManager.redoCommand(command);
    },

    resetFeaturesTable() {
      this.searchFeatures = '';
      this.features = this.featureModelSolo.features;
      this.versionForFilteringFeatures = undefined;
    },

    decisionPropagation(item, selectionState) {
      const command = new DecisionPropagationCommand(this.featureModelSolo, item, selectionState);
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
      const e = featureNodeConstraintItem.evaluate();
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
      return evaluation ? 'green' : (evaluation === undefined ? '' : 'red');
    },

    openFileDialog() {
      this.showOpenDialog = true;
    },

    openFile(file) {
      let reader = new FileReader();
      reader.addEventListener('load', (event) => {
        this.featureModelSolo = FeatureModelSolo.loadXmlDataFromFile(event.target.result);
        this.features = this.featureModelSolo.features;
        this.featureModelName = file[0].name;
        this.allConstraints = this.featureModelSolo.constraints.map((e) => ({
          constraint: e,
          formula: e.toList(),
          evaluation: e.evaluate()
        }));
        this.filteredConstraints = this.allConstraints;
      });
      reader.readAsText(file[0]);
      this.showOpenDialog = false;
    }
  },

  computed: {
    tr() {
      return tr;
    },
    Feature() {
      return Feature;
    },

    FeatureNodeConstraintItem() {
      return FeatureNodeConstraintItem;
    },

    SelectionState() {
      return SelectionState;
    },

    missingFeaturesOfSelectedVersion() {
      if (!this.featureModelSolo || !this.featureModelSolo.root) {
        return [];
      }

      return this.featureModelSolo.features
        .filter(f => f.selectionState === SelectionState.ExplicitlySelected || f.selectionState === SelectionState.ImplicitlySelected)
        .filter(f => !this.featureModelSolo.features.includes(f));
    },

    conflictingCTCsOfSelectedVersion() {
      if (!this.featureModelSolo || this.featureModelSolo.root) {
        return [];
      }

      return this.featureModelSolo.constraints.some(c => c.evaluate() === false);
    }
  }
};
</script>

<style scoped>

</style>
