<template>
    <v-menu
        v-model="show"
        :position-x="d3NodeEvent ? d3NodeEvent.pageX : 0"
        :position-y="d3NodeEvent ? d3NodeEvent.pageY : 0"
        absolute
        offset-y
        transition="scroll-y-transition"
    >
        <v-list>
            <v-list-item :disabled="d3Node && !d3Node.children && !d3Node.collapsedChildren"
                         @click="$emit('collapse', d3Node)">
                <v-list-item-icon>
                    <v-icon>mdi-arrow-collapse-all</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                    <v-list-item-title>Collapse</v-list-item-title>
                </v-list-item-content>
            </v-list-item>

            <v-divider></v-divider>

            <v-list-item
                :disabled="
					!(
						d3Node &&
						d3Node.parent &&
						d3Node.parent.children &&
						d3Node.parent.children.length > 1 &&
						d3Node.parent.children[0].data.name !== d3Node.data.name
					)
				"
                @click="$emit('hideLeftSiblings', d3Node)"
            >
                <v-list-item-content>
                    <v-list-item-title>Hide left siblings</v-list-item-title>
                </v-list-item-content>
            </v-list-item>

            <v-list-item
                :disabled="
					!(
						d3Node &&
						d3Node.parent &&
						d3Node.parent.children &&
						d3Node.parent.children.length > 1 &&
						d3Node.parent.children[d3Node.parent.children.length - 1].data.name !== d3Node.data.name
					)
				"
                @click="$emit('hideRightSiblings', d3Node)"
            >
                <v-list-item-content>
                    <v-list-item-title>Hide right siblings</v-list-item-title>
                </v-list-item-content>
            </v-list-item>

            <v-list-item :disabled="d3Node && d3Node.data && d3Node.data.isRoot"
                         @click="$emit('hideCurrentNode', d3Node)">
                <v-list-item-content>
                    <v-list-item-title>Hide current node
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>

            <v-divider></v-divider>

            <!-- TODO: Emit event to highlight -->
            <v-list-item :disabled="!(d3Node && d3Node.data.constraints && d3Node.data.constraints.length)">
                <v-list-item-content>
                    <v-list-item-title>Highlight constraints</v-list-item-title>
                </v-list-item-content>
            </v-list-item>

            <v-divider></v-divider>

            <v-list-item @click="$emit('edit', d3Node)">
                <v-list-item-content>
                    <v-list-item-title>Edit</v-list-item-title>
                </v-list-item-content>
            </v-list-item>

            <v-list-item @click="$emit('add', d3Node)">
                <v-list-item-content>
                    <v-list-item-title>Add</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
    name: 'FeatureModelTreeContextMenu',

    props: {
        d3Node: undefined,
        d3NodeEvent: undefined,
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
});
</script>

<style scoped>
.v-list-item:not(.v-list-item--disabled) {
    cursor: pointer;
}
</style>
