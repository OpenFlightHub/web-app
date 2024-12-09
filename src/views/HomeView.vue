<script setup lang="ts">

import WIP from '@/components/WIP.vue';
import { deviceSupportsSDK } from './hub/connect/dji-pilot-2/dji-connect-sdk';
import { onMounted, ref } from 'vue';
import App from '@/components/app/App.vue';
import AppNavBar from '@/components/app/AppNavBar.vue';
import AppContent from '@/components/app/AppContent.vue';
import { Button } from 'primevue';

const isDjiRemoteController = ref(false)

function checkIsDjiRemoteController(){
    isDjiRemoteController.value = deviceSupportsSDK()
}

onMounted(checkIsDjiRemoteController)

</script>

<template>
    <App>
        <AppNavBar>
            <RouterLink to="/hub">
                <Button>Hub</Button>
            </RouterLink>
        </AppNavBar>

        <AppContent>

            <div v-if="isDjiRemoteController">
                <RouterLink to="/hub/connect/dji-pilot-2">Connect your DJI Remote Controller now</RouterLink>
            </div>

            <div v-else>
                <h1>Welcome to OpenFlightHub!</h1>

                    <a href="/hub">link</a>

                <WIP></WIP>
            </div>

        </AppContent>

    </App>

</template>
