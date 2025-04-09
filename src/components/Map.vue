<script setup lang="ts">
import { ApiResponse_ConnectionGet } from 'openflighthub-api-client-sdk';
import { ref, onMounted } from 'vue';

import { Cartesian3, createOsmBuildingsAsync, Ion, Math, Terrain, Viewer, Cartographic, OpenStreetMapImageryProvider, ScreenSpaceCameraController } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

const props = defineProps<{
    startLongitude: number,
    startLatitude: number,
    startHeight: number
    startCameraHeading?: number
    startCameraPitch?: number
    disableUserControl?: boolean
}>()

const mapContainer = ref(null as HTMLElement)

const viewerIsLoaded = ref(false)
let viewer: Viewer = null // if we make Viewer a reactive object, performance goes down the tube ...

const emit = defineEmits<{
    'viewer-loaded': [Viewer]
}>()

//TODO dont hardcode this token
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MTFkYzVkNy03ZmJkLTQyYTAtYTQ5Zi05ZDMxMGQ2YjU5N2QiLCJpZCI6MjYyNzgwLCJpYXQiOjE3MzQzNDM0NDF9.9NxftItZvbyOrcMENhulF4eKoLGI_-7lYjTkia2racg'

onMounted(()=>{

    viewer = new Viewer(mapContainer.value, {
        terrain: Terrain.fromWorldTerrain(),
        animation: false,
        timeline: false,
        homeButton: false,
        fullscreenButton: props.disableUserControl !== true,
        navigationHelpButton: props.disableUserControl !== true,
        navigationInstructionsInitiallyVisible: props.disableUserControl !== true,
        //projectionPicker: props.disableUserControl !== true,
        selectionIndicator: props.disableUserControl !== true,
        baseLayerPicker: props.disableUserControl !== true,
        sceneModePicker: props.disableUserControl !== true,
        geocoder: props.disableUserControl !== true
    })

    viewerIsLoaded.value = true

    emit('viewer-loaded', viewer)


    //TODO currently switching to 2D crashes cesium
    // const openstreetmap = new OpenStreetMapImageryProvider({
    //     url : 'https://tile.openstreetmap.org/'
    // })
    //viewer.imageryLayers.addImageryProvider(openstreetmap) //TODO add attribution see https://operations.osmfoundation.org/policies/tiles/

    viewer.camera.setView({
        destination: Cartesian3.fromDegrees(props.startLongitude, props.startLatitude, props.startHeight),
        orientation: {
            heading: Math.toRadians(typeof props.startCameraHeading === 'number' ? props.startCameraHeading : 0),
            pitch: Math.toRadians(typeof props.startCameraPitch === 'number' ? props.startCameraPitch : -15)
        }
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

    viewer.scene.screenSpaceCameraController.enableInputs = !props.disableUserControl

    // viewer.scene.screenSpaceCameraController.enableRotate = false;
    // viewer.scene.screenSpaceCameraController.enableTranslate = false;
    // viewer.scene.screenSpaceCameraController.enableZoom = false;
    // viewer.scene.screenSpaceCameraController.enableTilt = false;
    // viewer.scene.screenSpaceCameraController.enableLook = false;


})

</script>

<template>

    <div id="map" ref="mapContainer">
    </div>

</template>

<style scoped lang="scss">

#map {
    position: relative;
    height: 100%;
    width: 100%;
}

</style>
