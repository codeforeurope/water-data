/* jshint node: true, esversion: 6 */
const csv = require('csvtojson');
const fs = require('fs');
var path = require('path');
var zonesjson = require('../../../zones/brabantwater.json');
var dirPath = path.resolve(__dirname, '../reports/brabantwater');

// initialize
var total = [];
var zones = {};
function processValue(value){
  if(!value){
    return;
  }
  if(value.startsWith("<")){
    value = value.slice(1);
  }
  var res = value.replace(",", ".");
  return parseFloat(res);
}

function getIssued(value){
  //Year and issued
  switch (true){
    case value.indexOf('2013') != -1:
      return "2013-12-31T23:59:00.000Z";
    case value.indexOf('2014') != -1:
      return "2014-12-31T23:59:00.000Z";
    case value.indexOf('2015') != -1:
      return "2015-12-31T23:59:00.000Z";
    case value.indexOf('2016') != -1 && value.indexOf('.Q3 en 4') != -1:
      return "2016-12-31T23:59:00.000Z";
    case value.indexOf('2016') != -1 && value.indexOf('.Q3') != -1:
      return "2016-09-30T23:59:00.000Z";
    case value.indexOf('2016') != -1 && value.indexOf('.Q4') != -1:
      return "2016-12-31T23:59:00.000Z";
    default:
      //console.log(value);
      return;
  }
}

