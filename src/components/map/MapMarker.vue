<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, onUnmounted, ref, watch } from 'vue';
import { Cartesian2, Cartesian3, Cartographic, Color, Ellipsoid, Entity, HeadingPitchRoll, HeightReference, JulianDate, LabelStyle, Math as MathCesium, Matrix3, PolylineArrowMaterialProperty, PolylineDashMaterialProperty, PositionProperty, Ray, SampledPositionProperty, sampleTerrainMostDetailed, Transforms, VerticalOrigin, Viewer } from 'cesium';
import { getElevationAtPosition } from '@/util/terrain';
import { convertEllipsoidalHeightToOrthometricHeight } from '@/util/geoid';
import { cleanupClickMyEntity, ClickMyEntityHandle, getPointFromOriginWithBearingAndDistance, setupClickMyEntity, toCssRGBA } from '@/util/cesium';
import * as turf from '@turf/turf';
import { colorizeCanvas } from '@/util/canvas';

//TODO if marker elevation is below cesium terrain, clamp it to ground
const props = defineProps<{
    mapContainer: HTMLElement
    viewer: Viewer
    position: [number, number, number?] // longitude, latitude, elevation (if not present, marker will sit on the ground)
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
    backgroundCircle?: Color
    blink?: number // switch between color and backgroundCircle (if both are set) or color and transparent. Time in ms
}>()


const BACKGROUND_CIRCLE_OVERLAP = 0.3

let lastPosition: [number, number, number?]


const emit = defineEmits<{
    click: [value:undefined]
}>()

let marker: Entity
let markerClickMyEntityHandle: ClickMyEntityHandle
let heightIndicator: Entity
let bearingIndicator: Entity

const myId = crypto.randomUUID()

const image = document.createElement('img')

let canvas = document.createElement('canvas')
//TODO check if we can use OffscreenCanvas for better performance: new Canvas.getContext('2d').putImageDate(offscreenCanvas.getImageData())


watch(()=>props.bearing, update, {deep: true})
watch(()=>props.color, update, {deep: true})
watch(()=>props.fontSize, update, {deep: true})
watch(()=>props.iconHeight, update, {deep: true})
watch(()=>props.iconUrl, update, {deep: true})
watch(()=>props.iconWidth, update, {deep: true})
watch(()=>props.label, update, {deep: true})
watch(()=>props.position, updatePosition, {deep: true})
watch(()=>props.showHeightIndicator, update, {deep: true})
watch(()=>props.showHeightMeanSeaLevelInLabel, update, {deep: true})
watch(()=>props.backgroundCircle, updateCanvasAndIcon, {deep: true})

onMounted(async()=>{
    await update()

    await blink()
})

onBeforeUnmount(()=>{
    removeMarker()
    removeHeightIndicator()
    removeBearingIndicator()
})

let autoBearing = 0

let blinker = ref(false)

let blinkTimeout
async function blink(){

    const oldBlinkerValue = blinker.value

    if(typeof props.blink === 'number'){
        blinker.value = !blinker.value
    } else {
        blinker.value = false
    }

    if(oldBlinkerValue !== blinker.value){
        console.log('updateCanvasAndIcon because of blink', props.label)
        await updateCanvasAndIcon()
    }

    blinkTimeout = setTimeout(blink, typeof props.blink === 'number' ? props.blink : 200)
}

onUnmounted(()=>{
    clearTimeout(blinkTimeout)
})

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

    await makeCanvas()

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
    return typeof props.position[2] === 'number' && props.position[2] > 0
}

async function updateCanvasAndIcon(){
    console.debug('updateCanvasAndIcon', props.label)
    await makeCanvas()

    if(marker){
        //@ts-ignore
        marker.billboard.image = canvas
        // //@ts-ignore
        // marker.billboard.color = blinker.value ? (props.backgroundCircle ? props.backgroundCircle : Color.TRANSPARENT) : props.color
    }
}

