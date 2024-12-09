<script setup lang="ts">

import App from '@/components/app/App.vue';
import AppNavBar from '@/components/app/AppNavBar.vue';
import AppContent from '@/components/app/AppContent.vue';
import { useRouter } from 'vue-router';
import { computed } from 'vue';
import WIP from '@/components/WIP.vue';

const router = useRouter()

const isMainView = computed(()=>{
    return router.currentRoute.value.name === 'hub'
})


</script>

<template>
    <App>
        <AppNavBar>
        </AppNavBar>

        <AppContent>

            <div v-if="isMainView">
                Welcome to the Hub!

                <WIP></WIP>

            </div>
            <RouterView v-else>

            </RouterView>

        </AppContent>

    </App>

</template>

<style lang="scss" scoped>


</style>
