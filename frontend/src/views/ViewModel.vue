<template>
  <div>
    <v-toolbar elevation="4" absolute left top floating>
      <v-text-field
        hide-details
        prepend-icon="mdi-magnify"
        single-line
      ></v-text-field>

      <v-btn icon>
        <v-icon>mdi-palette</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-eye</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </v-toolbar>
    <div id="container" style="width: 100%; height: 95vh"></div>
  </div>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  name: "ViewGraph",

  components: {},

  props: {},

  data: () => ({
    nodes: {},
  }),

  computed: {},

  methods: {},

  mounted() {},
});
</script>

<style scoped></style>
