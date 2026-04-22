<script setup lang="ts">
import { ref, onMounted } from 'vue';

import { Cartesian3, Ion, Math as MathCesium, Terrain, Viewer, Cartographic, PerspectiveFrustum, IonImageryProvider, CesiumTerrainProvider, ImageryProvider } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { getSetting } from '@/util/settings';
import { WebMapServiceImageryProvider } from 'cesium';

const props = defineProps<{
    startPoint: {
        longitude: number,
        latitude: number
    },
    startHeight: number
    startCameraHeading?: number // degree
    startCameraPitch?: number // degree
    disableUserControl?: boolean,
    cameraFOV?: number
}>()
//TODO watch props and respond to changes

const mapContainer = ref(null as HTMLElement)

const viewerIsLoaded = ref(false)
let viewer: Viewer = null // if we make Viewer a reactive object, performance goes down the tube ...

const emit = defineEmits<{
    'viewer-loaded': [Viewer]
    'viewer-tiles-loaded': []
}>()

//TODO dont hardcode this token
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5Y2NlMTRlMy1kOGZlLTQzZWEtOGU5OS03ZjgwMDg1NTNmYTgiLCJpZCI6MjYyNzgwLCJpYXQiOjE3NjYwODMyNTB9.AU0RyR5c1OaUZCOjtlQ51oiSZN9Oh2HdZIBkkFHlcv4'

let viewerLoadCheckInterval

onMounted(async()=>{

    viewer = new Viewer(mapContainer.value, {
        //terrain: new Terrain(CesiumTerrainProvider.fromIonAssetId(4613429)),
        terrain: new Terrain(CesiumTerrainProvider.fromUrl('https://dev.openflighthub.org/ctb/terrain')),
        // terrain: new Terrain(CesiumTerrainProvider.fromUrl('https://dev.openflighthub.org/terrain2/tiles/dynamic/?minZoom=1&maxZoom=18&cog=/config/tiles.vrt')),
        animation: false,
        timeline: false,
        homeButton: false,
        fullscreenButton: false,
        navigationHelpButton: props.disableUserControl !== true,
        navigationInstructionsInitiallyVisible: props.disableUserControl !== true,
        //projectionPicker: props.disableUserControl !== true,
        selectionIndicator: props.disableUserControl !== true,
        baseLayerPicker: getSetting('allow-bing-maps') === true,
        sceneModePicker: props.disableUserControl !== true,
        geocoder: props.disableUserControl !== true
    })

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


    //TODO currently switching to 2D crashes cesium
    // const openstreetmap = new OpenStreetMapImageryProvider({
    //     url : 'https://tile.openstreetmap.org/'
    // })
    //viewer.imageryLayers.addImageryProvider(openstreetmap) //TODO add attribution see https://operations.osmfoundation.org/policies/tiles/

    resetCamera()

    /*
    // Add Cesium OSM Buildings, a global 3D buildings layer.
    createOsmBuildingsAsync().then(buildingTileset => {
        viewer.scene.primitives.add(buildingTileset)
    })
    */

    viewer.camera.moveEnd.addEventListener(evt=>{
        const carto = Cartographic.fromCartesian(viewer.camera.position)
        console.log('camera.moveEnd', MathCesium.toDegrees(carto.longitude), MathCesium.toDegrees(carto.latitude), carto.height)
        //TODO append to url
    })

    viewer.scene.screenSpaceCameraController.enableInputs = !props.disableUserControl

    // viewer.scene.screenSpaceCameraController.enableRotate = false;
    // viewer.scene.screenSpaceCameraController.enableTranslate = false;
    // viewer.scene.screenSpaceCameraController.enableZoom = false;
    // viewer.scene.screenSpaceCameraController.enableTilt = false;
    // viewer.scene.screenSpaceCameraController.enableLook = false;

    viewerLoadCheckInterval = setInterval(()=>{

        if(viewer.terrainProvider){

            clearInterval(viewerLoadCheckInterval)

            viewerIsLoaded.value = true

            emit('viewer-loaded', viewer)
        }
    }, 10)

})

function resetCamera(){

    viewer.camera.setView({
        destination: Cartesian3.fromDegrees(props.startPoint.longitude, props.startPoint.latitude, props.startHeight),
        orientation: {
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

</script>

<template>

    <div id="map" ref="mapContainer">

        <slot v-bind="{resetCamera}"></slot>

    </div>

</template>

<style scoped lang="scss">

#map {
    position: relative;
    height: 100%;
    width: 100%;
}

</style>
