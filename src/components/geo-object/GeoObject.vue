<script setup lang="ts">
import {inject} from 'vue'
import MapMarker from '../map/MapMarker.vue';
import { Color, Viewer } from 'cesium';
import { ApiResponse_WorkspaceGeoObjectsGet } from 'openflighthub-api-client-sdk';
import { getColorForHex } from '@/util/cesium';
import MapPolyline from '../map/MapPolyline.vue';
import MapPolygon from '../map/MapPolygon.vue';
import MapCircle from '../map/MapCircle.vue';

const props = defineProps<{
    geoObject: ApiResponse_WorkspaceGeoObjectsGet[number]
}>()

const viewer = inject<Viewer>('cesiumViewer')
const mapContainer = inject<HTMLElement>('mapContainer')

</script>

<template>


    <template v-if="geoObject.type === 0/* TODO use Message_Type_Event_Object_Data_Geo_Object_Type_Type_TYPES.marking */">

        <MapMarker v-if="geoObject.sub_type === 0/* TODO use Message_Type_Event_Object_Data_Geo_Object_Type_SubType_TYPES.marking*/" :viewer="viewer!" :map-container="mapContainer!" :position="geoObject.config.point" :label="geoObject.name" icon-url="/images/geo_objects/markings/0.png" :icon-width="24" :icon-height="24" :show-height-indicator="true" :color="getColorForHex(geoObject.config.color)"></MapMarker>

        <!-- TODO implement configurable clamp to ground-->
        <MapPolyline v-if="geoObject.sub_type === 1/* TODO use Message_Type_Event_Object_Data_Geo_Object_Type_SubType_TYPES.marking*/" :viewer="viewer!" :map-container="mapContainer!" :points="geoObject.config.line" :color="getColorForHex(geoObject.config.color)" :label="geoObject.name"></MapPolyline>

        <!-- TODO implement configurable clamp to ground-->
        <MapPolygon v-if="geoObject.sub_type === 2/* TODO use Message_Type_Event_Object_Data_Geo_Object_Type_SubType_TYPES.marking*/" :viewer="viewer!" :map-container="mapContainer!" :points="geoObject.config.polygon/*TODO support multi-array polygon*/" :color="getColorForHex(geoObject.config.color, 0.3)" :filled="true" :outline-color="getColorForHex(geoObject.config.color)"></MapPolygon>

        <!-- TODO implement configurable clamp to ground-->
        <MapCircle v-if="geoObject.sub_type === 3/* TODO use Message_Type_Event_Object_Data_Geo_Object_Type_SubType_TYPES.marking*/" :viewer="viewer!" :map-container="mapContainer!" :label="geoObject.name" :position="geoObject.config.center" :radius="geoObject.config.radius" :color="getColorForHex(geoObject.config.color, 0.3)" :filled="true" :outline-color="getColorForHex(geoObject.config.color)"></MapCircle>

    </template>

    <template v-if="geoObject.type === 1/* TODO use Message_Type_Event_Object_Data_Geo_Object_Type_Type_TYPES.traffic */">

        <!-- TODO add traffic coverage -->

        <!-- TODO improve logic when to blink -->

        <MapMarker :viewer="viewer!" :map-container="mapContainer!" :position="[geoObject.config.longitude, geoObject.config.latitude, geoObject.config.height/* TODO rename to elevation in client sdk */]" :label="geoObject.name + ' ' + Math.floor(geoObject.config.height) + ' m'" :icon-url="'/images/geo_objects/traffic/' + geoObject.sub_type + '.png'" :color="Color.RED" :icon-width="32" :icon-height="32" :show-height-indicator="true" :background-circle="Color.WHITE" :blink="geoObject.config.height < 2000 ? 500 : undefined" :max-visible-distance="1000 * 10"></MapMarker>

    </template>

    <template v-if="geoObject.type === 2 /* TODO use Message_Type_Event_Object_Data_Geo_Object_Type_Type_TYPES.traffic */">

        <MapMarker :viewer="viewer!" :map-container="mapContainer!" :position="[geoObject.config.longitude, geoObject.config.latitude, geoObject.config.height/* TODO rename to elevation in client sdk */]" :label="geoObject.name" :icon-url="geoObject.config.symbol" :icon-width="32" :icon-height="32" :show-height-indicator="true" :background-circle="getColorForHex('#2D8CF0')" :max-visible-distance="1000 * 10"></MapMarker>

    </template>

</template>

<style scoped lang="scss">

</style>
