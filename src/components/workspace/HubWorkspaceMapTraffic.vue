<script setup lang="ts">
import api from '@/api'
//TODO fix this import import {Message_Type_Event_Object_Data_Traffic} from 'openflighthub-api-client-sdk'
import {watch, onMounted, onUnmounted, reactive} from 'vue'
import MapMarker from '../map/MapMarker.vue';
import { Viewer, Color } from 'cesium';
import MapCircle from '../map/MapCircle.vue';


const props = defineProps<{
    mapContainer: HTMLElement
    viewer: Viewer
    latitude: number
    longitude: number
    radius: number
    showCoverage?: boolean
}>()


watch(()=>props, setup, {deep: true})

onMounted(setup)

const traffic: {
    id: string,
    position: {
        latitude: number
        longitude: number
        height?: number
        reported_at: string
    }
}[] = reactive([])//TODO get real import (see beginning of this file)

function setup(){
    api.live.subscribeToTraffic(props.latitude, props.longitude, props.radius, (event, filter, data)=>{

        const existing = traffic.find(t => t.id === data.id)

        if(existing){
            existing.position = data.position
        } else {
            traffic.push(data)
        }
    })
}

function destroy(){
    //TODO
}


onUnmounted(destroy)

</script>

<template>

    <template v-for="t of traffic" :key="t.id">
        <MapMarker v-if="t.position.height < 3000" :viewer="props.viewer" :map-container="props.mapContainer" :position="[t.position.longitude, t.position.latitude]" :elevation="t.position.height" :label="t.id" icon-url="/images/traffic/icon.png" :icon-width="32" :icon-height="32" :show-height-indicator="true" :color="Color.RED"></MapMarker>
    </template>

    <MapCircle v-if="props.showCoverage" :viewer="props.viewer" :longitude="props.longitude" :latitude="props.latitude" :radius="props.radius" :filled="false" :color="Color.BLUE"></MapCircle>

</template>

<style scoped lang="scss">

</style>
