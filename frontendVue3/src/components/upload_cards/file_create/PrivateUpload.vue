<script setup>
import {onMounted, reactive, ref} from 'vue';
import ActionButtons from '@/components/upload_cards/file_create/ActionButtons.vue';
import {storeToRefs} from "pinia";
import {useAppStore} from "@/store/app";
import {useFileStore} from "@/store/file";
const form = ref(null);
const { fileCreateAlert } = storeToRefs(useAppStore());
onMounted(() => {
    const fileStore = useFileStore();
    fileStore.fetchLicenses();
});
let formData = reactive({
    label: '',
    description: '',
    files: null,
    license: null,
    family: null,
    version: '',
    tags: [],
    private: true,
});

const showDetails = ref(false);

let labelRules = [(v) => !!v || 'Label is required'];

</script>

<template>
  <v-card class="pa-2" max-width="1000">
    <v-card-title class="text-h5">
      Private Upload Summary
    </v-card-title>
    <v-card-text>
      <v-alert
        :type="fileCreateAlert.variant"
        variant="tonal"
        v-model="fileCreateAlert.show"
        closable
        density="comfortable"
      >
        {{ fileCreateAlert.message }}
        <v-spacer></v-spacer>
      </v-alert>

      <v-window>
        <v-window-item>
          <v-container>
            <v-form ref="form" @submit.prevent>
              <v-row>
                <v-col class="py-1" cols="12">
                  <v-text-field
                    v-model="formData.label"
                    :rules="labelRules"
                    hint="Name your feature model"
                    label="File name"
                    variant="outlined"
                    density="comfortable"
                    placeholder="Leave a filename"
                    required
                  ></v-text-field>
                </v-col>
                <v-col class="py-1" cols="12">
                  <v-textarea
                    v-model="formData.description"
                    counter="250"
                    hint="Add a description to your feature model"
                    label="Description"
                    variant="outlined"
                    density="comfortable"
                    placeholder="Leave a comment here"
                    rows="2"
                  ></v-textarea>
                </v-col>
              </v-row>
              <v-row>
                <action-buttons
                  :data="formData"
                  :valid="form"
                  @close="$emit('close')"
                  @submit-click="showDetails = true"
                ></action-buttons>
              </v-row>
            </v-form>
          </v-container>
        </v-window-item>
      </v-window>

    </v-card-text>
  </v-card>
</template>

<style scoped>

</style>
