<template>
	<div class="mainView">
		<h3 class="text-h3 mb-2 mt-8">Welcome to ddueruem</h3>
		<h5 class="text-h5 mb-4">
			A web service for sharing feature model instances and collaborative
			benchmarking
		</h5>
		<feature-model-table
			:items="$store.state.files"
			:loading="loading"
			:addable="true"
		/>
	</div>
</template>

<script>
import Vue from 'vue'
import FeatureModelTable from '@/components/FeatureModelTable'

export default Vue.extend({
	name: 'HomeView',

	components: {
		FeatureModelTable,
	},

	props: {},

	data: () => ({
		search: '',
		dialog: false,
		createDialog: false,
		editedIndex: -1,
		headers: [
			{
				text: 'ID',
				align: 'start',
				sortable: false,
				value: 'id',
			},
			{ text: 'Label', value: 'label' },
			{ text: 'Description', value: 'description' },
			{ text: 'License', value: 'license' },
			{ text: 'Tags', value: 'tags' },
			{ text: 'Uploaded on', value: 'uploaded' },
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
			license: 'CC-BY Mention',
			tags: null,
			uploaded: 'Today',
		},
		defaultItem: {
			label: '',
			description: '',
			license: 'CC-BY Mention',
			tags: null,
			uploaded: 'Today',
		},
		files: [],
		licenses: [],
		families: [],
		tags: [],
		check1: false,
		check2: false,
		check3: false,
		loading: false,
		info: '',
	}),

	computed: {
		formTitle() {
			return this.editedIndex === -1 ? 'Upload New Model' : 'Edit Model'
		} /*
    existingFamilies() {
      return this.desserts.map((x) => x.label);
    }, */,
	},

	watch: {
		dialog(val) {
			val || this.close()
		},
	},

	methods: {
		close() {
			this.dialog = false
			this.$nextTick(() => {
				this.editedItem = Object.assign({}, this.defaultItem)
				this.editedIndex = -1
			})
		},

		save() {
			/* if (this.editedIndex > -1) {
              Object.assign(this.desserts[this.editedIndex], this.editedItem);
            } else {
              this.desserts.push(this.editedItem);
            } */
			this.close()
		},
	},

	mounted() {
		this.loading = true
		this.$store.dispatch('fetchFamilies')
		this.families = this.$store.state.families
		this.$store.dispatch('fetchTags')
		this.tags = this.$store.state.tags
		this.$store.dispatch('fetchFiles')
		this.files = this.$store.state.files
		this.loading = false
	},
})
</script>
