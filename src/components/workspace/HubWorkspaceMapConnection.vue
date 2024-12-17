<script setup lang="ts">
import { ApiResponse_ConnectionGet, ApiResponse_DroneLastpositionGet, ApiResponse_RemotecontrollerLastpositionGet } from '@/api/openflighthub-api';
import MapMarker from '../maplibre/MapMarker.vue';
import { Color, combine, Viewer } from 'cesium';
import { computed, onMounted, reactive } from 'vue';
import { updateObject } from '@/util/vue';
import api from '@/api';
import MapLine from '../maplibre/MapLine.vue';

const props = defineProps<{
    viewer: Viewer
    connection: ApiResponse_ConnectionGet
}>()



const lastDronePosition = reactive({} as ApiResponse_DroneLastpositionGet)

const isValidLastDronePosition = computed(()=>{
    return typeof lastDronePosition.height === 'number'
})

onMounted(()=>{
    setInterval(fetchLastDronePosition, 1000 * 1)
})

async function fetchLastDronePosition(){
    if(typeof props.connection.drone_id !== 'number'){
        return
    }

    updateObject(lastDronePosition, await api.drone.lastPosition.get({
        droneId: props.connection.drone_id
    }))
}


const lastRemoteControllerPosition = reactive({} as ApiResponse_RemotecontrollerLastpositionGet)
const isValidLastRemoteControllerPosition = computed(()=>{
    return typeof lastRemoteControllerPosition.height === 'number'
})

onMounted(()=>{
    setInterval(fetchLastRemoteControllerPosition, 1000 * 1)
})

async function fetchLastRemoteControllerPosition(){
    if(typeof props.connection.remote_controller_id !== 'number'){
        return
    }


    updateObject(lastRemoteControllerPosition, await api.remoteController.lastPosition.get({
        remoteControllerId: props.connection.remote_controller_id
    }))
}


</script>

<template>

    <MapMarker v-if="isValidLastDronePosition" :position="[lastDronePosition.longitude, lastDronePosition.latitude]" :elevation="lastDronePosition.height" :viewer="props.viewer" :label="'Drone #' + props.connection.drone_id" icon-url="/images/drone/icon_simple.png" :icon-width="32" :icon-height="32"></MapMarker>

    <MapMarker v-if="isValidLastRemoteControllerPosition" :position="[lastRemoteControllerPosition.longitude, lastRemoteControllerPosition.latitude]" :elevation="lastRemoteControllerPosition.height" :viewer="props.viewer" :label="'RC #' + props.connection.remote_controller_id" icon-url="/images/remote_controller/icon_simple.png" :icon-width="32" :icon-height="32"></MapMarker>

    <MapLine v-if="isValidLastDronePosition && isValidLastRemoteControllerPosition" :from="{position: [lastDronePosition.longitude, lastDronePosition.latitude], elevation: lastDronePosition.height}" :to="{position: [lastRemoteControllerPosition.longitude, lastRemoteControllerPosition.latitude], elevation: lastRemoteControllerPosition.height}" :viewer="props.viewer" :color="Color.RED"></MapLine>

</template>

<style scoped lang="scss">



</style>
