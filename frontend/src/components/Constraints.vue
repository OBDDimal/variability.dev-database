<template>
	<v-bottom-sheet v-model="isOpen" hide-overlay>
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

					<v-btn
						icon
						@click="$store.commit('openConstraints', false)"
					>
						<v-icon>mdi-close</v-icon>
					</v-btn>
				</div>
			</template>

			<template v-slot:item.formula="{ item }">
				<v-chip
					v-model="item.checked"
					:color="item.constraint.color"
					:style="`color: ${computeColor(item.constraint.color)}`"
					@click="highlightConstraint(item)"
				>
					{{ item.formula }}
				</v-chip>
			</template>

			<template v-slot:item.actions="{ item }">
				<v-icon
					class="mr-6"
					@click="openAddEditDialog('Edit', item.constraint)"
					:disabled="!editRights"
				>
					mdi-pencil
				</v-icon>
				<v-icon
					@click="deleteConstraint(item.constraint)"
					:disabled="!editRights"
				>
					mdi-delete
				</v-icon>
			</template>
		</v-data-table>
	</v-bottom-sheet>
</template>

<script>
import Vue from 'vue'
import ConstraintAddEditDialog from '@/components/ConstraintAddEditDialog'
import { AddCommand } from '@/classes/Commands/Constraints/AddCommand'
import { CommandManager } from '@/classes/Commands/CommandManager'
import { EditCommand } from '@/classes/Commands/Constraints/EditCommand'
import { DeleteCommand } from '@/classes/Commands/Constraints/DeleteCommand'

export default Vue.extend({
	name: 'Constraints',

	components: {
		ConstraintAddEditDialog: ConstraintAddEditDialog,
	},

	props: {
		commandManager: CommandManager,
		constraints: undefined,
		rootNode: undefined,
		editRights: undefined,
        isOpen: Boolean,
	},

	data: () => ({
		headers: [
			{ text: 'Constraint', value: 'formula', width: '50%' },
			{ text: 'Actions', value: 'actions', width: '50%' },
		],
		search: '',
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
			}))
		},
	},

	methods: {
		highlightConstraint(constraintRow) {
			constraintRow.checked = !constraintRow.checked
			constraintRow.constraint.toggleHighlighted()
			constraintRow.constraint
				.getFeatureNodes()
				.forEach((node) => node.uncollapse())
			this.$emit('update-feature-model')
		},

		update() {
			this.updateKey++
		},

		save(newConstraintItem) {
			let command
			if (this.modeAddEdit === 'Add') {
				command = new AddCommand(this.constraints, newConstraintItem)
			} else {
				command = new EditCommand(
					this.constraints,
					this.constraintAddEdit,
					newConstraintItem
				)
			}
			this.closeAddEditDialog()
			this.commandManager.execute(command)
		},

		deleteConstraint(constraint) {
			const command = new DeleteCommand(this.constraints, constraint)
			this.commandManager.execute(command)
		},

		computeColor(bg) {
			const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(bg)
			const rgb = result
				? [
						parseInt(result[1], 16),
						parseInt(result[2], 16),
						parseInt(result[3], 16),
						// eslint-disable-next-line no-mixed-spaces-and-tabs
				  ]
				: null
			if (rgb) {
				if (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 > 170) {
					return '#000'
				} else {
					return '#fff'
				}
			} else {
				if (this.$vuetify.theme.dark) {
					return '#fff'
				}
				return '#000'
			}
		},

		openAddEditDialog(mode, constraint) {
			this.showAddEditDialog = true
			this.modeAddEdit = mode
			this.constraintAddEdit = constraint
		},

		closeAddEditDialog() {
			this.showAddEditDialog = false
			this.constraintAddEdit = undefined
		},

		undo() {
			this.commandManager.undo()
		},

		redo() {
			this.commandManager.redo()
		},
	},

	watch: {
		editRights() {
			if (!this.editRights) {
				this.showAddEditDialog = false
			}
		},
	},
})
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
