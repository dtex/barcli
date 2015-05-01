# barcli [bahrk-lee]
Barcli is a **simple** tool for displaying real time bar graphs in the console.

<caption>Screenshot of Leap Motion Controller example</caption>

![screen shot 2015-04-05 at 10 46 51 pm](https://cloud.githubusercontent.com/assets/854911/7000356/ad911400-dbe5-11e4-8cf0-4e485c84aae9.png)


I needed a way to visualize Johnny-Five sensor data quickly and easily. console.log is hard to read, especially if you have more than one datapoint to track.

Multiple instances of barcli can be stacked to show multiple axes, sensors or other data sources in an easy to read horizontal bar graph.

### Installation
````bash
npm install barcli
````

### Usage
This example uses all of barcli's default values.

````js
var Barcli = require("barcli");

var graph = new Barcli();

graph.update(0.25); // Sets bar to 25%
graph.update(1.0); // Sets bar to 100%
````

Optionally, you can pass configuration parameters in an object.
````js
var Barcli = require("barcli");

var graph = new Barcli({
  label: "My Graph",
  range: [0, 100],
});

graph.update(25); // Sets bar to 25%
graph.update(100); // Sets bar to 100%
````

### Configuration Options

**label** (String) - Label for the bar graph. Any length is fine, but make sure it will fit in your terminal window along with the bar graph (Default: "Input n")

**range** (Array) - The upper and lower limits for input values. This will be mapped to your bar length. One or both values can be set to null and the range will be found automatically (Default: [null, null])

**autoRange** (Boolean) - Grow the range to include the minimum and maximum values passed in calls to update() (Default: false. If no range is passed or null is passed then this defaults to true)

**precision** (Integer) - The number of digits after the decimal point to display (Default: 0)

**constrain** (Boolean) - Constrains displayed input value to given inputRange (Default: false)

**percent** (Boolean) - Displays the input value as a percentage of the inputRange (Default: false)

**width** (Integer) - The length of the bar in terminal characters (Default: 80)

**color** (String) - Colors will be assigned automatically, but you can override with your preference. Valid values are "red", "green", "yellow", "blue", "magenta", "cyan" or "white".

### Examples

#### Johnny-Five Sensor Input
````js
var five = require("johnny-five");
var Barcli = require("barcli");

var board = new five.Board().on("ready", function() {

  var sensor = new five.Sensor({
    pin: "A0",
    freq: 250
  });

  var graph = new Barcli({
    label: "Sensor",
    range: [0, 100]
  });

  sensor.scale([0, 100]);

  sensor.on("data", function() {
    graph.update(this.value);
  });
});

````

#### Leap Motion Controller Input
````js
var Leap = require("leapjs");
var Barcli = require("barcli");

var palmX = new Barcli({label: "Palm X", range: [-500, 500]});
var palmY = new Barcli({label: "Palm Y", range: [50, 400]});
var palmZ = new Barcli({label: "Palm Z", range: [-500, 500]});

Leap.loop({enableGestures: true}, function(frame) {

  if (frame.hands.length === 1) {
    palmX.update(frame.hands[0].palmPosition[1]);
    palmY.update(frame.hands[0].palmPosition[0]);
    palmZ.update(frame.hands[0].palmPosition[2]);
  }

});

````

#### A Barcli Clock
````js
var Barcli = require("barcli");

var hours = new Barcli({ label: "Hour", range: [0, 23]});
var minutes = new Barcli({ label: "Minute", range: [0, 59]});
var seconds = new Barcli({ label: "Second", range: [0, 59]});
var milliseconds = new Barcli({ label: "Millisecond", range: [0, 999]});

var intervalID = GLOBAL.setInterval(function() {

  var now = new Date();

  hours.update(now.getHours());
  minutes.update(now.getMinutes());
  seconds.update(now.getSeconds());
  milliseconds.update(now.getMilliseconds());

}, 12);

````
