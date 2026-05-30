<script setup lang="ts">
import api from '@/api';
import List from '@/components/layout/List.vue';

import LoadApiWithIdParamInUrl from '@/components/functional/LoadApiWithIdParamInUrl.vue';
import ConnectionSnippet from '@/components/connection/ConnectionSnippet.vue';
import HubWorkspaceMap from '@/components/workspace/HubWorkspaceMap.vue';
import { Tabs, TabList, Tab, TabPanels, TabPanel, Button } from 'primevue';
import Padding from '@/components/layout/Padding.vue';
import { useRoute, useRouter } from 'vue-router';
import { getIdQueryFromRouteOrUseDefault } from '@/util/url';
import ConnectionLiveStream from '@/components/video/ConnectionLiveStream.vue';
import HubWorkspaceFiles from '@/components/workspace/HubWorkspaceFiles.vue';
import DroneSnippet from '@/components/drone/DroneSnippet.vue';
import { uniqueProperty } from '@/util/array';
import LoadApiArrayWithIdParamInUrl from '@/components/functional/LoadApiArrayWithIdParamInUrl.vue';
import MissionSnippet from '@/components/mission/MissionSnippet.vue';
import ModalVue from '@/components/display/ModalVue.vue';
import { ref } from 'vue';
import IconVue from '@/components/general/IconVue.vue';
import TeamSnippet from '@/components/team/TeamSnippet.vue';
import {DataTable, Column} from 'primevue';
import MissionCreateForm from '@/components/mission/MissionCreateForm.vue';
import WorkspaceInviteTeamForm from '@/components/workspace/WorkspaceInviteTeamForm.vue';

const router = useRouter()

const showCreateMissionModal = ref(false)

const showInviteTeamModal = ref(false)

</script>

<template>

   <LoadApiWithIdParamInUrl :api-method="api.rest.workspace.get" :config="{params: {}}" :id-params="['workspaceId']" v-slot="workspace">
      <Padding>
         <h1>Workspace {{ workspace.data.name }}</h1>

         <LoadApiArrayWithIdParamInUrl :api-method="api.rest.workspace.connections.get" :config="{params: {}}" :id-params="['workspaceId']" v-slot="connections">

            <HubWorkspaceMap :workspace-id="workspace.data.id" :connections="connections.data" :longitude="workspace.data.longitude" :latitude="workspace.data.latitude" style="width: 100%; height: 70vh;" forceTopDown></HubWorkspaceMap>

         </LoadApiArrayWithIdParamInUrl>

      </Padding>
   </LoadApiWithIdParamInUrl>

</template>

<style scoped lang="scss">

</style>

