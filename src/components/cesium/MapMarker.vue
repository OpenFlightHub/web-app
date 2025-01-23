<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Cartesian2, Cartesian3, Cartographic, Color, Ellipsoid, Entity, HeightReference, JulianDate, LabelStyle, PolylineDashMaterialProperty, SampledPositionProperty, sampleTerrainMostDetailed, VerticalOrigin, Viewer } from 'cesium';
import { getElevationAtPosition } from '@/util/terrain';
import { convertEllisoidalHeightToOrthometricHeight } from '@/util/geoid';
import { cleanupClickMyEntity, ClickMyEntityHandle, setupClickMyEntity } from '@/util/cesium';

//TODO if marker elevation is below cesium terrain, clamp it to ground
const props = defineProps<{
    mapContainer: HTMLElement
    viewer: Viewer
    position: [number, number]
    elevation?: number //if not present, marker will sit on the ground
    iconUrl: string
    iconWidth: number
    iconHeight: number
    label?: string
    fontSize?: number
    showHeightIndicator?: boolean
}>()


const emit = defineEmits<{
    click: [value:undefined]
}>()

let marker: Entity
let markerClickMyEntityHandle: ClickMyEntityHandle
let heightIndicator: Entity

const myId = crypto.randomUUID()

watch(()=>props.position, update, {deep: true})
watch(()=>props.elevation, update)

onMounted(update)

onBeforeUnmount(()=>{
    removeMarker()
    removeHeightIndicator()
})


async function update(){//TODO cesium fails to repaint polygons (height marker) if we update it too quickly (e.g. every 10ms)

    if(marker){
        removeMarker()
    }

    addMarker()


    if(heightIndicator){
        removeHeightIndicator()
    }

    await addHeightIndicator()
}


function heightIsNotZero(){
    return typeof props.elevation === 'number' && props.elevation > 0
}

function addMarker(){
    marker = props.viewer.entities.add({
        id: 'map-marker-' + myId,
        position: Cartesian3.fromDegrees(props.position[0], props.position[1], props.elevation),
        billboard: {
            image: props.iconUrl,
            width: props.iconWidth,
            height: props.iconHeight,
            color: Color.CYAN,
            heightReference: heightIsNotZero() ? HeightReference.NONE : HeightReference.CLAMP_TO_TERRAIN,
            disableDepthTestDistance: heightIsNotZero() ? 5000000 : Number.POSITIVE_INFINITY // show always above terrain https://community.cesium.com/t/points-labels-stuck-under-terrain/11141
        },
        label: {
            text: props.label + ' ' + Math.floor(convertEllisoidalHeightToOrthometricHeight(props.position[0], props.position[1], props.elevation)) + 'm MSL',
            font: (typeof props.fontSize === 'number' ? props.fontSize : 14) + 'pt monospace',
            style: LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            heightReference: heightIsNotZero() ? HeightReference.NONE : HeightReference.CLAMP_TO_TERRAIN,
            disableDepthTestDistance: heightIsNotZero() ? 5000000 : Number.POSITIVE_INFINITY, // show always above terrain https://community.cesium.com/t/points-labels-stuck-under-terrain/11141
            verticalOrigin: VerticalOrigin.TOP,
            pixelOffset: new Cartesian2(0, props.iconHeight * 0.5)
        }
    })

    markerClickMyEntityHandle = setupClickMyEntity(props.mapContainer, props.viewer, marker, ()=>{
        emit('click', undefined)
    })

}

function removeMarker(){

    if(markerClickMyEntityHandle){
        cleanupClickMyEntity(markerClickMyEntityHandle)
    }

    if(marker){
        props.viewer.entities.remove(marker)
        marker = undefined
    }
}

async function addHeightIndicator(){

    if(!props.showHeightIndicator === false){
        return
    }

    // TODO reenable this code
    // if(Math.abs(inAirPos.height - onGroundPos.height) < 5){
    //     return
    // }

    heightIndicator = props.viewer.entities.add({
        id: 'map-marker-height-indicator' + myId,
        polyline: {
            positions: makeHeightIndicatorPositions(props.position, props.elevation),
            width: 2,
            material: new PolylineDashMaterialProperty({
                color: Color.CYAN
            })
        }
    })
}

function makeHeightIndicatorPositions(latLon: [number, number], elevation: number){
    return [Cartesian3.fromDegrees(latLon[0], latLon[1], elevation), Cartesian3.fromDegrees(latLon[0], latLon[1], 0)]
}

function removeHeightIndicator(){
    if(!heightIndicator){
        return
    }
    props.viewer.entities.remove(heightIndicator)
    heightIndicator = undefined
}

onBeforeUnmount(()=>{
    removeMarker()
    removeHeightIndicator()
})

</script>

<template>

</template>
