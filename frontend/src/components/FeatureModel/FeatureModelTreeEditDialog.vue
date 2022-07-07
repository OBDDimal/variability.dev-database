<template>
	<div class="text-center">
		<v-dialog width="500" v-model="show" persistent>
			<v-card>
				<v-card-title class="text-h5 grey lighten-2"> Edit Feature </v-card-title>

				<v-form @submit.prevent="save">
					<v-card-text>
						<v-row class="my-2">
							<v-col cols="12" class="pt-0">
								<template>
									<v-text-field
										v-model="name"
										hide-details
										label="Name"
										:rules="[(value) => !!value || 'Required.']"
									></v-text-field>
								</template>
							</v-col>
						</v-row>

						<v-row class="my-2" v-if="showGroupTypeSelection">
							<v-col cols="12">
								<v-btn-toggle dense v-model="convertGroupType" mandatory>
									<v-btn>⊻ alt </v-btn>
									<v-btn>∨ or </v-btn>
									<v-btn>∧ and </v-btn>
								</v-btn-toggle>
							</v-col>
						</v-row>

						<v-row class="my-2" v-if="showMandatorySelection">
							<v-col cols="12">
								<v-btn-toggle dense v-model="mandatory" mandatory>
									<v-btn> mandatory </v-btn>
									<v-btn> optional </v-btn>
								</v-btn-toggle>
							</v-col>
						</v-row>

						<v-checkbox v-model="abstract" label="Abstract" hide-details></v-checkbox>
					</v-card-text>

					<v-divider></v-divider>

					<v-card-actions>
						<v-btn color="secondary" text @click="discard"> Discard </v-btn>
						<v-spacer></v-spacer>
						<v-btn color="primary" type="submit" text> Save </v-btn>
					</v-card-actions>
				</v-form>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
	name: 'FeatureModelTreeEditDialog',

	data: () => ({
		name: undefined,
		groupType: undefined,
		mandatory: undefined,
		abstract: undefined,
	}),

	props: {
		d3Node: Object,
	},

	watch: {
		d3Node() {
			if (this.d3Node) {
				this.name = this.d3Node.data.name;
				this.groupType = this.d3Node.data.groupType;
				this.mandatory = this.d3Node.data.isMandatory;
				this.abstract = this.d3Node.data.isAbstract;
			}
		},
	},

	computed: {
		show: {
			get() {
				return !!this.d3Node;
			},
			set() {},
		},

		convertGroupType: {
			get() {
				if (this.d3Node) {
					switch (this.groupType) {
						case 'alt':
							return 0;
						case 'or':
							return 1;
						case 'and':
							return 2;
						default:
							return 0;
					}
				}
				return 0;
			},
			set(newValue) {
				switch (newValue) {
					case 0:
						this.groupType = 'alt';
						break;
					case 1:
						this.groupType = 'or';
						break;
					case 2:
						this.groupType = 'and';
						break;
					default:
						this.groupType = 'alt';
						break;
				}
			},
		},

		showMandatorySelection() {
			if (this.d3Node) {
				return !this.d3Node.data.isRoot && this.d3Node.data.parent.isAnd();
			}
			return false;
		},

		showGroupTypeSelection() {
			if (this.d3Node) {
				return !this.d3Node.data.isLeaf();
			}
			return false;
		},
	},

	methods: {
		discard() {
			this.close();
		},

		close() {
			this.show = false;
			this.$emit('close');
		},

		save() {
			this.d3Node.data.name = this.name;
			this.d3Node.data.groupType = this.groupType;
			this.d3Node.data.isMandatory = this.mandatory;
			this.d3Node.data.isAbstract = this.abstract;
			this.close();
			this.$emit('update');
		},
	},
});
</script>

<style scoped></style>
