<script setup lang="ts">
import api from '@/api';

import LoadApi from '@/components/functional/LoadApi.vue';
import LoadApiWithIdParamInUrl from '@/components/functional/LoadApiWithIdParamInUrl.vue';
import RemoteControllerSnippet from '@/components/remote_controller/RemoteControllerSnippet.vue';
import DroneSnippet from '@/components/drone/DroneSnippet.vue';
import Padding from '@/components/layout/Padding.vue';
import List from '@/components/layout/List.vue';
import DroneMedia from '@/components/drone/DroneMedia.vue';

</script>

<template>

   <LoadApiWithIdParamInUrl :api-method="api.rest.media.get" :id-params="{mediaId: undefined}" v-slot="media">
      <Padding id="outer">
         <h1>Drone media {{ media.data.file_name }}</h1>

         <DroneMedia :media="media.data" class="drone_media"></DroneMedia>

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

