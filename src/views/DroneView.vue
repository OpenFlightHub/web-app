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

</script>

<template>

   <LoadApiWithIdParamInUrl :api-method="api.rest.drone.get" :id-params="{droneId: undefined}" v-slot="drone">
      <Padding id="outer">
         <h1>Drone {{ drone.data.name }}</h1>

         <h1>Flights</h1>

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


         <h1>All Drone Media</h1>
         <LoadApi :api-method="api.rest.drone.media.get" :params="{droneId: drone.data.id}" v-slot="droneMedia">
            <List :horizontal="true">
               <template v-for="media in droneMedia.data">
                  <RouterLink :to="'/drone-media/' + media.id">
                     <HubWorkspaceFilePreview  class="media_file_preview" :id="media.file_id"></HubWorkspaceFilePreview>
                  </RouterLink>
               </template>
            </List>
         </LoadApi>

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

