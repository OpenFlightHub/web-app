<script setup lang="ts">
import { ApiResponse_ConnectionGet } from 'openflighthub-api-client-sdk';
import { ref, onMounted } from 'vue';

import { Cartesian3, createOsmBuildingsAsync, Ion, Math, Terrain, Viewer, Cartographic, OpenStreetMapImageryProvider } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

import HubWorkspaceMapConnection from './HubWorkspaceMapConnection.vue';
import { geoidIsLoaded } from '@/util/geoid';
import HubWorkspaceMapTraffic from './HubWorkspaceMapTraffic.vue';
import Checkbox from 'primevue/checkbox'
import { Button } from 'primevue';
import HubWorkspaceMapDroneMedia from './HubWorkspaceMapDroneMedia.vue';

const props = defineProps<{
    connections: ApiResponse_ConnectionGet[]
}>()

const mapContainer = ref(null as HTMLElement)

const viewerIsLoaded = ref(false)
let viewer: Viewer = null // if we make Viewer a reactive object, performance goes down the tube ...

//TODO dont hardcode this token
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MTFkYzVkNy03ZmJkLTQyYTAtYTQ5Zi05ZDMxMGQ2YjU5N2QiLCJpZCI6MjYyNzgwLCJpYXQiOjE3MzQzNDM0NDF9.9NxftItZvbyOrcMENhulF4eKoLGI_-7lYjTkia2racg'

onMounted(()=>{

    viewer = new Viewer(mapContainer.value, {
        terrain: Terrain.fromWorldTerrain(),
        animation: false,
        timeline: false
    })

    viewerIsLoaded.value = true


    //TODO currently switching to 2D crashes cesium
    // const openstreetmap = new OpenStreetMapImageryProvider({
    //     url : 'https://tile.openstreetmap.org/'
    // })
    //viewer.imageryLayers.addImageryProvider(openstreetmap) //TODO add attribution see https://operations.osmfoundation.org/policies/tiles/

    viewer.camera.flyTo({
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


    viewer.camera.moveEnd.addEventListener(evt=>{
        const carto = Cartographic.fromCartesian(viewer.camera.position)
        console.log('camera.moveEnd', Math.toDegrees(carto.longitude), Math.toDegrees(carto.latitude), carto.height)
        //TODO append to url
    })


})

const sidebarIsOpen = ref(false)
const showMedia = ref(false)

</script>

<template>

    <div id="outer-container">
        <div id="map-container">
            <div id="map" ref="mapContainer">
            </div>

            <template v-if="viewerIsLoaded && geoidIsLoaded">
                <HubWorkspaceMapConnection v-for="connection in props.connections" :key="connection.id" :map-container="mapContainer" :connection="connection" :viewer="viewer"></HubWorkspaceMapConnection>

                <!-- TODO implement center of map (but lazy load, so a small change in distance does not actually trigger a reset) -->
                <HubWorkspaceMapTraffic :viewer="viewer" :map-container="mapContainer" :latitude="47.554" :longitude="10.22" :radius="50000"></HubWorkspaceMapTraffic>
            </template>

            <template v-if="viewerIsLoaded && showMedia">
                <HubWorkspaceMapDroneMedia v-for="connection in props.connections" :key="connection.id" :viewer="viewer" :map-container="mapContainer" :connection="connection"></HubWorkspaceMapDroneMedia>
            </template>
        </div>

        <div id="sidebar">
            <Button @click="sidebarIsOpen = !sidebarIsOpen">
                <template v-if="sidebarIsOpen">Close</template>
                <template v-else>Open</template>
            </Button>
            <div v-show="sidebarIsOpen" id="sidebar-inner">
                <Checkbox v-model="showMedia" binary input-id="show-media"></Checkbox>
                <label for="show-media">Show Media</label>
            </div>
        </div>
    </div>

</template>

<style scoped lang="scss">

#outer-container {
    display: flex;
    flex-direction: row;

    #map-container {
        position: relative;
        flex-shrink: 1;
        flex-grow: 1;

        #map {
            height: 100%;
            width: 100%;
        }

    }

    #sidebar {
        flex-shrink: 0;
        flex-grow: 0;
    }
}
</style>
