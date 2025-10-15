<script setup lang="ts">
import api from '@/api'
import {onMounted, onUnmounted, reactive} from 'vue'
import MapMarker from '../map/MapMarker.vue';
import { Viewer } from 'cesium';
import { ApiResponse_WorkspaceMapelementsGet } from 'openflighthub-api-client-sdk';
import { updateArray, updateObject } from '@/util/vue';
import { getColorForHex } from '@/util/cesium';
import MapPolyline from '../map/MapPolyline.vue';
import MapPolygon from '../map/MapPolygon.vue';
import MapCircle from '../map/MapCircle.vue';

const props = defineProps<{
    mapContainer: HTMLElement
    viewer: Viewer
    workspaceId: number
}>()

const mapElements = reactive<ApiResponse_WorkspaceMapelementsGet>([])


onMounted(setup)

async function setup(){

    updateArray(mapElements, await api.rest.workspace.mapElements.get({workspaceId: props.workspaceId}))

    api.live.subscribeToMapElements(props.workspaceId, (event, filter, data)=>{

        const existingElementIndex = mapElements.findIndex(me => me.uuid === data.uuid)
        const existingElement = mapElements[existingElementIndex]

        if(data.event_type == 'create' || data.event_type === 'update' && !existingElement){
            mapElements.push(data.data)
        } else if (data.event_type === 'update'){
            updateObject(existingElement, data.data)
        } else if(data.event_type === 'delete'){
            mapElements.splice(existingElementIndex, 1)
        } else {
            throw new Error('unsupported map element event_type: ' + data.event_type)
        }

    })
}

function destroy(){
    //TODO unsubscribe
}


onUnmounted(destroy)

</script>

<template>

    <template v-for="elem of mapElements" :key="elem.id">

        <MapMarker v-if="elem.type === 0" :viewer="props.viewer" :map-container="props.mapContainer" :position="[elem.longitude, elem.latitude]" :elevation="elem.elevation" :label="elem.name" icon-url="/images/map_elements/point.png" :icon-width="24" :icon-height="24" :show-height-indicator="true" :color="getColorForHex(elem.color)"></MapMarker>

        <!-- TODO implement configurable clamp to ground-->
        <MapPolyline v-if="elem.type === 1" :viewer="props.viewer" :map-container="props.mapContainer" :points="elem.coordinates.map(a => {
            return {
                position: {
                    longitude: a.longitude,
                    latitude: a.latitude
                },
                elevation: a.elevation
            }
        })" :color="getColorForHex(elem.color)" :clamp-to-ground="true"></MapPolyline>

        <!-- TODO implement configurable clamp to ground-->
        <MapPolygon v-if="elem.type === 2" :viewer="props.viewer" :map-container="props.mapContainer" :points="elem.coordinates[0].map(a => {//TODO support multi-array polygon
            return {
                position: {
                    longitude: a.longitude,
                    latitude: a.latitude
                },
                elevation: a.elevation
            }
        })" :color="getColorForHex(elem.color, 0.3)" :filled="true" :outline-color="getColorForHex(elem.color)" :clamp-to-ground="true"></MapPolygon>

        <!-- TODO implement configurable clamp to ground-->
        <MapCircle v-if="elem.type === 7" :viewer="props.viewer" :map-container="props.mapContainer" :label="elem.name" :longitude="elem.longitude" :latitude="elem.latitude" :radius="elem.radius" :color="getColorForHex(elem.color, 0.3)" :filled="true" :outline-color="getColorForHex(elem.color)" :clamp-to-ground="true"></MapCircle>

    </template>

</template>

<style scoped lang="scss">

</style>
