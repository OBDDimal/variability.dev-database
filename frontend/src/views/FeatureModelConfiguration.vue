<template>
  <div class="mainView">
    <h3 class="text-h3 mb-2 mt-8">Configurations</h3>
    <h5 class="text-h5 mb-4">Here you can edit or add new feature model configurations</h5>

    <v-treeview
        v-model="selected"
        :items="[data.rootNode]"
        item-disabled="disabled"
        item-key="name"
        return-object
        selectable
        open-on-click
        selection-type="independent"
        :open="opened"
        @update:open="onOpen"
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
    selected: [],
    oldSelected: [],
    opened: [],
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
    },

    update(selected) {
      const newSelected = selected.find(node => !this.oldSelected.includes(node));
      const newDeselected = this.oldSelected.find(node => !this.selected.includes(node));
      if (newSelected && newDeselected) return;
      console.log(newSelected?.name, newDeselected?.name);

      // Focused View (Children of current selected feature will be uncollpased)
      if (newSelected && !newSelected.isLeaf()) {
        this.opened.push(newSelected);
      }

      this.oldSelected = selected;
    },

    onOpen(opened) {
      console.log(opened.map(n => n.name));
    }
  },


});
</script>

<style lang="scss">
</style>
