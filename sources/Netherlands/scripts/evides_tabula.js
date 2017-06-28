/* jshint node: true, esversion: 6 */
const csv = require('csvtojson');
const fs = require('fs');
var path = require('path');
var dirPath = path.resolve(__dirname, '../reports/evides');
// initialize
var columns = [
  'APR 2016','MEI 2016', 'JUN 2016','JUL 2016',
  'AUG 2016', 'SEP 2016', 'OKT 2016','NOV 2016',
  'DEC 2016', 'JAN 2017', 'FEB 2017', 'MRT 2017'];
var issued = [
  "2016-04-30T23:59:00.000Z",
  "2016-05-31T23:59:00.000Z",
  "2016-06-30T23:59:00.000Z",
  "2016-07-31T23:59:00.000Z",
  "2016-08-31T23:59:00.000Z",
  "2016-09-30T23:59:00.000Z",
  "2016-10-31T23:59:00.000Z",
  "2016-11-30T23:59:00.000Z",
  "2016-12-30T23:59:00.000Z",
  "2017-01-31T23:59:00.000Z",
  "2017-02-28T23:59:00.000Z",
  "2017-03-31T23:59:00.000Z"];
var year = [
  '2016','2016', '2016','2016',
  '2016', '2016', '2016','2016',
  '2016', '2017', '2017', '2017'];
var total = [];
function processValue(value){
  if(value.startsWith("<")){
    value = value.slice(1);
  }
  var res = value.replace(",", ".");
  return parseFloat(res);
}

function parsecsv(filename, cb){
  //Prepare reports
  var results = [];
  for (i = 0; i < columns.length; i++) {
    results.push(
      {
        "name": filename + ' ' + columns[i],
        "issued": issued[i],
        "year": year[i],
        "observations": []
      }
    );
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
    var skipset = new Set(['Geur','Smaak']);
    if(skipset.has(jsonObj.Parameter)){
      //skip
      console.log('skipped ' + jsonObj.Parameter);
    } else {
      switch (jsonObj.Parameter) {
        case 'Temperatuur': code = 'watertemperature'; break;
        case 'Zuurstof': code = 'oxygen'; break;
        case 'Troebeling': code = 'turbidity'; break;
        case 'Zuurgraad': code = 'acidity'; break;
        case 'Verzadigingsindex': code = 'saturation'; break;
        case 'Geleidingsvermogen 20°C': code = 'conductance'; break;
        case 'Waterstofcarbonaat': code = 'bicarbonate'; break;
        case 'Chloride': code = 'chloride'; break;
        case 'Sulfaat': code = 'sulfate'; break;
        case 'Natrium': code = 'natrium'; break;
        case 'Calcium': code = 'calcium'; break;
        case 'Magnesium': code = 'magnesium'; break;
        case 'Totale hardheid': code = 'hardness'; break;
        case 'Ammonium': code = 'ammonium'; break;
        case 'Nitraat': code = 'nitrate'; break;
        case 'IJzer': code = 'iron'; break;
        case 'Aluminium': code = 'aluminum'; break;
        case 'Fluoride': code = 'fluoride'; break;
        case 'Kleurintensiteit (Pt/Co-schaal)': code = 'pt_co'; break;
        case 'Trihalomethanen (som)': code = 'trihalomethanes'; break;
        case 'Bacteriën van de coligroep': code = 'coli'; break;
        case 'Escherichia coli': code = 'e_coli'; break;
        case 'Enterococcen': code = 'enterococci'; break;
        case 'Clostridium perf. (incl sporen)': code = 'clostridium'; break;
        default:
          code = 'MISSING';
      }
      switch (true) {
        case jsonObj.Eenheid.indexOf('°C') != -1: uom = 'deg_c'; break;
        case jsonObj.Eenheid.indexOf('FTE') != -1: uom = 'ftu'; break;
        case jsonObj.Eenheid === 'pH': uom = 'ph'; break;
        case jsonObj.Eenheid === 'SI': uom = 'ph'; break;
        case jsonObj.Eenheid === 'mS/m': uom = 'ms_m'; break;
        case jsonObj.Eenheid.indexOf('KVD/100 ml') != -1: uom = 'cfu_100ml'; break;
        case jsonObj.Eenheid.indexOf('μg/l') != -1: uom = 'mug_l'; break;
        case jsonObj.Eenheid.indexOf('mmol/l') != -1: uom = 'mmol_l'; break;
        case jsonObj.Eenheid.indexOf('mg/l') != -1: uom = 'mg_l'; break;
        default:
          uom = 'MISSING';
      }
      switch (true){
        case filename.indexOf('baanhoek') != -1:
          zones = ['baanhoek'];
          plants = ['baanhoek'];
          break;
        case filename.indexOf('berenplaat') != -1:
          zones = ['berenplaat'];
          plants = ['berenplaat'];
          break;
        case filename.indexOf('braakman') != -1:
          zones = ['braakman'];
          plants = ['braakman'];
          break;
        case filename.indexOf('haamstede') != -1:
          zones = ['haamstede'];
          plants = ['haamstede'];
          break;
        case filename.indexOf('halsteren') != -1:
          zones = ['halsteren_1', 'halsteren_2'];
          plants = ['halsteren'];
          break;
        case filename.indexOf('kralingen') != -1:
          zones = ['kralingen'];
          zones = ['plants'];
          break;
        case filename.indexOf('midden-zeeland') != -1:
          zones = ['midden_zeeland'];
          plants = ['huijbergen', 'ossendrecht'];
          break;
        case filename.indexOf('ouddorp') != -1:
          zones = ['ouddorp'];
          plants = ['ouddorp'];
          break;
      }
      for (i = 0; i < columns.length; i++) {
        results[i].zones = zones;
        results[i].plants = plants;
        if(uom !== 'MISSING' && code !== 'MISSING'){
          results[i].observations.push({
            "code": code,
            "value": processValue(jsonObj[columns[i]]),
            "uom": uom
          });
        }
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
        fs.writeFile('../../../reports/evides.json', JSON.stringify(total, null,2), 'utf8', function(err,result){
           console.log("Write evides.json");
        });
      }

    });
  });
});
