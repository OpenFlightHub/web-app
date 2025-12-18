<script setup lang="ts">
import api from '@/api'
import {onMounted, onUnmounted, reactive} from 'vue'
import MapMarker from '../map/MapMarker.vue';
import { Color, Viewer } from 'cesium';
import { ApiResponse_WorkspaceGeoObjectsGet } from 'openflighthub-api-client-sdk';
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

const geoObjects = reactive<ApiResponse_WorkspaceGeoObjectsGet>([])


onMounted(setup)

async function setup(){

    updateArray(geoObjects, await api.rest.workspace.geoObjects.get({workspaceId: props.workspaceId}))

    api.live.subscribeToGeoObjects(props.workspaceId, (event, filter, data)=>{

        const existingElementIndex = geoObjects.findIndex(me => me.uuid === data.uuid)
        const existingElement = geoObjects[existingElementIndex]

        if(data.event_type == 'create' || data.event_type === 'update' && !existingElement){
            geoObjects.push(data.data)
        } else if (data.event_type === 'update'){
            updateObject(existingElement, data.data)
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

</script>

<template>

    <template v-for="geoObject of geoObjects">

        <template v-if="geoObject.type === 0/* TODO use Message_Type_Event_Object_Data_Geo_Object_Type_Type_TYPES.marking */">

            <MapMarker :key="geoObject.id" v-if="geoObject.sub_type === 0/* TODO use Message_Type_Event_Object_Data_Geo_Object_Type_SubType_TYPES.marking*/" :viewer="props.viewer" :map-container="props.mapContainer" :position="geoObject.config.point" :label="geoObject.name" icon-url="/images/map_elements/point.png" :icon-width="24" :icon-height="24" :show-height-indicator="true" :color="getColorForHex(geoObject.config.color)"></MapMarker>

            <!-- TODO implement configurable clamp to ground-->
            <MapPolyline :key="geoObject.id" v-if="geoObject.sub_type === 1/* TODO use Message_Type_Event_Object_Data_Geo_Object_Type_SubType_TYPES.marking*/" :viewer="props.viewer" :map-container="props.mapContainer" :points="geoObject.config.line" :color="getColorForHex(geoObject.config.color)" :clamp-to-ground="true"></MapPolyline>

            <!-- TODO implement configurable clamp to ground-->
            <MapPolygon :key="geoObject.id" v-if="geoObject.sub_type === 2/* TODO use Message_Type_Event_Object_Data_Geo_Object_Type_SubType_TYPES.marking*/" :viewer="props.viewer" :map-container="props.mapContainer" :points="geoObject.config.polygon/*TODO support multi-array polygon*/" :color="getColorForHex(geoObject.config.color, 0.3)" :filled="true" :outline-color="getColorForHex(geoObject.config.color)" :clamp-to-ground="true"></MapPolygon>

            <!-- TODO implement configurable clamp to ground-->
            <MapCircle :key="geoObject.id" v-if="geoObject.sub_type === 3/* TODO use Message_Type_Event_Object_Data_Geo_Object_Type_SubType_TYPES.marking*/" :viewer="props.viewer" :map-container="props.mapContainer" :label="geoObject.name" :position="geoObject.config.center" :radius="geoObject.config.radius" :color="getColorForHex(geoObject.config.color, 0.3)" :filled="true" :outline-color="getColorForHex(geoObject.config.color)" :clamp-to-ground="true"></MapCircle>

        </template>

        <template v-if="geoObject.type === 1/* TODO use Message_Type_Event_Object_Data_Geo_Object_Type_Type_TYPES.traffic */">

            <!-- TODO add traffic coverage -->

            <!-- TODO improve logic when to blink -->

            <MapMarker :key="geoObject.id" :viewer="props.viewer" :map-container="props.mapContainer" :position="[geoObject.config.longitude, geoObject.config.latitude, geoObject.config.height/* TODO rename to elevation in client sdk */]" :label="geoObject.name + ' ' + Math.floor(geoObject.config.height) + ' m'" :icon-url="'/images/geo_objects/traffic/' + geoObject.sub_type + '.png'" :color="Color.RED" :icon-width="32" :icon-height="32" :show-height-indicator="true" :background-circle="Color.WHITE" :blink="geoObject.config.height < 2000 ? 500 : undefined"></MapMarker>

        </template>

        <template v-if="geoObject.type === 2 /* TODO use Message_Type_Event_Object_Data_Geo_Object_Type_Type_TYPES.traffic */">

            <MapMarker :key="geoObject.id" :viewer="props.viewer" :map-container="props.mapContainer" :position="[geoObject.config.longitude, geoObject.config.latitude, geoObject.config.height/* TODO rename to elevation in client sdk */]" :label="geoObject.name" :icon-url="geoObject.config.symbol" :icon-width="32" :icon-height="32" :show-height-indicator="true" :background-circle="getColorForHex('#2D8CF0')"></MapMarker>

        </template>

    </template>

</template>

<style scoped lang="scss">

</style>
