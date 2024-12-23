<script setup lang="ts">

import { useRouter } from 'vue-router';
import { computed, onMounted, reactive, ref } from 'vue';
import api from '@/api';
import {ApiResponse_WorkspaceMyworkspacesGet} from '@/api/openflighthub-api'
import { updateArray } from '@/util/vue';
import WorkspaceSnippet from '@/components/workspace/WorkspaceSnippet.vue';
import List from '@/components/layout/List.vue';
import { deviceSupportsOpenFlightHubConnectLink, OpenFlightHubConnectLinkManager } from '@/sdks/openflighthub-connect-link-sdk';
import Padding from '@/components/layout/Padding.vue';
import LinkableDeviceInfo from '@/components/link/LinkableDeviceInfo.vue';

const router = useRouter()

const isMainView = computed(()=>{
    return router.currentRoute.value.name === 'hub'
})


const workspaces = reactive<ApiResponse_WorkspaceMyworkspacesGet>([])

onMounted(async ()=>{
    updateArray(workspaces, await api.workspace.myWorkspaces.get())
})

const supportsOpenFlightHubConnectLink = ref(false)
const isLinkedToOpenFlightHubConnect = ref(false)

onMounted(async ()=>{
    const supports = deviceSupportsOpenFlightHubConnectLink()
    if(supports){

        const manager = new OpenFlightHubConnectLinkManager()
        if(await manager.deviceIsLinked()){
            isLinkedToOpenFlightHubConnect.value = true
        }

        supportsOpenFlightHubConnectLink.value = supports
    }
})


</script>

<template>

    <LinkableDeviceInfo></LinkableDeviceInfo>

    <Padding>

        <h3>Your Workspaces:</h3>

        <List horizontal>
            <WorkspaceSnippet v-for="workspace, index in workspaces" :key="index" :id="workspace.id"></WorkspaceSnippet>
        </List>

    </Padding>

</template>

<style lang="scss" scoped>


</style>
