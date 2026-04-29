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

    loadCollisionObjects(true)

console.log('adding camera move end listener to load collision objects')

    viewer.scene.camera.moveEnd.addEventListener(()=>{

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
        } else {

            const newCameraHeading = radiansToDegrees(viewer.camera.heading)
            if(newCameraHeading !== currentCameraHeading.value){
                currentCameraHeading.value = newCameraHeading
                updateShownObjects()
            }
        }

    })
}, 50)

async function loadCollisionObjects(forceReload = false){

    if(!currentQueryParams){
        return
    }

    if(forceReload){
        updateObject(currentQueryParams, calculcateQueryParams())
    }

    if(currentQueryParams.radius === 0){
        return

    }

    updateArray(objects.value, await api.rest.info.collisionObjects.get({queryParams: currentQueryParams}))

    console.log('loaded collision objects', objects.value.length)

    updateShownObjects()
}

const shownObjects = reactive<ApiResponse_InfoCollisionObjectsGet>([])

function updateShownObjects(){
    const visibleObjects = filterVisible(objects.value)

    let removedCount = 0
    let addedCount = 0
    let updatedCount = 0

    // remove objects that are not visible anymore
    for(let i = 0; i < shownObjects.length; i++){
        if(!visibleObjects.find(o => o.id === shownObjects[i].id)){
            // remove
            shownObjects.splice(i, 1)
            removedCount++
            i--
        }
    }

    visibleObjects.forEach(vo => {
        const foundIndex = shownObjects.findIndex(so => so.id === vo.id)
        if(foundIndex >= 0){
            //update existing object

            for(const key of Object.keys(vo)){
                //@ts-ignore
                if(vo[key] !== shownObjects[foundIndex][key]){
                    // only update if something has changed, otherwise it can lead to performance issues because of too many updates
                    updateObject(shownObjects[foundIndex], vo)
                    updatedCount++
                    break
                }
            }
        }
    })

    // insert new
    const objectsToAdd = visibleObjects.filter(vo => !shownObjects.find(so => so.id === vo.id))
    shownObjects.push(...objectsToAdd)
    addedCount += objectsToAdd.length

    console.log('updating filtered objects', shownObjects.length, 'added:', addedCount, 'removed:', removedCount, 'updated:', updatedCount)
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

        if(distanceToCamera > COLLISION_OBJECTS_RADIUS && object.marking.type !== 1){//ignore polyline objects, because they can be very long and should be visible even if their center point is far away
            continue
        }

        visibleObjects.push(object)
    }

    return visibleObjects
}

</script>

<template>


    <CollisionObject v-for="obj of shownObjects" :key="'' + obj.id" :object="obj"></CollisionObject>

</template>

<style scoped lang="scss">



</style>
