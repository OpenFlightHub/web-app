<script setup lang="ts">
import { ApiResponse_ConnectionGet } from 'openflighthub-api-client-sdk';
import { ref, onMounted } from 'vue';

import { Cartesian3, createOsmBuildingsAsync, Ion, Math, Terrain, Viewer, Cartographic, OpenStreetMapImageryProvider } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

import HubWorkspaceMapConnection from './HubWorkspaceMapConnection.vue';
import { geoidIsLoaded } from '@/util/geoid';
import HubWorkspaceMapTraffic from './HubWorkspaceMapTraffic.vue';

const props = defineProps<{
    connections: ApiResponse_ConnectionGet[]
}>()

const mapContainer = ref(null as HTMLElement)

let viewer = ref<Viewer>(null)

//TODO dont hardcode this token
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MTFkYzVkNy03ZmJkLTQyYTAtYTQ5Zi05ZDMxMGQ2YjU5N2QiLCJpZCI6MjYyNzgwLCJpYXQiOjE3MzQzNDM0NDF9.9NxftItZvbyOrcMENhulF4eKoLGI_-7lYjTkia2racg'

onMounted(()=>{

    viewer.value = new Viewer(mapContainer.value, {
        terrain: Terrain.fromWorldTerrain(),
        animation: false,
        timeline: false
    })


    //TODO currently switching to 2D crashes cesium
    // const openstreetmap = new OpenStreetMapImageryProvider({
    //     url : 'https://tile.openstreetmap.org/'
    // })
    //viewer.imageryLayers.addImageryProvider(openstreetmap) //TODO add attribution see https://operations.osmfoundation.org/policies/tiles/

    viewer.value.camera.flyTo({
        destination: Cartesian3.fromDegrees(10.31261, 47.48063, 3200),
        orientation: {
            heading: Math.toRadians(0),
            pitch: Math.toRadians(-15)
        },
        duration: 1
    })

    /*
    // Add Cesium OSM Buildings, a global 3D buildings layer.
    createOsmBuildingsAsync().then(buildingTileset => {
        viewer.scene.primitives.add(buildingTileset)
    })
    */


    viewer.value.camera.moveEnd.addEventListener(evt=>{
        const carto = Cartographic.fromCartesian(viewer.value.camera.position)
        console.log('camera.moveEnd', Math.toDegrees(carto.longitude), Math.toDegrees(carto.latitude), carto.height)
        //TODO append to url
    })


})

</script>

<template>

    <div id="container">
        <div id="map" ref="mapContainer">
        </div>

        <template v-if="viewer && geoidIsLoaded">
            <HubWorkspaceMapConnection v-for="connection in props.connections" :key="connection.id" :map-container="mapContainer" :connection="connection" :viewer="viewer"></HubWorkspaceMapConnection>

            <!-- TODO implement center of map (but lazy load, so a small change in distance does not actually trigger a reset) -->
            <HubWorkspaceMapTraffic :viewer="viewer" :map-container="mapContainer" :latitude="47.554" :longitude="10.22" :radius="50000"></HubWorkspaceMapTraffic>
        </template>
    </div>

</template>

<style scoped lang="scss">

#container {
    position: relative;

    #map {
        height: 100%;
        width: 100%;
    }

}
</style>
