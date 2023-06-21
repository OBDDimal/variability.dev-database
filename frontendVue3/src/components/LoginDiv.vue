<template>
    <div style="min-width: 300px; height: max-content">
        <github-button></github-button>
        <div class="mt-4 d-flex justify-center align-center">
            <v-divider></v-divider>
            <span class="mx-2">OR</span>
            <v-divider></v-divider>
        </div>
        <v-form
            class="mt-4"
            ref="form"
            validate-on="submit"
            @submit.prevent="onSubmit"
        >
            <v-text-field
                v-model="email"
                :rules="emailRules"
                label="E-mail"
                required
                density="comfortable"
            ></v-text-field>

            <v-text-field
                v-model="password"
                :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                :rules="passwordRules"
                :type="show1 ? 'text' : 'password'"
                counter
                hint="At least 8 characters"
                label="Password"
                name="input-10-1"
                density="comfortable"
                @click:append="show1 = !show1"
            >
            </v-text-field>

            <v-btn
                :loading="loading"
                class="mt-2 float-right"
                color="primary"
                type="submit"
            >
                Login
            </v-btn>
        </v-form>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import AuthService from '@/services/auth.service';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';
import { useRouter, useRoute } from 'vue-router';
import { useFileStore } from '@/store/file';
import GithubButton from '@/components/GithubButton.vue';

const fileStore = useFileStore();
let email = ref('');
let password = ref('');
let loading = ref(false);

const authStore = useAuthStore();
const appStore = useAppStore();
const router = useRouter();
const route = useRoute();

const valid = ref(false);
const emailRules = [
    (v) => v.length > 0,
    (v) => !!v || 'E-mail is required',
    (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
];
const passwordRules = [
    (v) => !!v || 'Required.',
    (v) => v.length >= 8 || 'Min 8 characters',
    /* emailMatch: () => (`The email and password you entered don't match`), */
];
const show1 = ref(false);
const prevRoute = '/';

const emit = defineEmits(['onClickedLogin']);

/*const isReady = computed(() => {
    return this.valid.value && this.email !== '' && this.password !== '';
});*/

function onSubmit(e) {
    if (email.value !== '' && password.value !== '') {
        loading.value = true;

        AuthService.login(email.value, password.value).then(
            () => {
                authStore.login();
                if (route.path !== '/') {
                    router.push('/');
                }
                fileStore.fetchConfirmedFeatureModels();
                emit('onClickedLogin');
                loading.value = false;
            },
            (error) => {
                console.log(error.response.data);
                appStore.updateSnackbar(
                    'Login not successful: ' + error.response.data.detail,
                    'error',
                    5000,
                    true
                );
                emit('onClickedLogin');
                loading.value = false;
            }
        );
    }
}

/*function mounted() {
  if (this.$store.state.loggedIn && this.$store.state.currentUser) {
    this.$store.commit('updateSnackbar', {
      message: 'User is already logged in',
      variant: 'info',
      timeout: 5000,
      show: true,
    });
    this.$router.push('/');
  }
},*/
</script>
