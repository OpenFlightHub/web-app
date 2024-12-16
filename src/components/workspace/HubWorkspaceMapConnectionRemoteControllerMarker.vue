<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue';
import * as maplibregl from 'maplibre-gl'
import { ApiResponse_RemotecontrollerLastpositionGet } from '@/api/openflighthub-api';
import api from '@/api';
import { updateObject } from '@/util/vue';
import MapMarker from '../maplibre/MapMarker.vue';


const props = defineProps<{
    map: maplibregl.Map
    remoteControllerId: number
}>()

const lastPosition = reactive({} as ApiResponse_RemotecontrollerLastpositionGet)

onMounted(()=>{
    setInterval(fetchLastPosition, 1000 * 1)
})

async function fetchLastPosition(){
    updateObject(lastPosition, await api.remoteController.lastPosition.get({
        remoteControllerId: props.remoteControllerId
    }))
}


const imageLogo = ref(null as HTMLElement)

</script>

<template>

    <MapMarker v-if="imageLogo" :position="[lastPosition.longitude, lastPosition.latitude]" :map="props.map" :marker-element="imageLogo"></MapMarker>

    <svg ref="imageLogo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="48" height="48"><g id="Out_line" data-name="Out line"><path d="M352,280a40.00057,40.00057,0,0,0,29.99854-66.46l-11.9961,10.58789a24,24,0,1,1-36.00488,0L322.00146,213.54A40.00057,40.00057,0,0,0,352,280Z"/><path d="M344,214.6239V240h16V214.6239a24,24,0,1,0-16,0ZM352,184a8,8,0,1,1-8,8A8.00917,8.00917,0,0,1,352,184Z"/><path d="M408,216a24,24,0,1,0-24-24A24.02687,24.02687,0,0,0,408,216Zm0-32a8,8,0,1,1-8,8A8.00917,8.00917,0,0,1,408,184Z"/><path d="M160,280a40.00057,40.00057,0,0,0,29.99854-66.46l-11.9961,10.58789a23.99957,23.99957,0,1,1-36.00488-.001L130.00146,213.54A40.00057,40.00057,0,0,0,160,280Z"/><path d="M152,214.6239V240h16V214.6239a24,24,0,1,0-16,0ZM160,184a8,8,0,1,1-8,8A8.00917,8.00917,0,0,1,160,184Z"/><path d="M104,216a24,24,0,1,0-24-24A24.02687,24.02687,0,0,0,104,216Zm0-32a8,8,0,1,1-8,8A8.00917,8.00917,0,0,1,104,184Z"/><circle cx="224" cy="192" r="8"/><circle cx="256" cy="192" r="8"/><circle cx="288" cy="192" r="8"/><rect x="80" y="368" width="16" height="48"/><rect x="416" y="368" width="16" height="48"/><circle cx="88" cy="352" r="8"/><circle cx="88" cy="328" r="8"/><path d="M200,336h32V320H192a7.99977,7.99977,0,0,0-8,8v40h16Z"/><path d="M200,416H184v40a7.99977,7.99977,0,0,0,8,8h40V448H200Z"/><path d="M320,320H280v16h32v32h16V328A7.99977,7.99977,0,0,0,320,320Z"/><path d="M312,448H280v16h40a7.99977,7.99977,0,0,0,8-8V416H312Z"/><path d="M256,368a24,24,0,1,0,24,24A24.02687,24.02687,0,0,0,256,368Zm0,32a8,8,0,1,1,8-8A8.00917,8.00917,0,0,1,256,400Z"/><path d="M494.50977,259.3501,456,205.4364V152a7.99977,7.99977,0,0,0-8-8H376V120a7.99977,7.99977,0,0,0-8-8H352V24a7.99977,7.99977,0,0,0-8-8H312a7.99977,7.99977,0,0,0-8,8V144H208V24a7.99977,7.99977,0,0,0-8-8H168a7.99977,7.99977,0,0,0-8,8v88H144a7.99977,7.99977,0,0,0-8,8v24H64a7.99977,7.99977,0,0,0-8,8v53.4364L17.49023,259.3501A7.99955,7.99955,0,0,0,16,264V392a32.036,32.036,0,0,0,32,32h8v48a24.02687,24.02687,0,0,0,24,24H432a24.02687,24.02687,0,0,0,24-24V424h8a32.036,32.036,0,0,0,32-32V264A7.99955,7.99955,0,0,0,494.50977,259.3501ZM320,32h16v80h-8v16h32v16H320ZM152,128h32V112h-8V32h16V144H152Zm288,32V289.3761A23.88505,23.88505,0,0,0,432,288H80a23.88505,23.88505,0,0,0-8,1.3761V160ZM48,408a16.01833,16.01833,0,0,1-16-16V266.56348l24-33.59986V408Zm24,64V312a8.00917,8.00917,0,0,1,8-8h25.37622A23.88388,23.88388,0,0,0,104,312V472a23.88388,23.88388,0,0,0,1.37622,8H80A8.00917,8.00917,0,0,1,72,472Zm56,8a8.00917,8.00917,0,0,1-8-8V312a8.00917,8.00917,0,0,1,8-8H384a8.00917,8.00917,0,0,1,8,8V472a8.00917,8.00917,0,0,1-8,8Zm312-8a8.00917,8.00917,0,0,1-8,8H406.62378A23.88388,23.88388,0,0,0,408,472V312a23.88388,23.88388,0,0,0-1.37622-8H432a8.00917,8.00917,0,0,1,8,8Zm40-80a16.01833,16.01833,0,0,1-16,16h-8V232.96362l24,33.59986Z"/></g></svg>



</template>

<style scoped lang="scss">



</style>
