<script setup lang="ts">
import { ApiResponse_ConnectionGet } from '@/api/openflighthub-api';
import { computed, inject, provide, ref, reactive, onMounted } from 'vue';

import { Cartesian3, createOsmBuildingsAsync, Ion, Math, Terrain, Viewer, Cartographic, JulianDate, Clock, ClockViewModel, ClockStep } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

import HubWorkspaceMapConnection from './HubWorkspaceMapConnection.vue';

const props = defineProps<{
    connections: ApiResponse_ConnectionGet[]
}>()

const mapContainer = ref(null as HTMLElement)

let viewer: Viewer

Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MTFkYzVkNy03ZmJkLTQyYTAtYTQ5Zi05ZDMxMGQ2YjU5N2QiLCJpZCI6MjYyNzgwLCJpYXQiOjE3MzQzNDM0NDF9.9NxftItZvbyOrcMENhulF4eKoLGI_-7lYjTkia2racg'

onMounted(()=>{

    viewer = new Viewer(mapContainer.value, {
        terrain: Terrain.fromWorldTerrain(),
        animation: false,
        timeline: false
    })


    /*
    const polygon = props.viewer.entities.add({
        polygon: {
            hierarchy: Cartesian3.fromDegreesArray([
                10.313992402329717, 47.5409938499751,
                10.313992402329717, 47.5419938499751,
                10.314992402329717, 47.5409938499751,
            ]),
            //height: 2000,
            material: Color.RED.withAlpha(0.2),
            outline: true,
            outlineColor: Color.BLACK
        }
    })*/


    viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(10.31261, 47.48063, 3200),
        orientation: {
            heading: Math.toRadians(0),
            pitch: Math.toRadians(-15)
        },
        duration: 1
    })

    // Add Cesium OSM Buildings, a global 3D buildings layer.
    createOsmBuildingsAsync().then(buildingTileset => {
        viewer.scene.primitives.add(buildingTileset)
    })


    viewer.camera.moveEnd.addEventListener(evt=>{
        const carto = Cartographic.fromCartesian(viewer.camera.position)
        console.log('camera.moveEnd', Math.toDegrees(carto.longitude), Math.toDegrees(carto.latitude), carto.height)
        //TODO append to url
    })


})

</script>

<template>

    <div id="container">
        <div id="map" ref="mapContainer">
        </div>

        <template v-if="viewer">
            <HubWorkspaceMapConnection v-for="connection in props.connections" :key="connection.id" :connection="connection" :viewer="viewer"></HubWorkspaceMapConnection>
        </template>
    </div>

</template>

<style scoped lang="scss">

#map {
    height: 100%;
    width: 100%;
}


</style>
