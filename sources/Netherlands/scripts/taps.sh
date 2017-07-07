wget -O jointhepipe-taps.js http://join-the-pipe.org/uploads/markers.js
wget -O dunea-taps.json https://dunea.maps.arcgis.com/sharing/rest/content/items/026c904780654348af8dafc81406b36f/data?f=json
wget -O waternet-taps.json "https://maps.waternet.nl/arcgis/rest/services/Happertjeskaart/Happertjeskaart/MapServer/0/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=json"
echo "exports.markers=markers;" >> jointhepipe-taps.js

npm install @mapbox/togeojson xmldom
node taps_parse.js
rm jointhepipe-taps.js
rm dunea-taps.json
rm waternet-taps.json
