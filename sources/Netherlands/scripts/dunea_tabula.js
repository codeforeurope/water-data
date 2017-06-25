/* jshint node: true, esversion: 6 */
const csv = require('csvtojson');
const fs = require('fs');
var path = require('path');
var dirPath = path.resolve(__dirname, '../reports/dunea');

// initialize
var total = [];
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

function parsecsv(filename, cb){
  //Prepare reports
  //First part of filename is name
  //Grab year
  var results = {
    "name": filename,
    "issued": 'need to extract date and year from filename',
    "year": 'need to extract date and year from filename',
    "observations": []
  };
  results.sources = ["https://www.dunea.nl/documents/10156/13625/" + filename.replace(/ /g, "+").replace('.csv', '.pdf')];
  //Year and issued
  switch (true){
    case filename.indexOf('2013') != -1:
      results.year = '2013';
      results.issued = "2013-12-31T23:59:00.000Z";
      break;
    case filename.indexOf('2014') != -1:
      results.year = '2014';
      results.issued = "2014-12-31T23:59:00.000Z";
      break;
    case filename.indexOf('2015') != -1:
      results.year = '2015';
      results.issued = "2016-12-31T23:59:00.000Z";
      break;
    case filename.indexOf('2016') != -1:
      results.year = '2016';
      results.issued = "2016-12-31T23:59:00.000Z";
      break;
    case filename.indexOf('2017') != -1 && filename.indexOf('1e kw') != -1:
      results.year = '2017';
      results.issued = "2017-03-31T23:59:00.000Z";
      break;
  }

  //Zones and plants
  switch (true){
    case filename.indexOf('Katwijk') != -1:
      results.zones = ["noordwijkerhout","hillegom","lisse","noordwijk","teylingen","katwijk","oegstgeest","leiden"];
      results.plants = ['katwijk'];
      break;
    case filename.indexOf('Monster') != -1:
      results.zones = ["den_haag","rijswijk"];
      results.plants = ['monster'];
      break;
    case filename.indexOf('Scheveningen') != -1:
      results.zones = ["wassenaar","voorschoten","leidschendam_voorburg","zoetermeer","pijnacker_nootdorp","lansingerland","zuidplas","nesselande","den_haag","rijswijk","alphen_aan_de_rijn"];
      results.plants = ['scheveningen'];
      break;
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

    var skipset = new Set(['','Omschrijving','Geur (kwalitatief)','Smaak (kwalitatief)','Omschrijving']);
    if(skipset.has(jsonObj.field1)){
      //skip
      console.log('skipped ' + jsonObj.field1);
    } else {
      switch (jsonObj.field1) {
        case 'Aluminium': code = 'aluminum'; break;
        case 'Arseen': code = 'arsine'; break;
        case 'Boor': code = 'barium'; break;
        case 'Calcium': code = 'calcium'; break;
        case 'Chloride': code = 'chloride'; break;
        case 'Koolstofdioxide': code = 'carbondioxide'; break;
        case 'EGV (elek. geleid.verm. 20°C)': code = 'conductance'; break;
        case 'Fluoride': code = 'fluoride'; break;
        case 'IJzer': code = 'iron'; break;
        case 'Troebeling': code = 'turbidity'; break;
        // Geur (kwalitatief)
        case 'Waterstofcarbonaat': code = 'bicarbonate'; break;
        case 'Kwik': code = 'mercury'; break;
        case 'Totale hardheid': code = 'hardness'; break;
        case 'Kleurgetal': code = 'pt_co'; break;
        case 'Magnesium': code = 'magnesium'; break;
        case 'Mangaan': code = 'manganese'; break;
        case 'Natrium': code = 'natrium'; break;
        case 'Ammonium': code = 'ammonium'; break;
        case 'Nitriet': code = 'nitrite'; break;
        case 'Nitraat': code = 'nitrate'; break;
        case 'Zuurstof, opgelost': code = 'oxygen'; break;
        case 'pH berekend': code = 'acidity'; break;
        //Orthosofaat
        //Seleen
        case 'Verzadigingsindex S.I. berekend': code = 'saturation'; break;
        // Smaak (kwalitatief)
        case 'Sulfaat': code = 'sulfate'; break;
        case 'Temperatuur': code = 'watertemperature'; break;
        // Totaal organisch koolstof
        // Lood
        // Aeromonas
        case 'Clostridium perfringens': code = 'clostridium'; break;
        case 'Coli 37°C': code = 'coli'; break;
        case 'Enterococcen': code = 'enterococci'; break;
        //Koloniegetal 22 °C *
        default:
          code = 'MISSING';
      }
      switch (true) {
        case jsonObj.field2.indexOf('°C') != -1: uom = 'deg_c'; break;
        case jsonObj.field2.indexOf('FTU') != -1: uom = 'ftu'; break;
        case jsonObj.field2 === 'pH': uom = 'ph'; break;
        case jsonObj.field2 === 'SI': uom = 'si'; break;
        case jsonObj.field2 === 'mS/m': uom = 'ms_m'; break;
        case jsonObj.field2.indexOf('kvd/100 ml') != -1: uom = 'cfu_100ml'; break;
        case jsonObj.field2.indexOf('μg/l') != -1: uom = 'mug_l'; break;
        case jsonObj.field2.indexOf('mmol/l') != -1: uom = 'mmol_l'; break;
        case jsonObj.field2.indexOf('mg/l') != -1: uom = 'mg_l'; break;
        default:
          uom = 'MISSING';
      }

      if(uom !== 'MISSING' && code !== 'MISSING'){
        results.observations.push({
          "code": code,
          "value": processValue(jsonObj.field4),
          "max": processValue(jsonObj.field3),
          "min": processValue(jsonObj.field5),
          "uom": uom
        });
      }
    }
  })
  .on('done',(error)=>{
  	cb(results);
  });
}
fs.readdir(dirPath, function(err, files){
  filelist = files.filter(function(e){
    return path.extname(e).toLowerCase() === '.csv';
  });
  var done = filelist.length;
  var status = 0;
  filelist.forEach(function(file){
    parsecsv(file, function(out){
      var json = JSON.stringify(out,null,2);
      total = total.concat(out);
      status++;
      if (status === done){
        //console.log(total);
        fs.writeFile('../../../reports/dunea.json', JSON.stringify(total, null,2), 'utf8', function(err,result){
           console.log("Write dunea.json");
        });
      }

    });
  });
});