function makeCanvas(){
    return new Promise<void>((resolve, reject)=>{

        const onLoad = ()=>{

            let newCanvas = document.createElement('canvas')

            console.debug('image loaded, drawing canvas ...', blinker.value)

            const size = Math.max(image.width, image.height)

            newCanvas.width = size
            newCanvas.height = size

            const ctx = newCanvas.getContext('2d')
            ctx.clearRect(0, 0, newCanvas.width, newCanvas.height)

            const targetWidth = (1 - BACKGROUND_CIRCLE_OVERLAP) * image.width
            const targetHeight = (1 - BACKGROUND_CIRCLE_OVERLAP) * image.height

            // if image width and height differ, keep aspect ratio
            ctx.drawImage(image, 0,0,image.width,image.height, (size - targetWidth)/2, (size - targetHeight)/2,targetWidth,targetHeight)

            const iconColor = blinker.value === true ? (props.backgroundCircle ? props.backgroundCircle : Color.TRANSPARENT) : (props.color || Color.WHITE)

            console.debug('iconColor', iconColor)
            colorizeCanvas(newCanvas, iconColor)

            if(props.backgroundCircle){

                // TODO refactor so that we cache the canvases instead of generating them every blink

                const tempCanvas = document.createElement('canvas')
                tempCanvas.width = newCanvas.width
                tempCanvas.height = newCanvas.height

                const tempCtx = tempCanvas.getContext('2d')

                tempCtx.beginPath()
                tempCtx.arc(size/2, size/2, size/2, 0, Math.PI*2)
                tempCtx.fillStyle = toCssRGBA(blinker.value ? props.color : props.backgroundCircle)
                tempCtx.fill()


                tempCtx.drawImage(newCanvas, 0, 0)

                newCanvas.getContext('2d').drawImage(tempCanvas, 0, 0)
            }

            image.removeEventListener('error', onError)
            image.removeEventListener('load', onLoad)

            canvas = newCanvas//must be new canvas element so cesium is forced to repaint

            resolve()
        }

        image.addEventListener('load', onLoad)

        const onError = (err)=>{

            image.removeEventListener('error', onError)
            image.removeEventListener('load', onLoad)

            reject(err)
        }

        image.addEventListener('error', onError)

        image.src = props.iconUrl
    })
}

function addMarker(){
    marker = props.viewer.entities.add({
        id: 'map-marker-' + myId,
        position: Cartesian3.fromDegrees(props.position[0], props.position[1], props.position[2]),
        billboard: {
            image: canvas,
            width: props.iconWidth,
            height: props.iconHeight,
            heightReference: heightIsNotZero() ? HeightReference.NONE : HeightReference.CLAMP_TO_TERRAIN,
            disableDepthTestDistance: heightIsNotZero() ? 5000000 : Number.POSITIVE_INFINITY // show always above terrain https://community.cesium.com/t/points-labels-stuck-under-terrain/11141,
        },
        label: {
            text: (props.label ? props.label + ' ' : '') + (props.showHeightMeanSeaLevelInLabel ? (typeof props.position[2] === 'number' ? Math.floor(convertEllipsoidalHeightToOrthometricHeight(props.position[0], props.position[1], props.position[2])) + 'm' : '') : ''),
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
            positions: makeHeightIndicatorPositions(props.position),
            width: 2,
            material: new PolylineDashMaterialProperty({
                color: props.color || Color.WHITE
            })
        }
    })
}

function makeHeightIndicatorPositions(position: [number, number, number?]){
    return [Cartesian3.fromDegrees(position[0], position[1], position[2]), Cartesian3.fromDegrees(position[0], position[1], 0)]
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
            positions: await makeBearingIndicatorPositions(props.position, typeof props.bearing === 'number' ? props.bearing : autoBearing),
            width: 10,
            material: new PolylineArrowMaterialProperty(props.color || Color.WHITE),
        }
    })
}

/**
 *
 * @param position
 * @param bearing
 * @param elevation
 */
async function makeBearingIndicatorPositions(position: [number, number, number?], bearing: number){

    const terrainElevation = (await getElevationAtPosition(props.viewer, position[0], position[1])).height

    let elevation = position[2]
    if(typeof elevation === 'number'){
        if(elevation < (terrainElevation + 1)){
            elevation = terrainElevation + 1
        }
    } else {
        elevation = terrainElevation
    }

    const origin = Cartesian3.fromDegrees(position[0], position[1], elevation)

    return [
        origin, getPointFromOriginWithBearingAndDistance([position[0], position[1], elevation], bearing, 500)//TODO this hardcoded length does not work with dynmic zoom (using velocitiy of traffic would be nice)
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
