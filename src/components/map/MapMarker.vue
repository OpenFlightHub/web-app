<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Cartesian2, Cartesian3, Cartographic, Color, Ellipsoid, Entity, HeadingPitchRoll, HeightReference, JulianDate, LabelStyle, Math as MathCesium, Matrix3, PolylineArrowMaterialProperty, PolylineDashMaterialProperty, PositionProperty, Ray, SampledPositionProperty, sampleTerrainMostDetailed, Transforms, VerticalOrigin, Viewer } from 'cesium';
import { getElevationAtPosition } from '@/util/terrain';
import { convertEllipsoidalHeightToOrthometricHeight } from '@/util/geoid';
import { cleanupClickMyEntity, ClickMyEntityHandle, getPointFromOriginWithBearingAndDistance, setupClickMyEntity } from '@/util/cesium';
import * as turf from '@turf/turf';

//TODO if marker elevation is below cesium terrain, clamp it to ground
const props = defineProps<{
    mapContainer: HTMLElement
    viewer: Viewer
    position: [number, number] // longitude, latitude
    elevation?: number //if not present, marker will sit on the ground
    iconUrl: string
    iconWidth: number
    iconHeight: number
    label?: string
    color?: Color
    fontSize?: number
    showHeightIndicator?: boolean
    showHeightMeanSeaLevelInLabel?: boolean
    bearing?: number // in 360 degrees, 0 = north
    autoBearing?: boolean //calculate bearing from last to current position
}>()

let lastPosition: [number, number]


const emit = defineEmits<{
    click: [value:undefined]
}>()

let marker: Entity
let markerClickMyEntityHandle: ClickMyEntityHandle
let heightIndicator: Entity
let bearingIndicator: Entity

const myId = crypto.randomUUID()

watch(()=>props.bearing, update, {deep: true})
watch(()=>props.color, update, {deep: true})
watch(()=>props.elevation, ()=>{
    updatePosition(null, null)
}, {deep: true})
watch(()=>props.fontSize, update, {deep: true})
watch(()=>props.iconHeight, update, {deep: true})
watch(()=>props.iconUrl, update, {deep: true})
watch(()=>props.iconWidth, update, {deep: true})
watch(()=>props.label, update, {deep: true})
watch(()=>props.mapContainer, update, {deep: true})
watch(()=>props.position, updatePosition, {deep: true})
watch(()=>props.showHeightIndicator, update, {deep: true})
watch(()=>props.showHeightMeanSeaLevelInLabel, update, {deep: true})

onMounted(update)

onBeforeUnmount(()=>{
    removeMarker()
    removeHeightIndicator()
    removeBearingIndicator()
})

let autoBearing = 0


async function updatePosition(newValue: typeof props.position, oldValue: typeof props.position){//TODO add this optimization for all the other map elements too (and for all the properties if possible)

    if(newValue && (newValue[0] !== oldValue[0] && newValue[1] !== oldValue[1])){
        lastPosition = oldValue

        autoBearing = turf.bearing(lastPosition, newValue)
        if(autoBearing < 0){
            autoBearing += 360
        }
    }

    if(marker){
        //@ts-ignore
        marker.position = Cartesian3.fromDegrees(props.position[0], props.position[1], props.elevation)
    }


    if(heightIndicator){
        //@ts-ignore
        heightIndicator.polyline.positions = makeHeightIndicatorPositions(props.position, props.elevation)
    }


    if(bearingIndicator){
        //@ts-ignore
        bearingIndicator.polyline.positions = await makeBearingIndicatorPositions(props.position, typeof props.bearing === 'number' ? props.bearing : autoBearing, props.elevation)
    }

}


async function update(){//TODO cesium fails to repaint polygons (height marker) if we update it too quickly (e.g. every 10ms)

    if(!props.mapContainer){
        return
    }

    if(marker){
        removeMarker()
    }

    addMarker()


    if(heightIndicator){
        removeHeightIndicator()
    }

    await addHeightIndicator()


    if(bearingIndicator){
        removeBearingIndicator()
    }

    await addBearingIndicator()
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
            color: props.color,
            heightReference: heightIsNotZero() ? HeightReference.NONE : HeightReference.CLAMP_TO_TERRAIN,
            disableDepthTestDistance: heightIsNotZero() ? 5000000 : Number.POSITIVE_INFINITY // show always above terrain https://community.cesium.com/t/points-labels-stuck-under-terrain/11141,
        },
        label: {
            text: (props.label ? props.label + ' ' : '') + (props.showHeightMeanSeaLevelInLabel ? (typeof props.elevation === 'number' ? Math.floor(convertEllipsoidalHeightToOrthometricHeight(props.position[0], props.position[1], props.elevation)) + 'm' : '') : ''),
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

    if(!props.showHeightIndicator === true){
        return
    }

    // TODO reenable this code
    // if(Math.abs(inAirPos.height - onGroundPos.height) < 5){
    //     return
    // }

    heightIndicator = props.viewer.entities.add({
        id: 'map-marker-height-indicator-' + myId,
        polyline: {
            positions: makeHeightIndicatorPositions(props.position, props.elevation),
            width: 2,
            material: new PolylineDashMaterialProperty({
                color: props.color || Color.WHITE
            })
        }
    })
}

function makeHeightIndicatorPositions(lonLat: [number, number], elevation: number){
    return [Cartesian3.fromDegrees(lonLat[0], lonLat[1], elevation), Cartesian3.fromDegrees(lonLat[0], lonLat[1], 0)]
}

function removeHeightIndicator(){
    if(!heightIndicator){
        return
    }
    props.viewer.entities.remove(heightIndicator)
    heightIndicator = undefined
}


async function addBearingIndicator(){

    if(typeof props.bearing !== 'number' && props.autoBearing !== true){
        return
    }

    bearingIndicator = props.viewer.entities.add({
        id: 'map-marker-bearing-indicator-' + myId,
        polyline: {
            positions: await makeBearingIndicatorPositions(props.position, typeof props.bearing === 'number' ? props.bearing : autoBearing, props.elevation),
            width: 10,
            material: new PolylineArrowMaterialProperty(props.color || Color.WHITE),
        }
    })
}

/**
 *
 * @param lonLat
 * @param bearing
 * @param elevation
 */
async function makeBearingIndicatorPositions(lonLat: [number, number], bearing: number, elevation?: number){

    const terrainElevation = (await getElevationAtPosition(props.viewer, lonLat[0], lonLat[1])).height

    if(typeof elevation === 'number'){
        if(elevation < (terrainElevation + 1)){
            elevation = terrainElevation + 1
        }
    } else {
        elevation = terrainElevation
    }

    const origin = Cartesian3.fromDegrees(lonLat[0], lonLat[1], elevation)

    return [
        origin, getPointFromOriginWithBearingAndDistance(lonLat, elevation, bearing, 500)//TODO this hardcoded length does not work with dynmic zoom (using velocitiy of traffic would be nice)
    ]
}


function removeBearingIndicator(){
    if(!bearingIndicator){
        return
    }
    props.viewer.entities.remove(bearingIndicator)
    bearingIndicator = undefined
}

onBeforeUnmount(()=>{
    removeMarker()
    removeHeightIndicator()
    removeBearingIndicator
})

</script>

<template>

</template>
