<template>
	<div class="text-center">
		<v-dialog width="500" v-model="show" persistent>
			<v-card>
				<v-card-title class="text-h5 grey lighten-2"> Edit Node </v-card-title>

				<v-card-text>
					<v-row class="my-2">
						<v-col cols="12">
							<template>
								<v-text-field v-model="name" :rules="[(value) => !!value || 'Required.']"></v-text-field>
							</template>
						</v-col>
					</v-row>

					<v-row class="my-2">
						<v-col cols="12">
							<v-btn-toggle v-if="showGroupTypeSelection" v-model="groupType" mandatory>
								<v-btn>⊻ alt </v-btn>
								<v-btn>∨ or </v-btn>
								<v-btn>∧ and </v-btn>
							</v-btn-toggle>
						</v-col>
					</v-row>

					<v-row class="my-2">
						<v-col cols="12">
							<v-btn-toggle v-if="showMandatorySelection" v-model="mandatory" mandatory>
								<v-btn> mandatory </v-btn>
								<v-btn> optional </v-btn>
							</v-btn-toggle>
						</v-col>
					</v-row>

					<v-checkbox v-model="abstract" label="Abstract" hide-details></v-checkbox>
				</v-card-text>

				<v-divider></v-divider>

				<v-card-actions>
					<v-btn color="secondary" text @click="close"> Close </v-btn>
					<v-spacer></v-spacer>
					<v-btn color="primary" text @click="confirm"> I accept </v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
	name: 'FeatureModelTreeEditDialog',

	props: {
		d3Node: Object,
	},

	computed: {
		name: {
			get() {
				if (this.d3Node) {
					return this.d3Node.data.name;
				}
				return 0;
			},
			set(newValue) {
				this.d3Node.data.name = newValue;
			},
		},

		show: {
			get() {
				return !!this.d3Node;
			},
			set() {},
		},

		groupType: {
			get() {
				if (this.d3Node) {
					switch (this.d3Node.data.groupType) {
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
						this.d3Node.data.groupType = 'alt';
						break;
					case 1:
						this.d3Node.data.groupType = 'or';
						break;
					case 2:
						this.d3Node.data.groupType = 'and';
						break;
					default:
						this.d3Node.data.groupType = 'alt';
						break;
				}
			},
		},

		mandatory: {
			get() {
				if (this.d3Node) {
					return this.d3Node.data.isMandatory ? 0 : 1;
				}
				return 0;
			},
			set(newValue) {
				this.d3Node.data.isMandatory = newValue == 0;
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

		abstract: {
			get() {
				if (this.d3Node) {
					return this.d3Node.data.isAbstract;
				}
				return false;
			},
			set(newValue) {
				this.d3Node.data.isAbstract = newValue;
			},
		},
	},

	methods: {
		close() {
			this.show = false;
			this.$emit('close');
		},

		confirm() {
			this.close();
			this.$emit('update');
		},
	},
});
</script>

<style scoped></style>
