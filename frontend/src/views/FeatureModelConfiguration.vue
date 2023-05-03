<template>
  <div class="mainView">
    <v-data-table
        :headers="headersCommands"
        :items="commandManager.commands"
        single-select
        class="elevation-1"
        @click:row="command => commandManager.redoCommand(command)"
        :item-class="command => command.marked ? 'active-command' : ''"
    >
    </v-data-table>

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
          <p>{{featureModel.satCount}}</p>
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
import {CommandManager} from "@/classes/Commands/CommandManager";
import {SelectionCommand} from "@/classes/Commands/Configurator/SelectionCommand";



export default Vue.extend({
  name: 'FeatureModelConfiguration',
  components: {FeatureModelViewer},
  computed: {
    SelectionState() {
      return SelectionState
    }
  },

  data: () => ({
    commandManager: new CommandManager(),
    featureModel: FeatureModel,
    headersVersions: [{text: 'Version', value: 'version'}, {text: 'RootId', value: 'id'}],
    headersFeatures: [{text: 'All features', value: 'name'}, {text: 'Id', value: 'id'}],
    headersCommands: [{text: 'Command', value: 'featureOrVersion.id'}, {text: 'SAT count', value: 'newSatCount'}],
    selectedVersion: Version,
  }),

  created() {
    this.initData();
  },

  methods: {
    initData() {
      this.featureModel = FeatureModel.create(xmlVersions, features);
      this.selectedVersion = this.featureModel.versions[0];
    },

    select(item, selectionState) {
      console.log("Select")
      let command = new SelectionCommand(this.featureModel, item, selectionState);
      this.commandManager.execute(command);
    }
  },


});
</script>

<style lang="scss">
.active-command {
  background-color: lightgoldenrodyellow;
  color: black;
}
</style>
