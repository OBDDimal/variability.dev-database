<template>
  <div id="svg-container" style="width: 100%; height: 95vh"></div>
</template>

<script allowJs="">
import Vue from "vue";
import * as constants from "@/classes/constants.ts";
import * as func from "@/classes/updates.js";
import d3 from "d3";
import flextree from "d3-flextree";
import hierarchy from "d3-hierarchy";

export default Vue.extend({
  name: "FeatureModelTree",

  components: {},

  props: {},

  data: () => ({}),

  computed: {},

  methods: {
    mounted() {
      this.initialize();
    },
  },
});
</script>

<style scoped></style>
