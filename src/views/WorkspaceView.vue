<script setup lang="ts">
import api from '@/api';
import List from '@/components/layout/List.vue';

import LoadApiWithIdParamInUrl from '@/components/functional/LoadApiWithIdParamInUrl.vue';
import LoadApiArrayWithIdParamInUrl from '@/components/functional/LoadApiArrayWithIdParamInUrl.vue';
import ConnectionSnippet from '@/components/connection/ConnectionSnippet.vue';
import HubWorkspaceMap from '@/components/workspace/HubWorkspaceMap.vue';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primevue';
import Padding from '@/components/layout/Padding.vue';
import { useRoute, useRouter } from 'vue-router';
import { getIdQueryFromRouteOrUseDefault } from '@/util/url';
import ConnectionLiveStream from '@/components/video/ConnectionLiveStream.vue';
import HubWorkspaceFiles from '@/components/workspace/HubWorkspaceFiles.vue';
import DroneSnippet from '@/components/drone/DroneSnippet.vue';
import { ApiResponse_WorkspaceConnectionsGet } from 'openflighthub-api-client-sdk';

const router = useRouter()

function uniqueDrones(connections: ApiResponse_WorkspaceConnectionsGet){
   const droneIds: number[] = []

   for(const connection of connections){
      if(typeof connection.drone_id === 'number'){
         if(!droneIds.includes(connection.drone_id)){
            droneIds.push(connection.drone_id)
         }
      }
   }

   return droneIds
}

</script>

<template>

   <LoadApiWithIdParamInUrl :api-method="api.rest.workspace.get" :id-params="{workspaceId: undefined}" v-slot="workspace">
      <Padding>
         <h1>Workspace {{ workspace.data.name }}</h1>

         <LoadApiArrayWithIdParamInUrl :api-method="api.rest.workspace.connections.get" :id-params="{workspaceId: undefined}" v-slot="connections">

            <Tabs :value="getIdQueryFromRouteOrUseDefault('tab', useRoute(), 0)" @update:value="evt=>{router.push({query: {tab:  '' + evt}})}">
               <TabList>
                  <Tab :value="0">Map</Tab>
                  <Tab :value="1">Drones</Tab>
                  <Tab :value="2">Streams</Tab>
                  <Tab :value="3">Files</Tab>
                  <Tab :value="4">Connections</Tab>
               </TabList>
               <TabPanels>
                  <TabPanel :value="0">
                     <HubWorkspaceMap :workspace-id="workspace.data.id" :connections="connections.data" :longitude="workspace.data.longitude" :latitude="workspace.data.latitude" style="width: 100%; height: 70vh;"></HubWorkspaceMap>
                  </TabPanel>
                  <TabPanel :value="1">
                     <List>
                        <DroneSnippet v-for="droneId in uniqueDrones(connections.data)" :id="droneId"></DroneSnippet>
                     </List>
                  </TabPanel>
                  <TabPanel :value="2">
                     <List :horizontal="true">
                        <ConnectionLiveStream v-for="connection in connections.data" :key="connection.id" :connectionId="connection.id"></ConnectionLiveStream>
                     </List>
                  </TabPanel>
                  <TabPanel :value="3">
                     <LoadApiArrayWithIdParamInUrl :api-method="api.rest.workspace.files.get" :id-params="{workspaceId: undefined}" v-slot="workspaceFiles">
                        <HubWorkspaceFiles :files="workspaceFiles.data"></HubWorkspaceFiles>
                     </LoadApiArrayWithIdParamInUrl>
                  </TabPanel>
                  <TabPanel :value="4">
                     <List>
                        <ConnectionSnippet v-for="connection in connections.data" :workspace-id="workspace.data.id" :connection-id="connection.id"></ConnectionSnippet>
                     </List>
                  </TabPanel>
               </TabPanels>
            </Tabs>

         </LoadApiArrayWithIdParamInUrl>

      </Padding>
   </LoadApiWithIdParamInUrl>

</template>

<style scoped lang="scss">

</style>

