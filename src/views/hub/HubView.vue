<script setup lang="ts">

import App from '@/components/app/App.vue';
import AppNavBar from '@/components/app/AppNavBar.vue';
import AppContent from '@/components/app/AppContent.vue';
import { useRouter } from 'vue-router';
import { computed, onMounted, reactive } from 'vue';
import WIP from '@/components/WIP.vue';
import api from '@/api';
import {ApiResponse_WorkspaceMyworkspacesGet} from '@/api/openflighthub-api'
import { updateArray } from '@/util/vue';
import { DataView } from 'primevue';
import WorkspaceSnippet from '@/components/workspace/WorkspaceSnippet.vue';
import List from '@/components/layout/List.vue';

const router = useRouter()

const isMainView = computed(()=>{
    return router.currentRoute.value.name === 'hub'
})


const workspaces = reactive<ApiResponse_WorkspaceMyworkspacesGet>([])

onMounted(async ()=>{
    updateArray(workspaces, await api.workspace.myWorkspaces.get())
})


</script>

<template>
    <App>
        <AppNavBar>
        </AppNavBar>

        <AppContent>

            <div v-if="isMainView">
                Welcome to the Hub!

                <h3>Your Workspaces:</h3>

                <List>
                    <WorkspaceSnippet v-for="workspace, index in workspaces" :key="index" :id="workspace.id"></WorkspaceSnippet>
                </List>


            </div>
            <RouterView v-else>

            </RouterView>

        </AppContent>

    </App>

</template>

<style lang="scss" scoped>


</style>
