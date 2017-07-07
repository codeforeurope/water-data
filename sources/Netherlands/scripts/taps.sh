wget -O jointhepipe-taps.js http://join-the-pipe.org/uploads/markers.js
wget -O dunea-taps.json https://dunea.maps.arcgis.com/sharing/rest/content/items/026c904780654348af8dafc81406b36f/data?f=json
echo "exports.markers=markers;" >> jointhepipe-taps.js

npm install @mapbox/togeojson xmldom
node taps_parse.js
rm jointhepipe-taps.js
rm dunea-taps.json
