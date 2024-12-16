<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue';
import { ApiResponse_DroneLastpositionGet } from '@/api/openflighthub-api';
import api from '@/api';
import { updateObject } from '@/util/vue';
import MapMarker from '../maplibre/MapMarker.vue';
import { Viewer } from 'cesium';


const props = defineProps<{
    viewer: Viewer
    droneId: number
}>()

const lastPosition = reactive({} as ApiResponse_DroneLastpositionGet)

onMounted(()=>{
    setInterval(fetchLastPosition, 1000 * 1)
})

async function fetchLastPosition(){
    updateObject(lastPosition, await api.drone.lastPosition.get({
        droneId: props.droneId
    }))
}

</script>

<template>

    <MapMarker v-if="typeof lastPosition.height === 'number'" :position="[lastPosition.longitude, lastPosition.latitude]" :elevation="lastPosition.height" :viewer="props.viewer" :label="'Drone #' + props.droneId" icon-url="/images/drone/icon.png" :icon-width="64" :icon-height="64"></MapMarker>

</template>

<style scoped lang="scss">



</style>
