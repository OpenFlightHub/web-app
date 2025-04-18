<script setup lang="ts">
import api from '@/api';

import LoadApi from '@/components/functional/LoadApi.vue';
import LoadApiWithIdParamInUrl from '@/components/functional/LoadApiWithIdParamInUrl.vue';
import Padding from '@/components/layout/Padding.vue';
import List from '@/components/layout/List.vue';
import HubWorkspaceFilePreview from '@/components/workspace/HubWorkspaceFilePreview.vue';
import Map from '@/components/map/Map.vue';
import { ref } from 'vue';
import { Viewer } from 'cesium';
import { ApiResponse_DroneCurrentflightGet } from 'openflighthub-api-client-sdk';
import * as turf from '@turf/turf'
import HubWorkspaceMapDrone from '@/components/workspace/HubWorkspaceMapDrone.vue';

const mapContainer = ref(null as HTMLElement)

const viewerIsLoaded = ref(false)
let viewer: Viewer = null // if we make Viewer a reactive object, performance goes down the tube ...


function getCenterPointForFlight(flight: ApiResponse_DroneCurrentflightGet){

   const points = flight.track.map(t => turf.point([t.longitude, t.latitude]))

   const center = turf.center(turf.featureCollection(points))

   return {
      longitude: center.geometry.coordinates[0],
      latitude: center.geometry.coordinates[1]
   }
}

function getMaxHeightForFlight(flight: ApiResponse_DroneCurrentflightGet){
   let maxHeight = -1

   for(const t of flight.track){
      if(t.height > maxHeight){
         maxHeight = t.height
      }
   }

   if(flight.track.length === 0){
      return 3000
   }

   return maxHeight
}

</script>

<template>

   <LoadApiWithIdParamInUrl :api-method="api.rest.drone.get" :id-params="{droneId: undefined}" v-slot="drone">
      <Padding id="outer">
         <h1>Drone {{ drone.data.name }}</h1>

         <h1>Current Flight</h1>

         <LoadApi :api-method="api.rest.drone.currentFlight.get" :params="{droneId: drone.data.id}" v-slot="currentFlight">

            <div id="map-container" ref="mapContainer">
               <template v-if="currentFlight.data.track.length === 0">
                  Invalid Location
               </template>
               <template v-else>

                  <Map id="map" :start-point="getCenterPointForFlight(currentFlight.data)" :start-height="getMaxHeightForFlight(currentFlight.data) + 200" :start-camera-pitch="-90" @viewer-loaded="(v)=>{viewer = v; viewerIsLoaded = true}"></Map>

                  <template v-if="viewerIsLoaded">

                     <HubWorkspaceMapDrone :drone-id="drone.data.id" :viewer="viewer" :map-container="mapContainer" :show-current-flight="true"></HubWorkspaceMapDrone>

                  </template>
               </template>

            </div>
         </LoadApi>


         <h1>Drone Media</h1>
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

