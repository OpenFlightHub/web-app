<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue';
import { Cartesian2, Cartesian3, Color, Entity, HeightReference, LabelStyle, VerticalOrigin, Viewer } from 'cesium';


const props = defineProps<{
    viewer: Viewer
    position: [number, number]
    height: number
    iconUrl: string
    iconWidth: number
    iconHeight: number
    label?: string
    fontSize?: number
}>()

let marker: Entity

onMounted(()=>{
    /*
    const polygon = props.viewer.entities.add({
        polygon: {
            hierarchy: Cartesian3.fromDegreesArray([
                10.313992402329717, 47.5409938499751,
                10.313992402329717, 47.5419938499751,
                10.314992402329717, 47.5409938499751,
            ]),
            //height: 2000,
            material: Color.RED.withAlpha(0.2),
            outline: true,
            outlineColor: Color.BLACK
        }
    })*/

    marker = props.viewer.entities.add({
        position: Cartesian3.fromDegrees(props.position[0], props.position[1], props.height),
        billboard: {
            image: props.iconUrl,
            width: props.iconWidth,
            height: props.iconHeight,
            //heightReference: HeightReference.CLAMP_TO_TERRAIN,
            // verticalOrigin: VerticalOrigin.BOTTOM,
            // pixelOffset: new Cartesian2(0, props.iconHeight * -0.5),
            disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        label: {
            text: props.label,
            font: (typeof props.fontSize === 'number' ? props.fontSize : 14) + 'pt monospace',
            style: LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            //heightReference: HeightReference.CLAMP_TO_TERRAIN,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
    })
})

onBeforeUnmount(()=>{
    props.viewer.entities.remove(marker)
})


/*
let marker: maplibregl.Marker
let markerIsAddedToMap = false

onMounted(()=>{

    marker = new maplibregl.Marker({
        element: props.markerElement
    })

})

watch(()=>props.position, updateMarker, {deep: true})

function updateMarker(){

    if(typeof props.position[0] === 'number' && typeof props.position[1] === 'number'){
        marker.setLngLat(props.position)
        showMarker()
    } else {
        hideMarker()
    }
}

function showMarker(){
    if(!markerIsAddedToMap){
        marker.addTo(props.viewer)
        markerIsAddedToMap = true
    }
}

function hideMarker(){
    if(markerIsAddedToMap){
        marker.remove()
        markerIsAddedToMap = false
    }
}
    */

</script>

<template>

</template>
