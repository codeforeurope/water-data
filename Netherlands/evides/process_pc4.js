var async = require('async');
var request = require("request");
var fs = require('fs');

var arr = require('./pc4.json');
var new_array = [];
var plants = {};
var errors = [];
async.map(arr, getInfo, function (e, r) {
  var json = JSON.stringify(new_array,null,2);
  fs.writeFile('zones.json', json, 'utf8', function(err){
    var json2 = JSON.stringify(plants,null,2);
    fs.writeFile('plants.json', json2, 'utf8', function(err){
      console.log("finished.");
      console.log("No evides postalcodes:" + errors.join(","));
    });
  });
});

function getInfo(name, callback) {
  var url = "https://www.evides.nl/webapi/v1/postcode/waterkwaliteit?postcode=" + name;
  request({
    url: url,
    json: true
  }, function (error, response, body) {
    var productlocations = [];
    if (!error && response.statusCode === 200) {
      if(body){
        if (body.Postcode === null){
          delete body.Postcode;
        }
        if (body.Hardheid === null){
          delete body.Hardheid;
        }
        if (body.HardheidStatus === null){
          delete body.HardheidStatus;
        }
        if (body.Zuurgraad === null){
          delete body.Zuurgraad;
        }
        if (body.Menggebied === null){
          delete body.Menggebied;
        }
        if (body.Bron === null){
          delete body.Bron;
        }
        for (var i = 1; i < 9; i++) {
          if(body["ProductLocatie"+i]){
            plants[body["ProductLocatie"+i]] = plants[body["ProductLocatie"+i]] || [];
            plants[body["ProductLocatie"+i]].push(name);
            productlocations.push(body["ProductLocatie"+i]);
          }
          delete body["ProductLocatie"+i];
        }
        body.pc4 = name;
        body.plants = productlocations;
        new_array.push(body);
      } else {
        errors.push(name);
      }
      callback(null, "");
    }
  });

}
