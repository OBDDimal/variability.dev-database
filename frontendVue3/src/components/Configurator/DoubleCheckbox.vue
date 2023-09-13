<template>
  <div v-if='selectionItem'>
    <v-layout row>

       <v-tooltip location="bottom" >
        <template v-slot:activator="{ props }">
          <v-checkbox
              hide-details
              v-model="trueCheckBox"
              style="display: inline;"
              :model-value="selectionItem.selectionState === SelectionState.ImplicitlySelected || selectionItem.selectionState === SelectionState.ExplicitlySelected"
              :disabled="selectionItem.selectionState !== SelectionState.Unselected && selectionItem.selectionState !== SelectionState.ExplicitlySelected"
              @input="selectFeature"
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

      <v-tooltip location="bottom" >
        <template v-slot:activator="{ props }">
          <v-checkbox
              hide-details
              style="display: inline;"
              on-icon="mdi-close-box"
              v-model="falseCheckBox"
              :model-value="selectionItem.selectionState === SelectionState.ImplicitlyDeselected || selectionItem.selectionState === SelectionState.ExplicitlyDeselected"
              :disabled="selectionItem.selectionState !== SelectionState.Unselected && selectionItem.selectionState !== SelectionState.ExplicitlyDeselected"
              @input="deselectFeature"
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

  data: () => ({
    trueCheckBox: false,
    falseCheckBox: false,
  }),

  props: {
    selectionItem: undefined
  },

  methods: {
    selectFeature() {
      if (this.trueCheckBox){
        this.$emit('select', SelectionState.ExplicitlySelected)
      } else {
        this.$emit('select', SelectionState.Unselected)
      }
    },

    deselectFeature() {
      if (this.falseCheckBox){
        this.$emit('select', SelectionState.ExplicitlyDeselected)
      } else {
        this.$emit('select', SelectionState.Unselected)
      }
    }
  }
};
</script>

<style scoped>

</style>
