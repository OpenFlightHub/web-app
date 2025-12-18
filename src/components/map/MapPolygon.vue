<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue';
import { Cartesian3, Cartographic, Color, Entity, PolygonGeometry, PolylineDashMaterialProperty, Property, Viewer } from 'cesium';
import { getElevationAtPosition } from '@/util/terrain';


//TODO if line elevation is below cesium terrain, clamp it to ground
const props = defineProps<{
    viewer: Viewer
    points: [number, number, number?][],
    clampToGround?: boolean
    color: Color
    filled?: boolean
    outlineColor?: Color
    outlineWidth?: number
}>()

let polygon: Entity
let outline: Entity

const myId = crypto.randomUUID()

watch(()=>props.clampToGround, update, {deep: true})
watch(()=>props.color, update, {deep: true})
watch(()=>props.filled, update, {deep: true})
watch(()=>props.points, update, {deep: true})

onMounted(update)
onBeforeUnmount(()=>{
    removeAll()
})

async function update(){

    if(polygon || outline){
        removeAll()
    }

    await addAll()
}

async function addAll(){


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

    polygon = props.viewer.entities.add({
        id: 'map-polygon-' + myId,
        polygon: {
            //@ts-ignore
            hierarchy: {
                positions
            },
            filled: true,
            material: props.color,
            outline: true,
            outlineColor: props.outlineColor || props.color,
            perPositionHeight: false, //props.clampToGround !== false
        }
    })

    //extra polyline because outlineWidth is bugged in cesium and will never be fixed

    positions.push(positions[0])// polyline needs the first point again

    outline = props.viewer.entities.add({
        id: 'map-polygon_outline-' + myId,
        polyline: {
            positions,
            width: typeof props.outlineWidth === 'number' ? props.outlineWidth : 3,
            clampToGround: props.clampToGround,
            material: props.outlineColor || props.color
        }
    })
}



function removeAll(){
    if(polygon){
        props.viewer.entities.remove(polygon)
        polygon = undefined
    }

    if(outline){
        props.viewer.entities.remove(outline)
        outline = undefined
    }
}

onBeforeUnmount(removeAll)

</script>

<template>

</template>
