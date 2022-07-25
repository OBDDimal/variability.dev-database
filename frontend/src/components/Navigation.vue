<template>
  <div>
    <v-app-bar app color="primary" dark>
      <h1 class="mr-6">{{ title }}</h1>
      <div class="hidden-md-and-down">
        <v-btn to="/" text class="mx-1">
          <v-icon left> mdi-home </v-icon>
          Home
        </v-btn>
        <v-btn v-if="$store.state.loggedIn" to="/profile" text class="mx-1">
          <v-icon left> mdi-account </v-icon>
          Profile
        </v-btn>
        <v-btn v-if="$store.state.loggedIn" to="/files" text class="mx-1">
          <v-icon left> mdi-file </v-icon>
          Files
        </v-btn>
        <v-btn v-if="$store.state.loggedIn" to="/tags" text class="mx-1">
          <v-icon left> mdi-tag </v-icon>
          Tags
        </v-btn>
        <v-btn v-if="$store.state.loggedIn" to="/families" text class="mx-1">
          <v-icon left> mdi-human-male-female-child </v-icon>
          Families
        </v-btn>
        <v-btn to="/dsgvo" text class="mx-1">
          <v-icon left> mdi-scale-balance </v-icon>
          DSGVO
        </v-btn>
      </div>
      <v-spacer></v-spacer>
      <div class="hidden-lg-and-up">
        <v-btn
          icon
          class="mr-3"
          @click="$vuetify.theme.dark = !$vuetify.theme.dark"
        >
          <v-icon v-if="$vuetify.theme.dark"> mdi-brightness-7 </v-icon>
          <v-icon v-else> mdi-brightness-4 </v-icon>
        </v-btn>
        <v-btn
            icon
            @click.stop="drawer = !drawer"
        >
          <v-icon>
            mdi-menu
          </v-icon>
        </v-btn>
      </div>
      <div class="hidden-md-and-down">
        <v-btn v-if="!$store.state.loggedIn" text to="/register">
          <v-icon left> mdi-account-plus </v-icon>
          Register
        </v-btn>
        <v-btn v-if="!$store.state.loggedIn" text to="/login">
          <v-icon left> mdi-login-variant </v-icon>
          Login
        </v-btn>
        <v-btn v-if="$store.state.loggedIn" text @click="logoutAndRedirect()">
          <v-icon left> mdi-logout-variant </v-icon>
          Logout
        </v-btn>
        <v-divider vertical class="mx-5"></v-divider>
        <v-btn
          icon
          class="mr-3"
          @click="$vuetify.theme.dark = !$vuetify.theme.dark"
        >
          <v-icon v-if="$vuetify.theme.dark"> mdi-brightness-7 </v-icon>
          <v-icon v-else> mdi-brightness-4 </v-icon>
        </v-btn>
      </div>
    </v-app-bar>
    <v-navigation-drawer
        v-model="drawer"
        temporary
        app
    >
      <v-list>
        <v-list-item
            to="/"
            link
        >
          <v-list-item-icon>
            <v-icon left> mdi-home </v-icon>
          </v-list-item-icon>
          Home
        </v-list-item>
        <v-list-item
            v-if="$store.state.loggedIn"
            to="/profile"
            link
        >
          <v-list-item-icon>
            <v-icon left> mdi-account </v-icon>
          </v-list-item-icon>
          Profile
        </v-list-item>
        <v-list-item
            v-if="$store.state.loggedIn"
            to="/files"
            link
        >
          <v-list-item-icon>
            <v-icon left> mdi-file </v-icon>
          </v-list-item-icon>
          Files
        </v-list-item>
        <v-list-item
            v-if="$store.state.loggedIn"
            to="/tags"
            link
        >
          <v-list-item-icon>
            <v-icon left> mdi-tag </v-icon>
          </v-list-item-icon>
          Tags
        </v-list-item>
        <v-list-item
            v-if="$store.state.loggedIn"
            to="/families"
            link
        >
          <v-list-item-icon>
            <v-icon left> mdi-human-male-female-child </v-icon>
          </v-list-item-icon>
          Families
        </v-list-item>
        <v-list-item
            to="/dsgvo"
            link
        >
          <v-list-item-icon>
            <v-icon left> mdi-scale-balance </v-icon>
          </v-list-item-icon>
          DSGVO
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list>
        <v-list-item v-if="!$store.state.loggedIn" link to="/register">
          <v-list-item-icon><v-icon left> mdi-account-plus </v-icon></v-list-item-icon>
          Register
        </v-list-item>
        <v-list-item v-if="!$store.state.loggedIn" link to="/login">
          <v-list-item-icon><v-icon left> mdi-login-variant </v-icon></v-list-item-icon>
          Login
        </v-list-item>
        <v-list-item v-if="$store.state.loggedIn" link @click="logoutAndRedirect()">
          <v-list-item-icon><v-icon left> mdi-logout-variant </v-icon></v-list-item-icon>
          Logout
        </v-list-item>
        <v-list-item link
            @click="$vuetify.theme.dark = !$vuetify.theme.dark"
        >
          <v-list-item-icon v-if="$vuetify.theme.dark"><v-icon left> mdi-brightness-7 </v-icon></v-list-item-icon>
          <v-list-item-icon v-else><v-icon left> mdi-brightness-4 </v-icon></v-list-item-icon>
          Switch theme
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  name: "Navigation",

  components: {},

  props: {
    title: {
      type: String,
      required: true,
    },
  },

  data: () => ({
    drawer: false,
    /*navItems: [
      {
        name: "Home",
        to: "/",
        icon: "mdi-home",
        protected: false,
      },
      {
        name: "Profile",
        to: "/profile",
        icon: "mdi-account",
        protected: true,
      },
      {
        name: "Files",
        to: "/files",
        icon: "mdi-file",
        protected: true,
      },
      {
        name: "Tags",
        to: "/tags",
        icon: "mdi-tag",
        protected: true,
      },
      {
        name: "Families",
        to: "/families",
        icon: "mdi-human-male-female-child",
        protected: true,
      },
      {
        name: "DSGVO",
        to: "/dsgvo",
        icon: "mdi-scale-balance",
        protected: false,
      }
    ]*/
  }),

  computed: {},

  methods: {
    logoutAndRedirect() {
      if (this.$route.path !== "/") {
        this.$router.push("/");
      }
      this.$store.dispatch("logout");
    },
  },
});
</script>

<style scoped></style>
