<script setup lang="ts">
import { ApiResponse_ConnectionGet } from 'openflighthub-api-client-sdk';
import { ref } from 'vue';

import { Viewer } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

import HubWorkspaceMapConnection from './HubWorkspaceMapConnection.vue';
import { geoidIsLoaded } from '@/util/geoid';
import HubWorkspaceMapTraffic from './HubWorkspaceMapTraffic.vue';
import Checkbox from 'primevue/checkbox'
import { Button } from 'primevue';
import HubWorkspaceMapDroneMedia from './HubWorkspaceMapDroneMedia.vue';
import Map from '../map/Map.vue';

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
        <div id="map-container" ref="mapContainer">
            <Map id="map" :start-longitude="10.31261" :start-latitude="47.48063" :start-height="3200" @viewer-loaded="(v)=>{viewer = v; viewerIsLoaded = true}"></Map>

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
            <Button @click="sidebarIsOpen = !sidebarIsOpen" id="sidebar-close">
                <template v-if="sidebarIsOpen">&gt;&gt;</template>
                <template v-else>&lt;&lt;</template>
            </Button>
            <div v-show="sidebarIsOpen" id="sidebar-inner">
                <label for="show-media">
                    <Checkbox v-model="showMedia" binary input-id="show-media"></Checkbox>
                    Show Media
                </label>
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
        display: flex;
        flex-direction: row;
        flex-shrink: 0;
        flex-grow: 0;
        background: var(--neutral-darker);

        #sidebar-close {
            height: 100%;
        }

        #sidebar-inner {
            padding: 0.5em;

            label {
                cursor: pointer;

                .p-checkbox {
                    margin-right: 0.5em;
                }
            }

        }
    }
}
</style>
