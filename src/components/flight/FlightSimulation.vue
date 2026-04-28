<script setup lang="ts">
import { Cartesian3, PerspectiveFrustum, Viewer, Math as MathCesium } from 'cesium';
import { inject } from 'vue';
import MapCollisionObjects from '../info/collision-objects/MapCollisionObjects.vue';


const viewer = inject<Viewer>('cesiumViewer')
const mapContainer = inject<HTMLElement>('mapContainer')

function setCameraPosition(position: {
    longitude: number
    latitude: number
    height: number
}, cameraOrientation?: {
    heading: number
    pitch: number
    roll: number
}, fov?: number){

    if(!viewer || !mapContainer){
        console.error('Viewer or mapContainer was not provided (must be used within <Map> component!)')
        return
    }

    viewer.camera.setView({
        destination: Cartesian3.fromDegrees(position.longitude, position.latitude, position.height),
        orientation: cameraOrientation ? {
            heading: MathCesium.toRadians(cameraOrientation.heading),
            pitch: MathCesium.toRadians(cameraOrientation.pitch),
        } : undefined
    })

    if(typeof fov === 'number'){
        viewer.camera.frustum = new PerspectiveFrustum({
            fov: MathCesium.toRadians(fov),
            aspectRatio: viewer.canvas.clientWidth / viewer.canvas.clientHeight
        })
    }
}

defineExpose({
    setCameraPosition
})

</script>

<template>

    <div>
        <slot v-bind="{setCameraPosition}"></slot>
        <MapCollisionObjects></MapCollisionObjects>
    </div>

</template>

<style scoped lang="scss">



</style>
