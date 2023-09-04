<template>
    <v-container max-width="800">
        
        <v-row class="mb-4">
        <v-col>
            <b>Format:</b> {{props.data.format}}
        </v-col>
        </v-row>
        <v-row class="mb-4">
    <v-col v-if="props.data.format === 'Bulk'">
        <v-row>
        <v-col>
            <b>Model Names:</b>
        </v-col>
        <v-col>
        <ul style = "margin-left: 20px;">
            <li v-for="(filename, index) in props.data.fileNames" :key="index">{{ "Model " + index + ": " +  filename }}</li>
        </ul>
        </v-col>
        </v-row>
        <v-row >
            <v-col> <b>Total Files: </b>{{ props.data.fileCount }}</v-col></v-row>
        
    </v-col>
    <v-col v-else>          
        <b>Model Name:</b> {{ props.data.fileNames }}
    </v-col>
    </v-row >
        <v-row class="mb-4">
            <v-col>
            <p> <b>License: </b>{{props.data.license}}</p>
        </v-col>
        </v-row>
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