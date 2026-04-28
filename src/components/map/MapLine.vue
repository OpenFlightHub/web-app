<script setup lang="ts">
import { getCurrentInstance, onBeforeUnmount, onMounted, watch } from 'vue';
import { Cartographic, Color, Entity, PolylineDashMaterialProperty, Viewer } from 'cesium';
import { getElevationAtPosition } from '@/util/terrain';


//TODO merge this into MapPolygon

//TODO if line elevation is below cesium terrain, clamp it to ground
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
    heightIsRelative?: boolean // relative to ground
    color: Color
}>()

let line: Entity | undefined

const myId = '' + getCurrentInstance()?.uid

watch(()=>props.from, update, {deep: true})
watch(()=>props.to, update, {deep: true})
watch(()=>props.color, update, {deep: true})

onMounted(update)
onBeforeUnmount(()=>{
    removeLine()
})


async function update(){

    if(line){
        removeLine()
    }

    await addLine()
}

function fromHeightIsNotZero(){
    return typeof props.from.elevation === 'number' && props.from.elevation > 0
}

function toHeightIsNotZero(){
    return typeof props.to.elevation === 'number' && props.to.elevation > 0
}

async function addLine(){

    const fromPos = fromHeightIsNotZero() ? Cartographic.fromDegrees(props.from.position[0], props.from.position[1], props.from.elevation) : await getElevationAtPosition(props.viewer, props.from.position[0], props.from.position[1])

    const toPos = toHeightIsNotZero() ? Cartographic.fromDegrees(props.to.position[0], props.to.position[1], props.to.elevation) : await getElevationAtPosition(props.viewer, props.to.position[0], props.to.position[1])

    if(props.heightIsRelative && typeof props.from.elevation === 'number'){
        fromPos.height = (await getElevationAtPosition(props.viewer, props.from.position[0], props.from.position[1])).height + props.from.elevation
    }

    if(props.heightIsRelative && typeof props.to.elevation === 'number'){
        toPos.height = (await getElevationAtPosition(props.viewer, props.to.position[0], props.to.position[1])).height + props.to.elevation
    }

    line = props.viewer.entities.add({
        id: 'map-line-' + myId,

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
