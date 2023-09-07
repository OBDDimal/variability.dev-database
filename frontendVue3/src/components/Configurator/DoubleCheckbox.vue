<template>
  <div v-if="selectionItem">
    <v-tooltip bottom>
      <template v-slot:activator="{ props }">
        <v-checkbox
            style="display: inline;"
            :value="selectionItem.selectionState === SelectionState.ImplicitlySelected || selectionItem.selectionState === SelectionState.ExplicitlySelected"
            :disabled="selectionItem.selectionState === SelectionState.ImplicitlyDeselected || selectionItem.selectionState === SelectionState.ExplicitlyDeselected"
            @input="$emit('select', SelectionState.ExplicitlySelected)"
            :color="selectionItem.selectionState === SelectionState.ImplicitlySelected ? 'grey' : 'green'"
            v-bind="props"
        ></v-checkbox>
      </template>
      <span v-if="selectionItem.selectionState === SelectionState.Unselected">Select explicitly</span>
      <span v-else-if="selectionItem.selectionState === SelectionState.ImplicitlySelected">Implicitly selected. Explicit selection is possible.</span>
      <span v-else-if="selectionItem.selectionState === SelectionState.ImplicitlyDeselected">Implicitly deselected</span>
      <span
          v-else-if="selectionItem.selectionState === SelectionState.ExplicitlySelected">Explicitly selected</span>
      <span v-else-if="selectionItem.selectionState === SelectionState.ExplicitlyDeselected">Explicitly deselected</span>
    </v-tooltip>

    <v-tooltip bottom>
      <template v-slot:activator="{ props }">
        <v-checkbox
            style="display: inline;"
            on-icon="mdi-close-box"
            :value="selectionItem.selectionState === SelectionState.ImplicitlyDeselected || selectionItem.selectionState === SelectionState.ExplicitlyDeselected"
            :disabled="selectionItem.selectionState === SelectionState.ImplicitlySelected || selectionItem.selectionState === SelectionState.ExplicitlySelected"
            @input="$emit('select', SelectionState.ExplicitlyDeselected)"
            :color="selectionItem.selectionState === SelectionState.ImplicitlyDeselected ? 'grey' : 'red'"
            v-bind="props"
        ></v-checkbox>

      </template>
      <span v-if="selectionItem.selectionState === SelectionState.Unselected">Deselect explicitly</span>
      <span v-else-if="selectionItem.selectionState === SelectionState.ImplicitlySelected">Implicitly selected</span>
      <span v-else-if="selectionItem.selectionState === SelectionState.ImplicitlyDeselected">Implicitly deselected. Explicit deselection is possible.</span>
      <span v-else-if="selectionItem.selectionState === SelectionState.ExplicitlySelected">Explicitly selected</span>
      <span v-else-if="selectionItem.selectionState === SelectionState.ExplicitlyDeselected">Explicitly deselected</span>
    </v-tooltip>
  </div>
</template>

<script>
import { SelectionState } from '@/classes/Configurator/SelectionState';

export default {
  name: 'DoubleCheckbox',

  computed: {
    SelectionState() {
      return SelectionState
    }
  },

  props: {
    selectionItem: undefined,
  },
};
</script>

<style scoped>

</style>
