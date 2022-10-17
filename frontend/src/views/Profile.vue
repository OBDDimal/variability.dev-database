<template>
    <div v-if="$store.state.currentUser" class="mainView">
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
                                v-if="$vuetify.breakpoint.mdAndUp"
                                class="mb-2 text-h4"
                                >{{ $store.state.currentUser.email }}</span
                            >
                            <span v-else class="mb-2 text-h5">{{
                                $store.state.currentUser.email
                            }}</span>
                            <h6 class="text-h6">
                                Institute:
                                {{
                                    $store.state.currentUser.institute == ''
                                        ? 'None'
                                        : $store.state.currentUser.institute
                                }}
                            </h6>
                        </v-col>
                    </v-row>
                </v-card-title>

                <v-divider></v-divider>

                <v-card-text>
                    <v-row align="center">
                        <v-col
                            :class="$vuetify.breakpoint.smAndDown ? 'pb-0' : ''"
                            cols="12"
                            md="2"
                        >
                            <h4>User since:</h4>
                        </v-col>
                        <v-col>
                            <div style="word-break: break-all">
                                {{
                                    new Date(
                                        $store.state.currentUser.date_joined
                                    )
                                        .toLocaleString('en-US')
                                        .substring(0, 9)
                                }}
                            </div>
                        </v-col>
                    </v-row>
                    <v-row align="center">
                        <v-col
                            :class="$vuetify.breakpoint.smAndDown ? 'pb-0' : ''"
                            cols="12"
                            md="2"
                        >
                            <h4>Token:</h4>
                        </v-col>
                        <v-col>
                            <div style="word-break: break-all">
                                {{ $store.state.accessToken }}
                            </div>
                        </v-col>
                    </v-row>
                    <v-row align="center">
                        <v-col
                            :class="$vuetify.breakpoint.smAndDown ? 'pb-0' : ''"
                            cols="12"
                            md="2"
                        >
                            <h4>ID:</h4>
                        </v-col>
                        <v-col>
                            <div style="word-break: break-all">
                                {{
                                    $store.state.currentUser.id
                                        ? $store.state.currentUser.id
                                        : $store.state.currentUser.pk
                                }}
                            </div>
                        </v-col>
                    </v-row>
                    <v-row align="center">
                        <v-col
                            :class="$vuetify.breakpoint.smAndDown ? 'pb-0' : ''"
                            cols="12"
                            md="2"
                        >
                            <h4>History:</h4>
                        </v-col>
                    </v-row>
                    <v-row align="center" justify="center">
                        <v-col cols="auto">
                            <div class="timeline-div">
                                <v-timeline align-top class="ma-3" dense>
                                    <v-timeline-item
                                        v-for="elem in preparedElems"
                                        :key="elem.uploaded_at"
                                        :icon="
                                            elem.type == 'file'
                                                ? 'mdi-file'
                                                : elem.type == 'tag'
                                                ? 'mdi-tag'
                                                : 'mdi-human-male-female-child'
                                        "
                                        color="primary"
                                        large
                                    >
                                        <v-row class="pt-1">
                                            <v-col cols="4">
                                                {{
                                                    getFormattedDate(
                                                        elem.uploaded_at
                                                    )
                                                }}
                                            </v-col>
                                            <v-col>
                                                <strong
                                                    v-if="elem.type == 'file'"
                                                    >Uploaded Feature
                                                    Model</strong
                                                >
                                                <strong
                                                    v-else-if="
                                                        elem.type == 'tag'
                                                    "
                                                    >Created Tag</strong
                                                >
                                                <strong
                                                    v-else-if="
                                                        elem.type == 'family'
                                                    "
                                                    >Created Family</strong
                                                >
                                                <div class="text-caption">
                                                    {{ elem.label }}
                                                </div>
                                                <div v-if="elem.type == 'file'">
                                                    <v-btn
                                                        class="mr-2"
                                                        color="primary"
                                                        outlined
                                                        x-small
                                                    >
                                                        <v-icon left
                                                            >mdi-eye</v-icon
                                                        >
                                                        Show
                                                    </v-btn>
                                                    <v-btn
                                                        color="primary"
                                                        outlined
                                                        x-small
                                                    >
                                                        <v-icon left
                                                            >mdi-play</v-icon
                                                        >
                                                        Analyse
                                                    </v-btn>
                                                </div>
                                            </v-col>
                                        </v-row>
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

<script>
import Vue from 'vue';

export default Vue.extend({
    name: 'Profile',

    components: {},

    props: {},

    data: () => ({}),

    computed: {
        preparedElems: function () {
            // gets, filters, sorts and transpiles all files
            const files = this.$store.state.files;
            const tags = this.$store.state.tags;
            const families = this.$store.state.families;
            const preparedFiles = files
                .filter((elem) => elem.owner)
                .map((elem) => {
                    return {
                        id: elem.id,
                        label: elem.label,
                        uploaded_at: elem.uploaded_at,
                        type: 'file',
                    };
                });
            const preparedTags = tags
                .filter((elem) => elem.owner)
                .map((elem) => {
                    return {
                        id: elem.id,
                        label: elem.label,
                        uploaded_at: elem.date_created,
                        type: 'tag',
                    };
                });
            const preparedFamilies = families
                .filter((elem) => elem.owner)
                .map((elem) => {
                    return {
                        id: elem.id,
                        label: elem.label,
                        uploaded_at: elem.date_created,
                        type: 'family',
                    };
                });
            const combined = preparedFiles
                .concat(preparedTags)
                .concat(preparedFamilies)
                .sort((a, b) => {
                    if (a.uploaded_at < b.uploaded_at) return 1;
                    else if (b.uploaded_at < a.uploaded_at) return -1;
                    else return 0;
                });
            /*console.log(combined)*/
            return combined;
        },
    },

    methods: {
        getFormattedDate(date) {
            const temp = new Date(date);
            return (
                ('0' + (temp.getMonth() + 1)).slice(-2) +
                '/' +
                ('0' + temp.getDate()).slice(-2) +
                '/' +
                ('' + temp.getFullYear()).slice(-2)
            );
        },
    },

    mounted() {
        if (!this.$store.state.loggedIn || !this.$store.state.currentUser) {
            this.$store.commit('updateSnackbar', {
                message: 'Please log in to view this page',
                variant: 'info',
                timeout: 5000,
                show: true,
            });
            this.$router.push('/login');
        }
        this.$store.dispatch('fetchFiles');
        this.$store.dispatch('fetchTags');
        this.$store.dispatch('fetchFamilies');
    },
});
</script>

<style scoped>
.timeline-div {
    max-height: 400px;
    overflow-y: scroll;
}
</style>
