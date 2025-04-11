<script setup lang="ts">
import { ApiResponse_ConnectionGet, ApiResponse_DroneLastpositionGet, ApiResponse_RemotecontrollerLastpositionGet, ApiResponse_DroneLastbatteryGet, Live, ApiResponse_DroneMediaGet } from 'openflighthub-api-client-sdk';
import MapMarker from '../cesium/MapMarker.vue';
import { Color, Viewer } from 'cesium';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { updateArray, updateObject } from '@/util/vue';
import api from '@/api';
import MapLine from '../cesium/MapLine.vue';
import Padding from '../layout/Padding.vue';
import LiveStream from '../video/LiveStream.vue';
import IconVue from '../general/IconVue.vue';
import HubWorkspaceMapDroneMediaMarker from './HubWorkspaceMapDroneMediaMarker.vue';

const props = defineProps<{
    mapContainer: HTMLElement
    viewer: Viewer
    connection: ApiResponse_ConnectionGet
}>()



const droneMedia = reactive([] as ApiResponse_DroneMediaGet)

onMounted(setup)

watch(()=>{
    return props.connection
}, setup, {deep: true})

async function setup(){

    if(typeof props.connection.drone_id === 'number'){

        updateArray(droneMedia, await api.rest.drone.media.get({droneId: props.connection.drone_id}))
    }
}

</script>

<template>

    <template v-for="media in droneMedia" :key="media.id">
        <HubWorkspaceMapDroneMediaMarker :map-container="props.mapContainer" :viewer="viewer" :media="media"></HubWorkspaceMapDroneMediaMarker>
    </template>

</template>

<style scoped lang="scss">


</style>
