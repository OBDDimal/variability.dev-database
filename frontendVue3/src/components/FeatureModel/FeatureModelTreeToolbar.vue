<template>
    <div>
        <v-navigation-drawer
            v-model="drawer"
            rail
            expand-on-hover
            absolute
            permanent
            location="start"
        >
            <v-list dense>
                <v-list-item
                    @click="$emit('new-empty-model')"
                    prepend-icon="mdi-file-document-plus-outline"
                >
                    <v-list-item-title>New empty model</v-list-item-title>
                </v-list-item>

                <v-dialog v-model="saveDialog" persistent width="400">
                    <template v-slot:activator="{ props }">
                        <v-list-item
                            v-bind="props"
                            :prepend-icon="
                                !isSaveAvailable
                                    ? 'mdi-content-save'
                                    : 'mdi-content-save-edit'
                            "
                            id="feature-model-toolbar-save"
                        >
                            <v-list-item-title>Save</v-list-item-title>
                        </v-list-item>
                    </template>

                    <v-card>
                        <v-card-title>Save?</v-card-title>
                        <v-card-text>
                            Do you really want to overwrite the feature-model
                            currently saved in local storage?
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn
                                text
                                color="error"
                                @click="saveDialog = false"
                            >
                                Cancel
                            </v-btn>
                            <v-btn
                                color="primary"
                                text
                                @click="
                                    () => {
                                        $emit('save');
                                        this.saveDialog = false;
                                    }
                                "
                            >
                                Save
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

                <v-dialog
                    v-model="discardChangesConfirmDialog"
                    persistent
                    width="400"
                >
                    <template v-slot:activator="{ props }">
                        <v-list-item
                            :disabled="!isUndoAvailable || !editRights"
                            v-bind="props"
                            prepend-icon="mdi-backup-restore"
                        >
                            <v-list-item-title>
                                Discard changes
                            </v-list-item-title>
                        </v-list-item>
                    </template>

                    <v-card>
                        <v-card-title>Discard changes?</v-card-title>
                        <v-card-text
                            >Do you really want to discard all changes? This
                            action can't be undone!
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn
                                color="primary"
                                text
                                @click="discardChangesConfirmDialog = false"
                                >Cancel
                            </v-btn>
                            <v-btn color="primary" text @click="$emit('reset')"
                                >Discard
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

                <v-list-item
                    :disabled="!isUndoAvailable || !editRights"
                    @click="$emit('undo')"
                    prepend-icon="mdi-undo"
                >
                    <v-list-item-title>Undo</v-list-item-title>
                </v-list-item>

                <v-list-item
                    :disabled="!isRedoAvailable || !editRights"
                    @click="$emit('redo')"
                    prepend-icon="mdi-redo"
                >
                    <v-list-item-title>Redo</v-list-item-title>
                </v-list-item>

                <v-menu offset-y :close-on-content-click="false" >
                    <template v-slot:activator="{ props }">
                        <v-list-item v-bind="props" prepend-icon="mdi-palette">
                            <v-list-item-title>Coloring</v-list-item-title>
                        </v-list-item>
                    </template>
                    <v-list>
                        <v-list-item
                            v-for="(item, i) in itemsColoring"
                            :key="i"
                            @click="selectedColoring(i)"
                        >
                                <v-list-item-title
                                >{{item}}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>

                <v-menu offset-y :close-on-content-click="false">
                    <template v-slot:activator="{ props }">
                        <v-list-item v-bind="props" prepend-icon="mdi-eye">
                            <v-list-item-title> View </v-list-item-title>
                        </v-list-item>
                    </template>
                    <v-list>
                        <v-list-subheader>View</v-list-subheader>

                        <v-list-item
                            class="clickable"
                            @click="$emit('fitToView')"
                        >
                            <v-list-item-title> Fit to view </v-list-item-title>
                        </v-list-item>
                        <v-list-item
                            class="clickable"
                            @click="$emit('toggleDirection')"
                        >
                            <v-list-item-title>
                                {{
                                    direction === 'v'
                                        ? 'Change direction to horizontally'
                                        : 'Change direction to vertically'
                                }}
                            </v-list-item-title>
                        </v-list-item>
                        <v-list-item
                            class="clickable"
                            @click="$emit('resetView', levels, maxChildren)"
                        >
                            <v-list-item-title> Reset view </v-list-item-title>
                        </v-list-item>
                        <v-list-item
                            class="clickable"
                            @click="$store.commit('openConstraints', true)"
                        >
                            <v-list-item-title>
                                Show Constraints
                            </v-list-item-title>
                        </v-list-item>
                        <v-list-item>
                            <template v-slot:prepend="{ active }">
                                <v-list-item-action start>
                                    <v-checkbox-btn
                                        v-model="isShortName"
                                        :input-value="active"
                                        color="primary"
                                    ></v-checkbox-btn>
                                </v-list-item-action>

                                <v-list-item-title>
                                    Short Name
                                </v-list-item-title>
                            </template>
                        </v-list-item>
                        <v-list-subheader>
                            Space parent -> child</v-list-subheader
                        >
                        <v-list-item>
                            <v-slider
                                v-model="spaceBetweenParentChild"
                                hide-details
                                max="300"
                                min="40"
                                style="width: 200px"
                            ></v-slider>
                        </v-list-item>
                        <v-list-subheader
                            >Space between siblings</v-list-subheader
                        >
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

                <v-list-item
                    @click="$emit('export')"
                    prepend-icon="mdi-export-variant"
                >
                    <v-list-item-title>Export as XML</v-list-item-title>
                </v-list-item>

                <v-list-item
                    :disabled="collaborationStatus"
                    @click="$emit('show-collaboration-dialog')"
                    id="feature-model-toolbar-collaboration"
                    prepend-icon="mdi-account-multiple"
                >
                    <v-list-item-title>Collaboration</v-list-item-title>
                </v-list-item>

                <v-list-item
                    @click="$emit('show-tutorial')"
                    id="tutorial-mode"
                    prepend-icon="mdi-school"
                >
                    <v-list-item-title>Tutorial</v-list-item-title>
                </v-list-item>

                <v-menu :close-on-content-click="false" offset-y>
                    <template v-slot:activator="{ props }">
                        <v-list-item
                            v-bind="props"
                            id="feature-model-toolbar-other-settings"
                            prepend-icon="mdi-dots-vertical"
                        >
                            <v-list-item-title>Settings</v-list-item-title>
                        </v-list-item>
                    </template>
                    <v-list>
                        <v-list-subheader>Adjust Levels</v-list-subheader>

                        <v-list-item>
                            <v-text-field
                                v-model="levels"
                                class="mt-0 pt-0"
                                min="0"
                                type="number"
                                @change="
                                    $emit('resetView', levels, maxChildren)
                                "
                            ></v-text-field>
                        </v-list-item>
                        <v-list-subheader>Adjust Max Children</v-list-subheader>

                        <v-list-item>
                            <v-text-field
                                v-model="maxChildren"
                                class="mt-0 pt-0"
                                min="0"
                                type="number"
                                @change="
                                    $emit('resetView', levels, maxChildren)
                                "
                            ></v-text-field>
                        </v-list-item>

                        <v-list-item>
                            <template v-slot:prepend="{ active }">
                                <v-list-item-action start>
                                    <v-checkbox-btn
                                        v-model="semanticEditing"
                                        :input-value="active"
                                        color="primary"
                                    ></v-checkbox-btn>
                                </v-list-item-action>

                                <v-list-item-title>
                                    Semantic editing
                                </v-list-item-title>
                            </template>
                        </v-list-item>
                        <v-list-item>
                            <template v-slot:prepend="{ active }">
                                <v-list-item-action start>
                                    <v-checkbox-btn
                                        v-model="quickEdit"
                                        :input-value="active"
                                        color="primary"
                                    ></v-checkbox-btn>
                                </v-list-item-action>

                                <v-list-item-title>
                                    Quick edit
                                </v-list-item-title>
                            </template>
                        </v-list-item>
                    </v-list>
                </v-menu>
                <v-list-item
                    id="featureide-service-status"
                >
                  <template v-slot:prepend>
                    <v-icon v-if=isServiceAvailable>mdi-wifi</v-icon>
                    <v-icon v-if=!isServiceAvailable>mdi-wifi-off</v-icon>
                  </template>
                    <v-list-item-title>FeatureIDE Service Status</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>
    </div>
