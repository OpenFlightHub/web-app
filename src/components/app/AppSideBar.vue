<script setup lang="ts">
import LogoVue from '../branding/LogoVue.vue';
import LogoutButton from '@/components/general/LogoutButton.vue';
import useMainStore from '@/stores/main';
import { Button } from 'primevue';
import IconVue from '../general/IconVue.vue';
import { ref } from 'vue';
import AppSideBarEntry from './AppSideBarEntry.vue';
import Padding from '../layout/Padding.vue';

const store = useMainStore()

const isExtended = ref(false)

</script>

<template>

    <div id="sidebar" @mouseenter="isExtended = true" @mouseleave="isExtended = false">

        <IconVue name="list" @click="isExtended = !isExtended"></IconVue>

        <div id="menu" :style="{'display': isExtended ? '' : 'none'}">

            <div id="top">
                <RouterLink to="/">
                    <LogoVue id="logo" size1em></LogoVue>
                    Home
                </RouterLink>
            </div>

            <div id="middle">
                <AppSideBarEntry to="/" icon="textarea">Workspaces</AppSideBarEntry>
            </div>

            <div id="bottom">
                <AppSideBarEntry v-if="store.isAdmin" to="/settings" icon="gear">Settings</AppSideBarEntry>

                <AppSideBarEntry v-if="store.isLoggedIn" to="/auth/password-change" icon="key">{{ $t('auth.change_password') }}</AppSideBarEntry>
                <AppSideBarEntry v-else to="/auth/login" icon="key">{{ $t('login.sign_in') }}</AppSideBarEntry>

                <LogoutButton v-if="store.isLoggedIn"></LogoutButton>

                <span>© OpenFlightHub 2025</span>
            </div>

        </div>

    </div>

</template>

<style scoped lang="scss">

#sidebar {
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 3;
    min-height: 100vh;
    background-color: var(--neutral-darker);
    overflow: hidden;
    flex-grow: 0;
    flex-shrink: 0;
    min-width: var(--sidebar-min-size);

    #menu {
        display: flex;
        flex-direction: column;
        transition: all 0.2s ease;
        height: 100%;

        #top, #middle, #bottom {
            padding: 0.5em 1em;
            gap: 0.5em;
        }

        #top {

        }

        #middle {
            display: flex;
            flex-direction: column;
        }

        #bottom {
            display: flex;
            flex-direction: column;
            margin-top: auto;
            white-space: nowrap;
        }
    }
}


</style>
