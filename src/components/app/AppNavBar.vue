<script setup lang="ts">
import { useRouter } from 'vue-router';
import LogoVue from '../branding/LogoVue.vue';
import LogoutButton from '@/components/general/LogoutButton.vue';
import useMainStore from '@/stores/main';
import { Button } from 'primevue';

const router = useRouter()


const store = useMainStore()
</script>

<template>

    <div id="nav-bar">
        <div id="left" @click="router.push({name: 'home'})">
            <LogoVue id="logo" size1em></LogoVue>
            OpenFlightHub
        </div>

        <div id="right">
            <slot></slot>

            <LogoutButton v-if="store.isLoggedIn"></LogoutButton>
            <RouterLink v-else to="/auth/login">
                <Button :label="$t('login.sign_in')"></Button>
            </RouterLink>
        </div>
    </div>

</template>

<style scoped lang="scss">

#nav-bar {
    height: var(--navbar-size);
    flex-grow: 0;
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;

    #left {
        display: flex;
        align-items: center;
        font-weight: bold;
        color: var(--neutral-lighter);
        cursor: pointer;
        transition: all 0.2s ease;

        #logo {
            font-size: 30px;
            margin-right: 0.5em;
        }

        &:hover {
            color: var(--neutral-light);

            #logo {
                filter: brightness(90%);
            }
        }
    }

    #right {
        display: flex;
        align-items: center;
        gap: 0.5em;
    }
}

</style>
