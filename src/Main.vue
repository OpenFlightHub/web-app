<script lang="ts">

import { computed, defineComponent } from 'vue';
import { RouterView, useRoute } from 'vue-router'


import App from '@/components/app/App.vue';
import AppNavBar from '@/components/app/AppNavBar.vue';
import AppContent from '@/components/app/AppContent.vue';

export default defineComponent({

    components: { RouterView, App, AppNavBar, AppContent }

})


// fix cesium static url
//@ts-ignore
window.CESIUM_BASE_URL = '/cesiumStatic'
</script>

<script lang="ts" setup>

const route = useRoute()

const routeIsAuth = computed(()=>{
    return route.path.startsWith('/auth')
})

</script>

<template>
    <App>
        <AppNavBar v-if="!routeIsAuth">
        </AppNavBar>

        <AppContent :no-nav-bar="routeIsAuth">
            <RouterView/>
        </AppContent>
    </App>

</template>
