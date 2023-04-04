<template>
  <div class="mainView">

  </div>
</template>

<script>
import Vue from 'vue';
import {FeatureModel} from "@/classes/Configuration/FeatureModel";
import {xmlVersions} from "@/classes/Configuration/example";

export default Vue.extend({
  name: 'FeatureModelConfiguration',

  props: {
    id: undefined,
  },

  data: () => ({
    data: {
      featureModel: FeatureModel,
    },
  }),

  created() {
    this.initData();
  },

  watch: {
    selected() {
    },
  },

  methods: {
    initData() {
        this.featureModel = FeatureModel.create(xmlVersions);
    },

    update(selected) {
      selected.isExplicit = selected.isSelected;
      this.data.rootNode.decisionPropagation();
    },

    onOpen(opened) {
      console.log(opened.map(n => n.name));
    }
  },


});
</script>

<style lang="scss">
</style>
