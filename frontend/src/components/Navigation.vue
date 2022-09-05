<template>
	<div>
		<v-app-bar app :color="isOnline ? 'primary' : 'red'" dark>
			<h1 class="mr-6">{{ title }}</h1>
			<div class="hidden-sm-and-down">
				<v-btn class="mx-1" text to="/">
					<v-icon left> mdi-home</v-icon>
					Home
				</v-btn>
				<v-btn
					v-if="$store.state.loggedIn"
					class="mx-1"
					text
					to="/profile"
				>
					<v-icon left> mdi-account</v-icon>
					Profile
				</v-btn>
				<v-btn
					v-if="$store.state.loggedIn"
					class="mx-1"
					text
					to="/files"
				>
					<v-icon left> mdi-file</v-icon>
					Files
				</v-btn>
				<v-btn
					v-if="$store.state.loggedIn"
					class="mx-1"
					text
					to="/tags"
				>
					<v-icon left> mdi-tag</v-icon>
					Tags
				</v-btn>
				<v-btn
					v-if="$store.state.loggedIn"
					class="mx-1"
					text
					to="/families"
				>
					<v-icon left> mdi-human-male-female-child</v-icon>
					Families
				</v-btn>
			</div>
			<v-spacer></v-spacer>
			<div class="hidden-md-and-up">
				<v-btn
					class="mr-1"
					icon
					@click="$vuetify.theme.dark = !$vuetify.theme.dark"
				>
					<v-icon v-if="$vuetify.theme.dark">
						mdi-brightness-7</v-icon
					>
					<v-icon v-else> mdi-brightness-4</v-icon>
				</v-btn>
				<v-btn class="mr-1" icon v-fullscreen>
					<v-icon> mdi-fullscreen</v-icon>
				</v-btn>
				<v-btn icon @click.stop="drawer = !drawer">
					<v-icon> mdi-menu </v-icon>
				</v-btn>
			</div>
			<div class="hidden-sm-and-down">
				<v-btn v-if="!$store.state.loggedIn" text to="/register">
					<v-icon left> mdi-account-plus</v-icon>
					Register
				</v-btn>
				<v-btn v-if="!$store.state.loggedIn" text to="/login">
					<v-icon left> mdi-login-variant</v-icon>
					Login
				</v-btn>
				<v-btn
					v-if="$store.state.loggedIn"
					:text="!$vuetify.breakpoint.mdAndDown"
					:icon="$vuetify.breakpoint.mdAndDown"
					@click="logoutAndRedirect()"
				>
					<v-icon :left="!$vuetify.breakpoint.mdAndDown">
						mdi-logout-variant</v-icon
					>
					<div class="hidden-md-and-down">Logout</div>
				</v-btn>
				<!--				<v-divider class="mx-5" vertical></v-divider>-->
				<v-btn
					class="mx-3"
					icon
					@click="$vuetify.theme.dark = !$vuetify.theme.dark"
				>
					<v-icon v-if="$vuetify.theme.dark">
						mdi-brightness-7</v-icon
					>
					<v-icon v-else> mdi-brightness-4</v-icon>
				</v-btn>
				<v-btn
					:class="$vuetify.breakpoint.smAndDown ? 'mr-3' : ''"
					icon
					v-fullscreen
				>
					<v-icon> mdi-fullscreen</v-icon>
				</v-btn>
			</div>
		</v-app-bar>
		<v-navigation-drawer v-model="drawer" app temporary>
			<v-list>
				<v-list-item link to="/">
					<v-list-item-icon>
						<v-icon left> mdi-home</v-icon>
					</v-list-item-icon>
					Home
				</v-list-item>
				<v-list-item v-if="$store.state.loggedIn" link to="/profile">
					<v-list-item-icon>
						<v-icon left> mdi-account</v-icon>
					</v-list-item-icon>
					Profile
				</v-list-item>
				<v-list-item v-if="$store.state.loggedIn" link to="/files">
					<v-list-item-icon>
						<v-icon left> mdi-file</v-icon>
					</v-list-item-icon>
					Files
				</v-list-item>
				<v-list-item v-if="$store.state.loggedIn" link to="/tags">
					<v-list-item-icon>
						<v-icon left> mdi-tag</v-icon>
					</v-list-item-icon>
					Tags
				</v-list-item>
				<v-list-item v-if="$store.state.loggedIn" link to="/families">
					<v-list-item-icon>
						<v-icon left> mdi-human-male-female-child</v-icon>
					</v-list-item-icon>
					Families
				</v-list-item>
			</v-list>
			<v-divider></v-divider>
			<v-list>
				<v-list-item v-if="!$store.state.loggedIn" link to="/register">
					<v-list-item-icon>
						<v-icon left> mdi-account-plus</v-icon>
					</v-list-item-icon>
					Register
				</v-list-item>
				<v-list-item v-if="!$store.state.loggedIn" link to="/login">
					<v-list-item-icon>
						<v-icon left> mdi-login-variant</v-icon>
					</v-list-item-icon>
					Login
				</v-list-item>
				<v-list-item
					v-if="$store.state.loggedIn"
					link
					@click="logoutAndRedirect()"
				>
					<v-list-item-icon>
						<v-icon left> mdi-logout-variant</v-icon>
					</v-list-item-icon>
					Logout
				</v-list-item>
				<v-list-item
					link
					@click="$vuetify.theme.dark = !$vuetify.theme.dark"
				>
					<v-list-item-icon v-if="$vuetify.theme.dark">
						<v-icon left> mdi-brightness-7</v-icon>
					</v-list-item-icon>
					<v-list-item-icon v-else>
						<v-icon left> mdi-brightness-4</v-icon>
					</v-list-item-icon>
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
        isOnline: true,
    }),

    mounted() {
        window.addEventListener('online', this.updateOnlineStatus);
        window.addEventListener('offline', this.updateOnlineStatus);
    },
    beforeDestroy() {
        window.removeEventListener('online', this.updateOnlineStatus);
        window.removeEventListener('offline', this.updateOnlineStatus);
    },

    methods: {
        logoutAndRedirect() {
            if (this.$route.path !== "/") {
                this.$router.push("/");
            }
            this.$store.dispatch("logout");
        },
        updateOnlineStatus() {
            this.isOnline = !this.isOnline;
        }
    },
});
</script>
