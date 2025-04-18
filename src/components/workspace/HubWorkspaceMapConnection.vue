<script setup lang="ts">
import { ApiResponse_ConnectionGet, ApiResponse_DroneLastpositionGet, ApiResponse_RemotecontrollerLastpositionGet, ApiResponse_DroneLastbatteryGet } from 'openflighthub-api-client-sdk';
import MapMarker from '../map/MapMarker.vue';
import { Color, Viewer } from 'cesium';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { updateObject } from '@/util/vue';
import api from '@/api';
import MapLine from '../map/MapLine.vue';
import LiveStream from '../video/LiveStream.vue';
import HubWorkspaceMapDrone from './HubWorkspaceMapDrone.vue';

const props = defineProps<{
    mapContainer: HTMLElement
    viewer: Viewer
    connection: ApiResponse_ConnectionGet
}>()



const lastDronePosition = reactive({} as ApiResponse_DroneLastpositionGet)

const isValidLastDronePosition = computed(()=>{
    return typeof lastDronePosition.height === 'number'
})

onMounted(setup)

watch(()=>{
    return props.connection
}, setup, {deep: true})

async function setup(){

    if(typeof props.connection.remote_controller_id === 'number'){
        api.live.subscribeToRemoteControllerPosition(props.connection.remote_controller_id, (evt, filter, data)=>{
            updateObject(lastRemoteControllerPosition, data)
        })

        updateObject(lastRemoteControllerPosition, await api.rest.remoteController.lastPosition.get({
            remoteControllerId: props.connection.remote_controller_id
        }))
    }
}

const lastRemoteControllerPosition = reactive({} as ApiResponse_RemotecontrollerLastpositionGet)
const isValidLastRemoteControllerPosition = computed(()=>{
    return typeof lastRemoteControllerPosition.height === 'number'
})


</script>

<template>

    <HubWorkspaceMapDrone v-if="typeof props.connection.drone_id === 'number'" :drone-id="props.connection.drone_id" :map-container="props.mapContainer" :viewer="props.viewer" @drone-position="(pos)=>updateObject(lastDronePosition, pos)"></HubWorkspaceMapDrone>

    <MapMarker v-if="isValidLastRemoteControllerPosition" :map-container="props.mapContainer" :position="[lastRemoteControllerPosition.longitude, lastRemoteControllerPosition.latitude]" :elevation="lastRemoteControllerPosition.height" :viewer="props.viewer" :label="'RC #' + props.connection.remote_controller_id" icon-url="/images/remote_controller/icon_simple.png" :icon-width="32" :icon-height="32" :color="Color.CYAN"></MapMarker>

    <MapLine v-if="isValidLastDronePosition && isValidLastRemoteControllerPosition" :map-container="props.mapContainer" :from="{position: [lastDronePosition.longitude, lastDronePosition.latitude], elevation: lastDronePosition.height}" :to="{position: [lastRemoteControllerPosition.longitude, lastRemoteControllerPosition.latitude], elevation: lastRemoteControllerPosition.height}" :viewer="props.viewer" :color="Color.RED"></MapLine>

</template>

<style scoped lang="scss">

</style>
