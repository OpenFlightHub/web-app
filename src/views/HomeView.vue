<script setup lang="ts">

import { useRouter } from 'vue-router';
import { computed, onMounted, reactive, ref } from 'vue';
import api from '@/api';
import {ApiResponse_WorkspaceMyworkspacesGet} from '@/api/openflighthub-api'
import { updateArray } from '@/util/vue';
import WorkspaceSnippet from '@/components/workspace/WorkspaceSnippet.vue';
import List from '@/components/layout/List.vue';
import { deviceSupportsSDK } from '@/sdks/dji-pilot-2/dji-open-platform-connect-sdk';
import Padding from '@/components/layout/Padding.vue';

const router = useRouter()

const isMainView = computed(()=>{
    return router.currentRoute.value.name === 'hub'
})


const workspaces = reactive<ApiResponse_WorkspaceMyworkspacesGet>([])

onMounted(async ()=>{
    updateArray(workspaces, await api.workspace.myWorkspaces.get())
})

const isDjiRemoteController = ref(false)

function checkIsDjiRemoteController(){
    isDjiRemoteController.value = deviceSupportsSDK()
}

onMounted(checkIsDjiRemoteController)


</script>

<template>

    <div v-if="isDjiRemoteController">
        <RouterLink to="/link/dji-pilot-2">{{ $t("connect.connectable_device_connect_now")}}</RouterLink>
    </div>

    <div v-else>
        <Padding>

            <h3>Your Workspaces:</h3>

            <List>
                <WorkspaceSnippet v-for="workspace, index in workspaces" :key="index" :id="workspace.id"></WorkspaceSnippet>
            </List>

        </Padding>

    </div>

</template>

<style lang="scss" scoped>


</style>
