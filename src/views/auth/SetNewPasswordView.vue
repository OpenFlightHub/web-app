<script setup lang="ts">

import api from '@/api';
import PerformOperation from '@/components/general/PerformOperation.vue'
import { computed, onMounted, ref } from 'vue';
import LogoVue from '@/components/branding/LogoVue.vue';
import { useRouter } from 'vue-router';
import IconVue from '@/components/general/IconVue.vue';
import { goToRedirect } from '@/util/router';
const router = useRouter()

const newPassword1 = ref('')
const newPassword2 = ref('')

const newPassword1IsValid = computed(()=>{
    if(newPassword1.value.length < 10){
        return false
    }

    return true
})

const newPassword2IsValid = computed(()=>{
    if(!newPassword1IsValid.value){
        return false
    }

    if(newPassword1.value !== newPassword2.value){
        return false
    }

    return true
})

async function setNewPassword(){
    await api.rest.auth.passwordSetNew.post({
        code: resetCode.value,
        new_password: newPassword2.value
    })
}

const resetCode = ref('')

onMounted(()=>{
    let code = router.currentRoute.value.query['code']
    if(code instanceof Array){
        code = code[0]
    }

    if(typeof code === 'string' && code.length > 0){
        resetCode.value = code
    }
})

</script>

<template>

    <PerformOperation v-slot="scope" v-if="resetCode.length > 0">
        <div class="header">
            <div class="inner">
                <LogoVue></LogoVue>
            </div>
        </div>

        <div class="centered">
            <v-form>
                <span>{{ $t("auth.new_password") }}</span>
                <span class="restrictions">{{ $t("auth.password_restrictions") }}</span>
                <div class="password_container">
                    <v-text-field type="password" autocomplete="new-password" v-model="newPassword1"></v-text-field>
                    <IconVue class="valid_icon" name="check" v-if="newPassword1IsValid"></IconVue>
                </div>


                <span>{{ $t("auth.repeat_new_password") }}</span>
                <div class="password_container">
                    <v-text-field type="password" autocomplete="new-password" v-model="newPassword2" :rules="[v => v.length > 5]"></v-text-field>
                    <IconVue class="valid_icon" name="check" v-if="newPassword2IsValid"></IconVue>
                </div>


                <div class="button_group">
                    <v-btn type="submit" @click="scope.watch(
                        setNewPassword().then(()=>{
                            //TODO show success message first
                            goToRedirect(router)
                        }))
                    " :disabled="!newPassword1IsValid || !newPassword2IsValid">{{ $t("actions.confirm") }}</v-btn>
                    <v-btn @click="router.back()">{{ $t("actions.cancel") }}</v-btn>
                </div>
            </v-form>

        </div>


    </PerformOperation>

    <div v-else class="no_code">
        <span>No valid reset code provided.</span>

        <RouterLink to="/">
            <v-btn type="primary">{{ $t("actions.return_to_home")}}</v-btn>
        </RouterLink>
    </div>

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

    .password_container {
        position: relative;
        margin-top: 0.3em;

        .valid_icon {
            font-size: 30px;
            position: absolute;
            left: 100%;
            color: #279B27;
        }
    }

    .restrictions {
        color: var(--neutral-light);
        margin: 0.3em 0;
    }

    .button_group {
        display: flex;
        gap: 0.5em;
    }
}

.no_code {
    align-self: center;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

</style>
