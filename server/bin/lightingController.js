const Rx = require('rxjs/Rx');
const config = require('../config');
const fs = require('fs');
const moment = require('moment');
let Gpio;
if (config.prod) {
  Gpio = require('pigpio').Gpio;
} else {
  Gpio = require('../mock/pigpio-mock');
}

red = new Gpio(21, {mode: Gpio.OUTPUT});
green = new Gpio(12, {mode: Gpio.OUTPUT});
blue = new Gpio(16, {mode: Gpio.OUTPUT});
white = new Gpio(18, {mode: Gpio.OUTPUT});

const lightingController = {
  period: 500 /* ms */,
  index: 0,
  steps: [],
  restart: function() {
    if (!this.repeat) {
      this.repeat = Rx.Observable.interval(this.period);
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    // read our CSV file
    fs.readFile(config.profileFile, "utf8", (err, dataFile) => {
      steps = [];
      this.index = undefined;

      const lines = dataFile.split('\n');

      const now = moment();
      const startOfDay = moment().set({
        hour: 0,
        minute: 0, 
        second: 0
      });
      const currentMs = moment.duration(now.diff(startOfDay)).asMilliseconds();
      let previous;
      lines.splice(1, lines.length).forEach((line) => {
        const dataLine = line.split(',');
        const data = {
          time: moment(dataLine[0], 'h:mm:ss'),
          red: parseInt(dataLine[1]),
          green: parseInt(dataLine[2]),
          blue: parseInt(dataLine[3]),
          white: parseInt(dataLine[4])
        }
        if (previous) {
          //seconds between now and the next time
          const startMS = moment.duration(previous.time.diff(startOfDay)).asMilliseconds();
          const totalMs = moment.duration(data.time.diff(previous.time)).asMilliseconds();
          const n = totalMs/this.period;
          const difRed = data.red - previous.red / n;
          const difGreen = data.green - previous.green / n;
          const difBlue = data.blue - previous.blue / n;
          const difWhite = data.white - previous.white / n;

          for (let i = 0; i < n ; i++) {
            const ms = startMS + (this.period * i);
            if (!this.index) { // check if this is the closest index
              if (currentMs < ms) {
                this.index = this.steps.length;
              }
            }
            this.steps.push({
              ms,
              red: previous.red + (difRed * i),
              green: previous.green + (difGreen * i),
              blue: previous.blue + (difBlue * i),
              white: previous.white + (difWhite * i),
            })
          }
        }
        previous = data;
      });

      console.log(this.index, this.steps.length);
      this.subscription = this.repeat.subscribe(
        this.tick,
        this.onFailure,
        this.onComplete);
    });
  },
  tick: function() {
    // set rgb to random
    red.pwmWrite(Math.random()*255);
    green.pwmWrite(Math.random()*255);
    blue.pwmWrite(Math.random()*255);
    white.pwmWrite(Math.random()*255);

    this.index++;
  },  
  onComplete: function(results) {
    console.error("Finished", results);
  },
  onFailure: function(exception) {
    console.error("Error", exception);
  },
}

module.exports = lightingController;