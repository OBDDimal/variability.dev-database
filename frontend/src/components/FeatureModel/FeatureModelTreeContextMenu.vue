<template>
  <div
    v-if="showMenu"
    class="context-menu"
    :style="`top: ${selectedD3NodeEvent.pageY}px; left: ${selectedD3NodeEvent.pageX}px`"
  >
    <v-list>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Single-line item</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item two-line>
        <v-list-item-content>
          <v-list-item-title>Two-line item</v-list-item-title>
          <v-list-item-subtitle>Secondary text</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-list-item three-line>
        <v-list-item-content>
          <v-list-item-title>Three-line item</v-list-item-title>
          <v-list-item-subtitle>
            Secondary line text Lorem ipsum dolor sit amet,
          </v-list-item-subtitle>
          <v-list-item-subtitle>
            consectetur adipiscing elit.
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
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

  methods: {},
});
</script>

<style scoped>
.context-menu {
  position: absolute;
  background-color: white;
  border: 1px solid grey;
  border-radius: 3px;
  z-index: 10;
}

.context-menu > ul {
  padding: 0;
  margin: 0;
  list-style: none;
}

.context-menu > ul > li {
  padding: 0.5rem;
  cursor: pointer;
}

.context-menu > ul > .deactivated {
  color: grey;
  cursor: initial;
}

.context-menu > ul > .deactivated:hover {
  background-color: lightgrey;
}

.context-menu > ul > li:hover {
  background-color: lightblue;
}

.context-menu-active {
  display: block;
  transition: all 1s;
  min-width: 200px;
}
</style>
