<template>
    <v-btn
        block
        dark
        @click="loginWithGithub"
        variant="outlined"
        prepend-icon="mdi-github"
    >
        Sign in with GitHub
    </v-btn>
</template>

<script setup>
import { useAuthStore } from '@/store/auth';

const authStore = useAuthStore();

async function loginWithGithub() {
    const url = await authStore.loginWithGithubRedirect();
    window.open(url, '_self');
}
</script>
