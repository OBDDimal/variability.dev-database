<template>
    <div v-if="currentUser" class="mainView">
        <div class="my-10 py-4 d-flex justify-center">
            <v-card elevation="4" max-width="1000px" outlined>
                <v-card-title>
                    <v-row align="center">
                        <v-col class="text-center" cols="12" md="auto">
                            <v-avatar class="" color="primary" size="100">
                                <v-icon dark size="80"> mdi-account</v-icon>
                            </v-avatar>
                        </v-col>
                        <v-col cols="auto">
                            <span
                                v-if="breakpoints.mdAndUp"
                                class="mb-2 text-h4"
                                >{{ currentUser.email }}</span
                            >
                            <span v-else class="mb-2 text-h5">{{
                                currentUser.email
                            }}</span>
                            <h6 class="text-h6">
                                Institute:
                                {{
                                    currentUser.institute == ''
                                        ? 'None'
                                        : currentUser.institute
                                }}
                            </h6>
                        </v-col>
                    </v-row>
                </v-card-title>

                <v-divider></v-divider>

                <v-card-text>
                    <v-row align="center">
                        <v-col
                            :class="breakpoints.smAndDown ? 'pb-0' : ''"
                            cols="12"
                            md="3"
                        >
                            <h4>User since:</h4>
                        </v-col>
                        <v-col>
                            <div style="word-break: break-all">
                                {{
                                    new Date(currentUser.date_joined)
                                        .toLocaleString('en-US')
                                        .substring(0, 9)
                                }}
                            </div>
                        </v-col>
                    </v-row>
                    <v-row align="center">
                        <v-col
                            :class="breakpoints.smAndDown ? 'pb-0' : ''"
                            cols="12"
                            md="3"
                        >
                            <h4>Token:</h4>
                        </v-col>
                        <v-col>
                            <div style="word-break: break-all">
                                {{ authStore.accessToken }}
                            </div>
                        </v-col>
                    </v-row>
                    <v-row align="center">
                        <v-col
                            :class="breakpoints.smAndDown ? 'pb-0' : ''"
                            cols="12"
                            md="3"
                        >
                            <h4>ID:</h4>
                        </v-col>
                        <v-col>
                            <div style="word-break: break-all">
                                {{
                                    currentUser.id
                                        ? currentUser.id
                                        : currentUser.pk
                                }}
                            </div>
                        </v-col>
                    </v-row>
                    <v-row align="center">
                        <v-col
                            :class="breakpoints.smAndDown ? 'pb-0' : ''"
                            cols="12"
                            md="3"
                        >
                            <h4>Uploaded Feature Models:</h4>
                        </v-col>
                    </v-row>
                    <v-row align="center" justify="center">
                        <v-col cols="auto">
                            <div class="timeline-div">
                                <v-timeline
                                    align="start"
                                    class="ma-3"
                                    density="compact"
                                >
                                    <v-timeline-item
                                        v-for="elem in myConfirmedFeatureModels"
                                        :key="elem.uploaded_at"
                                        icon="mdi-file"
                                        fill-dot
                                        dot-color="primary"
                                        size="large"
                                    >
                                        <v-card>
                                            <v-card-title>
                                                {{ elem.label }}
                                            </v-card-title>
                                            <v-card-subtitle>
                                                Uploaded:
                                                {{
                                                    getFormattedDate(
                                                        elem.uploaded_at
                                                    )
                                                }}
                                            </v-card-subtitle>
                                            <v-card-actions>
                                                <v-btn
                                                    class="mr-2"
                                                    color="primary"
                                                    outlined
                                                    variant="text"
                                                    prepend-icon="mdi-eye"
                                                    size="small"
                                                >
                                                    Show
                                                </v-btn>
                                                <v-btn
                                                    color="primary"
                                                    outlined
                                                    size="small"
                                                    variant="text"
                                                    prepend-icon="mdi-play"
                                                >
                                                    Analyse
                                                </v-btn>
                                            </v-card-actions>
                                        </v-card>
                                    </v-timeline-item>
                                </v-timeline>
                            </div>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';
import { useFileStore } from '@/store/file';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import { storeToRefs } from 'pinia';

const breakpoints = useDisplay();
const router = useRouter();
const fileStore = useFileStore();
const appStore = useAppStore();
const authStore = useAuthStore();

const { currentUser } = storeToRefs(authStore);

const { myConfirmedFeatureModels } = storeToRefs(fileStore);
function getFormattedDate(date) {
    const temp = new Date(date);
    return (
        ('0' + (temp.getMonth() + 1)).slice(-2) +
        '/' +
        ('0' + temp.getDate()).slice(-2) +
        '/' +
        ('' + temp.getFullYear()).slice(-2)
    );
}

onMounted(() => {
    if (!authStore.loggedIn || !authStore.currentUser) {
        appStore.updateSnackbar(
            'Please log in to view this page',
            'info',
            5000,
            true
        );
        router.push('/login');
    }
    fileStore.fetchMyConfirmedFeatureModels();
});
</script>

<style scoped>
.timeline-div {
    max-height: 400px;
    overflow-y: scroll;
}
</style>
