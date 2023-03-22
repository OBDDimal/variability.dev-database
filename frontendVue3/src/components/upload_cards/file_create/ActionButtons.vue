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
        let file_object = {};

        file_object['label'] = props.data.label;
        console.log('LABEL');
        console.log(props.data.label);
        file_object['description'] = props.data.description;
        console.log('DESCRIPTION');
        console.log(props.data.description);
        file_object['license'] = props.data.license;
        console.log('LICENSE');
        console.log(props.data.license);
        file_object['version'] = props.data.version;
        console.log('VERSION');
        console.log(props.data.version);

        file_object['family'] = props.data.family;
        console.log('FAMILY');
        console.log(props.data.family);
        file_object['tags'] = props.data.tags;
        console.log('TAGS');
        console.log(props.data.tags);
        file_object['file'] = '0';
        file_data.push(file_object);
        console.log('FILES (in total finished):');
        console.log(JSON.stringify(file_data));
        data.append('files', JSON.stringify(file_data));
        console.log(props.data.file);
        data.append('0', props.data.file[0]);
        uploadStatus.value = 'Uploading file...';
        await fileStore.uploadBulkFeatureModels(data);
        /*console.log('finished uploading file')*/
        uploadStatus.value = '';
        loading.value = false;
        emit('close');
    } else {
        emit('submitClick');
    }
}
</script>
