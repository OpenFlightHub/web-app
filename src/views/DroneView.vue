<script setup lang="ts">
import api from '@/api';

import LoadApi from '@/components/functional/LoadApi.vue';
import LoadApiWithIdParamInUrl from '@/components/functional/LoadApiWithIdParamInUrl.vue';
import Padding from '@/components/layout/Padding.vue';
import List from '@/components/layout/List.vue';
import HubWorkspaceFilePreview from '@/components/workspace/HubWorkspaceFilePreview.vue';
import TimestampDisplay from '@/components/display/TimestampDisplay.vue';
import SmartTable from '@/components/general/SmartTable.vue';
import LoadApiArray from '@/components/functional/LoadApiArray.vue';
import RemoteControllerSnippet from '@/components/remote_controller/RemoteControllerSnippet.vue';
import { sortByProperty, uniqueByProperty } from '@/util/array';

</script>

<template>

   <LoadApiWithIdParamInUrl :api-method="api.rest.drone.get" :id-params="{droneId: undefined}" v-slot="drone">
      <Padding id="outer">
         <h1>Drone {{ drone.data.name }}</h1>


         <h2>Last Connection</h2>

         <LoadApi v-if="typeof drone.data.last_connection_id === 'number'" :api-method="api.rest.connection.get" :params="{connectionId: drone.data.last_connection_id}" v-slot="connection">
            <Padding>
               <table>
                  <tr>
                     <td>Name</td>
                     <td>
                        <RouterLink :to="'/connection/' + connection.data.id">
                           {{ connection.data.name }}
                        </RouterLink>
                     </td>
                  </tr>
                  <tr>
                     <td>Remote Controller</td>
                     <td>
                        <RemoteControllerSnippet v-if="typeof connection.data.remote_controller_id === 'number'" :id="connection.data.remote_controller_id"></RemoteControllerSnippet>
                        <p v-else>-</p>
                     </td>
                  </tr>
                  <tr>
                     <td>Workspace</td>
                     <td>TODO: implement workspace name</td>
                  </tr>
               </table>
            </Padding>
         </LoadApi>
         <Padding v-else>
            Not connected
         </Padding>

         <h2>Flights</h2>

         <LoadApiArray :api-method="api.rest.drone.flights.get" :params="{droneId: drone.data.id}" v-slot="flights">

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


         <h2>All Drone Media</h2>
         <LoadApiArray :api-method="api.rest.drone.media.get" :params="{droneId: drone.data.id}" v-slot="droneMedia">
            <List :horizontal="true">
               <template v-for="media in sortByProperty(uniqueByProperty(droneMedia.data, 'id'), 'id')">
                  <RouterLink :to="'/drone-media/' + media.id">
                     <HubWorkspaceFilePreview  class="media_file_preview" :id="media.file_id"></HubWorkspaceFilePreview>
                  </RouterLink>
               </template>
            </List>
         </LoadApiArray>

      </Padding>
   </LoadApiWithIdParamInUrl>

</template>

<style scoped lang="scss">
#outer {
   display: flex;
   flex-direction: column;
   height: calc(100vh - var(--navbar-size) - 4em); // 4em for heading
   width: 100vw;

   .drone_media {
      flex-grow: 1;
   }
}

</style>

