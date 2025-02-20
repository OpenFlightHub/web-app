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
import LiveStream from '@/components/video/LiveStream.vue';
import HubWorkspaceFile from '@/components/workspace/HubWorkspaceFile.vue';

const router = useRouter()


</script>

<template>

   <LoadApiWithIdParamInUrl :api-method="api.rest.workspace.get" :id-params="{workspaceId: undefined}" v-slot="workspace">
      <Padding>
         <h1>Workspace {{ workspace.data.name }}</h1>

         <LoadApiArrayWithIdParamInUrl :api-method="api.rest.workspace.connections.get" :id-params="{workspaceId: undefined}" v-slot="connections">

            <Tabs :value="getIdQueryFromRouteOrUseDefault('tab', useRoute(), 0)" @update:value="evt=>{router.push({query: {tab:  '' + evt}})}">
               <TabList>
                  <Tab :value="0">Map</Tab>
                  <Tab :value="1">Connections</Tab>
                  <Tab :value="2">Streams</Tab>
                  <Tab :value="3">Files</Tab>
               </TabList>
               <TabPanels>
                  <TabPanel :value="0">
                     <HubWorkspaceMap :connections="connections.data" style="width: 100%; height: 70vh;"></HubWorkspaceMap>
                  </TabPanel>
                  <TabPanel :value="1">
                     <List>
                        <ConnectionSnippet v-for="connection in connections.data" :workspace-id="workspace.data.id" :connection-id="connection.id"></ConnectionSnippet>
                     </List>
                  </TabPanel>
                  <TabPanel :value="2">
                     <List :horizontal="true">
                        <div v-for="connection in connections.data" style="width: 300px; height: 200px" :key="connection.id">
                           <span>Connection {{ connection.id }}</span>
                           <LiveStream :id="connection.id"></LiveStream>
                        </div>
                     </List>
                  </TabPanel>
                  <TabPanel :value="3">
                     <List :horizontal="true">
                        <LoadApiWithIdParamInUrl :api-method="api.rest.workspace.files.get" :id-params="{workspaceId: undefined}" v-slot="workspaceFiles">
                           <div v-for="file in workspaceFiles.data" :key="file.id">
                              <HubWorkspaceFile :id="file.id"></HubWorkspaceFile>
                           </div>
                        </LoadApiWithIdParamInUrl>
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

