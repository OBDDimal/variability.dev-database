<template>
  <v-menu
    v-model="showMenu"
    transition="scroll-y-transition"
    :position-x="selectedD3NodeEvent ? selectedD3NodeEvent.pageX : 0"
    :position-y="selectedD3NodeEvent ? selectedD3NodeEvent.pageY : 0"
    absolute
    offset-y
  >
    <v-list>
      <v-list-item
        :disabled="
          selectedD3Node &&
          !selectedD3Node.children &&
          !selectedD3Node.collapsedChildren
        "
        @click="$emit('collapse', selectedD3Node)"
      >
        <v-list-item-icon>
          <v-icon>mdi-arrow-collapse-all</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Collapse</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list-item
        :disabled="
          !(
            selectedD3Node &&
            selectedD3Node.parent &&
            selectedD3Node.parent.children &&
            selectedD3Node.parent.children.length > 1 &&
            selectedD3Node.parent.children[0].data.name !==
              selectedD3Node.data.name
          )
        "
        @click="$emit('hideLeftSiblings', selectedD3Node)"
      >
        <v-list-item-content>
          <v-list-item-title>Hide left siblings</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item
        :disabled="
          !(
            selectedD3Node &&
            selectedD3Node.parent &&
            selectedD3Node.parent.children &&
            selectedD3Node.parent.children.length > 1 &&
            selectedD3Node.parent.children[
              selectedD3Node.parent.children.length - 1
            ].data.name !== selectedD3Node.data.name
          )
        "
        @click="$emit('hideRightSiblings', selectedD3Node)"
      >
        <v-list-item-content>
          <v-list-item-title>Hide right siblings</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item @click="$emit('hideCurrentNode', selectedD3Node)">
        <v-list-item-content>
          <v-list-item-title>Hide current node</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list-item
        :disabled="
          !(
            selectedD3Node &&
            selectedD3Node.data.constraints &&
            selectedD3Node.data.constraints.length
          )
        "
      >
        <v-list-item-content>
          <v-list-item-title>Highlight constraints</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Edit</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  name: "FeatureModelTreeContextMenu",

  props: {
    selectedD3Node: undefined,
    selectedD3NodeEvent: undefined,
    showMenu: Boolean,
  },
});
</script>

<style scoped>
.v-list-item:not(.v-list-item--disabled) {
  cursor: pointer;
}
</style>
