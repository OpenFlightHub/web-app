<script setup lang="ts">
import LoadApi from '../functional/LoadApi.vue';
import api from '@/api';
import Padding from '../layout/Padding.vue';
import { Button } from 'primevue';
import IconVue from '../general/IconVue.vue';
import { downloadUrl } from '@/util/download';
import { onMounted, ref, watch } from 'vue';
import { ApiResponse_DroneMediaGet } from 'openflighthub-api-client-sdk';
import HubWorkspaceFile from '../workspace/HubWorkspaceFile.vue';
import Map from '../Map.vue';


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
            cameraHeading.value = parsedMeta.metadata.gimbal_yaw_degree

            hasValidLocationInformation.value = true
            return
        }
    } catch (err){
        // ignore
    }

    hasValidLocationInformation.value = false
}



</script>

<template>

    <div id="drone-media-container">
        <HubWorkspaceFile class="media_file" :id="props.media.file_id"></HubWorkspaceFile>

        <div class="media_map">
            <Map v-if="hasValidLocationInformation" :start-longitude="cameraLongitude" :start-latitude="cameraLatitude" :start-height="cameraHeight" :start-camera-heading="cameraHeading" :start-camera-pitch="0" :disable-user-control="true"></Map>
            <div v-else>No valid location</div>
        </div>
    </div>

</template>

<style scoped lang="scss">
#drone-media-container {
    display: flex;
    flex-direction: row;
    height: 15em;

    .media_file {
        width: 50%;
    }

    .media_map {
        width: 50%;
    }
}

</style>
