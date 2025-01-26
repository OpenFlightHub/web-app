npm run build

mkdir dist/cesiumStatic

cp -r node_modules/@cesium/engine/Build/ThirdParty dist/cesiumStatic/ThirdParty
cp -r node_modules/@cesium/engine/Build/Workers dist/cesiumStatic/Workers
cp -r node_modules/@cesium/engine/Source/Assets dist/cesiumStatic/Assets
cp -r node_modules/@cesium/widgets/Source dist/cesiumStatic/Widgets
