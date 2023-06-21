<template>
    <v-card class="pa-2">
        <v-card-title>Add new Family</v-card-title>
        <v-card-text>
            <v-form ref="tag-form">
                <v-row no-gutters>
                    <v-col cols="12" class="py-1">
                        <v-text-field
                            v-model="newFamily.label"
                            hint="Name the new family"
                            :rules="labelRules"
                            label="Label"
                            variant="outlined"
                            density="comfortable"
                            placeholder="Family name"
                            required
                        >
                        </v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field
                            v-model="newFamily.description"
                            hint="Describe the new family"
                            label="Description"
                            variant="outlined"
                            density="comfortable"
                            placeholder="Family description"
                        >
                        </v-text-field>
                    </v-col>
                </v-row>
            </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn color="error" text @click="$emit('close')"> Cancel </v-btn>
            <v-btn
                :loading="loadingAddFamily"
                color="primary"
                @click="uploadFamily()"
                >Upload Family</v-btn
            >
        </v-card-actions>
    </v-card>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useFileStore } from '@/store/file';

let emit = defineEmits(['close']);

const fileStore = useFileStore();

let newFamily = reactive({
    label: '',
    description: '',
});

let labelRules = [(v) => !!v || 'Label is required'];
let loadingAddFamily = ref(false);

async function uploadFamily() {
    loadingAddFamily.value = true;
    const uploadedTag = await fileStore.uploadFamily(newFamily);
    await fileStore.fetchFamilies();
    //this.tags.push({ label: uploadedTag.label, id: uploadedTag.id });
    this.newFamily = { label: '', description: '' };
    //this.editTagMenu = false;
    this.loadingFamilyTag = false;
    emit('close');
}
</script>
