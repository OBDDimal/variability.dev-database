<template>
    <v-bottom-sheet v-model="$store.state.openConstraints" hide-overlay>
        <constraint-add-dialog
            :show="showAddEditDialog"
            :all-nodes="rootNode ? rootNode.descendants() : undefined"
            @close="closeAddEditDialog"
            @save="(newConstraint) => save(newConstraint)"
            :constraint="constraintAddEdit"
            :mode="modeAddEdit"
        ></constraint-add-dialog>

        <v-data-table
            :key="updateKey"
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
                    <v-text-field
                        v-model="search"
                        class="mx-4"
                        label="Search"
                        prepend-inner-icon="mdi-magnify"
                    ></v-text-field>

                    <v-btn color="primary" @click="openAddEditDialog('Add', undefined)">Add</v-btn>

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

            <template v-slot:item.actions="{ item }">
                <v-icon
                    class="mr-6"
                    @click="openAddEditDialog('Edit', item.constraint)"
                >
                    mdi-pencil
                </v-icon>
                <v-icon
                >
                    mdi-delete
                </v-icon>
            </template>

            <template v-slot:no-data>
                <v-btn
                    color="primary"
                    @click="initialize"
                >
                    Reset
                </v-btn>
            </template>
        </v-data-table>
    </v-bottom-sheet>
</template>

<script>
import Vue from "vue";
import ConstraintAddDialog from '@/components/ConstraintAddDialog';
import {Constraint} from "@/classes/constraint";

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
        headers: [
            {text: "Constraint", value: "formula"},
            {text: "Actions", value: "actions"},
        ],
        search: "",
        showAddEditDialog: false,
        modeAddEdit: undefined,
        constraintAddEdit: undefined,
        updateKey: 0,
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

        update() {
            this.updateKey++;
        },

        save(newConstraintItem) {
            if (this.modeAddEdit === 'Add') {
                this.constraints.push(new Constraint(newConstraintItem));
            } else {
                this.constraintAddEdit.rule = newConstraintItem;
            }

            this.closeAddEditDialog();
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

        openAddEditDialog(mode, constraint) {
            this.showAddEditDialog = true;
            this.modeAddEdit = mode;
            this.constraintAddEdit = constraint;
        },

        closeAddEditDialog() {
            this.showAddEditDialog = false;
            this.constraintAddEdit = undefined;
        }
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
