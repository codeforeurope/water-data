/* jshint node: true, esversion: 6 */
const csv = require('csvtojson');
const fs = require('fs');
var path = require('path');
var dirPath = path.resolve(__dirname, '../reports/pwn');

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
    "name": filename.replace('.csv',''),
    "issued": 'need to extract date and year from filename',
    "year": 'need to extract date and year from filename',
    "observations": []
  };
  results.sources = ["https://www.pwn.nl/sites/default/files/" + filename.replace('.csv', '.pdf')];
  //Year and issued
  switch (true){
    case filename.indexOf('2014') != -1:
      results.year = '2014';
      results.issued = "2014-12-31T23:59:00.000Z";
      break;
    case filename.indexOf('2015') != -1:
      results.year = '2015';
      results.issued = "2015-12-31T23:59:00.000Z";
      break;
    case filename.indexOf('2016') != -1:
      results.year = '2016';
      results.issued = "2016-12-31T23:59:00.000Z";
      break;
    case filename.indexOf('2016') != -1 && filename.indexOf('1e_kw') != -1:
      results.year = '2017';
      results.issued = "2017-03-31T23:59:00.000Z";
      break;
    case filename.indexOf('2016') != -1 && filename.indexOf('2e_kw') != -1:
      results.year = '2017';
      results.issued = "2017-06-30T23:59:00.000Z";
      break;
    case filename.indexOf('2016') != -1 && filename.indexOf('3e_kw') != -1:
      results.year = '2017';
      results.issued = "2017-09-30T23:59:00.000Z";
      break;
    case filename.indexOf('2016') != -1 && filename.indexOf('4e_kw') != -1:
      results.year = '2017';
      results.issued = "2017-12-31T23:59:00.000Z";
      break;
    case filename.indexOf('2017') != -1 && filename.indexOf('1e kw') != -1:
      results.year = '2017';
      results.issued = "2017-03-31T23:59:00.000Z";
      break;
  }

  //Zones and plants
  switch (true){
    case filename.indexOf('andijk') != -1:
      results.zones = ['andijk'];
      results.plants = ['andijk'];
      break;
    case filename.indexOf('bergen') != -1:
      results.zones = ['bergen'];
      results.plants = ['bergen'];
      break;
    case filename.indexOf('laren') != -1:
      results.zones = ['laren_weesperkarspel'];
      results.plants = ['laren'];
      break;
    case filename.indexOf('leiduin') != -1:
      results.zones = ['mensink_leiduin'];
      results.plants = ['leiduin'];
      break;
    case filename.indexOf('mensink') != -1:
      results.zones = ['mensink','mensink_leiduin'];
      results.plants = ['mensink'];
      break;
    case filename.indexOf('weesperkarspel') != -1:
      results.zones = ['laren_weesperkarspel'];
      results.plants = ['weesperkarspel'];
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

    var skipset = new Set(['','Omschrijving']);
    if(skipset.has(jsonObj.Omschrijving)){
      //skip
      console.log('skipped ' + jsonObj.Omschrijving);
    } else {
      switch (jsonObj.Omschrijving) {
        case 'Aluminium': code = 'aluminum'; break;
        case 'Calcium': code = 'calcium'; break;
        case 'Chloride': code = 'chloride'; break;
        case 'EGV (elek. geleid.verm. 20°C)': code = 'conductance'; break;
        case 'Waterstofcarbonaat': code = 'bicarbonate'; break;
        case 'Totale hardheid': code = 'hardness'; break;
        case 'Magnesium': code = 'magnesium'; break;
        case 'Natrium': code = 'natrium'; break;
        case 'Ammonium': code = 'ammonium'; break;
        case 'Nitraat': code = 'nitrate'; break;
        case 'Verzadigingsindex S.I.': code = 'saturation'; break;
        case 'Sulfaat': code = 'sulfate'; break;
        case 'Temperatuur': code = 'watertemperature'; break;
        case 'Coli 37°C': code = 'coli'; break;
        case 'Legionella': code = 'legionella'; break;
        default:
          code = 'MISSING';
      }
      switch (true) {
        case jsonObj.Eenheid.indexOf('°C') != -1: uom = 'degC'; break;
        case jsonObj.Eenheid.indexOf('FTU') != -1: uom = 'ftu'; break;
        case jsonObj.Eenheid === 'pH': uom = 'pH'; break;
        case jsonObj.Eenheid === 'SI': uom = 'pH'; break;
        case jsonObj.Eenheid === 'mS/m': uom = 'mS/m'; break;
        case jsonObj.Eenheid.indexOf('kve/100 ml') != -1: uom = 'cfu/dl'; break;
        case jsonObj.Eenheid.indexOf('kve/l') != -1: uom = 'cfu/l'; break;
        case jsonObj.Eenheid.indexOf('μg/l') != -1: uom = 'ug/l'; break;
        case jsonObj.Eenheid.indexOf('mmol/l') != -1: uom = 'mmol/l'; break;
        case jsonObj.Eenheid.indexOf('mg/l') != -1: uom = 'mg/l'; break;
        default:
          uom = 'MISSING';
      }

      if(uom !== 'MISSING' && code !== 'MISSING'){
        results.observations.push({
          "code": code,
          "value": processValue(jsonObj.gemiddelde),
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
        fs.writeFile('../../../reports/pwn.json', JSON.stringify(total, null,2), 'utf8', function(err,result){
           console.log("Write pwn.json");
        });
      }

    });
  });
});
