<script setup lang="ts">
import api from '@/api';

import LoadApiWithIdParamInUrl from '@/components/functional/LoadApiWithIdParamInUrl.vue';
import RemoteControllerSnippet from '@/components/remote_controller/RemoteControllerSnippet.vue';
import DroneSnippet from '@/components/drone/DroneSnippet.vue';



</script>

<template>

   <LoadApiWithIdParamInUrl :api-method="api.connection.get" :id-params="{connectionId: undefined}" v-slot="connection">
      <div id="inner">
         <h1>Connection {{ connection.data.id }}</h1>

         <h2>Remote Controller</h2>
         <RemoteControllerSnippet v-if="typeof connection.data.remote_controller_id === 'number'" :id="connection.data.remote_controller_id"></RemoteControllerSnippet>
         <span v-else>-</span>

         <h2>Drone</h2>
         <DroneSnippet v-if="typeof connection.data.drone_id === 'number'" :id="connection.data.drone_id"></DroneSnippet>
         <span v-else>-</span>

      </div>
   </LoadApiWithIdParamInUrl>

</template>

<style scoped lang="scss">

#inner {
   display: flex;
   flex-direction: column;
   gap: 1em;
}

</style>

