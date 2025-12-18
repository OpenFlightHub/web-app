<script setup lang="ts">
import { ApiResponse_DroneLastpositionGet, ApiResponse_DroneLastbatteryGet, ApiResponse_DroneGet, ApiResponse_DroneCurrentflightGet } from 'openflighthub-api-client-sdk';
import MapMarker from '../map/MapMarker.vue';
import { Color, Viewer } from 'cesium';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { updateObject } from '@/util/vue';
import api from '@/api';
import ConnectionLiveStream from '../video/ConnectionLiveStream.vue';
import MapPolyline from '../map/MapPolyline.vue';

const props = defineProps<{
    mapContainer: HTMLElement
    viewer: Viewer
    droneId: number
    showCurrentFlight?: boolean
}>()

const emit = defineEmits<{
    'drone-position': [ApiResponse_DroneLastpositionGet]
}>()


const drone = reactive({} as ApiResponse_DroneGet)

const lastDronePosition = reactive({} as ApiResponse_DroneLastpositionGet)

const isValidLastDronePosition = computed(()=>{
    return typeof lastDronePosition.height === 'number'
})

onMounted(setup)

watch(()=>{
    return props.droneId
}, setup)

async function setup(){

    api.live.subscribeToDbRowUpdate('drones', props.droneId, (a)=>{
        updateObject(drone, api.rest.drone.get({droneId: props.droneId}))
    })
    updateObject(drone, api.rest.drone.get({droneId: props.droneId}))

    api.live.subscribeToDronePosition(props.droneId, (evt, filter, data)=>{
        updateObject(lastDronePosition, data.position)

        if(currentFlight.track){//TODO check this can lead to a missing point on the track
            currentFlight.track.push(data.position)
        }

        emit('drone-position', data.position)
    })

    try {
        updateObject(lastDronePosition, await api.rest.drone.lastPosition.get({
            droneId: props.droneId
        }))
    } catch (_){}

    try {
        updateObject(currentFlight, await api.rest.drone.currentFlight.get({
            droneId: props.droneId
        }))
    } catch (_){}


    api.live.subscribeToDroneTelemetry(props.droneId, (evt, filter, data)=>{
        updateObject(lastDroneBattery, data.telemetry)
    })

    try {
        updateObject(lastDroneBattery, await api.rest.drone.lastBattery.get({
            droneId: props.droneId
        }))
    } catch (_){}
}

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

const currentFlight = reactive({} as ApiResponse_DroneCurrentflightGet)


</script>

<template>

    <MapMarker v-if="isValidLastDronePosition" :map-container="props.mapContainer" :position="[lastDronePosition.longitude, lastDronePosition.latitude]" :elevation="lastDronePosition.height" :viewer="props.viewer" :label="drone.name" icon-url="/images/drone/icon_simple.png" :icon-width="32" :icon-height="32" @click="clickMarker" :color="Color.CYAN" :show-height-indicator="true" :show-height-mean-sea-level-in-label="true"></MapMarker>


    <MapPolyline v-if="props.showCurrentFlight && typeof currentFlight.id === 'number'" :points="currentFlight.track.map(t => {
        return {position: {longitude: t.longitude, latitude: t.latitude}, elevation: t.height}
    })" :viewer="viewer" :color="Color.BLUE"></MapPolyline>

    <div v-show="showInfo" id="info">

        <div id="close" @click="showInfo = false">
            close
        </div>

        <div id="inner">
            <span>Drone ID: {{ props.droneId }}</span>

            <br/>

            <span>
                Drone Battery: {{ currentBatteryPercentString }}
            </span>

            <br/>

            <ConnectionLiveStream v-if="infoHasBeenShownAtLeastOnce && (typeof drone.last_connection_id === 'number')" :connection-id="drone.last_connection_id"></ConnectionLiveStream>
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
