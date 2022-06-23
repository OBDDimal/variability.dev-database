<template>
  <div>
    <v-toolbar
      class="mt-5 ml-5"
      elevation="12"
      absolute
      left
      top
      floating
      shaped
      style="border: 2px solid white"
    >
      <v-text-field
        hide-details
        placeholder="Search Features"
        prepend-icon="mdi-magnify"
        single-line
      ></v-text-field>

      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon>mdi-palette</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-subheader>Coloring</v-subheader>

          <v-list-item-group v-model="selectedColoring" color="primary">
            <v-list-item v-for="(item, i) in itemsColoring" :key="i">
              <v-list-item-content>
                <v-list-item-title v-text="item"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-menu>

      <v-menu offset-y :close-on-content-click="false">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon>mdi-eye</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-subheader>View</v-subheader>

          <v-list-item-group color="primary">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Fit to view</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Reset view</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <template v-slot:default="{ active }">
                <v-list-item-action>
                  <v-checkbox
                    :input-value="active"
                    color="primary"
                  ></v-checkbox>
                </v-list-item-action>

                <v-list-item-content>
                  <v-list-item-title>Short Name</v-list-item-title>
                </v-list-item-content>
              </template>
            </v-list-item>
          </v-list-item-group>
          <v-subheader>Spacing</v-subheader>
          <v-list-item>
            <v-slider
              style="width: 200px"
              hide-details
              v-model="verticalSpacing"
            ></v-slider>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon>mdi-export-variant</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-subheader>Export</v-subheader>

          <v-btn text color="primary" rounded>Export as XML</v-btn>
        </v-list>
      </v-menu>

      <v-menu offset-y :close-on-content-click="false">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-subheader>Adjust Levels</v-subheader>

          <v-list-item>
            <v-text-field
              v-model="levels"
              class="mt-0 pt-0"
              type="number"
            ></v-text-field>
          </v-list-item>
          <v-subheader>Adjust Max Children</v-subheader>

          <v-list-item>
            <v-text-field
              v-model="maxChilds"
              class="mt-0 pt-0"
              type="number"
            ></v-text-field>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar>
  </div>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  name: "FeatureModelTreeToolbar",

  components: {},

  props: {},

  data: () => ({
    selectedColoring: -1,
    selectedView: -1,
    levels: 4,
    maxChilds: 2,
    verticalSpacing: 10,
    itemsColoring: ["Count", "Direct Children", "Total Children"],
  }),

  computed: {},

  methods: {},
});
</script>

<style scoped></style>
