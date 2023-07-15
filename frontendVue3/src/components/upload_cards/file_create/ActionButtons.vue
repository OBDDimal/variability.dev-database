<template>
    <v-col cols="12">
        <div class="d-flex align-center">
            <v-spacer></v-spacer>
            <span v-if="uploadStatus !== ''" class="text-subtitle-1">
                {{ uploadStatus }}
            </span>
            <v-btn color="error" variant="text" @click="emit('close')">
                Cancel
            </v-btn>
            <v-btn
                type="submit"
                :loading="loading"
                color="primary"
                @click="upload()"
            >
                Upload
            </v-btn>
        </div>
    </v-col>
</template>

<script setup>
import { ref } from 'vue';
import { useFileStore } from '@/store/file';

const fileStore = useFileStore();

const emit = defineEmits(['close', 'submitClick']);

const props = defineProps({
    data: {
        type: Object,
        required: true,
    },
    valid: {
        type: Object,
    },
});

let uploadStatus = ref('');
let loading = ref(false);

async function upload() {
    const { valid } = await props.valid.validate();
    if (valid) {
        this.loading = true;
        const data = new FormData();
        let file_data = [];
        if (props.data.files !== undefined) {
            console.log("Bulk");
            for (let i = 0; i < props.data.files.length; i++) {
                let file_object = {};
                let versionMajor = 1;
                const event = new Date();
                const options = {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                };
                file_object['label'] = props.data.files[i].name.slice(0, -4);
                console.log(props.data.files[i].name.slice(0, -4));
                file_object['description'] = `Added in bulk upload on ${event.toLocaleDateString(
                    'en-US',
                    options
                )}`;
                file_object['license'] = props.data.license;
                file_object['version'] = `${versionMajor}`;
                file_object['family'] = props.data.family;
                file_object['tags'] = props.data.tags;
                file_object['file'] = `${i}`;
                file_data.push(file_object);
                
                versionMajor++;
            }
            
            data.append('files', JSON.stringify(file_data));
            for (let i = 0; i < props.data.files.length; i++) {
                    data.append(`${i}`, props.data.files[i]);
                }
        } else {
            let file_object = {};
            file_object['label'] = props.data.label;
            file_object['description'] = props.data.description;
            file_object['license'] = props.data.license;
            file_object['version'] = props.data.version;
            file_object['family'] = props.data.family;
            file_object['tags'] = props.data.tags;
            file_object['file'] = '0';
            file_data.push(file_object);
            data.append('0', props.data.file[0]);
            data.append('files', JSON.stringify(file_data));
        }
        
        uploadStatus.value = 'Uploading file...';
        await fileStore.uploadBulkFeatureModels(data);
        uploadStatus.value = '';
        loading.value = false;
        emit('close');
    } else {
        emit('submitClick');
    }
}
async function uploadBulk() {
  if (this.$refs.bulkform.validate() !== false) {
    this.loading = true;
    let versionMajor = 1;
    const data = new FormData();

    for (let i = 0; i < this.formData.files.length; i++) {
      let file_object = {};
      file_object['label'] = this.formData.files[i].name.slice(0, -4);

      const event = new Date();
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      };
      file_object['description'] = `Added in bulk upload on ${event.toLocaleDateString('en-US', options)}`;

      file_object['license'] = this.formData.license;
      file_object['version'] = `${versionMajor}`;
      file_object['family'] = this.formData.family;
      file_object['tags'] = this.formData.tags.map((x) => parseInt(x.id));
      file_object['file'] = `${i}`;

      data.append(`${i}`, this.formData.files[i]);
      versionMajor++;
    }

    data.append('files', JSON.stringify(this.formData.files.map((file, index) => ({
      label: file.name.slice(0, -4),
      description: `Added in bulk upload on ${new Date().toLocaleDateString('en-US', options)}`,
      license: this.formData.license,
      version: `${index + 1}`,
      family: this.formData.family,
      tags: this.formData.tags.map((x) => parseInt(x.id)),
      file: `${index}`
    }))));

    this.uploadStatus = 'Uploading bulk files. This may take a while...';
    await this.$store.dispatch('uploadBulkFeatureModels', data);

    this.uploadStatus = '';
    this.loading = false;
    this.close();
  }
}
</script>
