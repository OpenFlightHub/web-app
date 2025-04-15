<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { ApiResponse_DroneMediaGet } from 'openflighthub-api-client-sdk';
import Map from '../map/Map.vue';
import api from '@/api';
import { updateArray, updateObject } from '@/util/vue';
import { Color, Viewer } from 'cesium';
import MapPolygon from '../map/MapPolygon.vue';
import MapMarker from '../map/MapMarker.vue';

const props = defineProps<{
    media: ApiResponse_DroneMediaGet[0]
}>()


onMounted(parseData)
watch(()=>{
    return props.media.meta
}, parseData)

const cameraLongitude = ref(0)
const cameraLatitude = ref(0)
const cameraHeight = ref(0)
const cameraHeading = ref(0)
const cameraFOV = ref(0)

const hasValidLocationInformation = ref(false)

function parseData(){
    try {
        const parsedMeta = JSON.parse(props.media.meta)

        //TODO this should not be done in the frontend
        //TODO read gimbal pitch from exif data

        if(typeof parsedMeta.metadata?.shoot_position?.lat === 'number' && typeof parsedMeta.metadata?.shoot_position?.lng === 'number' && typeof parsedMeta.metadata?.absolute_altitude === 'number' && typeof parsedMeta.metadata?.gimbal_yaw_degree === 'number'){
            cameraLongitude.value = parsedMeta.metadata.shoot_position.lng
            cameraLatitude.value = parsedMeta.metadata.shoot_position.lat
            cameraHeight.value = parsedMeta.metadata.absolute_altitude
            cameraHeading.value = parsedMeta.metadata.gimbal_yaw_degree - 14 //TODO fix heading, looks like gimbal yaw degree is not correct
            cameraFOV.value = 48.5 //is Thermal Image of Mavic3 TODO make it work for visual images too

            if(!(cameraLongitude.value === 0 && cameraLatitude.value === 0)){
                hasValidLocationInformation.value = true
            }

            return
        }
    } catch (err){
        // ignore
    }

    hasValidLocationInformation.value = false
}

type Location = {
    position: {
        longitude: number
        latitude: number
    }
    elevation: number
}

let coverage = reactive<{
    all: Location[],
    outer: Location[]
}>({all: [], outer: []})

onMounted(async()=>{
    try {
        const response = await fetch('/api/media/ground-coverage/' + props.media.id, {
            method: 'get',
            credentials: 'include'
        })

        if(('' + response.status).startsWith('2') === false){
            throw new Error(response.statusText + ': ' + await response.text())
        }

        const res = JSON.parse(await response.text())
        updateArray(coverage.all, res.coverage.all)
        updateArray(coverage.outer, res.coverage.outer)
    } catch (err){
        console.error('failed to load coverage', err)
    }
})


const viewerIsLoaded = ref(false)
let viewer: Viewer = null // if we make Viewer a reactive object, performance goes down the tube ...

const mapContainer = ref<HTMLElement>(null)

</script>

<template>

    <div id="drone-media-container">
        <div class="media_file">
            <img :src="api.getFileDataUrl(props.media.file_id)" loading="lazy" fetchpriority="low">
        </div>

        <div class="media_map" ref="mapContainer">
            <Map v-if="hasValidLocationInformation" :start-longitude="cameraLongitude" :start-latitude="cameraLatitude" :start-height="cameraHeight" :start-camera-heading="cameraHeading" :start-camera-pitch="0" :disable-user-control="false" :camera-f-o-v="cameraFOV" @viewer-loaded="(v)=>{viewer = v; viewerIsLoaded = true}"></Map>

            <template v-if="viewerIsLoaded && mapContainer && coverage.all.length > 0">
                <MapMarker v-for="p in coverage.all" :viewer="viewer" :position="[p.position.longitude, p.position.latitude]" :map-container="mapContainer" icon-url="/images/traffic/warning.png" :icon-width="20" :icon-height="20"></MapMarker>
            </template>

            <div v-else>No valid location</div>
        </div>
    </div>

</template>

<style scoped lang="scss">

#drone-media-container {
    display: flex;
    flex-direction: row;
    height: 100%;

    .media_file, .media_map {
        flex-grow: 1;
        width: 50%;
    }

    .media_file {

        img {
            object-fit: contain;
            object-position: center;
            margin: auto;
            width: 100%;
            height: 100%;
            background-color: #000;
        }
    }
}

</style>
