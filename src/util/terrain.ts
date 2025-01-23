import { Cartographic, sampleTerrainMostDetailed, TerrainProvider, Viewer } from "cesium"

export async function getElevationAtPosition(viewer: Viewer, longitude: number, latitude: number){

    const inAirPos = Cartographic.fromDegrees(longitude, latitude, undefined, new Cartographic())


    const onGroundPos = inAirPos.clone()
    await sampleTerrainMostDetailed(viewer.terrainProvider, [onGroundPos])

    return onGroundPos
}