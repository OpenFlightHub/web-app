<script setup lang="ts">

/**
 * Usage:
 *  <div ref="mapContainer">
        <Map v-if="mapContainer" :map-container="mapContainer">
            <MapMarker>
 */

import { ref, onMounted, provide, getCurrentInstance, onBeforeUnmount, onBeforeMount } from 'vue';

import { Cartesian3, Ion, Math as MathCesium, Terrain, Viewer, PerspectiveFrustum, CesiumTerrainProvider, SceneMode } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { getSetting } from '@/util/settings';
import { WebMapServiceImageryProvider } from 'cesium';

const props = defineProps<{
    mapContainer: HTMLElement
    startPoint: {
        longitude: number,
        latitude: number
    },
    startHeight: number
    startCameraHeading?: number // degree
    startCameraPitch?: number // degree
    disableUserControl?: boolean,
    cameraFOV?: number
    forceTopDown?: boolean
}>()
//TODO watch props and respond to changes

const viewerIsLoaded = ref(false)

const emit = defineEmits<{
    'viewer-loaded': [Viewer]
    'viewer-tiles-loaded': []
    'location-changed': [position: {latitude: number, longitude: number, elevation: number}, zoom: number, camera: undefined | {heading: number, pitch: number, roll: number, fov: number}]// camera is undefined in force2d mode
}>()

//TODO dont hardcode this token
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5Y2NlMTRlMy1kOGZlLTQzZWEtOGU5OS03ZjgwMDg1NTNmYTgiLCJpZCI6MjYyNzgwLCJpYXQiOjE3NjYwODMyNTB9.AU0RyR5c1OaUZCOjtlQ51oiSZN9Oh2HdZIBkkFHlcv4'

let viewerLoadCheckInterval: ReturnType<typeof setInterval> | undefined = undefined

let viewer: Viewer = new Viewer(props.mapContainer, {
    //terrain: new Terrain(CesiumTerrainProvider.fromIonAssetId(4613429)),
    terrain: getSetting('use-dev-terrain') ? new Terrain(CesiumTerrainProvider.fromUrl('https://dev.openflighthub.org/ctb/terrain_sued_oa_1m')) : Terrain.fromWorldTerrain(),
    // terrain: new Terrain(CesiumTerrainProvider.fromUrl('https://dev.openflighthub.org/terrain2/tiles/dynamic/?minZoom=1&maxZoom=18&cog=/config/tiles.vrt')),
    animation: false,
    timeline: false,
    homeButton: false,
    fullscreenButton: false,
    navigationHelpButton: false,
    navigationInstructionsInitiallyVisible: props.disableUserControl !== true,
    //projectionPicker: props.disableUserControl !== true,
    selectionIndicator: props.disableUserControl !== true,
    infoBox: false,
    baseLayerPicker: getSetting('allow-bing-maps') === true,
    sceneModePicker: props.disableUserControl !== true,
    geocoder: props.disableUserControl !== true
})

viewer.scene.globe.depthTestAgainstTerrain = true

viewer.scene.globe.tileLoadProgressEvent.addEventListener((event)=>{
    if(viewer.scene.globe.tilesLoaded){
        emit('viewer-tiles-loaded')
    }
})

const layers = viewer.scene.imageryLayers
layers.removeAll(true)
// layers.addImageryProvider(
//     await IonImageryProvider.fromAssetId(4613429)//3954 Cesium Ion free
// )

layers.addImageryProvider(
    new WebMapServiceImageryProvider({
        url: 'https://geoservices.bayern.de/od/wms/dop/v1/dop20?',
        layers: 'by_dop20c',
        credit: 'Datenquellen: Bayerische Vermessungsverwaltung, © Europäische Union, enthält Copernicus Sentinel-2 Daten 2018, verarbeitet durch das Bundesamt für Kartographie und Geodäsie (BKG)'
    })

    // new TileLayer({
    //     source: new TileWMS({
    //         url: 'https://geoservices.bayern.de/od/wms/dop/v1/dop20?',
    //         params: {LAYERS: ['by_dop20c']},
    //         attributions: 'Datenquellen: Bayerische Vermessungsverwaltung, © Europäische Union, enthält Copernicus Sentinel-2 Daten 2018, verarbeitet durch das Bundesamt für Kartographie und Geodäsie (BKG)'
    //     })
    // })
)

