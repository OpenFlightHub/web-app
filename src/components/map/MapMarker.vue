<script setup lang="ts">
import { getCurrentInstance, inject, onBeforeUnmount, onMounted, onUnmounted, ref, watch } from 'vue';
import { Cartesian2, Cartesian3, Color, DistanceDisplayCondition, Entity, HeightReference, LabelStyle, PolylineArrowMaterialProperty, PolylineDashMaterialProperty, VerticalOrigin, Viewer } from 'cesium';
import { getElevationAtPosition } from '@/util/terrain';
import { convertEllipsoidalHeightToOrthometricHeight } from '@/util/geoid';
import { cleanupClickMyEntity, ClickMyEntityHandle, getPointFromOriginWithBearingAndDistance, setupClickMyEntity, toCssRGBA } from '@/util/cesium';
import * as turf from '@turf/turf';
import { colorizeCanvas } from '@/util/canvas';
import { watchForRealChange } from '@/util/vue';

//TODO if marker elevation is below cesium terrain, clamp it to ground
const props = defineProps<{
    position: [number, number, number?] // longitude, latitude, elevation (if not present, marker will sit on the ground)
    heightIsRelative?: boolean // if true, the height in position is relative to the ground
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
    maxVisibleDistance?: number
}>()

const viewer = inject<Viewer>('cesiumViewer')
const mapContainer = inject<HTMLElement>('mapContainer')

//TODO refactor other map elements to use watchForRealChange
watchForRealChange(()=>props.position, updatePosition, {deep: true})
watchForRealChange(()=>props.heightIsRelative, update)
watchForRealChange(()=>props.iconUrl, update)
watchForRealChange(()=>props.iconWidth, update)
watchForRealChange(()=>props.iconHeight, update)
watchForRealChange(()=>props.label, update)
watchForRealChange(()=>props.color, (newValue, oldValue)=>{
    console.log('update color', newValue, oldValue)
    update()
}, {deep: true})
watchForRealChange(()=>props.fontSize, update)
watchForRealChange(()=>props.showHeightIndicator, update)
watchForRealChange(()=>props.showHeightMeanSeaLevelInLabel, update)
watchForRealChange(()=>props.bearing, update)
watchForRealChange(()=>props.autoBearing, update)
watchForRealChange(()=>props.backgroundCircle, updateCanvasAndIcon, {deep: true})
watchForRealChange(()=>props.blink, update)
watchForRealChange(()=>props.maxVisibleDistance, update)


const BACKGROUND_CIRCLE_OVERLAP = 0.3

let lastPosition: [number, number, number?]


const emit = defineEmits<{
    click: []
}>()

let markerClickMyEntityHandle: ClickMyEntityHandle

const myId = '' + getCurrentInstance()?.uid

let canvas = document.createElement('canvas')
//TODO check if we can use OffscreenCanvas for better performance: new Canvas.getContext('2d').putImageDate(offscreenCanvas.getImageData())


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

let blinkTimeout: ReturnType<typeof setTimeout>
async function blink(){

    const oldBlinkerValue = blinker.value

    if(typeof props.blink === 'number'){
        blinker.value = !blinker.value
    } else {
        blinker.value = false
    }

    if(oldBlinkerValue !== blinker.value){
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

        autoBearing = turf.bearing(lastPosition as [number, number], newValue as [number, number])
        if(autoBearing < 0){
            autoBearing += 360
        }
    }

    let marker = viewer!.entities.getById('map-marker-' + myId)
    if(marker){
        const pos = Cartesian3.fromDegrees(props.position[0], props.position[1], props.position[2])
        //@ts-ignore
        marker.position = pos
    }


    let heightIndicator = viewer!.entities.getById('map-marker-height-indicator-' + myId)
    if(heightIndicator){
        const pos = await makeHeightIndicatorPositions(props.position)
        if(heightIndicator){
            //@ts-ignore
            heightIndicator.polyline.positions = pos
        }
    }

    let bearingIndicator = viewer!.entities.getById('map-marker-bearing-indicator-' + myId)
    if(bearingIndicator){
        const pos = await makeBearingIndicatorPositions(props.position, typeof props.bearing === 'number' ? props.bearing : autoBearing)
        if(bearingIndicator){
            //@ts-ignore
            bearingIndicator.polyline.positions = pos
        }
    }

}


