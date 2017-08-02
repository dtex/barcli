var chalk = require("chalk");
var barclis = [];
var currentPosition = 0;
var colors = ["red", "green", "yellow", "blue", "magenta", "cyan", "white"];
var maxLabelLength = 0;
var maxValueLength = 0;
var windowWidth = process.stdout.columns || 80;

// fmap() and constrain() are lifted from Rick Waldron's awesome
// Johnny-Five library https://github.com/rwaldron/johnnny-five
var fmap = function(value, fromLow, fromHigh, toLow, toHigh) {
  return (value - fromLow) * (toHigh - toLow) /
    (fromHigh - fromLow) + toLow;
};

var constrain = function(value, lower, upper) {
  return Math.min(upper, Math.max(lower, value));
};

function Barcli(opts) {

  if (!(this instanceof Barcli)) {
    return new Barcli(opts);
  }

  if (typeof opts === "undefined") {
    opts = {};
  }

  if (!opts.range && opts.inputRange) {
    opts.range = opts.inputRange;
  }

  this.index = barclis.length;
  this.autoRange = opts.autoRange || false;
  this.inputRange = opts.range || [null, null];
  this.color = opts.color || colors[this.index % colors.length];
  this.label = opts.label || "Input " + String(this.index + 1);
  this.percent = opts.percent || false;
  this.constrain = !!opts.constrain || false;
  this.precision = opts.precision || 0;
  this.inline = opts.inline || false;
  this.width = opts.width || windowWidth;

  if (!opts.range || opts.range[0] === null || opts.range[1] === null) {
    this.autoRange = true;
  }

  // So we can avoid wrapping
  if (this.precision > maxValueLength) {
    maxValueLength = this.precision;
  }

  // So we can left align all the graphs
  if (this.label.length > maxLabelLength) {
    maxLabelLength = this.label.length;
  }

  if (barclis.length === 0 && !this.inline){
    clearScreen();
  }

  barclis.push(this);

  resize(this.width);

}

Barcli.halt = function() {
  barclis.forEach(function(barcli) {
    barcli.finish();
  });
}

Barcli.prototype.finish = function() {
  process.stdout.write("\n");
};

Barcli.prototype.update = function(data) {
  var prepend = append = bar = postbar = "";

  this.data = data;
  
  if (Array.isArray(data)) {
    data = data[0];
  }

  var type = typeof data;

  if (String(data).length > maxValueLength) {
      maxValueLength = String(data).length;
      resize(this.width);
  }

  var raw = data;

  if (type === "number") {
    
    if (this.autoRange) {
      if (isNaN(this.inputRange[0]) || data < this.inputRange[0]) {
        this.inputRange[0] = data;
      }

      if (isNaN(this.inputRange[1]) || data > this.inputRange[1]) {
        this.inputRange[1] = data;
      }
    }

    // Map and constrain the input values
    data = fmap(data, this.inputRange[0], this.inputRange[1], 0, this.width);
    
    data = constrain(data, 0, this.width);

    // Make our "bar"
    for (i = 0; i <= data; i++) {
      bar = bar + "\u2588";
    }

    // Make the space after our bar
    for (i = data; i < this.width; i++) {
      postbar += " ";
    }
  }

  if (type === "string") {
    bar = data;
    for (i = bar.length; i <= this.width; i++) {
      postbar += " ";
    }
  }

  // Hide the cursor
  process.stdout.write("\033[?25l");

  // Put cursor on the correct line and clear right
  if (this.inline) {
    process.stdout.write("\r");
  } else {
    process.stdout.write("\033["+String(this.index + 1)+";0H\033[K");
  }

  // Output the label
  process.stdout.write(chalk[this.color](this.label+": "));
  process.stdout.write(chalk.white("|"));
    
  // Ouput the bar
  if (type === "number") {
    process.stdout.write(chalk[this.color](bar));
  } else {
    process.stdout.write(chalk[this.color](bar));
  }

  process.stdout.write(chalk[this.color](postbar));
  process.stdout.write(chalk.white("| "));

  if (type === "number") {
    // Output the raw data value in red if outside the range
    var color = (raw >= this.inputRange[0] && raw <= this.inputRange[1]) ? "white" : "red";

    if (raw > this.inputRange[1]) {
      prepend = "> ";
    }

    if (raw < this.inputRange[0]) {
      prepend = "< ";
    }

    if (this.constrain) {
      raw = constrain(raw, this.inputRange[0], this.inputRange[1]);
    }

    if (this.percent) {
      raw = fmap(raw, this.inputRange[0], this.inputRange[1], 0, 100);
      append = "%";
    }

    if (raw === null) {
      process.stdout.write(chalk.red(prepend + "null" + append));
    } else {
      process.stdout.write(chalk[color](prepend + String(raw.toFixed(this.precision)) + append));
    }
  }

  // Move the cursor to its previous position and make it visible again
  // process.stdout.write("\033["+position.row+";"+position.column+"H\033[?25h");
  if (!this.inline) process.stdout.write("\033[?25h");
};

Barcli.prototype.set = Barcli.prototype.update;

var clearScreen = function() {

  // Clear the console and hide the cursor
  process.stdout.write("\033[2J");

  // Redraw on resize event
  process.stdout.on('resize', function() {
    resize();
  });

}

var resize = function() {

  windowWidth = process.stdout.columns || 80;
  
  // Update our labels so the formatting is consistent
  barclis.forEach(function(barcli, index) {

    // Make sure the labels are laft padded with spaces
    while (barcli.label.length < maxLabelLength) {
      barcli.label = " " + barcli.label;
    }

    barcli.width = windowWidth - maxLabelLength - maxValueLength - 10;
    barcli.update(barcli.data);

    barcli.update(barcli.data);

  });
};

module.exports = Barcli;
