<script setup lang="ts">
import api from '@/api'
import {inject, onMounted, onUnmounted, reactive} from 'vue'
import { Viewer } from 'cesium';
import { ApiResponse_WorkspaceGeoObjectsGet } from 'openflighthub-api-client-sdk';
import { updateArray, updateObject } from '@/util/vue';
import GeoObject from '../geo-object/GeoObject.vue';

const props = defineProps<{
    workspaceId: number
    initialLongitude: number
    initialLatitude: number//TODO implement movement of map
}>()

const viewer = inject<Viewer>('cesiumViewer')
const mapContainer = inject<HTMLElement>('mapContainer')

const geoObjects = reactive<ApiResponse_WorkspaceGeoObjectsGet>([])


onMounted(setup)

async function setup(){

    updateArray(geoObjects, await api.rest.workspace.geoObjects.get({params: {workspaceId: props.workspaceId}}))

    api.live.subscribeToGeoObjects(props.workspaceId, (event, filter, data)=>{

        const existingElementIndex = geoObjects.findIndex(me => me.uuid === data.uuid)
        const existingElement = geoObjects[existingElementIndex]

        if(data.event_type === 'create' || data.event_type === 'update' && !existingElement){
            //@ts-ignore
            geoObjects.push(data.data)
        } else if (data.event_type === 'update'){
            //@ts-ignore
            updateObject(existingElement, data.data)
        } else if(data.event_type === 'delete'){
            geoObjects.splice(existingElementIndex, 1)
        } else {
            throw new Error('unsupported map element event_type: ' + data.event_type)
        }

    }, {
        latitude: props.initialLatitude,
        longitude: props.initialLongitude,
        radius: 100 * 1000
    })
}

function destroy(){
    //TODO unsubscribe
}


onUnmounted(destroy)

</script>

<template>

    <GeoObject v-for="geoObject of geoObjects" :key="geoObject.id" :geo-object="geoObject"></GeoObject>

</template>

<style scoped lang="scss">

</style>
