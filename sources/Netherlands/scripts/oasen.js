var request = require('request');
var fs = require('fs');
var url = 'https://www.oasen.nl/api/mijn-oasen/watersamenstelling';
function unique(arr){
  var o={};
  var r=[];
  var n = arr.length;
  var i;
  for( i=0 ; i<n ; ++i ) {
    o[arr[i]] = null;
  }
  for( i in o ){
    r.push(i);
  }
  return r;
}

function processValue(value){
  if(value.startsWith("<")){
    value = value.slice(1);
  }
  var res = value.replace(",", ".");
  return parseFloat(res);
}

function getPlant(path){
  switch(true){
    case path.indexOf('Hooge-Boom') != -1: return 'Hooge Boom';
    case path.indexOf('Steeg') != -1: return 'De Steeg';
    case path.indexOf('Laak') != -1: return 'De Laak';
    case path.indexOf('Alblasserdam') != -1: return 'De Put';
    case path.indexOf('Rodenhuis') != -1: return 'Rodenhuis';
    case path.indexOf('Reijerwaard') != -1: return 'Reijerwaard';
    case path.indexOf('Elzengors') != -1: return 'Baanhoek';
    case path.indexOf('Lekkerkerk') != -1: return 'Schuwacht';
    default:
      return;
  }
}
request(url, function(error, response, body){
  if(!error){
    var data = JSON.parse(body);
    var filepaths = [];
    var plants = {};
    var reports = [];
    var compositions = data.waterCompositions.tbody;
    for (i = 0; i < compositions.length; i++) {
      var reporturl = 'https://www.oasen.nl' + compositions[i].filePath;
      reports.push('wget -nc -P ../reports/oasen ' + reporturl);
      var plant = getPlant(compositions[i].filePath);
      plants[plant] = plants[plant] || {'municipalities':[],'alternatives':[]};
      plants[plant].report = reporturl;
      plants[plant].gradation = processValue(compositions[i].gradation);
      plants[plant].observations = [{code: 'hardness', value: processValue(compositions[i].hardness), uom: 'dH'}];
      plants[plant].municipalities.push(compositions[i].municipality);
      plants[plant].alternatives.push(compositions[i].title);
      plants[plant].alternatives = unique(plants[plant].alternatives);
      plants[plant].municipalities = unique(plants[plant].municipalities);
    }
    var reports = unique(reports);
    fs.writeFile('oasen-plants.json', JSON.stringify([plants], null,2), 'utf8', function(err,result){
       console.log("Write oasen-plants.json");
       var outstring = '#!/bin/bash\nwget -nc https://github.com/tabulapdf/tabula-java/releases/download/0.9.2/tabula-0.9.2-jar-with-dependencies.jar\n' +
        reports.join('\n') +
        '\njava -jar tabula-0.9.2-jar-with-dependencies.jar -g -t -f CSV -o ../reports/oasen/ -b ../reports/oasen' +
        '\nnpm install csvtojson' +
        '\nnode oasen_tabula.js' +
        '\nrm ../reports/oasen/*.csv;'
       fs.writeFile('oasen.sh', outstring, 'utf8', function(err,result){
          console.log("Write oasen.sh");
       });
    });
  }
});
