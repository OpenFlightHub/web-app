<script setup lang="ts">

import WIP from '@/components/WIP.vue';
import { deviceSupportsSDK } from './hub/connect/dji-pilot-2/dji-open-platform-connect-sdk';
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
                <Button rounded outlined>{{ $t("hub.hub") }}</Button>
            </RouterLink>
        </AppNavBar>

        <AppContent>

            <div v-if="isDjiRemoteController">
                <RouterLink to="/hub/connect/dji-pilot-2">{{ $t("connect.connectable_device_connect_now")}}</RouterLink>
            </div>
            <div v-else id="intro">
                <h1>Welcome to OpenFlightHub!</h1>

                <RouterLink to="/hub">
                    <Button rounded outlined>{{ $t("hub.go_to_hub") }}</Button>
                </RouterLink>

                <WIP></WIP>
            </div>

        </AppContent>

    </App>

</template>

<style scoped lang="scss">
#intro {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2em;
    padding: 2em;
}
</style>
