import { Cartographic, sampleTerrainMostDetailed, TerrainProvider } from "cesium"

export async function getElevationAtPosition(terrainProvider: TerrainProvider, longitude: number, latitude: number){

    const inAirPos = Cartographic.fromDegrees(longitude, latitude, undefined, new Cartographic())


    const onGroundPos = inAirPos.clone()
    await sampleTerrainMostDetailed(terrainProvider, [onGroundPos])

    return onGroundPos
}