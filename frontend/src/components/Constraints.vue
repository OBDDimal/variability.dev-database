<template>
  <v-bottom-sheet v-model="$store.state.openConstraints" hide-overlay>
    <v-data-table
      :headers="headers"
      :items="tableConstraints"
      :items-per-page="5"
      :search="search"
      style="padding: 10px"
      @click:row="highlightConstraint"
      hide-default-header
    >
      <template v-slot:top>
        <div class="d-flex justify-center align-center">
          <v-text-field
            prepend-inner-icon="mdi-magnify"
            v-model="search"
            label="Search"
            class="mx-4"
          ></v-text-field>
          <v-btn icon @click="$store.commit('openConstraints', false)"><v-icon>mdi-close</v-icon></v-btn>
        </div>
      </template>
      <template v-slot:item.formula="{ item }">
        <v-chip
          v-model="item.checked"
          :color="item.constraint.color"
          :style="`color: ${computeColor(item.constraint.color)}`"
        >
          {{ item.formula }}
        </v-chip>
      </template>
    </v-data-table>
  </v-bottom-sheet>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  name: "Constraints",

  components: {},

  props: {
    constraints: undefined,
  },

  data: () => ({
    headers: [{ text: "Constraint", value: "formula" }],
    search: "",
  }),

  computed: {
    tableConstraints() {
      return this.constraints.map((e) => ({
        constraint: e,
        formula: e.toString(),
        checked: false,
      }));
    },
  },

  methods: {
    highlightConstraint(item) {
      //TODO: Table row color
      item.checked = !item.checked;
      item.constraint.toggleHighlighted();
      this.$emit("update-feature-model");
    },
    computeColor(bg) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(bg);
      var rgb = result
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
          ]
        : null;
      if (rgb) {
        if (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 > 170) {
          return "#000";
        } else {
          return "#fff";
        }
      } else {
        if (this.$vuetify.theme.dark) {
          return "#fff"
        }
        return "#000"
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.feature-model-constraints {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 2rem;
  min-height: 10%;
  max-height: 40%;
  overflow: hidden;
}
</style>
