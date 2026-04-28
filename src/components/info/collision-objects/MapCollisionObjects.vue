<script setup lang="ts">
import api from '@/api';
import LoadApiArray from '@/components/functional/LoadApiArray.vue';
import { Cartesian2, Cartographic, Viewer } from 'cesium';
import { computed, inject, onMounted, reactive, ref } from 'vue';
import CollisionObject from './CollisionObject.vue';
import { bearing, distance, radiansToDegrees } from '@turf/turf';
import { ApiResponse_InfoCollisionObjectsGet } from 'openflighthub-api-client-sdk';
import { updateArray, updateObject } from '@/util/vue';

const viewer = inject<Viewer>('cesiumViewer')

const COLLISION_OBJECTS_RADIUS = 2000

const objects = ref([] as ApiResponse_InfoCollisionObjectsGet)

const currentQueryParams = reactive(calculcateQueryParams())
const currentCameraHeading = ref(0)

function calculcateQueryParams(){
    const DEFAULT = {
        latitude: 0,
        longitude: 0,
        radius: 0
    }

    if(!viewer){
        return DEFAULT
    } else {

        let mapCenter = getMapCenter()

        if(mapCenter.latitude === 0 && mapCenter.longitude === 0){
            return DEFAULT
        }

        return {
            latitude: mapCenter.latitude,
            longitude: mapCenter.longitude,
            radius: COLLISION_OBJECTS_RADIUS
        }
    }
}

function getMapCenter(){
    const DEFAULT = {
        latitude: 0,
        longitude: 0
    }

    if(!viewer){
        return DEFAULT
    }

    let windowPosition = new Cartesian2(viewer.container.clientWidth / 2, viewer.container.clientHeight / 2);

    let pickRay = viewer.scene.camera.getPickRay(windowPosition)

    if(!pickRay){
        return DEFAULT
    }

    let pickPosition = viewer.scene.globe.pick(pickRay, viewer.scene)

    if(!pickPosition){
        return DEFAULT
    }

    let pickPositionCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(pickPosition)

    return {
        latitude: radiansToDegrees(pickPositionCartographic.latitude),
        longitude: radiansToDegrees(pickPositionCartographic.longitude)
    }
}

let intervalId = setInterval(()=>{
    if(!viewer){
        return
    }

    clearInterval(intervalId)

console.log('adding camera move end listener to load collision objects')

    viewer.scene.camera.moveEnd.addEventListener(()=>{

        const newCameraHeading = radiansToDegrees(viewer.camera.heading)
        if(newCameraHeading !== currentCameraHeading.value){
            currentCameraHeading.value = newCameraHeading
            updateFilteredObjects()
            return
        }

        const newQueryParams = calculcateQueryParams()

        const distanceToCurrentPosition = distance(
            [newQueryParams.longitude, currentQueryParams.latitude],
            [currentQueryParams.longitude, newQueryParams.latitude],
            {units: 'meters'}
        )

        console.log('distance to current position', distanceToCurrentPosition)

        if(distanceToCurrentPosition > COLLISION_OBJECTS_RADIUS / 2){
            // trigger reload
            updateObject(currentQueryParams, newQueryParams)
            loadCollisionObjects()
            return
        }

    })
}, 50)

async function loadCollisionObjects(){

    if(!currentQueryParams){
        return
    }

    if(currentQueryParams.radius === 0){
        return

    }

    updateArray(objects.value, flattenObjects(await api.rest.info.collisionObjects.get({queryParams: currentQueryParams})))

    console.log('loaded collision objects', objects.value.length)

    updateFilteredObjects()
}

function flattenObjects(objects: ApiResponse_InfoCollisionObjectsGet): ApiResponse_InfoCollisionObjectsGet{
    const flattened: ApiResponse_InfoCollisionObjectsGet = []

    for(const object of objects){
        if(object.marking.type === 1){
            // line markings with multiple points, flatten to multiple objects with one point each for better visibility filtering

            for(let pi = 0; pi < object.marking.points.length-1; pi++){
                const point = object.marking.points[pi]
                const nextPoint = object.marking.points[pi + 1]

                flattened.push({
                    name: object.name,
                    type: object.type,
                    marking: {
                        type: 1,
                        points: [point, nextPoint]
                    }
                })
            }
        } else {
            flattened.push(object)
        }
    }

    return flattened
}

const filteredObjects = reactive<ApiResponse_InfoCollisionObjectsGet>([])

function updateFilteredObjects(){
    updateArray(filteredObjects, filterVisible(objects.value))
    console.log('updating filtered objects', filteredObjects.length)
}

function filterVisible(objects: ApiResponse_InfoCollisionObjectsGet){
    if(!viewer){
        return []
    }

    const cameraHeading = radiansToDegrees(viewer.camera.heading)

    console.log('camera heading', cameraHeading)

    const visibleObjects: ApiResponse_InfoCollisionObjectsGet = []

    for(const object of objects){

        const markingCenterPoint = object.marking.type === 0
            ? {longitude: object.marking.longitude, latitude: object.marking.latitude}
            : {
                longitude: object.marking.points.reduce((sum, point) => sum + point.longitude, 0) / object.marking.points.length,
                latitude: object.marking.points.reduce((sum, point) => sum + point.latitude, 0) / object.marking.points.length,
            }

        const mapCenterPos = getMapCenter()

        if(mapCenterPos.latitude === 0 && mapCenterPos.longitude === 0){
            console.error('mapcenter is invalid')
        }

        const objectHeading = bearing(
            [mapCenterPos.longitude, mapCenterPos.latitude],
            [markingCenterPoint.longitude, markingCenterPoint.latitude]
        )

        //TODO check heading formats of cesium and turf, maybe need to convert one to another
        if(Math.abs(objectHeading - cameraHeading) > 90){
            //continue // TODO fix and enable
        }

        const distanceToCamera = distance(
            [markingCenterPoint.longitude, markingCenterPoint.latitude],
            [mapCenterPos.longitude, mapCenterPos.latitude],
            {units: 'meters'}
        )

        if(distanceToCamera > COLLISION_OBJECTS_RADIUS){
            continue
        }

        visibleObjects.push(object)
    }

    return visibleObjects
}

</script>

<template>


    <CollisionObject v-for="(obj, index) of filteredObjects" :key="index" :object="obj"></CollisionObject>

</template>

<style scoped lang="scss">



</style>
