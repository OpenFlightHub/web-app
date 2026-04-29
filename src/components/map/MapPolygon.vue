<script setup lang="ts">
import { getCurrentInstance, onBeforeUnmount, onMounted, watch } from 'vue';
import { Cartesian3, Cartographic, Color, Entity, Viewer } from 'cesium';
import { getElevationAtPosition } from '@/util/terrain';


//TODO if line elevation is below cesium terrain, clamp it to ground
const props = defineProps<{
    viewer: Viewer
    points: [number, number, number?][],
    clampToGround?: boolean
    heightIsRelative?: boolean // relative to ground
    color: Color
    filled?: boolean
    outlineColor?: Color
    outlineWidth?: number
}>()

const myId = '' + getCurrentInstance()?.uid

watch(()=>props.points, update, {deep: true})
watch(()=>props.clampToGround, update, {deep: true})
watch(()=>props.heightIsRelative, update)
watch(()=>props.color, update, {deep: true})
watch(()=>props.filled, update, {deep: true})
watch(()=>props.outlineColor, update, {deep: true})
watch(()=>props.outlineWidth, update)

onMounted(update)
onBeforeUnmount(()=>{
    removeAll()
})

async function update(){
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
            cartographicPosition.height += 10//10 to always show above terrain
        } else {
            if(props.heightIsRelative === true){
                const terrainHeight = (await getElevationAtPosition(props.viewer, lng, lat)).height
                cartographicPosition = Cartographic.fromDegrees(lng, lat, terrainHeight + elevation)
            } else {
                cartographicPosition = Cartographic.fromDegrees(lng, lat, elevation)
            }
        }

        positions.push(Cartographic.toCartesian(cartographicPosition))
    }

    let polygon = props.viewer.entities.getById('map-polygon-' + myId)

    if(polygon){
        props.viewer.entities.remove(polygon)//TODO dont remove entity, instead update it
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

    let outline = props.viewer.entities.getById('map-polygon_outline-' + myId)

    if(outline){
        props.viewer.entities.remove(outline)//TODO dont remove entity, instead update it
    }

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
    props.viewer.entities.removeById('map-polygon-' + myId)
    props.viewer.entities.removeById('map-polygon_outline-' + myId)
}

</script>

<template>

</template>
