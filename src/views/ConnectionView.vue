<script setup lang="ts">
import api from '@/api';

import LoadApi from '@/components/functional/LoadApi.vue';
import LoadApiWithIdParamInUrl from '@/components/functional/LoadApiWithIdParamInUrl.vue';
import RemoteControllerSnippet from '@/components/remote_controller/RemoteControllerSnippet.vue';
import DroneSnippet from '@/components/drone/DroneSnippet.vue';
import Padding from '@/components/layout/Padding.vue';
import List from '@/components/layout/List.vue';
import HubWorkspaceFilePreview from '@/components/workspace/HubWorkspaceFilePreview.vue';

</script>

<template>

   <LoadApiWithIdParamInUrl :api-method="api.rest.connection.get" :id-params="{connectionId: undefined}" v-slot="connection">
      <Padding>
         <h1>Connection {{ connection.data.name }}</h1>

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

#inner {
   display: flex;
   flex-direction: column;
   gap: 1em;
}

.media_file_preview {
   height: 15em;
   width: 15em;
}

</style>

