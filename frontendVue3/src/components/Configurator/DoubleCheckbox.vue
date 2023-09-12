<template>
  <div v-if='selectionItem'>
    <v-layout row>

      <v-checkbox
        :color="selectionItem.selectionState === SelectionState.ImplicitlySelected ? 'grey' : 'green'"
        :disabled='selectionItem.selectionState === SelectionState.ImplicitlyDeselected || selectionItem.selectionState === SelectionState.ExplicitlyDeselected'
        :value='selectionItem.selectionState === SelectionState.ImplicitlySelected || selectionItem.selectionState === SelectionState.ExplicitlySelected'
        style='display: inline;'
        @input="$emit('select', SelectionState.ExplicitlySelected)"
      >
        <v-tooltip activator='parent' location='bottom'>
          <span v-if='selectionItem.selectionState === SelectionState.Unselected'>Select explicitly</span>
          <span v-else-if='selectionItem.selectionState === SelectionState.ImplicitlySelected'>Implicitly selected. Explicit selection is possible.</span>
          <span
            v-else-if='selectionItem.selectionState === SelectionState.ImplicitlyDeselected'>Implicitly deselected</span>
          <span
            v-else-if='selectionItem.selectionState === SelectionState.ExplicitlySelected'>Explicitly selected</span>
          <span
            v-else-if='selectionItem.selectionState === SelectionState.ExplicitlyDeselected'>Explicitly deselected</span>
        </v-tooltip>
      </v-checkbox>
      <v-checkbox
        :color="selectionItem.selectionState === SelectionState.ImplicitlyDeselected ? 'grey' : 'red'"
        :disabled='selectionItem.selectionState === SelectionState.ImplicitlySelected || selectionItem.selectionState === SelectionState.ExplicitlySelected'
        :value='selectionItem.selectionState === SelectionState.ImplicitlyDeselected || selectionItem.selectionState === SelectionState.ExplicitlyDeselected'
        on-icon='mdi-close-box'
        style='display: inline;'
        v-bind='props'
        @input="$emit('select', SelectionState.ExplicitlyDeselected)"
      >
        <v-tooltip activator='parent' location='bottom'>
          <span v-if='selectionItem.selectionState === SelectionState.Unselected'>Deselect explicitly</span>
          <span
            v-else-if='selectionItem.selectionState === SelectionState.ImplicitlySelected'>Implicitly selected</span>
          <span v-else-if='selectionItem.selectionState === SelectionState.ImplicitlyDeselected'>Implicitly deselected. Explicit deselection is possible.</span>
          <span
            v-else-if='selectionItem.selectionState === SelectionState.ExplicitlySelected'>Explicitly selected</span>
          <span
            v-else-if='selectionItem.selectionState === SelectionState.ExplicitlyDeselected'>Explicitly deselected</span>
        </v-tooltip>
      </v-checkbox>

    </v-layout>
  </div>
</template>

<script>
import { SelectionState } from '@/classes/Configurator/SelectionState';

export default {
  name: 'DoubleCheckbox',

  computed: {
    SelectionState() {
      return SelectionState;
    }
  },

  props: {
    selectionItem: undefined
  }
};
</script>

<style scoped>

</style>
