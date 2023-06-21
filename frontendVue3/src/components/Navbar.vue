<template>
    <v-app-bar app>
        <v-app-bar-title style="flex: initial">
            <v-avatar class="hidden-xs-only mr-3">
                <v-img
                    :src="
                        theme.global.current.value.dark
                            ? '/ddueruem_logo_dark.svg'
                            : '/ddueruem_logo.svg'
                    "
                    alt="logo"
                />
            </v-avatar>
            variability.dev
        </v-app-bar-title>
        <div class="hidden-sm-and-down ml-5">
            <v-btn
                v-if="appStore.isOnline"
                class="mx-1"
                to="/"
                prepend-icon="mdi-home"
            >
                Home
            </v-btn>
            <v-btn
                v-if="authStore.loggedIn && appStore.isOnline"
                class="mx-1"
                to="/profile"
                prepend-icon="mdi-account"
            >
                Profile
            </v-btn>
            <v-btn
                v-if="authStore.loggedIn || !appStore.isOnline"
                class="mx-1"
                to="/models"
                prepend-icon="mdi-file"
            >
                Models
            </v-btn>
            <!--            <v-btn
                v-if="authStore.loggedIn && appStore.isOnline"
                class="mx-1"
                to="/tags"
                prepend-icon="mdi-tag"
            >
                Tags
            </v-btn>-->
            <v-btn
                v-if="authStore.loggedIn && appStore.isOnline"
                class="mx-1"
                to="/histories"
                prepend-icon="mdi-human-male-female-child"
            >
                Histories
            </v-btn>
        </div>
        <v-spacer></v-spacer>
        <div class="hidden-md-and-up">
            <v-btn
                :icon="
                    theme.global.current.value.dark
                        ? 'mdi-brightness-7'
                        : 'mdi-brightness-4'
                "
                @click="toggleTheme"
            >
            </v-btn>
            <v-btn icon v-fullscreen>
                <v-icon> mdi-fullscreen</v-icon>
            </v-btn>
            <v-btn
                class="drawer-button"
                icon="mdi-menu"
                @click.stop="drawer = !drawer"
            ></v-btn>
        </div>
        <div class="hidden-sm-and-down">
            <!-- TODO show button if logged-in user is admin -->
            <v-btn
                v-if="authStore.loggedIn && appStore.isOnline && isAdmin"
                class="mx-1"
                prepend-icon="mdi-security"
                to="/admin"
            >
                <div class="hidden-md-and-down">Admin</div>
            </v-btn>
            <v-btn
                v-if="!authStore.loggedIn && appStore.isOnline"
                to="/register"
                prepend-icon="mdi-account-plus"
            >
                Register
            </v-btn>
            <v-menu
                v-model="loginMenu"
                :close-on-content-click="false"
                location="bottom"
            >
                <template v-slot:activator="{ props }">
                    <v-btn
                        v-if="!authStore.loggedIn && appStore.isOnline"
                        v-bind="props"
                        prepend-icon="mdi-login-variant"
                    >
                        Login
                    </v-btn>
                </template>

                <v-card elevation="16">
                    <v-card-title>Login</v-card-title>
                    <v-card-text style="overflow: hidden">
                        <login-div
                            @onClickedLogin="loginMenu = false"
                        ></login-div>
                    </v-card-text>
                </v-card>
            </v-menu>

            <v-btn
                v-if="authStore.loggedIn && appStore.isOnline"
                :text="!breakpoints.mdAndDown"
                prepend-icon="mdi-logout-variant"
                @click="logoutAndRedirect()"
            >
                <div class="hidden-md-and-down">Logout</div>
            </v-btn>
            <!--				<v-divider class="mx-5" vertical></v-divider>-->
            <v-btn
                class="mx-3 theme-button"
                :icon="
                    theme.global.current.value.dark
                        ? 'mdi-brightness-7'
                        : 'mdi-brightness-4'
                "
                @click="toggleTheme"
            >
            </v-btn>
            <v-btn
                :class="breakpoints.smAndDown ? 'mr-3' : ''"
                icon="mdi-fullscreen"
            >
            </v-btn>
        </div>
    </v-app-bar>
    <v-navigation-drawer
        class="mobile-navigation"
        v-model="drawer"
        app
        temporary
    >
        <v-list>
            <v-list-item link to="/">
                <template v-slot:prepend>
                    <v-icon icon="mdi-home"></v-icon>
                </template>
                <v-list-item-title>Home</v-list-item-title>
            </v-list-item>
            <v-list-item
                v-if="authStore.loggedIn && appStore.isOnline"
                link
                to="/profile"
            >
                <template v-slot:prepend>
                    <v-icon icon="mdi-account"></v-icon>
                </template>
                <v-list-item-title>Profile</v-list-item-title>
            </v-list-item>
            <v-list-item
                v-if="authStore.loggedIn || !appStore.isOnline"
                link
                to="/models"
            >
                <template v-slot:prepend>
                    <v-icon icon="mdi-file"></v-icon>
                </template>
                <v-list-item-title>Models</v-list-item-title>
            </v-list-item>
            <!--            <v-list-item
                v-if="authStore.loggedIn && appStore.isOnline"
                link
                to="/tags"
            >
                <template v-slot:prepend>
                    <v-icon icon="mdi-tag"></v-icon>
                </template>
                <v-list-item-title>Tags</v-list-item-title>
            </v-list-item>-->
            <v-list-item
                v-if="authStore.loggedIn && appStore.isOnline"
                link
                to="/histories"
            >
                <template v-slot:prepend>
                    <v-icon icon="mdi-human-male-female-child"></v-icon>
                </template>
                <v-list-item-title>Histories</v-list-item-title>
            </v-list-item>
            <!-- TODO: add isAdmin check -->
            <v-list-item
                v-if="authStore.loggedIn && appStore.isOnline"
                link
                to="/admin"
            >
                <template v-slot:prepend>
                    <v-icon icon="mdi-security"></v-icon>
                </template>
                <v-list-item-title>Admin</v-list-item-title>
            </v-list-item>
        </v-list>
        <v-divider></v-divider>
        <v-list>
            <v-list-item
                v-if="!authStore.loggedIn && appStore.isOnline"
                link
                to="/register"
            >
                <template v-slot:prepend>
                    <v-icon icon="mdi-account-plus"></v-icon>
                </template>
                <v-list-item-title>Register</v-list-item-title>
            </v-list-item>
            <v-list-item
                v-if="!authStore.loggedIn && appStore.isOnline"
                link
                to="/login"
            >
                <template v-slot:prepend>
                    <v-icon icon="mdi-login-variant"></v-icon>
                </template>
                <v-list-item-title>Login</v-list-item-title>
            </v-list-item>
            <v-list-item
                v-if="authStore.loggedIn && appStore.isOnline"
                link
                @click="logoutAndRedirect()"
            >
                <template v-slot:prepend>
                    <v-icon icon="mdi-logout-variant"></v-icon>
                </template>
                <v-list-item-title>Logout</v-list-item-title>
            </v-list-item>
            <v-list-item class="mobile-theme-button" link @click="toggleTheme">
                <template v-slot:prepend>
                    <v-icon
                        :icon="
                            theme.global.current.value.dark
                                ? 'mdi-brightness-7'
                                : 'mdi-brightness-4'
                        "
                    ></v-icon>
                </template>
                <v-list-item-title>Switch theme</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-navigation-drawer>
</template>

<script setup>
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';
import { useTheme, useDisplay } from 'vuetify';
import LoginDiv from '@/components/LoginDiv.vue';
import { useRouter, useRoute } from 'vue-router';
import { ref } from 'vue';
import { useFileStore } from '@/store/file';

const authStore = useAuthStore();
const appStore = useAppStore();
const theme = useTheme();
const breakpoints = useDisplay();
const isAdmin = true;
const loginMenu = ref(false);
const isMobileLandscape = false;
const drawer = ref(false);

const router = useRouter();
const route = useRoute();

function toggleTheme() {
    theme.global.name.value = theme.global.current.value.dark
        ? 'light'
        : 'dark';
}

function logoutAndRedirect() {
    if (route.path !== '/') {
        router.push('/');
    }
    authStore.logout();
    useFileStore().fetchConfirmedFeatureModels();
}
/*function logoutAndRedirect() {
  if (this.$route.path !== '/') {
    this.$router.push('/');
  }
  this.$store.dispatch('logout');
}*/
</script>
