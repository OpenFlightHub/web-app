<script setup lang="ts">
import { ApiResponse_ConnectionGet } from '@/api/openflighthub-api';
import { computed, inject, provide, ref, reactive, onMounted } from 'vue';

import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import HubWorkspaceMapConnection from './HubWorkspaceMapConnection.vue';

const props = defineProps<{
    connections: ApiResponse_ConnectionGet[]
}>()

const mapContainer = ref(null as HTMLElement)

let map: maplibregl.Map

onMounted(()=>{
    map = new maplibregl.Map({
        container: mapContainer.value,
        style: 'https://map.flaffipony.rocks/mystyle.json',
        center: [10.3, 47.5],
        zoom: 9,
        pitch: 52,
        hash: true
    })

    map.addControl(
        new maplibregl.NavigationControl({
            visualizePitch: true,
            showZoom: true,
            showCompass: true
        })
    )

    map.addControl(
        new maplibregl.TerrainControl({
            source: 'terrainSource',
            exaggeration: 1
        })
    )
})

</script>

<template>

    <div id="container">
        <div id="map" ref="mapContainer">
            <template v-if="map">
                <HubWorkspaceMapConnection v-for="connection in props.connections" :key="connection.id" :connection="connection" :map="map"></HubWorkspaceMapConnection>
            </template>
        </div>
    </div>

</template>

<style scoped lang="scss">

#map {
    height: 100%;
    width: 100%;
}


</style>
