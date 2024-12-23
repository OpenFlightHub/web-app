<script setup lang="ts">

import { onMounted, ref } from 'vue';
import { deviceSupportsOpenFlightHubConnectLink, OpenFlightHubConnectLinkClient_DjiPilot2, OpenFlightHubConnectLinkManager } from '@/sdks/openflighthub-connect-link-sdk';
import InfoPanel from '../layout/InfoPanel.vue';

const props = defineProps<{
    inline?: boolean
}>()

const supportsOpenFlightHubConnectLink = ref(false)
const isLinkedToOpenFlightHubConnect = ref(false)
const linkType = ref<undefined | 'dji-pilot-2'>()

onMounted(async ()=>{
    const supports = deviceSupportsOpenFlightHubConnectLink()
    if(supports){

        const manager = new OpenFlightHubConnectLinkManager()

        const connect = await manager.deviceIsLinked()
        if(connect !== false){
            isLinkedToOpenFlightHubConnect.value = true

            if(connect instanceof OpenFlightHubConnectLinkClient_DjiPilot2){
                linkType.value = 'dji-pilot-2'
            }
        }

        supportsOpenFlightHubConnectLink.value = supports
    }
})


</script>

<template>

    <InfoPanel :inline="props.inline">
        <template v-if="supportsOpenFlightHubConnectLink">
            <template v-if="isLinkedToOpenFlightHubConnect">
                <p>Device is linked to OpenFlightHub.</p>

                <RouterLink v-if="linkType === 'dji-pilot-2'" to="/link/dji-pilot-2">{{ $t("link.manage_connectable_device_now")}}</RouterLink>
            </template>
            <template v-else>
                <RouterLink to="/link/dji-pilot-2">{{ $t("link.connectable_device_connect_now")}}</RouterLink>
            </template>
        </template>
    </InfoPanel>

</template>

<style lang="scss" scoped>

#linkable-device-info {
    display: inline-flex;
    flex-direction: column;

    &:not(.inplace){
        position: absolute;
        top: 1em;
        left: 50%;
        transform: translateX(-50%);
    }
}

</style>
