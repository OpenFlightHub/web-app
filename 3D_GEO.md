Cesium is using WGS84 as height reference (as do all GPS receivers). This means its using a base ellipsoid + a geoid (that represents the hills and valleys of the earths gravitation and its influence on the mean sea level).

The terrainProvider uses the same height (Cesium Ion)


If you need to transform between the WGS84 and german NHN, you can use these tools:

see https://visgl.github.io/math.gl/docs/modules/geospatial
see https://community.cesium.com/t/what-altitude-is-returned-in-sampleterrainmostdetailed/8846/7
