<script setup lang="ts">
import api from '@/api'
import {inject, onMounted, onUnmounted, reactive} from 'vue'
import { Viewer } from 'cesium';
import { ApiResponse_WorkspaceGeoObjectsGet } from 'openflighthub-api-client-sdk';
import { updateArray, updateObject } from '@/util/vue';
import GeoObject from '../geo-object/GeoObject.vue';
import dayjs from 'dayjs';

const props = defineProps<{
    workspaceId: number
    initialLongitude: number
    initialLatitude: number//TODO implement movement of map
    showOnlyAircraft?: boolean
    hideMissionGeoObjects?: boolean
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

            if(dayjs(data.data.updated_at).isBefore(dayjs(existingElement.updated_at))){//TODO this should happen in the backend!!!
                //ignore older data
                console.debug('ignoring update for geo object ' + data.data!.uuid + ' because it is older than the existing data')
                return
            }

            updateObject(existingElement, data.data!)
        } else if(data.event_type === 'delete'){
            geoObjects.splice(existingElementIndex, 1)
        } else {
            throw new Error('unsupported map element event_type: ' + data.event_type)
        }

    })
}

function destroy(){
    //TODO unsubscribe
}


onUnmounted(destroy)

function shouldShowGeoObject(geoObject: ApiResponse_WorkspaceGeoObjectsGet[number]){
    if(props.showOnlyAircraft){
        if(geoObject.type === 1){//traffic
            return true
        }

        if(geoObject.type === 2 && [0, 1, 2].includes(geoObject.sub_type)){//unit (helicopter, airplane, drone)
            return true
        }

        return false
    }


    if(props.hideMissionGeoObjects){
        if(geoObject.type === 0 ){//marking
            if(geoObject.tasks && geoObject.tasks.length > 0){//linked to a task, so it is a mission geo object
                return false
            }
        }
    }

    return true

}

</script>

<template>

    <template v-for="geoObject of geoObjects" :key="geoObject.id" :geo-object="geoObject">
        <GeoObject v-if="shouldShowGeoObject(geoObject)" :key="geoObject.id" :geo-object="geoObject"></GeoObject>
    </template>

</template>

<style scoped lang="scss">

</style>
