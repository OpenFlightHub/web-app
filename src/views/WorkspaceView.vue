<script setup lang="ts">
import WIP from '@/components/WIP.vue';
import api from '@/api';
import List from '@/components/layout/List.vue';

import LoadApiWithIdParamInUrl from '@/components/functional/LoadApiWithIdParamInUrl.vue';
import LoadApiArrayWithIdParamInUrl from '@/components/functional/LoadApiArrayWithIdParamInUrl.vue';
import ConnectionSnippet from '@/components/connection/ConnectionSnippet.vue';
import HubWorkspaceMap from '@/components/workspace/HubWorkspaceMap.vue';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primevue';


</script>

<template>

   <LoadApiWithIdParamInUrl :api-method="api.workspace.get" :id-params="{workspaceId: undefined}" v-slot="workspace">
      <div>
         <h1>Workspace {{ workspace.data.name }}</h1>

         <h2>Connections</h2>

         <LoadApiArrayWithIdParamInUrl :api-method="api.workspace.connections.get" :id-params="{workspaceId: undefined}" v-slot="connections">

            <Tabs value="0">
               <TabList>
                  <Tab value="0">Map</Tab>
                  <Tab value="1">Connections</Tab>
               </TabList>
               <TabPanels>
                  <TabPanel value="0">
                     <HubWorkspaceMap :connections="connections.data" style="width: 100%; height: 70vh;"></HubWorkspaceMap>
                  </TabPanel>
                  <TabPanel value="1">
                     <List>
                        <ConnectionSnippet v-for="connection in connections.data" :workspace-id="workspace.data.id" :connection-id="connection.id"></ConnectionSnippet>
                     </List>
                  </TabPanel>
               </TabPanels>
            </Tabs>

         </LoadApiArrayWithIdParamInUrl>

      </div>
   </LoadApiWithIdParamInUrl>

</template>

<style scoped lang="scss">

</style>

