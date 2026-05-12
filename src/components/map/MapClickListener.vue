<script setup lang="ts">
import { inject, onBeforeMount, onBeforeUnmount, onMounted } from 'vue';
import { Viewer } from 'cesium';
import { getElevationAtPosition } from '@/util/terrain';
import { getMapTerrainLocationAt } from '@/util/cesium';

const viewer = inject<Viewer>('cesiumViewer')
const mapContainer = inject<HTMLElement>('mapContainer')

const emit = defineEmits<{
    click: [{longitude: number, latitude: number, height: number}]
}>()

onMounted(()=>{
    mapContainer!.addEventListener('click', onClick)
})

async function onClick(evt: MouseEvent){
    if(evt.target !== viewer!.canvas){
        return
    }

    const clickX = evt.pageX
    const clickY = evt.pageY
    const bounds = mapContainer!.getBoundingClientRect()

    const containerX = bounds.left + window.scrollX
    const containerY = bounds.top + window.scrollY

    const relativeX = (clickX - containerX) / bounds.width
    const relativeY = (clickY - containerY) / bounds.height

    const clickedLocation = getMapTerrainLocationAt(viewer!, relativeX, relativeY)

    const elevation = (await getElevationAtPosition(viewer!, clickedLocation.longitude, clickedLocation.latitude)).height

    emit('click', {
        longitude: clickedLocation.longitude,
        latitude: clickedLocation.latitude,
        height: elevation
    })
}


onBeforeUnmount(()=>{
    mapContainer!.removeEventListener('click', onClick)
})

</script>

<template>

</template>
