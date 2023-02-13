<template>
  <div class="mainView">
    <h3 class="text-h3 mb-2 mt-8">Configurations</h3>
    <h5 class="text-h5 mb-4">Here you can edit or add new feature model configurations</h5>

    <v-treeview
        v-model="selectedFeatureNodes"
        :items="[data.rootNode]"
        item-disabled="locked"
        item-key="name"
        return-object
        selectable
        selection-type="independent"
        @input="update">
      <!--<template v-slot:prepend="{ item }">
          <v-icon
              v-if="item.locked"
              v-text="`mdi-close`"
          ></v-icon>
      </template>-->
      <template v-slot:label="{item}">
        <span class="v-treeview-node__label">{{ item.name }}</span>
        <span class="v-treeview-node__label">{{ item.isAnd() ? " (AND)" : item.isOr() ? " (OR)" : item.isAlt() ? " (ALT)" : ""}}</span>
        <span class="v-treeview-node__label">{{ item.parent?.isAnd() && item.isMandatory ? " (MANDATORY)" : "" }}</span>
      </template>
    </v-treeview>
  </div>
</template>

<script>
import Vue from 'vue';
import api from '@/services/api.service';
import * as xmlTranspiler from '@/services/xmlTranspiler.service';
import beautify from 'xml-beautifier';

export default Vue.extend({
  name: 'FeatureModelConfiguration',

  props: {
    id: undefined,
  },

  data: () => ({
    data: {
      featureMap: [],
      constraints: [],
      properties: [],
      calculations: undefined,
      comments: [],
      featureOrder: undefined,
      rootNode: undefined,
    },
    selectedFeatureNodes: [],
    oldSelectedFeatureNodes: [],
  }),

  created() {
    this.initData();
  },

  methods: {
    initData() {
      if (this.id === 'local') {
        const xml = beautify(localStorage.featureModelData);
        xmlTranspiler.xmlToJson(xml, this.data);
        this.xml = xml;
      } else if (this.id) {
        api.get(`${process.env.VUE_APP_DOMAIN}files/${this.id}/`).then(
            (data) => {
              api.get(data.data.local_file).then((rawData) => {
                const xml = beautify(rawData.data);
                xmlTranspiler.xmlToJson(xml, this.data);
                this.xml = xml;
              });
            }
        );
      }
      console.log(this.data);
    },

    update() {
      const newSelectedFeatureNodes = this.selectedFeatureNodes.filter(node => !this.oldSelectedFeatureNodes.includes(node));
      const deselectedFeatureNodes = this.oldSelectedFeatureNodes.filter(node => !this.selectedFeatureNodes.includes(node));
      console.log(newSelectedFeatureNodes, deselectedFeatureNodes);

      if (newSelectedFeatureNodes.length) {
        newSelectedFeatureNodes[0].selected = true;
      }

      if (deselectedFeatureNodes.length) {
        deselectedFeatureNodes[0].selected = false;
      }

      // Display all selected feature nodes.
      this.selectedFeatureNodes = this.data.rootNode.descendants().filter(node => node.selected);
      this.oldSelectedFeatureNodes = this.selectedFeatureNodes;
    }
  },


});
</script>

<style lang="scss">
</style>
