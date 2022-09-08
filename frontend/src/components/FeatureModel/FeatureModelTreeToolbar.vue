<template>
    <div>
        <v-navigation-drawer
            v-model="drawer"
            :mini-variant="miniSidebar"
            absolute
            permanent
        >
            <v-list dense>
                <v-list-item @click.stop="miniSidebar = !miniSidebar">
                    <v-list-item-icon>
                        <v-icon v-if="miniSidebar">mdi-chevron-right</v-icon>
                        <v-icon v-else>mdi-chevron-left</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item :disabled="!isSaveAvailable || !editRights" @click="$emit('save')">
                    <v-list-item-icon>
                        <v-icon v-if="!isSaveAvailable" disabled>mdi-content-save</v-icon>
                        <v-icon v-else :disabled="!editRights">mdi-content-save-edit</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                        <v-list-item-title>Save</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-dialog persistent v-model="discardChangesConfirmDialog" width="400">
                    <template v-slot:activator="{ on, attrs }">
                        <v-list-item :disabled="!isUndoAvailable || !editRights" v-bind="attrs" v-on="on">
                            <v-list-item-icon>
                                <v-icon :disabled="!isUndoAvailable || !editRights">mdi-backup-restore</v-icon>
                            </v-list-item-icon>

                            <v-list-item-content>
                                <v-list-item-title>Discard changes</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </template>

                    <v-card>
                        <v-card-title>Discard changes?</v-card-title>
                        <v-card-text>Do you really want to discard all changes? This action can't be undone!
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" text @click="discardChangesConfirmDialog = false">Cancel</v-btn>
                            <v-btn color="primary" text @click="$emit('reset')">Discard</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

                <v-list-item :disabled="!isUndoAvailable || !editRights" @click="$emit('undo')">
                    <v-list-item-icon>
                        <v-icon :disabled="!isUndoAvailable || !editRights">mdi-undo</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                        <v-list-item-title>Undo</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item :disabled="!isRedoAvailable || !editRights" @click="$emit('redo')">
                    <v-list-item-icon>
                        <v-icon :disabled="!isRedoAvailable || !editRights">mdi-redo</v-icon>
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

                <v-menu offset-y>
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
                        <v-subheader>View</v-subheader>

                        <v-list-item class="clickable" @click="$emit('fitToView')">
                            <v-list-item-content>
                                <v-list-item-title>Fit to view</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item class="clickable" @click="$emit('toggleDirection')">
                            <v-list-item-content>
                                <v-list-item-title>
                                    {{ direction === 'v' ? 'Change direction to horizontally' : 'Change direction to vertically' }}
                                </v-list-item-title>
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
                        <v-subheader>Space parent -> child</v-subheader>
                        <v-list-item>
                            <v-slider
                                v-model="spaceBetweenParentChild"
                                hide-details
                                max="300"
                                min="40"
                                style="width: 200px"
                            ></v-slider>
                        </v-list-item>
                        <v-subheader>Space between siblings</v-subheader>
                        <v-list-item>
                            <v-slider
                                v-model="spaceBetweenSiblings"
                                hide-details
                                max="300"
                                min="5"
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

                <v-list-item :disabled="collaborationStatus" @click="$emit('show-collaboration-dialog')">
                    <v-list-item-icon>
                        <v-icon :disabled="collaborationStatus">mdi-account-multiple</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                        <v-list-item-title>Collaboration</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item @click="$emit('show-tutorial')" id="tutorial-mode">
                    <v-list-item-icon>
                        <v-icon>mdi-school</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                        <v-list-item-title>Tutorial</v-list-item-title>
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
        isSaveAvailable: Boolean,
        direction: String,
        editRights: undefined,
        collaborationStatus: undefined,
    },

    data: () => ({
        selectedColoring: undefined,
        selectedView: undefined,
        levels: 4,
        maxChildren: 3,
        spaceBetweenParentChild: 75,
        spaceBetweenSiblings: 20,
        itemsColoring: ["Count", "Direct Children", "Total Children"],
        isShortName: false,
        semanticEditing: false,
        drawer: false,
        miniSidebar: true,
        discardChangesConfirmDialog: false,
    }),

    watch: {
        selectedColoring: function (newValue) {
            this.$emit("coloring", newValue);
        },
        isShortName: function (newValue) {
            this.$emit("shortName", newValue);
        },
        spaceBetweenParentChild: function (newValue) {
            this.$emit("spaceBetweenParentChild", newValue);
        },
        spaceBetweenSiblings: function (newValue) {
            this.$emit("spaceBetweenSiblings", newValue);
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