function parsecsv(filename, cb){
  //Prepare reports
  //First part of filename is name
  //Grab year
  var results = {
    "name": filename.replace('.csv',''),
    "issued": getIssued(filename),
    "observations": []
  };
  if(results.issued){
    results.year = results.issued.substring(0,4);
  }
  results.sources = ["https://brabantwater.nl/PompStationInfo/" + filename.replace(/ /g, "%20").replace('.csv', '.pdf')];


  //Zones and plants
  switch (true){
    case filename.indexOf('Bergen op Zoom') != -1:
      results.zones = zones.bergen_op_zoom;
      results.plants = ['bergen_op_zoom'];
      break;
    case filename.indexOf('Budel') != -1:
      results.zones = zones.budel;
      results.plants = ['budel'];
      break;
    case filename.indexOf('Dorst') != -1:
      results.zones = zones.dorst;
      results.plants = ['dorst'];
      break;
    case filename.indexOf('Eindhoven') != -1:
      results.zones = zones.eindhoven;
      results.plants = ['eindhoven'];
      break;
    case filename.indexOf('Genderen') != -1:
      results.zones = zones.genderen;
      results.plants = ['genderen'];
      break;
    case filename.indexOf('Haaren') != -1:
      results.zones = zones.haaren;
      results.plants = ['haaren'];
      break;
    case filename.indexOf('Helmond') != -1:
      results.zones = zones.helmond;
      results.plants = ['helmond'];
      break;
    case filename.indexOf('Lieshout') != -1:
      results.zones = zones.lieshout;
      results.plants = ['lieshout'];
      break;
    case filename.indexOf('Lith') != -1:
      results.zones = zones.lith;
      results.plants = ['lith'];
      break;
    case filename.indexOf('Loosbroek') != -1:
      results.zones = zones.loosbroek;
      results.plants = ['loosbroek'];
      break;
    case filename.indexOf('Luyksgestel') != -1:
      results.zones = zones.luyksgestel;
      results.plants = ['luyksgestel'];
      break;
    case filename.indexOf('Macharen') != -1:
      results.zones = zones.macharen;
      results.plants = ['macharen'];
      break;
    case filename.indexOf('Nuland') != -1:
      results.zones = zones.nuland;
      results.plants = ['nuland'];
      break;
    case filename.indexOf('Oirschot') != -1:
      results.zones = zones.oirschot;
      results.plants = ['oirschot'];
      break;
    case filename.indexOf('Oosterhout') != -1:
      results.zones = zones.oosterhout;
      results.plants = ['oosterhout'];
      break;
    case filename.indexOf('Prinsenbosch') != -1:
      results.zones = zones.prinsenbosch;
      results.plants = ['prinsenbosch'];
      break;
    case filename.indexOf('Roosendaal') != -1:
      results.zones = zones.roosendaal;
      results.plants = ['roosendaal'];
      break;
    case filename.indexOf('Schijf') != -1:
      results.zones = zones.schijf;
      results.plants = ['schijf'];
      break;
    case filename.indexOf('Schijndel') != -1:
      results.zones = zones.schijndel;
      results.plants = ['schijndel'];
      break;
    case filename.indexOf('Seppe') != -1:
      results.zones = zones.seppe;
      results.plants = ['seppe'];
      break;
    case filename.indexOf('Someren') != -1:
      results.zones = zones.someren;
      results.plants = ['someren'];
      break;
    case filename.indexOf('Son') != -1:
      results.zones = zones.son;
      results.plants = ['son'];
      break;
    case filename.indexOf('Tilburg') != -1:
      results.zones = zones.tilburg;
      results.plants = ['tilburg'];
      break;
    case filename.indexOf('Veghel') != -1:
      results.zones = zones.veghel;
      results.plants = ['veghel'];
      break;
    case filename.indexOf('Vessem') != -1:
      results.zones = zones.vessem;
      results.plants = ['vessem'];
      break;
    case filename.indexOf('Vlierden') != -1:
      results.zones = zones.vlierden;
      results.plants = ['vlierden'];
      break;
    case filename.indexOf('Vlijmen') != -1:
      results.zones = zones.vlijmen;
      results.plants = ['vlijmen'];
      break;
    case filename.indexOf('Welschap') != -1:
      results.zones = zones.welschap;
      results.plants = ['welschap'];
      break;
    case filename.indexOf('Wouw') != -1:
      results.zones = zones.wouw;
      results.plants = ['wouw'];
      break;
    default:
      results.zones = [];
      results.plants = [];
  }

  csv()
  .fromFile(dirPath + '/' + filename)
  .on('json',(jsonObj)=>{
  	// combine csv header row and csv line to a json object
  	// jsonObj.a ==> 1 or 4
    var code;
    var uom;
    var zones = [];
    var plants = [];

    var skipset = new Set(['','Omschrijving','geur, kwalitatief',
      'Geur, kwalitatief', 'smaak, kwalitatief', 'Smaak, kwalitatief','PARAMETER',
      'Anionen', 'Kationen', 'Koloniegetal 22 °C', 'koloniegetal 22 °C','koloniegetal 25 °C, 10 dg R2A-strijkplaat',
      "totaal organisch koolstof (TOC)", 'anionen', 'kationen', "koloniegetal 22 °C, 3 dg GGA-gietplaat"
    ]);
    if(skipset.has(jsonObj.PARAMETER)){
      //skip
    } else {
      var description = '';
      switch (jsonObj.PARAMETER) {
        case 'Waterproductiebedrijf':
          if(jsonObj.AANTAL){
            description = jsonObj['WETTELIJKE NORM'].trim() + ' ' + jsonObj.AANTAL.trim();
          } else {
            description = jsonObj['WETTELIJKE NORM'].trim();
          }
          results.name = jsonObj.EENHEID.trim() + ' ' + description.trim();
          results.issued = getIssued(results.name);
          if(results.issued){
            results.year = results.issued.substring(0,4);
          }
          break;
        case 'temperatuur': //Drinkwaterkwaliteit
        case 'Watertemperatuur': code = 'watertemperature'; break;
        case 'zuurstof': //Drinkwaterkwaliteit
        case 'Zuurstof': code = 'oxygen'; break;
        case 'troebelingsgraad': //Drinkwaterkwaliteit
        case 'Troebelingsgraad': code = 'turbidity'; break;
        case 'zuurgraad': //Drinkwaterkwaliteit
        case 'Zuurgraad': code = 'acidity'; break;
        //evenwichts-pH
        //Evenwichts - pH (20°C)
        case 'saturatie-index': //Drinkwaterkwaliteit
        case 'Verzadigingsindex': code = 'saturation'; break;
        case "EGV (elek. geleid.verm., 20 °C)":
        case 'EGV (elek. geleid.verm., 20°C)': //Drinkwaterkwaliteit
        case 'EGV (20°C)': code = 'conductance'; break;
        //theoretisch afzetbaar calciumcarbonaat 10°C
        //TACC10
        //anionen
        //Anionen
        //kationen
        //Kationen
        case 'koolstofdioxide': //Drinkwaterkwaliteit
        case 'Koolstofdioxide': code = 'carbondioxide'; break;
        case 'waterstofcarbonaat': //Drinkwaterkwaliteit
        case 'Waterstofcarbonaat': code = 'bicarbonate'; break;
        case 'chloride': //Drinkwaterkwaliteit
        case 'Chloride': code = 'chloride'; break;
        case 'sulfaat': //Drinkwaterkwaliteit
        case 'Sulfaat': code = 'sulfate'; break;
        case 'natrium': //Drinkwaterkwaliteit
        case 'Natrium': code = 'natrium'; break;
        case 'kalium': //Drinkwaterkwaliteit
        case 'Kalium': code = 'kalium'; break;
        case 'calcium': //Drinkwaterkwaliteit
        case 'Calcium': code = 'calcium'; break;
        case 'magnesium': //Drinkwaterkwaliteit
        case 'Magnesium': code = 'magnesium'; break;
        case 'totale hardheid': //Drinkwaterkwaliteit
        case 'Totale hardheid': code = 'hardness'; break;
        case 'ammonium': //Drinkwaterkwaliteit
        case 'Ammonium': code = 'ammonium'; break;
        case 'nitriet': //Drinkwaterkwaliteit
        case 'Nitriet': code = 'nitrite'; break;
        case 'nitraat': //Drinkwaterkwaliteit
        case 'Nitraat': code = 'nitrate'; break;
        //ortofosfaat
        case 'silicaat': //Drinkwaterkwaliteit
        case 'Silicaat': code = 'silicate'; break;
        case 'ijzer': //Drinkwaterkwaliteit
        case 'IJzer': code = 'iron'; break;
        case 'mangaan': //Drinkwaterkwaliteit
        case 'Mangaan': code = 'manganese'; break;
        case 'Aluminium':
        case 'aluminium': code = 'aluminum'; break;
        case 'antimoon':
        case 'Antimoon': code = 'antimony'; break;
        case 'arseen': //Drinkwaterkwaliteit
        case 'Arseen': code = 'arsine'; break;
        // Organische koolstof, totaal
        case 'Barium':
        case 'barium': code = 'barium'; break;
        case 'Beryllium':
        case 'beryllium': code = 'beryllium'; break;
        case 'Boor':
        case 'boor': code = 'borium'; break;
        case 'cadmium':
        case 'Cadmium': code = 'cadmium'; break; //Drinkwaterkwaliteit only
        case 'chroom':
        case 'Chroom': code = 'chromium'; break; //Drinkwaterkwaliteit only
        case 'Kobalt':
        case 'Cobalt':
        case 'kobalt':
        case 'Kobalt': code = 'cobalt'; break;
        case 'Koper':
        case 'koper': code = 'copper'; break;
        case 'Kwik':
        case 'kwik': code = 'mercury'; break;
        case 'Lood':
        case 'lood': code = 'lead'; break;
        case 'Nikkel':
        case 'nikkel': code = 'nickel'; break;
        case 'Seleen':
        case 'seleen': code = 'selenium'; break;
        case 'Tin':
        case 'tin': code = 'tin'; break;
        case 'Vanadium':
        case 'vanadium': code = 'vanadium'; break;
        case 'Zilver':
        case 'zilver': code = 'silver'; break;
        case 'Zink':
        case 'zink': code = 'zinc'; break;
        case 'Tritium':
        case 'tritium': code = 'tritium'; break;
        case 'Fluoride':
        case 'fluoride': code = 'fluoride'; break;
        case 'totaal cyanide':
        case 'Cyanide, totaal': code = 'cyanide'; break;
        //totaal organische koolstof (TOC)
        case "totaal organisch koolstof (TOC)":
        case "Organisch koolstof, totaal": code = 'carbon'; break;
        case 'kleurintens., Pt/Co-schaal': //Drinkwaterkwaliteit
        case 'Kleurintensiteit': code = 'pt_co'; break;
        case 'Som Trihalomethanen':
        case 'som trihalomethanen': code = 'trihalomethanes'; break;
        case 'bacteriën Coligroep (37 °C)':
        case 'bacteriën Coligroep': //Drinkwaterkwaliteit
        case 'Bacteriën van de coligroep': code = 'coli'; break;
        case 'E.coli':
        case 'Escherichia coli': code = 'e_coli'; break;
        case "Aeromonas spp. 30 °C":
        case 'Aeromonas 30°C':
        case 'Aeromonas 30 °C': code = 'aeromonas'; break;
        case "Legionella spp.": code = 'legionella'; break;
        //Legionella spp.
        case 'Clostridium perfringens (incl. sporen)': code = 'clostridium'; break; //Drinkwaterkwaliteit only
        //dichlobenil
        default:
          code = 'MISSING';
      }
      switch (true) {
        case jsonObj.EENHEID.indexOf('°C') != -1: uom = 'deg_c'; break;
        case jsonObj.EENHEID.indexOf('FTE') != -1: uom = 'ftu'; break;
        case jsonObj.EENHEID.indexOf('pH') != -1: uom = 'ph'; break;
        case jsonObj.EENHEID.indexOf('SI') != -1: uom = 'si'; break;
        case jsonObj.EENHEID.indexOf('Bq/l') != -1: uom = 'bq_l'; break;
        case jsonObj.EENHEID.indexOf('mS/m') != -1: uom = 'ms_m'; break;
        case jsonObj.EENHEID.indexOf('kve/l') != -1: uom = 'cfu_l'; break;
        case jsonObj.EENHEID.indexOf('kve/ml') != -1: uom = 'cfu_ml'; break;
        case jsonObj.EENHEID.indexOf('kve/100 ml') != -1: uom = 'cfu_100ml'; break;
        case jsonObj.EENHEID.indexOf('μg/l') != -1: uom = 'mug_l'; break;
        case jsonObj.EENHEID.indexOf('mmol/l') != -1: uom = 'mmol_l'; break;
        case jsonObj.EENHEID.indexOf('mg/l') != -1: uom = 'mg_l'; break;
        default:
          uom = 'MISSING';
      }

      if(uom !== 'MISSING' && code !== 'MISSING') {
        if(filename.indexOf('Drinkwaterkwaliteit') != -1) {
          // Split field 4
          if(jsonObj.WAARNEMINGEN){
            var values = jsonObj.WAARNEMINGEN.split(" ");

            results.observations.push({
              "code": code,
              "samples": processValue(jsonObj.AANTAL),
              "value": processValue(values[0]),
              "min": processValue(values[1]),
              "max": processValue(values[2]),
              "uom": uom
            });
          }
        } else {
          var values2 = [];
          var values3 = [];
          var values4 = [];
          if(jsonObj['WETTELIJKE NORM']){
            values2 = jsonObj['WETTELIJKE NORM'].split(" ");
          }
          if(jsonObj.AANTAL){
            values3 = jsonObj.AANTAL.split(" ");
          }
          if(jsonObj.WAARNEMINGEN){
            values4 = jsonObj.WAARNEMINGEN.split(" ");
          }
          // // Regular file
          // var values_regular = jsonObj.AANTAL.split(" ");
          if(values4.length === 0){
            results.observations.push({
              "code": code,
              "samples": processValue(values2[0]),
              "value": processValue(values2[1]),
              "min": processValue(values3[0]),
              "max": processValue(values3[1]),
              "uom": uom
            });
          } else {
            results.observations.push({
              "code": code,
              "samples": processValue(values3[0]),
              "value": processValue(values4[0]),
              "min": processValue(values4[1]),
              "max": processValue(values4[2]),
              "uom": uom
            });
          }
        }
      } else {
        if(!skipset.has(jsonObj.PARAMETER) && jsonObj.PARAMETER != "Waterproductiebedrijf"){
          console.log('could not process: ' + filename + '-' + JSON.stringify(jsonObj));
        }
      }
    }
  })
  .on('done',(error)=>{
  	cb(results);
  });
}