</template>

<script>
export default {
    name: 'FeatureModelTreeToolbar',

    components: {},

    props: {
        isUndoAvailable: Boolean,
        isRedoAvailable: Boolean,
        isSaveAvailable: Boolean,
        isServiceAvailable: Boolean,
        direction: String,
        editRights: undefined,
        collaborationStatus: undefined,
    },

    data: () => ({
        selectedView: undefined,
        levels: 4,
        maxChildren: 3,
        spaceBetweenParentChild: 75,
        spaceBetweenSiblings: 20,
        itemsColoring: ['Standard', 'Direct Children', 'Total Children'],
        isShortName: false,
        semanticEditing: false,
        quickEdit: false,
        drawer: true,
        discardChangesConfirmDialog: false,
        saveDialog: false,
        isColorMenuOpened: false,
    }),

    watch: {
        isShortName: function (newValue) {
            this.$emit('shortName', newValue);
        },
        spaceBetweenParentChild: function (newValue) {
            this.$emit('spaceBetweenParentChild', newValue);
        },
        spaceBetweenSiblings: function (newValue) {
            this.$emit('spaceBetweenSiblings', newValue);
        },
        levels: function (newValue) {
            this.$emit('levels', newValue);
        },
        maxChilds: function (newValue) {
            this.$emit('maxChilds', newValue);
        },
        semanticEditing: function (newValue) {
            this.$emit('semanticEditing', newValue);
        },
        quickEdit: function (newValue) {
            this.$emit('quickEdit', newValue);
        },
    },

    computed: {},

    methods: {
        selectedColoring(newValue) {
            this.$emit('coloring', newValue);
        },
    },
};
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
