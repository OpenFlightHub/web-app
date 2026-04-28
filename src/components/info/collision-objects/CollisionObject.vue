<script setup lang="ts">
import MapLine from '@/components/map/MapLine.vue';
import MapMarker from '@/components/map/MapMarker.vue';
import MapPolygon from '@/components/map/MapPolygon.vue';
import MapPolyline from '@/components/map/MapPolyline.vue';
import { Viewer, Color } from 'cesium';
import { ApiResponse_InfoCollisionObjectsGet } from 'openflighthub-api-client-sdk';
import { inject } from 'vue';

const viewer = inject<Viewer>('cesiumViewer')
const mapContainer = inject<HTMLElement>('mapContainer')

const props = defineProps<{
    object: ApiResponse_InfoCollisionObjectsGet[number]
}>()


</script>

<template>

    <template v-if="viewer && mapContainer">
        <MapMarker v-if="props.object.marking.type === 0" :viewer="viewer" :map-container="mapContainer" :position="[props.object.marking.longitude, props.object.marking.latitude]" :icon-url="'/images/collision-objects/' + props.object.type + '.png'" :label="props.object.name" :icon-width="32" :icon-height="32"></MapMarker>

        <!--<template v-if="props.object.marking.type === 1">
            <template v-for="(point, index) of props.object.marking.points" :key="index">
                <MapLine v-if="props.object.marking.points[index + 1]" :viewer="viewer" :map-container="mapContainer" :from="{ position: [point.longitude, point.latitude], elevation: point.height_above_ground }" :to="{ position: [props.object.marking.points[index + 1].longitude, props.object.marking.points[index + 1].latitude], elevation: props.object.marking.points[index + 1].height_above_ground }" :color="Color.RED" height-is-relative></MapLine>
            </template>
        </template>-->
        <MapPolyline v-if="props.object.marking.type === 1" :viewer="viewer" :map-container="mapContainer" :points="props.object.marking.points.map(point => [point.longitude, point.latitude, point.height_above_ground])" :color="Color.RED" height-is-relative></MapPolyline><!-- TODO height above ground (problem: bad performance of ) -->

        <MapPolygon v-if="props.object.marking.type === 2" :viewer="viewer" :map-container="mapContainer" :points="props.object.marking.points.map(point => [point.longitude, point.latitude, point.height_above_ground])" :color="Color.RED" filled height-is-relative></MapPolygon>

    </template>

</template>

<style scoped lang="scss">



</style>
