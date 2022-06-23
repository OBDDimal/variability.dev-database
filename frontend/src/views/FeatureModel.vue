<template>
  <div>
    <feature-model-tree></feature-model-tree>
    <constraints></constraints>
  </div>
</template>

<script>
import Vue from "vue";
import FeatureModelTree from "../components/FeatureModelTree.vue";
import Constraints from "../components/Constraints.vue";

export default Vue.extend({
  name: "FeatureModel",

  components: {
    FeatureModelTree,
    Constraints,
  },

  props: {},

  data: () => ({}),

  computed: {},

  methods: {},
});
</script>

<style scoped></style>
