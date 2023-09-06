<template>
  <v-container max-width="1000">
    <v-card-item>
      <div class="mt-4 d-flex justify-center align-center">
        <v-divider></v-divider>
        <span class="mx-2"><b>Format: </b></span>
        <v-divider></v-divider>
      </div>
      <v-col class="mb-4 mt-2 d-flex justify-center align-center">
        {{ props.data.format }}
      </v-col>
    </v-card-item>

    <v-card-item class="mb-4" v-if="props.data.format === 'Bulk'">
      <div class="mt-4 d-flex align-center">
        <v-divider></v-divider>
        <span class="mx-2"><b>Model Names: </b></span>
        <v-divider></v-divider>
      </div>
      <v-row class="mb-4">
        <v-col>
          <ul style="margin-left: 20px; list-style-type: none;">
            <li v-for="(filename, index) in props.data.fileNames.slice(0, 5)" :key="index">
              {{ 'Model ' + index + ': ' + filename }}
            </li>
            <li v-if="props.data.fileNames.length > 5">And {{ props.data.fileNames.length - 5 }} more...</li>
          </ul>
        </v-col>
      </v-row>
      <div class="mt-4 d-flex justify-center align-center">
        <v-divider></v-divider>
        <span class="mx-2"><b>Total Files: </b></span>
        <v-divider></v-divider>
      </div>
      <v-row>
        <v-col class="mb-4 mt-2 d-flex justify-center align-center">{{ props.data.fileCount }}</v-col>
      </v-row>
    </v-card-item>

    <v-card-item class="mb-4" v-else>
      <div class="mt-4 d-flex justify-center align-center">
        <v-divider></v-divider>
        <span class="mx-2"><b>Model Name: </b></span>
        <v-divider></v-divider>
      </div>
      <v-col class="mb-4 mt-2 d-flex justify-center align-center">{{ props.data.fileNames }}</v-col>

    </v-card-item>

    <v-card-item>
      <div class="mt-4 d-flex justify-center align-center">
        <v-divider></v-divider>
        <span class="mx-2"><b>License: </b></span>
        <v-divider></v-divider>
      </div>
        <v-col class="mb-4 mt-2 d-flex justify-center align-center">{{ props.data.license }}
        </v-col>
    </v-card-item>
      <v-row>
        <v-btn color="primary" @click="$emit('close-summary')">Close</v-btn>
      </v-row>
  </v-container>
</template>

  <script setup>
    const props = defineProps({
        data: {
        type: Object,
        required: true,
    },
    })

  </script>
  <style scoped>
  .mb-4 {
      margin-bottom: 1rem; /* Hier kannst du den gewünschten Abstand einstellen */
  }
  </style>