async function update(){//TODO cesium fails to repaint polygons (height marker) if we update it too quickly (e.g. every 10ms)

    if(!mapContainer){
        return
    }

    await makeCanvas()

    await addMarker()

    await addHeightIndicator()

    await addBearingIndicator()
}


function heightIsNotZero(){
    return typeof props.position[2] === 'number' && props.position[2] > 0 || props.heightIsRelative === true
}

async function updateCanvasAndIcon(){
    await makeCanvas()

    let marker = viewer!.entities.getById('map-marker-' + myId)
    if(marker){
        //@ts-ignore
        marker.billboard.image = canvas
    }
}

function makeCanvas(){
    return new Promise<void>((resolve, reject)=>{


        const image = document.createElement('img')
        image.style.position = 'absolute'
        image.style.top = '0'
        image.style.left = '-9999px'

        const onLoad = ()=>{

            let newCanvas = document.createElement('canvas')

            const size = Math.min(Math.max(props.iconWidth, props.iconHeight), Math.max(image.width, image.height))

            newCanvas.width = size
            newCanvas.height = size

            const ctx = newCanvas.getContext('2d')
            ctx!.clearRect(0, 0, newCanvas.width, newCanvas.height)

            const imageAspectRatio = image.width / image.height

            const targetSize = props.backgroundCircle ? (1 - BACKGROUND_CIRCLE_OVERLAP) : 1

            const targetWidth = targetSize * size
            const targetHeight = targetSize * size / imageAspectRatio

            // if image width and height differ, keep aspect ratio
            ctx!.drawImage(image, 0,0,image.width,image.height, (size - targetWidth)/2, (size - targetHeight)/2,targetWidth,targetHeight)

            if(props.color){
                const iconColor = blinker.value === true ? (props.backgroundCircle ? props.backgroundCircle : Color.TRANSPARENT) : props.color

                colorizeCanvas(newCanvas, iconColor)
            }

            if(props.backgroundCircle){

                // TODO refactor so that we cache the canvases instead of generating them every blink

                const tempCanvas = document.createElement('canvas')
                tempCanvas.width = newCanvas.width
                tempCanvas.height = newCanvas.height

                const tempCtx = tempCanvas.getContext('2d')

                tempCtx!.beginPath()
                tempCtx!.arc(size/2, size/2, size/2, 0, Math.PI*2)
                tempCtx!.fillStyle = toCssRGBA(blinker.value ? props.color! : props.backgroundCircle!)
                tempCtx!.fill()


                tempCtx!.drawImage(newCanvas, 0, 0, tempCanvas.width, tempCanvas.height)

                newCanvas.getContext('2d')!.drawImage(tempCanvas, 0, 0, newCanvas.width, newCanvas.height)
            }

            cleanup()

            canvas = newCanvas//must be new canvas element so cesium is forced to repaint

            resolve()
        }

        image.addEventListener('load', onLoad)

        const onError = (err: any)=>{

            cleanup()

            console.error('failed to load MapMarker icon image', props.iconUrl, err)

            reject(err)
        }

        const cleanup = ()=>{

            image.removeEventListener('error', onError)
            image.removeEventListener('load', onLoad)

            image.remove()
        }

        image.addEventListener('error', onError)

        image.src = props.iconUrl

        setTimeout(()=>{
            if(image.complete){
                onLoad()
            }
        }, 1)

        document.body.appendChild(image)
    })
}

