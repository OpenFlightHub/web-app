<script setup lang="ts">

import LogoVue from '@/components/branding/LogoVue.vue';
import LogoutButton from '@/components/general/LogoutButton.vue';
import { useRouter } from 'vue-router';
import { computed } from 'vue';

const router = useRouter()

const isMainView = computed(()=>{
    return router.currentRoute.value.name === 'home'
})


</script>

<template>
    <v-app>

        <v-app-bar title="OpenFlightHub"></v-app-bar>

        <v-navigation-drawer>
            <v-list>
                <v-list-item title="Navigation drawer"></v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-main class="d-flex align-center justify-center" style="min-height: 300px;">
            <div v-if="isMainView">
                Hello
            </div>
            <RouterView v-else>

            </RouterView>
        </v-main>

    </v-app>

</template>

<style lang="scss" scoped>


</style>
