<template>
	<div class="mainView">
		<h3 class="text-h3 mb-2 mt-8">My Feature Models</h3>
		<h5 class="text-h5 mb-4">Here you can add new Feature Models</h5>
		<feature-model-table
			v-if="$store.state.isOnline"
			:items="featureModelsComp"
			:loading="loading"
			:addable="true"
		/>
		<template>
			<v-container v-if="!$store.state.isOnline">
				<div
					class="d-flex justify-space-around align-center"
					:class="$vuetify.breakpoint.smAndDown ? 'flex-column' : ''"
				>
					<v-btn
						class="mb-2 ml-4"
						color="success"
						rounded
						link
						to="/feature-model/new"
					>
						<v-icon left> mdi-plus</v-icon>
						Create new model
					</v-btn>
					<v-btn
						:disabled="!checkLocalStorage"
						class="mb-2 ml-4"
						color="secondary"
						rounded
						link
						to="/feature-model/local"
					>
						<v-icon left> mdi-server</v-icon>
						Edit Model from local storage
					</v-btn>
				</div>
			</v-container>
		</template>
	</div>
</template>

<script>
import Vue from 'vue'
import FeatureModelTable from '@/components/FeatureModelTable'

export default Vue.extend({
	name: 'Files',

	components: {
		FeatureModelTable,
	},

	props: {},

	data: () => ({
		search: '',
		dialog: false,
		createDialog: false,
		dialogDelete: false,
		dialogAnalysis: false,
		editedIndex: -1,
		family: '',
		newFamily: '',
		headers: [
			{
				text: 'ID',
				align: 'start',
				sortable: false,
				value: 'id',
			},
			{ text: 'Label', value: 'label' },
			{ text: 'Description', value: 'description' },
			{ text: 'License', value: 'license.label' },
			{ text: 'Tags', value: 'tags' },
			{ text: 'Uploaded on', value: 'uploaded' },
			{ text: 'Owner', value: 'owner' },
			{ text: 'Family', value: 'family.label' },
			{
				text: 'Actions',
				align: 'center',
				value: 'actions',
				sortable: false,
			},
		],
		editedItem: {
			label: '',
			description: '',
			license: '',
			tags: [''],
			dateCreated: new Date(),
			owner: true,
			family: '',
		},
		defaultItem: {
			label: '',
			description: '',
			license: '',
			tags: [''],
			dateCreated: new Date(),
			owner: true,
			family: '',
		},
		featureModels: [],
		licenses: [
			'CC-BY Mention',
			'CC-BY-NC Mention Non-Commercial',
			'MIT',
			'Apache 2.0',
		],
		tags: ['Test', 'Auto', 'Tagger'],
		check1: false,
		check2: false,
		check3: false,
		removeLoading: false,
		loading: false,
		isOnline: true,
	}),

	created() {
		this.initialize()
	},

	computed: {
		formTitle() {
			return this.editedIndex === -1 ? 'Upload New Model' : 'Edit Model'
		},
		existingFamilies() {
			return this.featureModels.map((x) => x.label)
		},
		featureModelsComp() {
			return this.$store.state.featureModels
		},
		checkLocalStorage() {
			return !!localStorage.featureModelData
		},
	},

	watch: {
		dialog(val) {
			val || this.close()
		},
		dialogDelete(val) {
			val || this.closeDelete()
		},
		dialogAnalysis(val) {
			val || this.closeDelete()
		},
	},

	methods: {
		initialize() {
			this.featureModels = [
				{
					id: 1,
					label: 'npc',
					description: 'desc',
					local_file: '/media/files/npc_7sRobIK.xml',
					family: {
						id: 1,
						owner: false,
						label: 'npc family',
						description: '',
					},
					license: {
						id: 1,
						label: 'CC BY - Mention',
					},
					tags: [
						{
							id: 1,
							label: 'small model',
							owner: false,
							description: '',
							date_created: '2022-04-25T15:50:17.950262Z',
							is_public: false,
						},
					],
					owner: false,
					uploaded_at: '2022-04-25T15:50:23.094505Z',
					new_version_of: null,
					transpiled_file: '/media/files/npc_as_g6_OkXoI7q.json',
					analysis: {
						id: 1,
						report: 'i am a report',
						order: 'input-name:examples/berkeleydb.dimacs\r\ninput-hash:eb06505ad6e1c838cffc360a5f3940e2\r\norder:1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76',
					},
				},
				{
					label: 'NPC Model',
					description: 'Test model for demonstration',
					license: 'CC-BY-SA',
					tags: ['test tag', 'exampletag'],
					dateCreated: new Date(),
					owner: true,
					family: 'NPC Family',
				},
				{
					label: 'Cars',
					description: 'Test model for demonstration',
					license: 'CC-BY-SA',
					tags: ['test tag', 'exampletag'],
					dateCreated: new Date(),
					owner: true,
					family: 'Cars Family',
				},
				{
					label: 'Model',
					description: 'Test model for demonstration',
					license: 'CC-BY-SA',
					tags: ['test tag', 'exampletag'],
					dateCreated: new Date(),
					owner: true,
					family: 'Model Family',
				},
				{
					label: 'Berkshire',
					description: 'Test model for demonstration',
					license: 'CC-BY-SA',
					tags: ['test tag', 'exampletag'],
					dateCreated: new Date(),
					owner: true,
					family: 'Berkshire Family',
				},
				{
					label: 'MyModel',
					description: 'Test model for demonstration',
					license: 'CC-BY-SA',
					tags: ['test tag', 'exampletag'],
					dateCreated: new Date(),
					owner: true,
					family: 'My Family',
				},
				{
					label: 'Pete',
					description: 'Test model for demonstration',
					license: 'CC-BY-SA',
					tags: ['test tag', 'exampletag'],
					dateCreated: new Date(),
					owner: true,
					family: 'Petes Family',
				},
			]
		},
		deleteItemConfirm() {
			this.removeLoading = true

			//TODO: actually delete the feature model
			// api.delete(`${API_URL}tags/${this.editedID}/`)
			//     .then(() => {
			//         this.$store.commit("updateSnackbar", {
			//             message: "Tag deleted successfully!",
			//             variant: "success",
			//             timeout: 5000,
			//             show: true,
			//         });
			//         this.$store.dispatch("fetchTags");
			//         this.removeLoading = false;
			//     })
			//     .catch((error) => {
			//         this.$store.commit("updateSnackbar", {
			//             message: "Error: " + error.message,
			//             variant: "error",
			//             timeout: 5000,
			//             show: true,
			//         });
			//         this.removeLoading = false;
			//     });

			this.$store.commit('updateSnackbar', {
				message:
					'Error: ' +
					'deletion of feature models is not yet implemented!',
				variant: 'error',
				timeout: 5000,
				show: true,
			})
			this.removeLoading = false

			this.closeDelete()
		},
		close() {
			this.dialog = false
			this.$nextTick(() => {
				this.editedItem = Object.assign({}, this.defaultItem)
				this.editedIndex = -1
			})
		},
		closeDelete() {
			this.dialogDelete = false
			this.$nextTick(() => {
				this.editedItem = Object.assign({}, this.defaultItem)
				this.editedIndex = -1
			})
		},
		deleteItem(item) {
			this.editedIndex = this.featureModels.indexOf(item)
			this.editedItem = Object.assign({}, item)
			this.dialogDelete = true
		},
		showAnalysis(item) {
			this.editedIndex = this.featureModels.indexOf(item)
			this.editedItem = Object.assign({}, item)
			this.dialogAnalysis = true
		},
		save() {
			if (this.editedIndex > -1) {
				Object.assign(
					this.featureModels[this.editedIndex],
					this.editedItem
				)
			} else {
				this.featureModels.push(this.editedItem)
			}
			this.close()
		},
	},

	mounted() {
		if (
			(this.$store.state.loggedIn && this.$store.state.currentUser) ||
			!this.$store.state.isOnline
		) {
			this.loading = true
			this.$store.dispatch('fetchFeatureModels')
			this.featureModels = this.$store.state.featureModels
			this.loading = false
		} else {
			this.$store.commit('updateSnackbar', {
				message: 'Please log in to view this page',
				variant: 'info',
				timeout: 5000,
				show: true,
			})
			this.$router.push('/login')
		}
	},
})
</script>
<style scoped>
.analysis-width {
	margin: 0 2rem;
}
</style>
