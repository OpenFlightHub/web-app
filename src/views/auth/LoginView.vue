<script setup lang="ts">
import useMainStore from "@/stores/main";
import { ref } from "vue";
import api from "@/api";

import LogoVue from '@/components/branding/LogoVue.vue';

const store = useMainStore()

const username = ref('')
const password = ref('')

const loginError = ref(false)

const isLoggingIn = ref(false)

async function login(){
    isLoggingIn.value = true

    api.auth.login.post({
        username: username.value,
        password: password.value
    }).then(()=>{
        document.location.reload()
    }).catch(err => {
        loginError.value = true
        isLoggingIn.value = false
    })
}

function handleKeyUp(evt: KeyboardEvent){
    if(evt.key.toLowerCase() === 'enter' && username.value.length > 0 && password.value.length > 0){
        login()
    }
}

</script>

<template>

    <v-container class="d-flex flex-column align-center rounded-xl">

        <v-container class="d-flex justify-center mb-6">
            <LogoVue></LogoVue>
        </v-container>

        <div v-if="store.apiUnavailable">Service currently not available, sorry!</div>

        <v-form v-else class="login_form">

            <v-container class="d-flex flex-column" :min-width="300">
                <v-text-field name="username" type="email" v-model="username" placeholder="email@example.org" autocomplete="username" @keyup="handleKeyUp" :disabled="isLoggingIn" :rules="[v => {if(v.length > 5){return true} return 'at least 5 chars'}]"></v-text-field>

                <v-text-field name="password" type="password" v-model="password" placeholder="password" autocomplete="current-password" @keyup="handleKeyUp" :disabled="isLoggingIn"></v-text-field>

                <div class="reset_password_container">
                    <a class="reset_password" href="/auth/password-reset"> {{ $t("login.reset_password") }}</a>
                </div>

                <div class="d-flex justify-end">
                    <v-btn type="submit" @click="login" icon-right="arrow-right">{{ $t("login.sign_in") }}</v-btn>
                </div>

            </v-container>

            <template v-if="loginError">
                <span>{{ $t("login.auth_error") }}</span>
            </template>

        </v-form>
    </v-container>

</template>

<style scoped lang="scss">


    .reset_password_container {

        .reset_password {
            font-size: 14px;
            color: var(--neutral-lighter);

            &:hover {
                color: var(--neutral-light);
            }
        }
    }


</style>
