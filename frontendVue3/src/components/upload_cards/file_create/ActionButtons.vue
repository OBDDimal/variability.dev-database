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
const uploadInfo = ref(null);
const fileStore = useFileStore();

const emit = defineEmits(['close', 'submitClick', 'uploadSuccessfull']);

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
    if (props.data.files.length === 1) {
      await uploadSingle();
      } else {
      await uploadBulk();
    }
  } else {
    emit('submitClick');
  }
}

async function uploadSingle() {
  loading.value = true;
  const data = new FormData();
  let file_data = [];
  let file_object = {};
  file_object['label'] = props.data.label;
  file_object['description'] = props.data.description;
  file_object['license'] = props.data.license;


  file_object['family'] = props.data.family;
  file_object['tags'] = props.data.tags;
  file_object['file'] = '0';
  if (!props.data.files.some(file => file.name.endsWith('.zip'))) {
    file_object['version'] = props.data.version;
    file_data.push(file_object);
    data.append('0', props.data.files[0]);
    data.append('files', JSON.stringify(file_data));
    uploadStatus.value = 'Uploading file...';
    let success = await fileStore.uploadBulkFeatureModels(data)
    if (success) {
      await handleSuccessfulUpload('Single')
    } else {
      handleUnsuccessfullUpload();
    }
  } else {
    data.append('files', JSON.stringify(file_object));
    data.append('file', props.data.files[0]);
    uploadStatus.value = 'Uploading file...';
    let success = await fileStore.uploadZipFeatureModels(data)
    if (success) {
      await handleSuccessfulUpload('Zip')
    } else {
      handleUnsuccessfullUpload();
    }
  }
}
async function handleSuccessfulUpload(format) {
  uploadInfo.value = {
    format: format,
    fileNames: props.data.label,
    license: props.data.license,
  };
  uploadStatus.value = '';
  loading.value = false;
  emit('uploadSuccessfull', uploadInfo.value);
}

function handleUnsuccessfullUpload(){
  uploadStatus.value = '';
      loading.value = false;
      emit('close');
}
async function uploadBulk() {
  const data = new FormData();
  //let uploaded_family_id = 0;
  let file_data = [];
  loading.value = true;
  let majorVersion = 1;
  let file_names = [];
  for (let i = 0; i < props.data.files.length; i++) {
    const file = props.data.files[i];
    let version = majorVersion.toString() + '.0.0';
    let file_object = {};
    const options = {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                    };
    let date = new Date();
    file_object['label'] = file.name.replace('.xml', '');
    file_object['description'] = `Added in bulk upload on ${date.toLocaleString('en-US', options)}`;
    file_object['license'] = props.data.license;
    file_object['version'] = version;
    /**if (i !== 0) {
        file_object['family'] = uploaded_family_id;
    } else {
      const uploadedFamily = await fileStore.uploadFamily(
        {
        label: props.data.family,
        description: props.data.familydescription
        }
      );
      uploaded_family_id = uploadedFamily.id;**/

    file_object['family'] = props.data.family;
    file_object['tags'] = props.data.tags.map((x) =>
                        parseInt(x.id)
                    );
    file_object['file'] = i.toString();
    file_data.push(file_object);
    file_names[i] = file.name.replace('.xml', '')
    data.append(i.toString(), file);
    majorVersion++;

  }

  data.append('files', JSON.stringify(file_data));

  uploadStatus.value = 'Uploading bulk files...';
  let success = await fileStore.uploadBulkFeatureModels(data);
  if (success){
    uploadInfo.value = {
        format: "Bulk",
        fileCount: props.data.files.length,
        fileNames: file_names,
        license: props.data.license
      };
    uploadStatus.value = '';
    loading.value = false;
    emit('uploadSuccessfull', uploadInfo.value)
  }else{
    handleUnsuccessfullUpload();
  }

}


</script>
