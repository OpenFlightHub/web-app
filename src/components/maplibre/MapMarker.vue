<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Cartesian2, Cartesian3, Cartographic, Color, Entity, HeightReference, JulianDate, LabelStyle, SampledPositionProperty, sampleTerrainMostDetailed, VerticalOrigin, Viewer } from 'cesium';


const props = defineProps<{
    viewer: Viewer
    position: [number, number]
    height?: number
    iconUrl: string
    iconWidth: number
    iconHeight: number
    label?: string
    fontSize?: number
    showHeightIndicator?: boolean
}>()

let marker: Entity
let heightIndicator: Entity

const myId = crypto.randomUUID()

watch(()=>props.position, update, {deep: true})
watch(()=>props.height, update)

onMounted(update)
onBeforeUnmount(()=>{
    removeMarker()
    removeHeightIndicator()
})


async function update(){

    if(marker){
        removeMarker()
    }

    addMarker()


    if(heightIndicator){
        removeHeightIndicator()
    }

    await addHeightIndicator()
}

function addMarker(){

    marker = props.viewer.entities.add({
        id: 'map-marker-' + myId,
        position: Cartesian3.fromDegrees(props.position[0], props.position[1], props.height),
        billboard: {
            image: props.iconUrl,
            width: props.iconWidth,
            height: props.iconHeight,
            // verticalOrigin: VerticalOrigin.BOTTOM,
            // pixelOffset: new Cartesian2(0, props.iconHeight * -0.5),
            heightReference: (typeof props.height === 'number' && props.height > 0) ? HeightReference.NONE : HeightReference.CLAMP_TO_TERRAIN,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        label: {
            text: props.label,
            font: (typeof props.fontSize === 'number' ? props.fontSize : 14) + 'pt monospace',
            style: LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            heightReference: (typeof props.height === 'number' && props.height > 0) ? HeightReference.NONE : HeightReference.CLAMP_TO_TERRAIN,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
    })
}

function removeMarker(){
    props.viewer.entities.remove(marker)
}

async function addHeightIndicator(){

    const inAirPos = Cartographic.fromDegrees(props.position[0], props.position[1], undefined, new Cartographic())


    const onGroundPos = inAirPos.clone()
    await sampleTerrainMostDetailed(props.viewer.terrainProvider, [onGroundPos])

    heightIndicator = props.viewer.entities.add({
        id: 'map-marker-height-indicator' + myId,
        polyline: {
            positions: [Cartesian3.fromDegrees(props.position[0], props.position[1], props.height), Cartographic.toCartesian(onGroundPos)],
            width: 10,
            material: Color.BLUE
        }
    })
}

function removeHeightIndicator(){
    props.viewer.entities.remove(heightIndicator)
}

</script>

<template>

</template>
