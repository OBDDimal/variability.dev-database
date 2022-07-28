<template>
    <div>
        <v-navigation-drawer
            v-model="drawer"
            absolute
            permanent
            :mini-variant="showSidebar"
        >
            <v-list dense>
                <v-list-item @click.stop="showSidebar = !showSidebar">
                    <v-list-item-icon>
                        <v-icon v-if="showSidebar">mdi-chevron-right</v-icon>
                        <v-icon v-else>mdi-chevron-left</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item :disabled="!isUndoAvailable" @click="$emit('save')">
                    <v-list-item-icon>
                        <v-icon disabled v-if="!isUndoAvailable">mdi-content-save</v-icon>
                        <v-icon v-else>mdi-content-save-edit</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                        <v-list-item-title>Save</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item :disabled="!isUndoAvailable" @click="$emit('reset')">
                    <v-list-item-icon>
                        <v-icon :disabled="!isUndoAvailable">mdi-backup-restore</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                        <v-list-item-title>Discard changes</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item :disabled="!isUndoAvailable" @click="$emit('undo')">
                    <v-list-item-icon>
                        <v-icon :disabled="!isUndoAvailable">mdi-undo</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                        <v-list-item-title>Undo</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item :disabled="!isRedoAvailable" @click="$emit('redo')">
                    <v-list-item-icon>
                        <v-icon :disabled="!isRedoAvailable">mdi-redo</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                        <v-list-item-title>Redo</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-menu offset-y>
                    <template v-slot:activator="{ on, attrs }">
                        <v-list-item v-bind="attrs" v-on="on">
                            <v-list-item-icon>
                                <v-icon>mdi-palette</v-icon>
                            </v-list-item-icon>

                            <v-list-item-content>
                                <v-list-item-title>Coloring</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </template>
                    <v-list>
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
                        <v-list-item v-bind="attrs" v-on="on">
                            <v-list-item-icon>
                                <v-icon>mdi-eye</v-icon>
                            </v-list-item-icon>

                            <v-list-item-content>
                                <v-list-item-title>View</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </template>
                    <v-list>
                        <v-list-item class="clickable" v-fullscreen>
                            <v-list-item-content>
                                <v-list-item-title>Fullscreen</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item class="clickable" @click="$emit('fitToView')">
                            <v-list-item-content>
                                <v-list-item-title>Fit to view</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item
                            class="clickable"
                            @click="$emit('resetView', levels, maxChildren)"
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

                <v-list-item @click="$emit('export')">
                    <v-list-item-icon>
                        <v-icon>mdi-export-variant</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                        <v-list-item-title>Export as XML</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-menu :close-on-content-click="false" offset-y>
                    <template v-slot:activator="{ on, attrs }">
                        <v-list-item v-bind="attrs" v-on="on">
                            <v-list-item-icon>
                                <v-icon>mdi-dots-vertical</v-icon>
                            </v-list-item-icon>

                            <v-list-item-content>
                                <v-list-item-title>Settings</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </template>
                    <v-list>
                        <v-subheader>Adjust Levels</v-subheader>

                        <v-list-item>
                            <v-text-field
                                v-model="levels"
                                class="mt-0 pt-0"
                                min="0"
                                type="number"
                                @change="$emit('resetView', levels, maxChildren)"
                            ></v-text-field>
                        </v-list-item>
                        <v-subheader>Adjust Max Children</v-subheader>

                        <v-list-item>
                            <v-text-field
                                v-model="maxChildren"
                                class="mt-0 pt-0"
                                min="0"
                                type="number"
                                @change="$emit('resetView', levels, maxChildren)"
                            ></v-text-field>
                        </v-list-item>

                        <v-list-item>
                            <v-checkbox v-model="semanticEditing" label="Semantic editing"></v-checkbox>
                        </v-list-item>
                    </v-list>
                </v-menu>
                <!--<v-list-group no-action prepend-icon="mdi-palette">
                    <template v-slot:activator>
                        <v-list-item-title>Coloring</v-list-item-title>
                    </template>

                    <v-list-item-group v-model="selectedColoring">
                        <v-list-item v-for="(item, i) in itemsColoring" :key="i">
                            <v-list-item-content>
                                <v-list-item-title>{{item}}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list-item-group>
                </v-list-group>-->
            </v-list>
        </v-navigation-drawer>
    </div>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
    name: "FeatureModelTreeToolbar",

    components: {},

    props: {
        isUndoAvailable: Boolean,
        isRedoAvailable: Boolean,
    },

    data: () => ({
        selectedColoring: undefined,
        selectedView: undefined,
        levels: 4,
        maxChildren: 3,
        verticalSpacing: 75,
        itemsColoring: ["Count", "Direct Children", "Total Children"],
        isShortName: false,
        semanticEditing: false,
        drawer: true,
        showSidebar: false,
    }),

    watch: {
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
        semanticEditing: function (newValue) {
            this.$emit("semanticEditing", newValue);
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

@media only screen and (max-width: 1800px) {
    .v-toolbar {
        width: 100%;
    }
}
</style>
