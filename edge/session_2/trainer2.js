var adxl345 = require('jsupm_adxl345');
var adxl = new adxl345.Adxl345(0); 

num_train = process.argv[2];

var count = 0;
var rest = 0;
var work = 0;

var raws = [];
var xs = [];
var ys = [];
var zs = [];
var k = false;

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

  if(raws.length >= num_train) {
    count = count + 1;
    if(count <= 1000) {
      var annotation = "rest";
      if(k) {
        work = work + 1;
        annotation = k;
      } else {
        rest = rest + 1;
      }
      console.error("key: " + k + ", work: " + work + ", rest: " + rest)
      console.log(annotation + "," + raws.join(" ") + "," + xs.join(" ") + "," + ys.join(" ") + "," + zs.join(" "))
      // console.log("key: " + k);
    }
    else {
      clearInterval(timer);
      process.exit();
    }
    // console.log("Raw Values: " + raws);
    // console.log("AxisXs: " + xs);
    // console.log("AxisYs: " + ys);
    // console.log("AxisZs: " + zs);
    raws = [];
    xs = [];
    ys = [];
    zs = [];
    k = false;
  }
}, 10);

var stdin = process.stdin;
stdin.setRawMode( true );
stdin.resume();
stdin.setEncoding( 'utf8' );

stdin.on('data', function (key) {
  if (key === '\u0003') process.exit();
  if (key) k = key;
});
