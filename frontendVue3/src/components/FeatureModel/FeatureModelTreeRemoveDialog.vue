<template>
  <div class="text-center">
    <v-dialog v-model="showDialog" persistent width="500">
      <v-card>
        <v-card-title class="text-h5">
          Remove Feature
        </v-card-title>
        <v-divider></v-divider>
        <v-form @submit.prevent="remove">
          <v-card-text data-cy="edit-feature-name"
                       label="Name"
                       class="text-h6">
            {{ name }}
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="secondary" text @click="discard">
              Discard
            </v-btn>
            <v-btn color="primary" text type="submit"
                   data-cy="tree-remove-dialog-remove-btn">
              Remove
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "FeatureModelTreeRemoveDialog",

  data: () => ({
    name: undefined,
    groupType: undefined,
    mandatory: undefined,
    abstract: undefined,
    slice: undefined,
  }),

  props: {
    model: Object,
    node: Object,
    show: Boolean,
  },

  watch: {
    show() {
      if (this.node) {
        this.name = this.node.name
        this.groupType = this.node.groupType
        this.mandatory = this.node.isMandatory
        this.abstract = this.node.isAbstract
      }
    },
  },

  computed: {
    showDialog: {
      get() {
        return this.show
      },
    },
  },

  methods: {
    discard() {
      this.name = ''
      this.groupType = ''
      this.mandatory = false
      this.abstract = false
      this.slice = false
      this.$emit('close')
    },
    remove() {
      this.$emit('remove')
    },
  }
}
</script>
