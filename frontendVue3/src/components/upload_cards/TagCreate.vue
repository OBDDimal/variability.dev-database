<template>
    <v-card class="pa-2">
        <v-card-title>Add new Tag</v-card-title>
        <v-card-text>
            <v-form ref="tag-form">
                <v-row no-gutters>
                    <v-col cols="12" class="py-1">
                        <v-text-field
                            v-model="newTag.label"
                            hint="Name the new tag"
                            :rules="labelRules"
                            label="Label"
                            variant="outlined"
                            density="comfortable"
                            placeholder="Tag name"
                            required
                        >
                        </v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field
                            v-model="newTag.description"
                            hint="Describe the new tag"
                            label="Description"
                            variant="outlined"
                            density="comfortable"
                            placeholder="Tag description"
                        >
                        </v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-checkbox
                            v-model="newTag.is_public"
                            hide-details
                            label="Public"
                            class="mt-0"
                            density="compact"
                            required
                        ></v-checkbox>
                    </v-col>
                </v-row>
            </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn color="error" text @click="$emit('close')"> Cancel </v-btn>
            <v-btn :loading="loadingAddTag" color="primary" @click="uploadTag()"
                >Upload Tag</v-btn
            >
        </v-card-actions>
    </v-card>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useFileStore } from '@/store/file';

let emit = defineEmits(['close']);

const fileStore = useFileStore();

let newTag = reactive({
    label: '',
    description: '',
    is_public: false,
});

let labelRules = [(v) => !!v || 'Label is required'];
let loadingAddTag = ref(false);

async function uploadTag() {
    loadingAddTag.value = true;
    const uploadedTag = await fileStore.uploadTag(newTag);
    await fileStore.fetchTags();
    //this.tags.push({ label: uploadedTag.label, id: uploadedTag.id });
    this.newTag = { label: '', description: '', is_public: false };
    //this.editTagMenu = false;
    this.loadingAddTag = false;
    emit('close');
}
</script>
