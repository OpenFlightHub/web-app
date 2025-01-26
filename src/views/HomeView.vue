<script setup lang="ts">

import { onMounted, reactive } from 'vue';
import api from '@/api';
import {ApiResponse_WorkspaceMyworkspacesGet} from 'openflighthub-api-client-sdk'
import { updateArray } from '@/util/vue';
import WorkspaceSnippet from '@/components/workspace/WorkspaceSnippet.vue';
import List from '@/components/layout/List.vue';
import Padding from '@/components/layout/Padding.vue';
import LinkableDeviceInfo from '@/components/link/LinkableDeviceInfo.vue';


const workspaces = reactive<ApiResponse_WorkspaceMyworkspacesGet>([])

onMounted(async ()=>{
    updateArray(workspaces, await api.rest.workspace.myWorkspaces.get())
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
