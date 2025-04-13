<script setup lang="ts">
import { ApiResponse_ConnectionGet, ApiResponse_DroneLastpositionGet, ApiResponse_RemotecontrollerLastpositionGet, ApiResponse_DroneLastbatteryGet } from 'openflighthub-api-client-sdk';
import MapMarker from '../map/MapMarker.vue';
import { Color, Viewer } from 'cesium';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { updateObject } from '@/util/vue';
import api from '@/api';
import MapLine from '../map/MapLine.vue';
import LiveStream from '../video/LiveStream.vue';

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

    if(typeof props.connection.drone_id === 'number'){
        api.live.subscribeToDronePosition(props.connection.drone_id, (evt, filter, data)=>{
            updateObject(lastDronePosition, data.position)
        })

        updateObject(lastDronePosition, await api.rest.drone.lastPosition.get({
            droneId: props.connection.drone_id
        }))

        api.live.subscribeToDroneTelemetry(props.connection.drone_id, (evt, filter, data)=>{
            updateObject(lastDroneBattery, data.telemetry)
        })

        updateObject(lastDroneBattery, await api.rest.drone.lastBattery.get({
            droneId: props.connection.drone_id
        }))
    }

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


const showInfo = ref(false)
const infoHasBeenShownAtLeastOnce = ref(false)

function clickMarker(){
    showInfo.value = true
    infoHasBeenShownAtLeastOnce.value = true // so stream is not loaded without need
}

const currentBatteryPercent = ref(0)

const lastDroneBattery = reactive({} as ApiResponse_DroneLastbatteryGet)
const isValidLastDroneBattery = computed(()=>{
    return typeof lastDroneBattery.capacity_percent_left === 'number'
})

const currentBatteryPercentString = computed(()=>{
    if(typeof lastDroneBattery.capacity_percent_left === 'number'){
        return Math.floor(lastDroneBattery.capacity_percent_left) + ' %'
    } else {
        return '?'
    }
})


</script>

<template>

    <MapMarker v-if="isValidLastDronePosition" :map-container="props.mapContainer" :position="[lastDronePosition.longitude, lastDronePosition.latitude]" :elevation="lastDronePosition.height" :viewer="props.viewer" :label="props.connection.name" icon-url="/images/drone/icon_simple.png" :icon-width="32" :icon-height="32" @click="clickMarker" :color="Color.CYAN" :show-height-indicator="true" :show-height-mean-sea-level-in-label="true"></MapMarker>

    <MapMarker v-if="isValidLastRemoteControllerPosition" :map-container="props.mapContainer" :position="[lastRemoteControllerPosition.longitude, lastRemoteControllerPosition.latitude]" :elevation="lastRemoteControllerPosition.height" :viewer="props.viewer" :label="'RC #' + props.connection.remote_controller_id" icon-url="/images/remote_controller/icon_simple.png" :icon-width="32" :icon-height="32" @click="clickMarker" :color="Color.CYAN"></MapMarker>

    <MapLine v-if="isValidLastDronePosition && isValidLastRemoteControllerPosition" :map-container="props.mapContainer" :from="{position: [lastDronePosition.longitude, lastDronePosition.latitude], elevation: lastDronePosition.height}" :to="{position: [lastRemoteControllerPosition.longitude, lastRemoteControllerPosition.latitude], elevation: lastRemoteControllerPosition.height}" :viewer="props.viewer" :color="Color.RED"></MapLine>

    <div v-show="showInfo" id="info">

        <div id="close" @click="showInfo = false">
            close
        </div>

        <div id="inner">
            <span>Connection ID: {{ props.connection.id }}</span>

            <br/>

            <span>
                Drone Battery: {{ currentBatteryPercentString }}
            </span>

            <br/>

            <LiveStream v-if="infoHasBeenShownAtLeastOnce" :id="props.connection.id"></LiveStream>
        </div>

    </div>

</template>

<style scoped lang="scss">

#info {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    min-width: 300px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    background: var(--neutral-darkest);

    #close {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        padding: 0.5em;
        background: var(--neutral-dark);
        cursor: pointer;
        transform: all 0.2s ease;

        &:hover {
            background: var(--neutral-darker);
        }
    }

    #inner {
        padding: 1em;
    }
}

</style>
