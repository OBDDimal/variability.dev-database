<template>
    <v-bottom-sheet
        v-model="isOpenDialog"
        hide-overlay
        @click:outside="$emit('close')"
    >
        <constraint-add-edit-dialog
            :all-nodes="rootNode ? rootNode.descendants() : undefined"
            :constraint="constraintAddEdit"
            :mode="modeAddEdit"
            :show="showAddEditDialog"
            @close="closeAddEditDialog"
            @save="(newConstraint) => save(newConstraint)"
        ></constraint-add-edit-dialog>

        <v-data-table
            :key="updateKey"
            :headers="headers"
            :items="tableConstraints"
            :items-per-page="5"
            :search="search"
            hide-default-header
            style="padding: 10px"
        >
            <template v-slot:top>
                <div class="d-flex justify-center align-center">
                    <v-text-field
                        v-model="search"
                        class="mx-4"
                        label="Search"
                        prepend-inner-icon="mdi-magnify"
                    ></v-text-field>

                    <v-btn
                        icon
                        outlined
                        :disabled="!editRights"
                        class="mr-1"
                        @click="openAddEditDialog('Add', undefined)"
                    >
                        <v-icon :disabled="!editRights">mdi-plus</v-icon>
                    </v-btn>

                    <v-btn
                        :disabled="
                            !commandManager.isUndoAvailable() || !editRights
                        "
                        icon
                        outlined
                        class="mr-1"
                        @click="undo"
                    >
                        <v-icon>mdi-undo</v-icon>
                    </v-btn>

                    <v-btn
                        :disabled="
                            !commandManager.isRedoAvailable() || !editRights
                        "
                        icon
                        outlined
                        @click="redo"
                    >
                        <v-icon>mdi-redo</v-icon>
                    </v-btn>

                    <v-btn icon @click="$emit('close')">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </div>
            </template>

            <template v-slot:item.formula="{ item }">
                <v-chip
                    :color="item.raw.constraint.color"
                    @click="highlightConstraint(item.raw)"
                >
                {{ item.raw.formula }}
                </v-chip>
            </template>

            <template v-slot:item.actions="{ item }">
                <v-btn
                    icon="mdi-pencil"
                    variant="text"
                    @click="openAddEditDialog('Edit', item.raw.constraint)"
                    :disabled="!editRights"
                >
                </v-btn>
                <v-btn
                    icon="mdi-delete"
                    variant="text"
                    @click="deleteConstraint(item.raw.constraint)"
                    :disabled="!editRights"
                >
                </v-btn>
            </template>
        </v-data-table>
    </v-bottom-sheet>
</template>

<script>
import ConstraintAddEditDialog from '@/components/ConstraintAddEditDialog';
import { AddCommand } from '@/classes/Commands/Constraints/AddCommand';
import { CommandManager } from '@/classes/Commands/CommandManager';
import { EditCommand } from '@/classes/Commands/Constraints/EditCommand';
import { DeleteCommand } from '@/classes/Commands/Constraints/DeleteCommand';

export default {
    name: 'Constraints',

    components: {
        ConstraintAddEditDialog: ConstraintAddEditDialog,
    },

    props: {
        commandManager: CommandManager,
        constraints: Array,
        rootNode: undefined,
        editRights: undefined,
        isOpen: Boolean,
    },

    data: () => ({
        headers: [
            { title: 'Constraint', key: 'formula', width: '50%' },
            { title: 'Actions', key: 'actions', width: '50%' },
        ],
        search: '',
        showAddEditDialog: false,
        modeAddEdit: undefined,
        constraintAddEdit: undefined,
        updateKey: 0,
    }),

  computed: {
        isOpenDialog: {
            get() {
                return this.isOpen;
            },
            set() {},
        },
        tableConstraints() {
            return this.constraints.map((e) => ({
                constraint: e,
                formula: e.toString(),
            }));
        },
    },

    methods: {
        highlightConstraint(constraintRow) {
            constraintRow.constraint.toggleHighlighted();
            constraintRow.constraint
                .getFeatureNodes()
                .forEach((node) => node.uncollapse());
            this.$emit('update-feature-model');
        },

        update() {
            this.updateKey++;
        },

        save(newConstraintItem) {
            let command;
            if (this.modeAddEdit === 'Add') {
                command = new AddCommand(this.constraints, newConstraintItem);
            } else {
                command = new EditCommand(
                    this.constraints,
                    this.constraintAddEdit,
                    newConstraintItem
                );
            }
            this.closeAddEditDialog();
            this.commandManager.execute(command);
            this.$emit('update-feature-model');
        },

        deleteConstraint(constraint) {
            if(constraint.isHighlighted){ //reset highlight to free up color
                constraint.toggleHighlighted();
            }
            const command = new DeleteCommand(this.constraints, constraint);
            this.commandManager.execute(command);
            this.$emit('update-feature-model');
        },

        openAddEditDialog(mode, constraint) {
            this.showAddEditDialog = true;
            this.modeAddEdit = mode;
            this.constraintAddEdit = constraint;
        },

        closeAddEditDialog() {
            this.showAddEditDialog = false;
            this.constraintAddEdit = undefined;
        },

        undo() {
            this.commandManager.undo();
            this.$emit('update-feature-model');
        },

        redo() {
            this.commandManager.redo();
            this.$emit('update-feature-model');
        },
    },

    watch: {
        editRights() {
            if (!this.editRights) {
                this.showAddEditDialog = false;
            }
        },
    },
};
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
