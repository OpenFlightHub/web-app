<script setup lang="ts">

import api from '@/api';
import PerformOperation from '@/components/general/PerformOperation.vue'
import { ref } from 'vue';
import LogoVue from '@/components/branding/LogoVue.vue';
import { useRouter } from 'vue-router';
import { goToRedirect } from '@/util/router';
const router = useRouter()

const email = ref('')

async function resetPassword(){
    await api.auth.passwordReset.post({
        username: email.value
    })
}

</script>

<template>

    <PerformOperation v-slot="scope">
        <div class="header">
            <div class="inner">
                <LogoVue></LogoVue>
            </div>
        </div>


        <div class="centered">
            <span>{{ $t("auth.email") }}</span>
            <v-text-field type="email" placeholder="email@example.org" autocomplete="username" v-model="email"></v-text-field>

            <div class="button_group">
                <v-btn @click="scope.watch(
                    resetPassword().then(()=>{
                        //TODO show success message first
                        goToRedirect(router)
                    }))
                " :disabled="email.length === 0">{{ $t("actions.confirm") }}</v-btn>
                <v-btn @click="router.back()">{{ $t("actions.cancel") }}</v-btn>
            </div>

        </div>


    </PerformOperation>

</template>

<style lang="scss" scoped>

.header {
    display: flex;
    flex-direction: row;
    justify-content: center;

    .inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1em;

        .profile_picture {
            width: 5em;
            height: 5em;
        }
    }
}

.centered {
    display: flex;
    flex-direction: column;
    align-items: center;

    input {
        margin-top: 0.5em;
    }

    .button_group {
        display: flex;
        gap: 0.5em;
    }
}

</style>
