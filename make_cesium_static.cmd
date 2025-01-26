echo "make cesiumStatic ..."

mkdir "dist/cesiumStatic"

robocopy "node_modules/@cesium/engine/Build/ThirdParty" "dist/cesiumStatic/ThirdParty" /E /NP /NFL /NJH /NJS /NS /NC /NDL
robocopy "node_modules/@cesium/engine/Build/Workers" "dist/cesiumStatic/Workers" /E /NP /NFL /NJH /NJS /NS /NC /NDL
robocopy "node_modules/@cesium/engine/Source/Assets" "dist/cesiumStatic/Assets" /E /NP /NFL /NJH /NJS /NS /NC /NDL
robocopy "node_modules/@cesium/widgets/Source" "dist/cesiumStatic/Widgets" /E /NP /NFL /NJH /NJS /NS /NC /NDL
