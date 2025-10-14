<script setup lang="ts">
import { useRouter } from 'vue-router';
import LogoVue from '../branding/LogoVue.vue';
import LogoutButton from '@/components/general/LogoutButton.vue';
import useMainStore from '@/stores/main';
import { Button, Menu } from 'primevue';
import IconVue from '../general/IconVue.vue';
import { Reactive, reactive, Ref, ref } from 'vue';
import { MenuItem } from 'primevue/menuitem';

const router = useRouter()

const props = defineProps<{
    open?: boolean
}>()

const store = useMainStore()

const menu = ref(null)

function toggleSidebar(evt){
    menu.value.toggle(evt)
}

const menuItems: MenuItem[] = computed(()=>{
    const ret: MenuItem[] = [{
        label: 'Home',
        url: '/'
    }, {
        items: [{
            label: 'Settings',
            url: '/settings',
            icon: 'pi pi-gear'
        }, {
            label: store.isLoggedIn ? 'Logout',
            url: '/auth/logout'
        }]
    }]
}

const refMenuItems = ref(menuItems)

const isExtended = ref(false)

</script>

<template>

    <div id="sidebar" @mouseenter="isExtended = true" @mouseleave="isExtended = false" @click="isExtended = true" :style="{'max-width': isExtended ? '' : '30px'}">

        <Menu ref="menu" id="menu" :model="menuItems">

            <template #start>
                <RouterLink to="/" id="top">
                    <LogoVue id="logo" size1em></LogoVue>
                    OpenFlightHub
                </RouterLink>
            </template>

            <template #submenuitem="{ item }">
                <span class="text-primary font-bold">{{ item.label }}</span>
            </template>

            <template #item="{ item, props }">
                <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
                    <a v-ripple :href="href" v-bind="props.action" @click="navigate">
                        <span :class="item.icon" />
                        <span class="ml-2">{{ item.label }}</span>
                    </a>
                </router-link>
                <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
                    <span :class="item.icon" />
                    <span class="ml-2">{{ item.label }}</span>
                </a>
            </template>

            <template #end>
                © OpenFlightHub 2025
            </template>

        </Menu>

        <div id="left">
            <LogoVue id="logo" size1em></LogoVue>
            OpenFlightHub
        </div>

        <div id="right">
            <slot></slot>

            <template v-if="store.isAdmin">
                <RouterLink to="/settings">
                    <IconVue name="gear"></IconVue>
                </RouterLink>
            </template>

            <template v-if="store.isLoggedIn">
                <LogoutButton></LogoutButton>
                <RouterLink to="/auth/password-change">
                    {{ $t('auth.change_password') }}
                </RouterLink>
            </template>
            <template v-else>
                <RouterLink to="/auth/login">
                    <Button :label="$t('login.sign_in')"></Button>
                </RouterLink>
            </template>
        </div>
    </div>

</template>

<style scoped lang="scss">

#sidebar {
    position: relative;
    z-index: 3;
    min-height: 100vh;
    background-color: red;
    overflow: hidden;

    #top {
        display: flex;
        align-items: center;
        font-weight: bold;
        color: var(--neutral-lighter);
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;

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
