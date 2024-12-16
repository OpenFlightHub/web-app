<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Cartesian2, Cartesian3, Color, Entity, HeightReference, JulianDate, LabelStyle, SampledPositionProperty, VerticalOrigin, Viewer } from 'cesium';


const props = defineProps<{
    viewer: Viewer
    position: [number, number]
    height?: number
    iconUrl: string
    iconWidth: number
    iconHeight: number
    label?: string
    fontSize?: number
}>()

let marker: Entity

watch(()=>props.position, updateMarker, {deep: true})
watch(()=>props.height, updateMarker)

onMounted(updateMarker)
onBeforeUnmount(removeMarker)


function updateMarker(){

    if(marker){
        removeMarker()
    }

    addMarker()
}

function addMarker(){

    marker = props.viewer.entities.add({
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

</script>

<template>

</template>
