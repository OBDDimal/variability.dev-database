<template>
    <v-bottom-sheet v-model="$store.state.openConstraints" hide-overlay>
        <constraint-add-dialog
            :show="showAddDialog"
            :all-nodes="rootNode ? rootNode.descendants() : undefined"
            @close="showAddDialog = false"
            @add="(newConstraint) => add(newConstraint)"
        ></constraint-add-dialog>

        <v-data-table
            :headers="headers"
            :items="tableConstraints"
            :items-per-page="5"
            :search="search"
            hide-default-header
            style="padding: 10px"
            @click:row="highlightConstraint"
        >
            <template v-slot:top>
                <div class="d-flex justify-center align-center">
                    <v-btn color="primary" @click="showAddDialog = true">Add</v-btn>

                    <v-text-field
                        v-model="search"
                        class="mx-4"
                        label="Search"
                        prepend-inner-icon="mdi-magnify"
                    ></v-text-field>

                    <v-btn icon @click="$store.commit('openConstraints', false)">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </div>
            </template>

            <template v-slot:item.formula="{ item }">
                <v-chip
                    v-model="item.checked"
                    :color="item.constraint.color"
                    :style="`color: ${computeColor(item.constraint.color)}`"
                >
                    {{ item.formula }}
                </v-chip>
            </template>
        </v-data-table>
    </v-bottom-sheet>
</template>

<script>
import Vue from "vue";
import ConstraintAddDialog from '@/components/ConstraintAddDialog';

export default Vue.extend({
    name: "Constraints",

    components: {
        ConstraintAddDialog,
    },

    props: {
        constraints: undefined,
        rootNode: undefined,
    },

    data: () => ({
        headers: [{text: "Constraint", value: "formula"}],
        search: "",
        showAddDialog: false,
    }),

    computed: {
        tableConstraints() {
            return this.constraints.map((e) => ({
                constraint: e,
                formula: e.toString(),
                checked: false,
            }));
        },
    },

    methods: {
        highlightConstraint(constraintRow) {
            //TODO: Table row color
            constraintRow.checked = !constraintRow.checked;
            constraintRow.constraint.toggleHighlighted();
            constraintRow.constraint.getFeatureNodes().forEach((node) => node.uncollapse());
            this.$emit("update-feature-model");
        },

        add(newConstraint) {
            this.showAddDialog = false;
            this.constraints.push(newConstraint);
        },

        computeColor(bg) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(bg);
            var rgb = result
                ? [
                    parseInt(result[1], 16),
                    parseInt(result[2], 16),
                    parseInt(result[3], 16),
                ]
                : null;
            if (rgb) {
                if (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 > 170) {
                    return "#000";
                } else {
                    return "#fff";
                }
            } else {
                if (this.$vuetify.theme.dark) {
                    return "#fff"
                }
                return "#000"
            }
        },
    },
});
</script>

<style lang="scss" scoped>
.feature-model-constraints {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 2rem;
    min-height: 10%;
    max-height: 40%;
    overflow: hidden;
}
</style>