//Prepare..
function parseZones(callback){
  var plantcollection = {};
  csv()
  .fromFile('./brabantwater_wp.csv')
  .on('json',(jsonObj)=>{
    plantcollection = parsePlace(plantcollection,jsonObj.PLACE, jsonObj.LOC1);
    if(jsonObj.LOC2){
      parsePlace(plantcollection,jsonObj.PLACE, jsonObj.LOC2);
    }
    if(jsonObj.LOC3){
      parsePlace(plantcollection,jsonObj.PLACE, jsonObj.LOC3);
    }
  })
  .on('done',(error)=>{
    callback(sortObject(plantcollection));
  });
}
function parsePlace(collection, place, plant){
  plant = plant.toLowerCase().replace(/ /g, '_');
  collection[plant] =collection[plant] || [];
  var zone;
  // TODO lookup place!
  for (i = 0; i < zonesjson.features.length; i++) {
    if(zonesjson.features[i].properties.alternatives.indexOf(place) != -1){
      zone = zonesjson.features[i].properties.name;
    }
  }
  if(!zone){
    console.log(place + " could not be matched");
  }
  if(collection[plant].indexOf(zone) == -1){
    collection[plant].push(zone);
  }
  return collection;
}

function sortObject(o) {
    var sorted = {},
    key, a = [];

    for (key in o) {
        if (o.hasOwnProperty(key)) {
            a.push(key);
        }
    }

    a.sort();

    for (key = 0; key < a.length; key++) {
        sorted[a[key]] = o[a[key]];
    }
    return sorted;
}

fs.readdir(dirPath, function(err, files){
  filelist = files.filter(function(e){
    return path.extname(e).toLowerCase() === '.csv';
  });
  var done = filelist.length;
  var status = 0;
  parseZones(function(out) {
    zones = out;
    filelist.forEach(function(file){
      parsecsv(file, function(out){
        var json = JSON.stringify(out,null,2);
        total = total.concat(out);
        status++;
        if (status === done){
          fs.writeFile('../../../reports/brabantwater.json', JSON.stringify(total, null,2), 'utf8', function(err,result){
             console.log("Write brabantwater.json");
          });
        }
      });
    });
  });
});
