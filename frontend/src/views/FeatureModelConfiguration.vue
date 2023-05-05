<template>
  <div class="">

    <v-container fluid>
      <v-row>

        <!-- Left column -->
        <v-col cols="2">
          <v-card>
            <v-card-title>#SAT</v-card-title>
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
            <v-card-title>Command History</v-card-title>
            <v-data-table
                :headers="headersCommands"
                :items="commandManager.commands"
                single-select
                class="elevation-1"
                @click:row="command => commandManager.redoCommand(command)"
                :item-class="command => command.marked ? 'active-command clickable' : 'clickable'"
                disable-sort
                disable-filtering
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
                      :headers="headersVersions"
                      :items="featureModel.versions"
                      item-key="version"
                      show-select
                      single-select
                      class="elevation-1"
                      :item-class="v => v === selectedVersion ? 'selected-version clickable' : 'clickable'"
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
                </v-card>
              </v-col>

              <!-- All features -->
              <v-col cols="4">
                <v-card>
                  <v-card-title>
                    All Features
                    <v-spacer></v-spacer>
                    <v-text-field
                        v-model="searchAllFeatures"
                        append-icon="mdi-magnify"
                        label="Search"
                        single-line
                        hide-details
                    ></v-text-field>
                  </v-card-title>
                  <v-data-table
                      :headers="headersFeatures"
                      :search="searchAllFeatures"
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
                </v-card>
              </v-col>

              <!-- Tree hierarchy table for one selected version -->
              <v-col cols="4">
                <v-card>
                  <v-card-title>Explanations</v-card-title>
                </v-card>
              </v-col>
            </v-row>

            <!-- feature model viewer -->
            <v-row>
              <v-col>
                <v-card>
                  <v-card-title>Version {{ selectedVersion.version }}</v-card-title>
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
                    <v-data-table
                        :headers="headersConstraints"
                        :items="tableConstraints"
                        hide-default-header
                    >
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
import {xmlVersions, features} from "@/classes/Configurator/example";
import {Version} from "@/classes/Configurator/Version";
import FeatureModelViewer from "@/components/Configurator/FeatureModelViewer.vue";
import {CommandManager} from "@/classes/Commands/CommandManager";
import {SelectionCommand} from "@/classes/Commands/Configurator/SelectionCommand";
import {ResetCommand} from "@/classes/Commands/Configurator/ResetCommand";
import {SelectionState} from "@/classes/Configurator/SelectionState";


export default Vue.extend({
  name: 'FeatureModelConfiguration',
  components: {FeatureModelViewer},

  data: () => ({
    commandManager: new CommandManager(),
    resetCommand: undefined,
    featureModel: FeatureModel,
    headersVersions: [{text: 'Version', value: 'version'}, {text: 'RootId', value: 'id'}],
    headersFeatures: [{text: 'All features', value: 'name'}, {text: 'Id', value: 'id'}],
    headersCommands: [{text: 'Command', value: 'featureOrVersion.id'}, {text: '#SAT', value: 'newSatCount'}],
    headersConstraints: [{text: 'Constraints', value: 'formula'}],
    selectedVersion: Version,
    searchAllFeatures: "",
    searchVersions: "",
    tab: undefined,
  }),

  created() {
    this.initData();
  },

  methods: {
    initData() {
      this.featureModel = FeatureModel.create(xmlVersions, features);
      this.selectedVersion = this.featureModel.versions[0];
      this.resetCommand = new ResetCommand(this.featureModel);
      this.resetCommand.execute()
    },

    select(item, selectionState) {
      const command = new SelectionCommand(this.featureModel, item, selectionState);
      this.commandManager.execute(command);
    },

    reset() {
      const command = this.resetCommand.copy();
      this.commandManager.execute(command);
    }
  },

  computed: {
    SelectionState() {
      return SelectionState
    },

    tableConstraints() {
      return this.selectedVersion.constraints.map((e) => ({
        constraint: e,
        formula: e.toString(),
        checked: false,
      }));
    },
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