async function addMarker(){

    const height = props.position[2]

    let marker = viewer!.entities.getById('map-marker-' + myId)

    if(marker){
        viewer!.entities.remove(marker)//TODO dont remove entity, instead update it
    }

    marker = viewer!.entities.add({
        id: 'map-marker-' + myId,
        position: Cartesian3.fromDegrees(props.position[0], props.position[1], height),
        billboard: {
            image: canvas,
            width: canvas.width,
            height: canvas.height,
            heightReference: heightIsNotZero() ? props.heightIsRelative ? HeightReference.RELATIVE_TO_TERRAIN :  HeightReference.NONE : HeightReference.CLAMP_TO_TERRAIN,
            disableDepthTestDistance: heightIsNotZero() ? 5000000 : Number.POSITIVE_INFINITY, // show always above terrain https://community.cesium.com/t/points-labels-stuck-under-terrain/11141
            distanceDisplayCondition: typeof props.maxVisibleDistance === 'number' ? new DistanceDisplayCondition(0, props.maxVisibleDistance) : undefined
        },
        label: {
            text: (props.label ? props.label + ' ' : '') + (props.showHeightMeanSeaLevelInLabel ? (
                typeof height === 'number' ? Math.floor(convertEllipsoidalHeightToOrthometricHeight(props.position[0], props.position[1], await getHeightValue() as number)) + 'm' : '') : ''),
            font: (typeof props.fontSize === 'number' ? props.fontSize : 14) + 'pt monospace',
            style: LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            heightReference: heightIsNotZero() ? props.heightIsRelative ? HeightReference.RELATIVE_TO_TERRAIN :HeightReference.NONE : HeightReference.CLAMP_TO_TERRAIN,
            disableDepthTestDistance: heightIsNotZero() ? 5000000 : Number.POSITIVE_INFINITY, // show always above terrain https://community.cesium.com/t/points-labels-stuck-under-terrain/11141
            verticalOrigin: VerticalOrigin.TOP,
            pixelOffset: new Cartesian2(0, props.iconHeight * 0.5),
            distanceDisplayCondition: typeof props.maxVisibleDistance === 'number' ? new DistanceDisplayCondition(0, props.maxVisibleDistance) : undefined,
        }
    })

    markerClickMyEntityHandle = setupClickMyEntity(mapContainer!, viewer!, marker, ()=>{
        emit('click')
    })

}

function removeMarker(){

    if(markerClickMyEntityHandle){
        cleanupClickMyEntity(markerClickMyEntityHandle)
    }

    viewer!.entities.removeById('map-marker-' + myId)
}

async function getHeightValue(){
    if(typeof props.position[2] === 'number'){
        if(props.heightIsRelative){
            const elev = await getElevationAtPosition(viewer!, props.position[0], props.position[1])
            return elev.height + props.position[2]
        } else {
            return props.position[2]
        }
    }
}

async function addHeightIndicator(){

    if(props.showHeightIndicator !== true){
        return
    }

    if(typeof props.position[2] !== 'number'){
        return
    }

    // TODO reenable this code
    // if(Math.abs(inAirPos.height - onGroundPos.height) < 5){
    //     return
    // }


    const positions = await makeHeightIndicatorPositions(props.position)

    let heightIndicator = viewer!.entities.getById('map-marker-height-indicator-' + myId)

    if(heightIndicator){
        viewer!.entities.remove(heightIndicator)//TODO dont remove entity, instead update it
    }

    heightIndicator = viewer!.entities.add({
        id: 'map-marker-height-indicator-' + myId,
        polyline: {
            positions,
            width: 2,
            material: new PolylineDashMaterialProperty({
                color: props.color || Color.WHITE
            })
        }
    })
}

async function makeHeightIndicatorPositions(position: [number, number, number?]){
    return [Cartesian3.fromDegrees(position[0], position[1], await getHeightValue()), Cartesian3.fromDegrees(position[0], position[1], (await getElevationAtPosition(viewer!, position[0], position[1])).height)]
}

function removeHeightIndicator(){
    viewer!.entities.removeById('map-marker-height-indicator-' + myId)
}


async function addBearingIndicator(){

    if(typeof props.bearing !== 'number' && props.autoBearing !== true){
        return
    }

    let bearingIndicator = viewer!.entities.getById('map-marker-bearing-indicator-' + myId)

    if(bearingIndicator){
        viewer!.entities.remove(bearingIndicator)//TODO dont remove entity, instead update it
    }

    bearingIndicator = viewer!.entities.add({
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
 * @param position [lng, lat, elevation]
 * @param bearing
 */
async function makeBearingIndicatorPositions(position: [number, number, number?], bearing: number){

    const terrainElevation = (await getElevationAtPosition(viewer!, position[0], position[1])).height

    let elevation = await getHeightValue()
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
    viewer!.entities.removeById('map-marker-bearing-indicator-' + myId)
}

</script>

<template>

</template>
