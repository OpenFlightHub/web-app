<script lang="ts">

import { defineComponent } from 'vue';
import { RouterView } from 'vue-router'


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

<template>
    <App>
        <AppNavBar>
        </AppNavBar>

        <AppContent>
            <RouterView/>
        </AppContent>
    </App>

</template>
