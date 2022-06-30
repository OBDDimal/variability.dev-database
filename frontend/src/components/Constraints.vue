<template>
    <v-data-table
        :headers="headers"
        :items="tableConstraints"
        :items-per-page="5"
        :search="search"
        class="feature-model-constraints"
        hide-default-header
    >
      <template v-slot:top>
        <v-text-field
            v-model="search"
            label="Search"
            class="mx-4"
        ></v-text-field>
      </template>
      <template v-slot:item.checked="{ item }">
        <v-simple-checkbox
            v-ripple
            v-model="item.checked"
            @click="highlightConstraint(item.constraint)"
        ></v-simple-checkbox>
      </template>
      <template v-slot:item.formula="{ item }">
        <v-chip
            :color="item.constraint.color"
        >
          {{ item.formula }}
        </v-chip>
      </template>
    </v-data-table>
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
    headers: [{text: 'Constraint', value: 'formula'}, {text: 'checked', value: "checked"}],
    search: '',
  }),

  computed: {
    tableConstraints() {
      return this.constraints.map(e => ({constraint: e, formula: e.toString(), checked: false}))
    }
  },

  methods: {
    highlightConstraint(constraint) {
      //TODO: Table row color
      constraint.toggleHighlighted();
      this.$emit('update-feature-model');
    },
  },
});
</script>

<style lang="scss" scoped>
.feature-model-constraints {
  position: absolute;
  background-color: white;
  bottom: 0;
  width: 100%;
  box-shadow: 0px 10px 10px #888, 0px -10px 10px #888;
  padding: 2rem;
  min-height: 10%;
  max-height: 40%;
  overflow: hidden;
}
</style>