// DIPUL https://www.dipul.de/homepage/de/hilfe/anleitung-fuer-den-web-map-service-wms/#/wms-nutzungsbedingungen
layers.addImageryProvider(
    new WebMapServiceImageryProvider({
        url: 'https://uas-betrieb.de/geoservices/dipul/wms?',
        layers: 'dipul:wohngrundstuecke,dipul:flugplaetze',
        credit: 'Quelle Geodaten: DFS, BKG 2026',
        parameters: {
            transparent: true,
            format: 'image/png'
        }
    })
)


//TODO currently switching to 2D crashes cesium
// const openstreetmap = new OpenStreetMapImageryProvider({
//     url : 'https://tile.openstreetmap.org/'
// })
//viewer.imageryLayers.addImageryProvider(openstreetmap) //TODO add attribution see https://operations.osmfoundation.org/policies/tiles/



if(props.forceTopDown){//TODO watch prop and respond to changes
    viewer.scene.mode = SceneMode.SCENE2D
}


resetCamera()

/*
// Add Cesium OSM Buildings, a global 3D buildings layer.
createOsmBuildingsAsync().then(buildingTileset => {
    viewer.scene.primitives.add(buildingTileset)
})
*/

if(props.forceTopDown){//TODO watch prop and respond to changes
    viewer.scene.screenSpaceCameraController.enableRotate = false;
    viewer.scene.screenSpaceCameraController.enableTilt = false;
    viewer.scene.screenSpaceCameraController.enableLook = false;
}
// viewer.scene.screenSpaceCameraController.enableTranslate = false;
// viewer.scene.screenSpaceCameraController.enableZoom = false;


viewer.camera.moveEnd.addEventListener(evt=>{
    const carto = viewer.camera.positionCartographic

    const longitude = MathCesium.toDegrees(carto.longitude)
    const latitude = MathCesium.toDegrees(carto.latitude)
    console.log('camera.moveEnd', longitude, latitude, carto.height)
    //TODO append to url

    let fov = viewer.camera.frustum instanceof PerspectiveFrustum ? MathCesium.toDegrees((viewer.camera.frustum as PerspectiveFrustum).fov!) : undefined
    if(typeof fov !== 'number'){
        if(props.forceTopDown !== true){
            console.error('fov is not valid', viewer.camera.frustum, fov)
        }
        fov = 42
    }

    emit('location-changed', {
        latitude,
        longitude,
        elevation: carto.height
    }, viewer.camera.positionCartographic.height, props.forceTopDown ? undefined : {
        heading: MathCesium.toDegrees(viewer.camera.heading),
        pitch: MathCesium.toDegrees(viewer.camera.pitch),
        roll: MathCesium.toDegrees(viewer.camera.roll),
        fov
    })
})

viewer.scene.screenSpaceCameraController.enableInputs = !props.disableUserControl

viewerLoadCheckInterval = setInterval(()=>{

    if(viewer.terrainProvider){

        clearInterval(viewerLoadCheckInterval)

        viewerIsLoaded.value = true

        emit('viewer-loaded', viewer)
    }
}, 10)

provide('cesiumViewer', viewer)
provide('mapContainer', props.mapContainer)

function resetCamera(){

    viewer.camera.setView({
        destination: Cartesian3.fromDegrees(props.startPoint.longitude, props.startPoint.latitude, props.startHeight),
        orientation: props.forceTopDown ? {
            heading: MathCesium.toRadians(0),
            pitch: MathCesium.toRadians(-90),
        } : {
            heading: MathCesium.toRadians(typeof props.startCameraHeading === 'number' ? props.startCameraHeading : 0),
            pitch: MathCesium.toRadians(typeof props.startCameraPitch === 'number' ? props.startCameraPitch : -15),
        }
    })

    if(typeof props.cameraFOV === 'number'){

        viewer.camera.frustum = new PerspectiveFrustum({
            fov: MathCesium.toRadians(props.cameraFOV),
            aspectRatio: viewer.canvas.clientWidth / viewer.canvas.clientHeight
        })
    }
}

export type MapPosition3D = {
    position: [number, number],
    elevation: number
}

onBeforeMount(()=>{
    //cleanup duplicate viewers when hot-reloading in development mode
    const existingViewers = props.mapContainer.querySelectorAll('.cesium-viewer')

    // delete all but the last one (the alive one)
    existingViewers.forEach((el, index)=>{
        if(index < existingViewers.length - 1){
            props.mapContainer.removeChild(el)
        }
    })
})

</script>

<template>

    <div id="map-overlay" ref="mapContainer">
        <slot v-bind="{resetCamera}"></slot>
    </div>

</template>

<style scoped lang="scss">

#map-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none; // allow clicks to pass through to the map

    *:not(div) {
        pointer-events: auto; // allow interaction with direct children of the overlay
    }
}

</style>
