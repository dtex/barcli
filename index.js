var chalk = require("chalk");
var barclis = [];
var currentPosition = 0;
var colors = ["red", "green", "yellow", "blue", "magenta", "cyan", "white"];
var maxLabelLength = 0;

// fmap() and contrain() are lifted from Rick Waldron's awesome
// Johnny-Five library https://github.com/rwaldron/johnnny-five
fmap = function(value, fromLow, fromHigh, toLow, toHigh) {
  return (value - fromLow) * (toHigh - toLow) /
    (fromHigh - fromLow) + toLow;
};

constrain = function(value, lower, upper) {
  return Math.min(upper, Math.max(lower, value));
};

function Barcli(opts) {

  if (!(this instanceof Barcli)) {
    return new Barcli(opts);
  }

  if (typeof opts === "undefined") {
    opts = {};
  }

  this.index = barclis.length;
  this.inputRange = opts.range || [0, 1];
  this.width = opts.width || 80;
  this.color = opts.color || colors[this.index % colors.length];
  this.label = opts.label || "Input " + String(this.index + 1);

  // So we can left align all the graphs
  if (this.label.length > maxLabelLength) {
    maxLabelLength = this.label.length;
  }

  barclis.push(this);


  // Update our labels so the formatting is consistent
  barclis.forEach(function(barcli, index) {

    // Make sure the labels are laft padded with spaces
    while (barcli.label.length < maxLabelLength) {
      barcli.label = " " + barcli.label;
    }

    // Output the label
    process.stdout.write("\033["+String(barcli.index+1)+";0H");
    process.stdout.write(chalk[barcli.color](barcli.label + ": "));
    process.stdout.write(chalk.white("|\n"));

  });

}

Barcli.prototype.update = function(data) {
  var bar = "", postbar = "";

  var raw = data;
  // Map and constrain the input values
  data = fmap(data, this.inputRange[0], this.inputRange[1], 0, this.width);
  data = constrain(data, 0, this.width);

  // Make our "bar"
  for (var i = 0; i < data; i++) {
    bar = bar + " ";
  }

  // Make the space after our bar
  for (i = data; i <= this.width; i++) {
    postbar += " ";
  }

  // Hide the cursor, put it on the correct line and clear right
  process.stdout.write("\033[?25l\033["+String(this.index+1)+";" + String(maxLabelLength + 4) + "H\033[K");

  // Ouput the bar with the raw data value on right
  process.stdout.write(chalk[this.color].inverse(bar));
  process.stdout.write(chalk[this.color](postbar));
  process.stdout.write(chalk.white("| " + raw));

  // Move the cursor to the end and make it visible again
  process.stdout.write("\033["+String(barclis.length + 1)+";0H\033[K\033[?25h");
};

// Clear the console and hide the cursor
process.stdout.write("\033[2J");

module.exports = Barcli;
