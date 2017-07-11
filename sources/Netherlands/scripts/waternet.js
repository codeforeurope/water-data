var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');
url = 'https://www.waternet.nl/ons-water/drinkwater/kwaliteit-van-ons-drinkwater/';

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

function processUom(uom){
  uom = uom.replace(encoding='utf-8');
  switch (true) {
    case uom.indexOf('°C') != -1: return 'degC';
    case uom.indexOf('FTU') != -1: return 'ftu';
    case uom === 'pH': return 'pH';
    case uom === 'SI': return 'pH';
    case uom === 'mS/m': return 'mS/m';
    case uom.indexOf('kvd/100 ml') != -1: return 'cfu/dl';
    case uom.indexOf('kvd/ml') != -1: return 'cfu/ml';
    case uom.indexOf('kvd/l') != -1: return 'cfu/l';
    case uom.indexOf('µg/l') != -1: return 'ug/l';
    case uom.indexOf('mmol/l') != -1: return 'mmol/l';
    case uom.indexOf('mg/l') != -1: return 'mg/l';
    default:
      return 'MISSING';
  }
}

function processCode(code){
  code = code.trim();
  switch (code) {
    case 'Aluminium': return 'aluminum';
    case 'Arseen': return 'arsenic';
    case 'Boor': return 'boron';
    case 'Calcium': return 'calcium';
    case 'Chloride': return 'chloride';
    case 'Koolstofdioxide': return 'carbondioxide';
    case 'EGV (elek. geleid.verm. 20°C)': return 'conductance';
    case 'Fluoride': return 'fluoride';
    case 'IJzer': return 'iron';
    case 'Troebeling': return 'turbidity';
    //Geur
    case 'Waterstofcarbonaat': return 'bicarbonate';
    case 'Kwik': return 'mercury';
    case 'Totale hardheid': return 'hardness';
    case 'Kleurgetal': return 'pt_co';
    case 'Magnesium': return 'magnesium';
    case 'Mangaan': return 'manganese';
    case 'Natrium': return 'natrium';
    case 'Ammonium': return 'ammonium';
    case 'Nitriet': return 'nitrite';
    case 'Nitraat': return 'nitrate';
    case 'Zuurstof, opgelost': return 'oxygen';
    //pH berekend
    case 'Seleen': return 'selenium';
    case 'Verzadigingsindex S.I. Berekend': return 'saturation';
    //Smaak
    case 'Sulfaat': return 'sulfate';
    case 'Temperatuur': return 'watertemperature';
    case 'Totaal organische koolstof': return 'carbon';
    case 'Aeromonas': return 'aeromonas';
    case 'Clostridium perfringens': return 'clostridium';
    case 'Coli 37°C': return 'coli';
    case 'Enterococcen': return 'enterococci';
    //Koloniegetal 22 °C *
    case 'Legionella': return 'legionella';
    default:
      return 'MISSING';
  }
}

var results = {
  "name": "",
  "issued": 'need to extract date and year from filename',
  "year": 'need to extract date and year from filename',
  "authority": 'waternet',
  "operator": 'waternet',
  "observations": [],
  "zones": ['waternet','heemskerk'],
  "plants": ['leiduin'],
  "sources":[url]
};
request(url, function(error, response, html){
  if(!error){
    var title;
    var $ = cheerio.load(html);
    $('#waterkwaliteit caption').filter(function(){
      var data = $(this);
      results.name = data[0].children[0].data;

      $('#waterkwaliteit > tbody > tr').filter(function(){
        var data = $(this);
        //console.log(data.children().length);
        var row = data.children();
        var _observation = {
          code: processCode(row[0].children[0].data),
          uom: processUom(row[1].children[0].data),
          min: processValue(row[2].children[0].data),
          value: processValue(row[3].children[0].data),
          max: processValue(row[4].children[0].data)
        };

        if(_observation.code !== 'MISSING' && _observation.uom !== 'MISSING'){
          //console.log(_observation);
          results.observations.push(_observation);
        } else {
          console.log([row[0].children[0].data, row[1].children[0].data, row[2].children[0].data, row[3].children[0].data, row[4].children[0].data].join(", "));
        }
      });
      switch (true){
        case results.name.indexOf('2014') != -1:
          results.year = '2014';
          results.issued = "2014-12-31T23:59:00.000Z";
          break;
        case results.name.indexOf('2015') != -1:
          results.year = '2015';
          results.issued = "2015-12-31T23:59:00.000Z";
          break;
        case (results.name.indexOf('2016') != -1 && results.name.indexOf('kwartaal') == -1):
          results.year = '2016';
          results.issued = "2016-12-31T23:59:00.000Z";
          break;
        case results.name.indexOf('2016') != -1 && results.name.indexOf('1e kwartaal') != -1:
          results.year = '2016';
          results.issued = "2016-03-31T23:59:00.000Z";
          break;
        case results.name.indexOf('2016') != -1 && results.name.indexOf('2e kwartaal') != -1:
          results.year = '2016';
          results.issued = "2016-06-30T23:59:00.000Z";
          break;
        case results.name.indexOf('2016') != -1 && results.name.indexOf('3e kwartaal') != -1:
          results.year = '2016';
          results.issued = "2016-09-30T23:59:00.000Z";
          break;
        case results.name.indexOf('2016') != -1 && results.name.indexOf('4e kwartaal') != -1:
          results.year = '2016';
          results.issued = "2016-12-31T23:59:00.000Z";
          break;
        case results.name.indexOf('2017') != -1 && results.name.indexOf('1e kwartaal') != -1:
          results.year = '2017';
          results.issued = "2017-03-31T23:59:00.000Z";
          break;
      }
      fs.writeFile('../../../reports/waternet.json', JSON.stringify([results], null,2), 'utf8', function(err,result){
         console.log("Write waternet.json");
      });
    });


  }
});
