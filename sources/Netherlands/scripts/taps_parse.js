/* jshint node: true, esversion: 6 */
const fs = require('fs');
var path = require('path');
var markerfile = require('./jointhepipe-taps.js');
var dunea = require('./dunea-taps.json');
var waternet = require('./waternet-taps.json');
var duneamarkers = dunea.operationalLayers[0].featureCollection.layers[0].featureSet.features;
var waternetmarkers = waternet.features;
var tj = require('@mapbox/togeojson');
var DOMParser = require('xmldom').DOMParser;


//Set up
var final = {
  "type": "FeatureCollection",
  "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  "features":[]
};

//Oasen
var kml = new DOMParser().parseFromString(fs.readFileSync('../Drinkwatertappunten Oasen.kml', 'utf8'));
var converted = tj.kml(kml);

for (i = 0; i < converted.features.length; i++) {
  var oasenfeature = {
    type: "Feature",
    geometry: converted.features[i].geometry,
    properties:{
      name: converted.features[i].properties.name,
      operator: "oasen",
      type: "tap",
      source: "oasen-taps",
    }
  }
  final.features.push(oasenfeature);
}

//Waternet
for (i = 0; i < waternetmarkers.length; i++) {
  var duneafeature = {
    type: "Feature",
    "id": waternetmarkers[i].attributes.NUMMER,
    properties: {
      "name": waternetmarkers[i].attributes.ADRES,
      "operator": "waternet",
      "description": waternetmarkers[i].attributes.TYPE,
      "id": waternetmarkers[i].attributes.NUMMER,
      "type": "tap",
      "source": "waternet-taps"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [ waternetmarkers[i].geometry.x, waternetmarkers[i].geometry.y ] }
  };
  final.features.push(duneafeature);
}


//Dunea
for (i = 0; i < duneamarkers.length; i++) {
  var duneafeature = {
    type: "Feature",
    id: duneamarkers[i].attributes.__OBJECTID,
    properties: {
      "name": duneamarkers[i].attributes.Naam,
      "description": duneamarkers[i].attributes.Locatie,
      "operator": "dunea",
      "street": duneamarkers[i].attributes.Adres,
      "city": duneamarkers[i].attributes.Plaats,
      "id": duneamarkers[i].attributes.__OBJECTID,
      "type": "tap",
      "source": "dunea-taps"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [ duneamarkers[i].attributes.Lengtegraad, duneamarkers[i].attributes.Breedtegraad ] }
  };
  final.features.push(duneafeature);
}

//Join the Pipe
var markers = markerfile.markers;

for (i = 0; i < markers.length; i++) {
  var type = "unknown";
  switch(markers[i][4]){
    case 1:
      type = "outlet";
      break;
    case 2:
      type = "restaurant";
      break;
    case 3:
      type = "tap";
      break;
    case 4:
      type = "pump";
      break;
    default:
      type = markers[i][4];
  }
  var address;
  var city = null;
  var street = null;
  var namecomponents = markers[i][0].split('<br />');
  if(namecomponents.length === 1){
    address = namecomponents[0].split(' - ');
    description = namecomponents;
  }
  if(namecomponents[1]){
    address = namecomponents[1].split(' - ');
    description = namecomponents[0];
  }
  if(address[1] && !address[2]){
    city = address[2];
  }
  if(address[2]){
    street = address[1];
    city = address[2];
  }
  var name = address[0];
  var tempfeature = {
    type: "Feature",
    id: markers[i][5],
    properties: {
      "name": name,
      //"description": description,
      "description": markers[i][0],
      "operator": "jointhepipe",
      "id": markers[i][5],
      //"sequence": markers[i][3],
      "type": type,
      "source": "jointhepipe-taps"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [ markers[i][2], markers[i][1] ] }
  };
  if(street){
    tempfeature.properties.street = street;
  }
  if(city){
    tempfeature.properties.city = city;
  }
  final.features.push(tempfeature);

}
fs.writeFile('../../../taps.json', JSON.stringify(final, null,2), 'utf8', function(err,result){
   console.log('Wrote ../../../taps.json');
});
