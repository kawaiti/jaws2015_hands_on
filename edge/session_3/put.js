var adxl345 = require('jsupm_adxl345');
var adxl = new adxl345.Adxl345(0);

var raws = [];
var xs = [];
var ys = [];
var zs = [];

var AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-1';

// Cognito settings
var cognitoParams = {
  AccountId: "ここを埋める",//ここは参加者毎に異なる。左記は、テスト用
  RoleArn: "arn:aws:iam::*/*" // ここを埋める
  IdentityPoolId: "us-east-1:*"// ここを埋める
};

// Get a credential from Cognito 
  AWS.config.region = 'us-east-1';
  AWS.config.credentials = new AWS.CognitoIdentityCredentials(cognitoParams);
  AWS.config.credentials.get(function(err) {
    if (!err) {
      console.log("Cognito Identity Id: " + "AWS.config.credentils.identityId");
    }
});
// Kinesis settings

AWS.config.region = 'ap-northeast-1';
var kinesis = new AWS.Kinesis();

timer = setInterval(function()
{
  adxl.update();
  var raw = adxl.getRawValues();
  var force = adxl.getAcceleration();
  var rawvalues = raw.getitem(0) + " " + raw.getitem(1) + " " + raw.getitem(2);

  raws.push(rawvalues);
  xs.push(force.getitem(0).toFixed(2));
  ys.push(force.getitem(1).toFixed(2));
  zs.push(force.getitem(2).toFixed(2));

  if(raws.length >= 20) {
    var time = parseInt((new Date)/1000);
    var data = { raw: raws.join(" "), x: xs.join(" "), y: ys.join(" "), z: zs.join(" "), time: time };
    var params = { Data: JSON.stringify(data), PartitionKey: "demo", StreamName: "jaws-iot-handson" }; //修正が必要
    kinesis.putRecord(params, function(err, data)
    {
      if(err) console.log(err, err.stack);
      else console.log(data);
    });

    // console.info(params);
    raws = [];
    xs = [];
    ys = [];
    zs = [];
  }
}, 100);

