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
import Map from '../Map.vue';

const props = defineProps<{
    connections: ApiResponse_ConnectionGet[]
}>()

const mapContainer = ref(null as HTMLElement)

const viewerIsLoaded = ref(false)
let viewer: Viewer = null // if we make Viewer a reactive object, performance goes down the tube ...

const sidebarIsOpen = ref(false)
const showMedia = ref(false)

</script>

<template>

    <div id="outer-container">
        <div id="map-container">
            <Map id="map" ref="mapContainer" :start-longitude="10.31261" :start-latitude="47.48063" :start-height="3200" @viewer-loaded="(v)=>{viewer = v; viewerIsLoaded = true}"></Map>

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

        // #map {
        //     height: 100%;
        //     width: 100%;
        // }

    }

    #sidebar {
        flex-shrink: 0;
        flex-grow: 0;
    }
}
</style>
