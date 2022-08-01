<template>
  <div class="mainView">
    <h3 class="text-h3 mb-2 mt-8">Family: {{family.label}}</h3>
    <h5 class="text-h5 mb-4">Details and more information</h5>
  </div>
</template>

<script>
import Vue from "vue";
import api from "@/services/api.service";

const API_URL = process.env.VUE_APP_DOMAIN;

export default Vue.extend({
  name: "FamilyDetail",

  components: {},

  props: {},

  data: () => ({
    family: {},
  }),

  mounted() {
    this.getFamily()
  },

  computed: {},

  methods: {
    async getFamily() {

      const id = this.$route.params.id
      await api
          .get(`${API_URL}families/${id}/`)
          .then(response => {
            this.family = response.data
          })
          .catch(error => {
            console.log(error)
          })
    }
  },
});
</script>
