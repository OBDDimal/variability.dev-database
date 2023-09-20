<template>
  <div class="text-center">
    <v-dialog v-model="showDialog" persistent width="500">
      <v-card>
        <v-card-title class="text-h7 text-wrap">
          Choose a FeatureModel or a FeatureIDE Configuration File
        </v-card-title>
        <v-divider></v-divider>
        <v-form fast-fail @submit.prevent="open">
          <v-file-input v-model="file"
                        clearable
                        label="File"
                        required
                        accept=".xml"
                        class='ma-2 mb-0'
          >

          </v-file-input>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="secondary" text @click="discard">
              Discard
            </v-btn>
            <v-btn color="primary" text type="submit"
                   :disabled="!file || file.length === 0">
              Open
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "ConfiguratorOpenFileDialog",

  data: () => ({
    file: undefined,
  }),

  props: {
    show: Boolean,
  },

  watch: {
    show() {
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
      this.$emit('close')
    },
    open() {
      this.$emit('open', this.file)
    },
  }
}
</script>
