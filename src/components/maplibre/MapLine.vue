<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Cartesian2, Cartesian3, Cartographic, Color, Entity, HeightReference, JulianDate, LabelStyle, PolylineDashMaterialProperty, SampledPositionProperty, sampleTerrainMostDetailed, VerticalOrigin, Viewer, Ellipsoid } from 'cesium';
import { getElevationAtPosition } from '@/util/maplibre';


const props = defineProps<{
    viewer: Viewer
    from: {
        position: [number, number],
        elevation?: number //if not present, marker will sit on the ground
    }
    to: {
        position: [number, number],
        elevation?: number //if not present, marker will sit on the ground
    },
    color: Color
}>()

let line: Entity

const myId = crypto.randomUUID()

watch(()=>props.from, update, {deep: true})
watch(()=>props.to, update, {deep: true})

onMounted(update)
onBeforeUnmount(()=>{
    removeLine()
})


async function update(){

    if(line){
        removeLine()
    }

    addLine()
}

function fromHeightIsNotZero(){
    return typeof props.from.elevation === 'number' && props.from.elevation > 0
}

function toHeightIsNotZero(){
    return typeof props.to.elevation === 'number' && props.to.elevation > 0
}

async function addLine(){

    const fromPos = fromHeightIsNotZero() ? Cartographic.fromDegrees(props.from.position[0], props.from.position[1], props.from.elevation) : await getElevationAtPosition(props.viewer.terrainProvider, props.from.position[0], props.from.position[1])
    const toPos = toHeightIsNotZero() ? Cartographic.fromDegrees(props.to.position[0], props.to.position[1], props.to.elevation) : await getElevationAtPosition(props.viewer.terrainProvider, props.to.position[0], props.to.position[1])

    line = props.viewer.entities.add({
        id: 'map-marker-' + myId,

        polyline: {
            positions: [Cartographic.toCartesian(fromPos), Cartographic.toCartesian(toPos)],
            width: 2,
            material: new PolylineDashMaterialProperty({
                color: props.color
            })
        }
    })
}

function removeLine(){
    if(!line){
        return
    }
    props.viewer.entities.remove(line)
    line = undefined
}

</script>

<template>

</template>
