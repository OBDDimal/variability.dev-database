<template>
    <v-menu
        v-model="show"
        :close-on-click="true"
        :close-on-content-click="false"
        :style="`left: ${d3NodeEvent ? d3NodeEvent.pageX + 'px' : '0'};top: ${
            d3NodeEvent ? d3NodeEvent.pageY + 'px' : '0'
        }`"
        max-height="80%"
        absolute
        offset-y
        transition="scroll-y-transition"
    >
        <v-list>
            <v-list-item
                :disabled="
                    d3Node && !d3Node.children && !d3Node.collapsedChildren
                "
                @click="$emit('collapse', d3Node)"
                prepend-icon="mdi-arrow-collapse-all"
            >
                <v-list-item-title>Collapse</v-list-item-title>
            </v-list-item>

            <v-divider></v-divider>

            <v-list-group no-action prepend-icon="mdi-eye-off">
                <template v-slot:activator="{ props }">
                    <v-list-item v-bind="props">
                        <v-list-item-title> Hide Nodes</v-list-item-title>
                    </v-list-item>
                </template>

                <v-list-item
                    :disabled="
                        !(
                            d3Node &&
                            d3Node.parent &&
                            d3Node.parent.children &&
                            d3Node.parent.children.length > 1 &&
                            d3Node.parent.children[0].data.name !==
                                d3Node.data.name
                        )
                    "
                    @click="$emit('hideLeftSiblings', d3Node)"
                >
                    <v-list-item-title>Hide left siblings</v-list-item-title>
                </v-list-item>

                <v-list-item
                    :disabled="
                        !(
                            d3Node &&
                            d3Node.parent &&
                            d3Node.parent.children &&
                            d3Node.parent.children.length > 1 &&
                            d3Node.parent.children[
                                d3Node.parent.children.length - 1
                            ].data.name !== d3Node.data.name
                        )
                    "
                    @click="$emit('hideRightSiblings', d3Node)"
                >
                    <v-list-item-title>Hide right siblings</v-list-item-title>
                </v-list-item>

                <v-list-item
                    :disabled="d3Node && d3Node.data && d3Node.data.isRoot"
                    @click="$emit('hideCurrentNode', d3Node)"
                >
                    <v-list-item-title>Hide current node</v-list-item-title>
                </v-list-item>

                <v-list-item @click="$emit('hideAllOtherNodes', d3Node)">
                    <v-list-item-title>
                        Hide all other nodes on every level
                    </v-list-item-title>
                </v-list-item>

                <v-list-item
                    :disabled="d3Node && d3Node.data && d3Node.data.isRoot"
                    @click="$emit('hideAllNodesOnThisLevel', d3Node)"
                >
                    <v-list-item-title>
                        Hide all other siblings on this level
                    </v-list-item-title>
                </v-list-item>
            </v-list-group>

            <v-divider></v-divider>

            <v-list-item
                :disabled="
                    !(
                        d3Node &&
                        d3Node.data.constraints &&
                        d3Node.data.constraints.length
                    )
                "
                @click="$emit('highlightConstraints', d3Node)"
            >
                <v-list-item-title>Highlight constraints</v-list-item-title>
            </v-list-item>

            <v-list-item
                :disabled="
                    !(
                        d3Node &&
                        d3Node.data.constraints &&
                        d3Node.data.constraints.length
                    )
                "
                @click="$emit('resetHighlightConstraints', d3Node)"
            >
                <v-list-item-title
                    >Reset highlight constraints</v-list-item-title
                >
            </v-list-item>

            <v-divider v-if="editRights"></v-divider>

            <v-list-item
                v-if="editRights"
                @click="$emit('edit', d3Node)"
                prepend-icon="mdi-pencil"
            >
                <v-list-item-title>Edit</v-list-item-title>
            </v-list-item>

            <v-list-item
                  v-if="editRights"
                  @click="$emit('remove', d3Node)"
                  prepend-icon="mdi-delete"
            >
                <v-list-item-title>Remove</v-list-item-title>
            </v-list-item>

            <v-list-group v-if="editRights" no-action prepend-icon="mdi-plus">
                <template v-slot:activator="{ props }">
                    <v-list-item v-bind="props">
                        <v-list-item-title>Add</v-list-item-title>
                    </v-list-item>
                </template>

                <v-list-item @click="$emit('addAsChild', d3Node)">
                    <v-list-item-title>Add as child</v-list-item-title>
                </v-list-item>

                <v-list-item
                    :disabled="d3Node && d3Node.data.isRoot"
                    @click="$emit('addAsSibling', d3Node)"
                >
                    <v-list-item-title>Add as sibling</v-list-item-title>
                </v-list-item>
            </v-list-group>
        </v-list>
    </v-menu>
</template>

<script>
export default {
    name: 'FeatureModelTreeContextMenu',

    props: {
        d3Node: undefined,
        d3NodeEvent: undefined,
        editRights: undefined,
    },

    computed: {
        show: {
            get() {
                return !!this.d3Node;
            },
            set() {
                this.$emit('close');
            },
        },
    },
};
</script>

<style scoped>
.v-list-item:not(.v-list-item--disabled) {
    cursor: pointer;
}
</style>
