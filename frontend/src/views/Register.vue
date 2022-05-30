<template>
    <div>
        <v-form ref="form" v-model="valid" lazy-validation>
            <v-text-field v-model="email" :rules="emailRules" label="E-mail" required></v-text-field>

            <v-text-field v-model="password" :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                :rules="passwordRules" :type="show1 ? 'text' : 'password'" name="input-10-1"
                label="Password" hint="At least 8 characters" counter @click:append="show1 = !show1">
            </v-text-field>

            <v-text-field v-model="passwordConfirmation" :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
                :rules="passwordRules" :type="show2 ? 'text' : 'password'" name="input-10-1"
                label="Password" hint="At least 8 characters" counter @click:append="show2 = !show2">
            </v-text-field>

            <v-btn :disabled="!valid" color="primary" class="mr-4" @click="validate">
                Register
            </v-btn>
        </v-form>
    </div>
</template>

<script lang="ts">
import Vue from "vue"
import { Register } from '../../types'

export default Vue.extend({
    name: 'Register',

    components: {},

    props: {},

    data: () => ({
        email: "" as Register["email"],
        password: "" as Register["password"],
        passwordConfirmation: "" as Register["passwordConfirmation"],
        loading: "" as Register["passwordConfirmation"],

        valid: true,
        emailRules: [
            (v:any) => !!v || 'E-mail is required',
            (v:any) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
        ],
        passwordRules: [
            (v:any) => !!v || 'Required.',
            (v:any) => v.length >= 8 || 'Min 8 characters',
            /* emailMatch: () => (`The email and password you entered don't match`), */
        ],
        show1: false,
        show2: false
    }),

    computed: {},

    methods: {
        isReady(): boolean {
            return this.valid
                && this.password === this.passwordConfirmation;
        }
    },
});
</script>

<style scoped>
</style>