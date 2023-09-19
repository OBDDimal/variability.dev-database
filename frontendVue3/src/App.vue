<template>
    <v-app>
        <navbar></navbar>
        <v-main style="position: relative">
            <router-view :key="$route.fullPath" />
            <v-snackbar
                location="bottom"
                v-model="snackbar.show"
                :color="snackbar.variant"
                :multi-line="true"
                :transition="
                    breakpoints.smAndDown
                        ? 'slide-y-transition'
                        : 'slide-x-reverse-transition'
                "
                :timeout="snackbar.timeout"
                absolute
                :min-height="breakpoints.smAndDown ? '0' : ''"
                :min-width="breakpoints.smAndDown ? '0' : ''"
                :rounded="!!breakpoints.smAndDown"
                variant="elevated"
                style="z-index: 1005"
            >
                {{ snackbar.message }}
                <template v-slot:actions>
                    <v-btn variant="plain" @click="appStore.closeSnackbar()">
                        &#10005;
                    </v-btn>
                </template>
            </v-snackbar>
        </v-main>
        <!--<TheFooter v-if="route.name !== 'FeatureModel' && route.name !== 'Configurator'"></TheFooter>-->
    </v-app>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue';
import TheFooter from '@/components/Footer.vue';
import { useAppStore } from '@/store/app';
import { storeToRefs } from 'pinia';
import { useDisplay } from 'vuetify';
import { useRoute } from 'vue-router';

const route = useRoute();
const breakpoints = useDisplay();
const appStore = useAppStore();

const snackbar = storeToRefs(useAppStore()).snackbar;
</script>

<style>
.mainView {
    margin-left: auto;
    margin-right: auto;
    padding-left: 30px;
    padding-right: 30px;
    max-width: 90% !important;
}

@media only screen and (max-width: 400px) {
    .mainView {
        margin-left: auto;
        margin-right: auto;
        padding-left: 10px;
        padding-right: 10px;
        max-width: 100% !important;
    }
}

.scroll-snap-container {
    height: 100%;
    width: 100%;
}
</style>
