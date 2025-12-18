<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue';
import { Cartesian3, Cartographic, Color, Entity, PolygonGeometry, PolylineDashMaterialProperty, Property, Viewer } from 'cesium';
import { getElevationAtPosition } from '@/util/terrain';


//TODO if line elevation is below cesium terrain, clamp it to ground
const props = defineProps<{
    viewer: Viewer
    points: [number, number, number][],//lng, lat, elevation
    clampToGround?: boolean
    color: Color
}>()

let polyline: Entity

const myId = crypto.randomUUID()

watch(()=>props.points, update, {deep: true})
watch(()=>props.clampToGround, update, {deep: true})
watch(()=>props.color, update, {deep: true})

onMounted(update)
onBeforeUnmount(()=>{
    removePolyline()
})

async function update(){

    if(polyline){
        removePolyline()
    }

    await addPolyline()
}

async function addPolyline(){


    const positions: Cartesian3[] = []
    for(const p of props.points){

        let cartographicPosition: Cartographic

        const lng = p[0]
        const lat = p[1]
        const elevation = p[2]

        if(props.clampToGround){
            cartographicPosition = Cartographic.fromDegrees(lng, lat)
        } else if(typeof elevation !== 'number' || elevation === 0){
            cartographicPosition = await getElevationAtPosition(props.viewer, lng, lat)
            cartographicPosition.height += 10
        } else {
            cartographicPosition = Cartographic.fromDegrees(lng, lat, elevation)
        }

        positions.push(Cartographic.toCartesian(cartographicPosition))
    }

    polyline = props.viewer.entities.add({
        id: 'map-polyline-' + myId,
        polyline: {
            positions,
            width: 4,
            clampToGround: props.clampToGround === true,
            material: props.color
        }
    })
}

function removePolyline(){
    if(!polyline){
        return
    }
    props.viewer.entities.remove(polyline)
    polyline = undefined
}

onBeforeUnmount(removePolyline)

</script>

<template>

</template>
