<template>
    <div>
        <v-toolbar
            absolute
            class="mt-5 ml-5"
            elevation="12"
            floating
            left
            shaped
            style="border: 2px solid white"
            top
        >
            <v-text-field
                v-model="searchText"
                hide-details
                placeholder="Search Features"
                prepend-icon="mdi-magnify"
                single-line
            ></v-text-field>

            <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon>mdi-palette</v-icon>
                    </v-btn>
                </template>
                <v-list>
                    <v-subheader>Coloring</v-subheader>

                    <v-list-item-group v-model="selectedColoring" color="primary">
                        <v-list-item v-for="(item, i) in itemsColoring" :key="i">
                            <v-list-item-content>
                                <v-list-item-title v-text="item"></v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
            </v-menu>

            <v-menu :close-on-content-click="false" offset-y>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon>mdi-eye</v-icon>
                    </v-btn>
                </template>
                <v-list>
                    <v-subheader>View</v-subheader>

                    <v-list-item class="clickable" @click="$emit('fitToView')">
                        <v-list-item-content>
                            <v-list-item-title>Fit to view</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item
                        class="clickable"
                        @click="$emit('resetView', levels, maxChilds)"
                    >
                        <v-list-item-content>
                            <v-list-item-title>Reset view</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item class="clickable" @click="$store.commit('openConstraints', true)">
                        <v-list-item-content>
                            <v-list-item-title>Show Constraints</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item>
                        <template v-slot:default="{ active }">
                            <v-list-item-action>
                                <v-checkbox
                                    v-model="isShortName"
                                    :input-value="active"
                                    color="primary"
                                ></v-checkbox>
                            </v-list-item-action>

                            <v-list-item-content>
                                <v-list-item-title>Short Name</v-list-item-title>
                            </v-list-item-content>
                        </template>
                    </v-list-item>
                    <v-subheader>Spacing</v-subheader>
                    <v-list-item>
                        <v-slider
                            v-model="verticalSpacing"
                            hide-details
                            max="300"
                            min="40"
                            style="width: 200px"
                        ></v-slider>
                    </v-list-item>
                </v-list>
            </v-menu>

            <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon>mdi-export-variant</v-icon>
                    </v-btn>
                </template>
                <v-list>
                    <v-subheader>Export</v-subheader>

                    <v-btn color="primary" rounded text @click="$emit('export')"
                    >Export as XML
                    </v-btn
                    >
                </v-list>
            </v-menu>

            <v-menu :close-on-content-click="false" offset-y>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                        <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                </template>
                <v-list>
                    <v-subheader>Adjust Levels</v-subheader>

                    <v-list-item>
                        <v-text-field
                            v-model="levels"
                            class="mt-0 pt-0"
                            min="0"
                            type="number"
                            @change="$emit('resetView', levels, maxChilds)"
                        ></v-text-field>
                    </v-list-item>
                    <v-subheader>Adjust Max Children</v-subheader>

                    <v-list-item>
                        <v-text-field
                            v-model="maxChilds"
                            class="mt-0 pt-0"
                            min="0"
                            type="number"
                            @change="$emit('resetView', levels, maxChilds)"
                        ></v-text-field>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-toolbar>
    </div>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
    name: "FeatureModelTreeToolbar",

    components: {},

    props: {},

    data: () => ({
        selectedColoring: undefined,
        selectedView: undefined,
        levels: 4,
        maxChilds: 3,
        verticalSpacing: 75,
        itemsColoring: ["Count", "Direct Children", "Total Children"],
        searchText: "",
        isShortName: false,
    }),

    watch: {
        searchText: function (newValue) {
            this.$emit("search", newValue);
        },
        selectedColoring: function (newValue) {
            this.$emit("coloring", newValue);
        },
        isShortName: function (newValue) {
            this.$emit("shortName", newValue);
        },
        verticalSpacing: function (newValue) {
            this.$emit("verticalSpacing", newValue);
        },
        levels: function (newValue) {
            this.$emit("levels", newValue);
        },
        maxChilds: function (newValue) {
            this.$emit("maxChilds", newValue);
        },
    },

    computed: {},

    methods: {},
});
</script>

<style scoped>
.clickable {
    cursor: pointer;
}
</style>
