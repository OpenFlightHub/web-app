import { Cartesian2, Cartesian3, Cartographic, defaultValue, defined, Entity, HeadingPitchRoll, Viewer, Math as MathCesium, Transforms, Matrix3, Ray } from "cesium";
import { toRaw } from "vue";

export type ClickMyEntityHandle = {
    readonly mapContainer: HTMLElement
    readonly f: (evt: MouseEvent)=>void
}

export function setupClickMyEntity(mapContainer: HTMLElement, viewer: Viewer, entity: Entity, callback: ()=>void){

    const actualMapContainer = toRaw(mapContainer)

    const handle: ClickMyEntityHandle = {
      mapContainer: actualMapContainer,
        f: evt => {
            const clickX = evt.pageX
            const clickY = evt.pageY
            const bounds = actualMapContainer.getBoundingClientRect()

            const containerX = bounds.left + window.scrollX
            const containerY = bounds.top + window.scrollY

            const relativeX = clickX - containerX
            const relativeY = clickY - containerY

            const clickedEntity = pickEntity(viewer, new Cartesian2(relativeX, relativeY))

            if(clickedEntity === entity){
                callback()
            }
        }
    }

    actualMapContainer.addEventListener('click', handle.f)

    return handle
}

export function cleanupClickMyEntity(handle: ClickMyEntityHandle){
    handle.mapContainer.removeEventListener('click', handle.f)
}


/**
 * Returns the top-most entity at the provided window coordinates
 * or undefined if no entity is at that location.
 *
 * source: https://cesium.com/learn/cesiumjs-learn/cesiumjs-creating-entities/#managing-entities
 *
 * @param windowPosition The window coordinates.
 * @returns The picked entity or undefined.
 */
function pickEntity(viewer: Viewer, windowPosition: Cartesian2) : Entity | undefined {
    const picked = viewer.scene.pick(windowPosition);
    if (defined(picked)) {
      const id = defaultValue(picked.id, picked.primitive.id);
      if (id instanceof Entity) {
        return id;
      }
    }
    return undefined;
  }

  /**
   * Returns the list of entities at the provided window coordinates.
   * The entities are sorted front to back by their visual order.
   *
   * source: https://cesium.com/learn/cesiumjs-learn/cesiumjs-creating-entities/#managing-entities
   *
   * @param  windowPosition The window coordinates.
   * @returns The picked entities or undefined.
   */
  function drillPickEntities(viewer: Viewer, windowPosition: Cartesian2): Entity[] | undefined {
    let picked, entity, i;
    const pickedPrimitives = viewer.scene.drillPick(windowPosition);
    const length = pickedPrimitives.length;
    const result: Entity[] = [];
    const hash = {};

    for (i = 0; i < length; i++) {
      picked = pickedPrimitives[i];
      entity = defaultValue(picked.id, picked.primitive.id);
      if (entity instanceof Entity && !defined(hash[entity.id])) {
        result.push(entity);
        hash[entity.id] = true;
      }
    }
    return result;
  }


/**
 * @param originLonLat in degrees
 * @param originElevation in meters
 * @param bearing in degrees, 0 is north
 * @param distance in meters
 */
export function getPointFromOriginWithBearingAndDistance(originLonLat: [number, number], originElevation: number, bearing: number, distance: number){

    const origin = Cartesian3.fromDegrees(originLonLat[0], originLonLat[1], originElevation)

    const hpr = HeadingPitchRoll.fromDegrees(bearing, 0, 0)
    hpr.heading -= MathCesium.PI_OVER_TWO // fix cesium 0 = east

    const orientation = Transforms.headingPitchRollQuaternion(origin, hpr)
    const direction = Matrix3.multiplyByVector(Matrix3.fromQuaternion(orientation), Cartesian3.UNIT_X, new Cartesian3())
    const ray = new Ray(origin, direction)

    const destination = Ray.getPoint(ray, distance)

    const carto = Cartographic.fromCartesian(destination)
    const destinationWithCorrectedElevation = Cartesian3.fromRadians(carto.longitude, carto.latitude, originElevation)

    return destinationWithCorrectedElevation
}