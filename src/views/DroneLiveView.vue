<script setup lang="ts">
import api from '@/api';

import LoadApiWithIdParamInUrl from '@/components/functional/LoadApiWithIdParamInUrl.vue';
import Padding from '@/components/layout/Padding.vue';
import FlightSimulation from '@/components/flight/FlightSimulation.vue';
import { onMounted, ref } from 'vue';
import { getIdParamFromRoute } from '@/util/url';
import { useRoute } from 'vue-router';
import { bearing } from '@turf/turf';
import List from '@/components/layout/List.vue';
import LiveVideo from '@/components/video/LiveVideo.vue';
import ConnectionLiveStream from '@/components/video/ConnectionLiveStream.vue';
import Map from '@/components/map/Map.vue';
import LoadApi from '@/components/functional/LoadApi.vue';

const flightSimulation = ref<InstanceType<typeof FlightSimulation> | null>(null)

let lastPosition: {longitude: number, latitude: number, height: number} | null = null

onMounted(()=>{
   api.live.subscribeToDronePosition(getIdParamFromRoute('droneId', useRoute()), (event, filter, data) => {

      if(flightSimulation.value){
         console.log('updating position', data.position)
      }

      flightSimulation.value?.setCameraPosition({
         longitude: data.position.longitude,
         latitude: data.position.latitude,
         height: data.position.height
      }, {
         heading: lastPosition ? calculateHeadingBetweenPoints(lastPosition, data.position) : 0,
         pitch: -10,
         roll: 0
      })

      lastPosition = data.position
   })
})

type Point = {
   height: number;
   longitude: number;
   latitude: number;
}

/**
 * @returns return deegrees, 0 = north, 90 = east
 */
function calculateHeadingBetweenPoints(pointA: Point, pointB: Point): number {
   return bearing([pointA.longitude, pointA.latitude], [pointB.longitude, pointB.latitude])
}

const viewerIsLoaded = ref(false)

</script>

<template>

   <Padding>

      <LoadApiWithIdParamInUrl :api-method="api.rest.drone.get" :config="{params: {}}" :id-params="['droneId']" v-slot="drone">
         <Padding id="outer">
            <h1>Drone {{ drone.data.name }}</h1>

            <div id="live-content">
               <LoadApi v-if="typeof drone.data.last_connection_id === 'number'" :api-method="api.rest.connection.get" :config="{params: {connectionId: drone.data.last_connection_id}}" v-slot="connection">
                  <LoadApi :api-method="api.rest.workspace.get" :config="{params: {workspaceId: drone.data.last_connection_id}}" v-slot="workspace">
                     <Map :start-point="{longitude: workspace.data.longitude, latitude: workspace.data.latitude}" :start-height="0" @viewer-loaded="viewerIsLoaded = true">
                        <FlightSimulation v-if="viewerIsLoaded" ref="flightSimulation"></FlightSimulation>
                     </Map>
                  </LoadApi>
               </LoadApi>
               <ConnectionLiveStream v-if="typeof drone.data.last_connection_id === 'number'" :connection-id="drone.data.last_connection_id"></ConnectionLiveStream>
               <div v-else id="no-connection">Drone has no active connection</div>
            </div>

         </Padding>
      </LoadApiWithIdParamInUrl>
   </Padding>

</template>

<style scoped lang="scss">

#live-content {
   display: flex;
   flex-direction: row;
   gap: 1em;

   & > * {
      width: 50%;
      height: 100%;
   }
}

#no-connection {
   display: flex;
   align-items: center;
   justify-content: center;
   height: 100%;
   width: 100%;
   color: #999;
   font-size: 1.2em;
}

</style>

