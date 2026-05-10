<script setup lang="ts">
import api from '@/api';

import LoadApi from '@/components/functional/LoadApi.vue';
import LoadApiWithIdParamInUrl from '@/components/functional/LoadApiWithIdParamInUrl.vue';
import Padding from '@/components/layout/Padding.vue';
import List from '@/components/layout/List.vue';
import HubWorkspaceFilePreview from '@/components/workspace/HubWorkspaceFilePreview.vue';
import TimestampDisplay from '@/components/display/TimestampDisplay.vue';
import SmartTable from '@/components/general/SmartTable.vue';
import RemoteControllerSnippet from '@/components/remote_controller/RemoteControllerSnippet.vue';
import { sortByProperty, uniqueByProperty } from '@/util/array';
import Spacing from '@/components/layout/Spacing.vue';
import LoadApiArray from '@/components/functional/LoadApiArray.vue';
import { TabList, Tabs, TabPanel, Tab, TabPanels } from 'primevue';
import { getIdQueryFromRouteOrUseDefault } from '@/util/url';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter()
</script>

<template>

   <Padding>

      <LoadApiWithIdParamInUrl :api-method="api.rest.drone.get" :config="{params: {}}" :id-params="['droneId']" v-slot="drone">
         <Padding id="outer">
            <h1>Drone {{ drone.data.name }}</h1>

            <Tabs :value="getIdQueryFromRouteOrUseDefault('tab', useRoute(), 0)" @update:value="evt=>{router.push({query: {tab:  '' + evt}})}">
               <TabList>
                  <Tab :value="0">Information</Tab>
                  <Tab :value="1">Live</Tab>
                  <Tab :value="2">Flight</Tab>
                  <Tab :value="3">Media</Tab>
               </TabList>
               <TabPanels>
                  <TabPanel :value="0">
                     <h2>Information</h2>

                     <Spacing></Spacing>

                     <h2>Last Connection</h2>

                     <LoadApi v-if="typeof drone.data.last_connection_id === 'number'" :api-method="api.rest.connection.get" :config="{params: {connectionId: drone.data.last_connection_id}}" v-slot="connection">
                        <Padding>
                           <table>
                              <tbody>
                                 <tr>
                                    <td>Name</td>
                                    <td>
                                       <RouterLink :to="'/connection/' + connection.data.id">
                                          {{ connection.data.name }}
                                       </RouterLink>
                                    </td>
                                 </tr>
                                 <tr>
                                    <td>Current Remote Controller</td>
                                    <td>
                                       <RemoteControllerSnippet v-if="typeof connection.data.remote_controller_id === 'number'" :id="connection.data.remote_controller_id"></RemoteControllerSnippet>
                                       <p v-else>-</p>
                                    </td>
                                 </tr>
                                 <tr>
                                    <td>Current Workspace</td>
                                    <td><RouterLink :to="'/workspace/' + connection.data.workspace_id"><LoadApi :api-method="api.rest.workspace.get" :config="{params: {workspaceId: connection.data.workspace_id}}" v-slot="workspace">{{ workspace.data.name }}</LoadApi></RouterLink></td>
                                 </tr>
                              </tbody>
                           </table>
                        </Padding>
                     </LoadApi>
                     <Padding v-else>
                        Not connected
                     </Padding>

                  </TabPanel>
                  <TabPanel :value="1">

                     <h2>Live</h2>

                     <RouterLink :to="'/drone/' + drone.data.id + '/live'">View Live</RouterLink>

                  </TabPanel>
                  <TabPanel :value="2">

                     <h2>Flights</h2>

                     <LoadApiArray :api-method="api.rest.drone.flights.get" :config="{params: {droneId: drone.data.id}}" v-slot="flights">

                        <SmartTable :column-labels="{id: 'ID', started_at: 'Takeoff at', landed_at: 'Landed at', ended_at: 'Ended at'}" :data="flights.data" sort-by-id="desc">

                           <template #cell(id)="data">
                              {{ data.value }}&nbsp;<RouterLink :to="'/flight/' + data.row.id">view details</RouterLink>
                           </template>
                           <template #cell(started_at)="data">
                              <TimestampDisplay v-if="data.value" :timestamp="data.value"></TimestampDisplay>
                              <span v-else>-</span>
                           </template>
                           <template #cell(landed_at)="data">
                              <TimestampDisplay v-if="data.value" :timestamp="data.value"></TimestampDisplay>
                              <span v-else>-</span>
                           </template>
                           <template #cell(ended_at)="data">
                              <TimestampDisplay v-if="data.value" :timestamp="data.value"></TimestampDisplay>
                              <span v-else>-</span>
                           </template>
                        </SmartTable>
                     </LoadApiArray>

                  </TabPanel>
                  <TabPanel :value="3">

                     <h2>All Drone Media</h2>

                     <LoadApiArray :api-method="api.rest.drone.media.get" :config="{params: {droneId: drone.data.id}}" v-slot="droneMedia">
                        <List :horizontal="true" :fill="true">
                           <RouterLink v-for="media in sortByProperty(uniqueByProperty(droneMedia.data, 'id'), 'id')" :key="media.id" :to="'/drone-media/' + media.id">
                              <HubWorkspaceFilePreview  class="media_file_preview" :id="media.file_id"></HubWorkspaceFilePreview>
                           </RouterLink>
                        </List>
                     </LoadApiArray>

                  </TabPanel>
               </TabPanels>
            </Tabs>
         </Padding>
      </LoadApiWithIdParamInUrl>
   </Padding>

</template>

<style scoped lang="scss">
#outer {
   display: flex;
   flex-direction: column;

   .media_file_preview {
      height: 300px;
      width: 300px;
   }
}

</style>

