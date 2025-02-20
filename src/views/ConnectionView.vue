<script setup lang="ts">
import api from '@/api';

import LoadApi from '@/components/functional/LoadApi.vue';
import LoadApiWithIdParamInUrl from '@/components/functional/LoadApiWithIdParamInUrl.vue';
import RemoteControllerSnippet from '@/components/remote_controller/RemoteControllerSnippet.vue';
import DroneSnippet from '@/components/drone/DroneSnippet.vue';
import Padding from '@/components/layout/Padding.vue';
import List from '@/components/layout/List.vue';
import HubWorkspaceFile from '@/components/workspace/HubWorkspaceFile.vue';

</script>

<template>

   <LoadApiWithIdParamInUrl :api-method="api.rest.connection.get" :id-params="{connectionId: undefined}" v-slot="connection">
      <Padding>
         <h1>Connection {{ connection.data.id }}</h1>

         <List>
            <div>
               <h2>Remote Controller</h2>
               <RemoteControllerSnippet v-if="typeof connection.data.remote_controller_id === 'number'" :id="connection.data.remote_controller_id"></RemoteControllerSnippet>
               <span v-else>-</span>
            </div>

            <div>
               <h2>Drone</h2>
               <DroneSnippet v-if="typeof connection.data.drone_id === 'number'" :id="connection.data.drone_id"></DroneSnippet>
               <span v-else>-</span>
            </div>
         </List>


         <h1>Drone Media</h1>
         <LoadApi :api-method="api.rest.drone.media.get" :params="{droneId: connection.data.drone_id}" v-slot="droneMedia">
            <List :horizontal="true">
               <HubWorkspaceFile v-for="media in droneMedia.data" :id="media.file_id"></HubWorkspaceFile>
            </List>
         </LoadApi>

      </Padding>
   </LoadApiWithIdParamInUrl>

</template>

<style scoped lang="scss">

#inner {
   display: flex;
   flex-direction: column;
   gap: 1em;
}

</style>

