// Author: Chris Bentley DL1C(at)DARC.DE +49 173 7070 2569
var config = require('./config')
var Wunderground = require('wundergroundnode');
var scrape = require('html-scrape');

var elements = {
	title: { start: 'Brombachsee', end: '&nbsp' },
}


// weather station data
var hours = '00'
var minutes= '00'
var wind_degrees = 0
var wind_dir = ' N'
var wind_kph = 0
var wind_beaufort = '0'
var temp_c = 0
var pressure_mb = '0000'
var wasser_c = '    '
var wasser_nn = '  '

var displayInUpdate = false

var wunderground = new Wunderground(config.key);

var SerialPort = require('serialport');


var port = new SerialPort(config.serialport, { autoOpen: false ,baudRate:19200});

// Open errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message);
})

port.open(function (err) {
  if (err) {
    return console.log('Error opening port: ', err.message);
  }
});

// The open event is always emitted
port.on('open', function() {

  console.log('Ramsberg Weather Display Driver')

  getCurrentTime()
  getWaterData()
  getWeatherData()

  // Get Current Time and Update Display every 20 seconds
  setInterval(function(){
    getCurrentTime()
  },11000)

  // Get Current Weather and Update Display every 3 minutes
  setInterval(function(){
    getWeatherData()
  },180000)

  // Get Current Weather and Update Display every 1,5 minutes
  setInterval(function(){
    getWaterData()
  },90000)



})

function getCurrentTime(){

  //var currentTime = new Date('2017-10-09T04:23:45.936Z')
  var currentTime = new Date()

  hours = currentTime.getHours().toString()
  minutes= currentTime.getMinutes().toString()

	// correct hours to 2 chracters
	if(hours.length < 2 ){
  console.log('correct hours',hours.length)
		hours = '0'+hours
	}

	// correct minutes to 2 characters
	if(minutes.length < 2){
		minutes = '0'+minutes
	}

  console.log('-- Updating Time')
  console.log('hours \t\t',hours);
  console.log('minutes \t',minutes);

  updateDisplay()

}


function getWeatherData(){

  wunderground.conditions().request('PWS:IPLEINFE4', function(err, response){

      try {

        wind_degrees = response.current_observation.wind_degrees
        wind_kph = response.current_observation.wind_kph
        temp_c = response.current_observation.temp_c
        pressure_mb = response.current_observation.pressure_mb.substr(0,4)

      } catch (e) {
        console.log(e)
        return
      }


      if(wind_kph < 0 || wind_kph == undefined) return 0;

      // conversion kph to beaufort scale
      var kmhLimits = [1,6,11,19,30,39,50,61,74,87,102,117,177,249,332,418,512];
      wind_beaufort = kmhLimits.reduce(function(previousValue, currentValue, index, array) {
        return previousValue + (wind_kph > currentValue ? 1 : 0);
      },0);

      wind_beaufort = wind_beaufort.toString()


      // correct wind_beaufort to 2 characters
      if(wind_beaufort.length < 2){
        wind_beaufort = ' '+wind_beaufort
      }

      // correct wind to temp_c value, e.g 1.1 -> 1
      temp_c = Math.abs(temp_c)
      temp_c = Math.round(temp_c)
      temp_c = temp_c.toString()
      temp_c = temp_c.substr(0,2)

      // correct temp_c to 2 characters
      if(temp_c.length < 2){
        temp_c = ' '+temp_c
      }


      // correct wind_degrees
      if(wind_degrees < 0){
          wind_degrees=0
      }

      // convert wind_degrees to string
      var val = Math.floor((wind_degrees / 22.5) + 0.5);
      var arr = [" N", "NE", "NE", "NE", " E", "SE", "SE", "SE", " S", "SW", "SW", "SW", " W", "NW", "NW", "NW"];
      wind_dir = arr[(val % 16)];

      console.log('-- Updating Weather Received from wunderground.com:')
      console.log('wind_dir \t', wind_dir)
      console.log('wind_beaufort \t',wind_beaufort);
      console.log('temp_c \t\t',temp_c);
      console.log('pressure_mb \t',pressure_mb);

      updateDisplay()
    })
}

function getWaterData(){

  scrape ('http://www.gkd.bayern.de/seen/wassertemperatur/karten/index.php?thema=gkd&rubrik=seen&produkt=wassertemperatur&gknr=0', elements, function (error, data) {
  	if (error) {
  		console.log(error);
  	} else {

      wasser_c = Number(data.title.substring(data.title.lastIndexOf('>')+1).replace(',','.'))

      wasser_c = Math.abs(wasser_c)
      wasser_c = Math.round(wasser_c)
      wasser_c = wasser_c.toString()
      wasser_c = wasser_c.substr(0,2)

      // correct temp_c to 2 characters
      if(wasser_c.length < 2){
        wasser_c = ' '+wasser_c
      }

      console.log('wasser_c',wasser_c)



  	}
  });

  scrape ('http://www.gkd.bayern.de/seen/wasserstand/karten/index.php?thema=gkd&rubrik=seen&produkt=wasserstand&gknr=0', elements, function (error, data) {
  	if (error) {
  		console.log(error);
  	} else {

      wasser_nn = Number(data.title.substring(data.title.lastIndexOf('>')+1).replace(',','.'))

      wasser_nn = Math.abs(wasser_nn)
      wasser_nn = Math.round(wasser_nn)
      wasser_nn = wasser_nn.toString()
      wasser_nn = wasser_nn.substr(0,3)

      if(wasser_nn.length < 2){
        wasser_nn = '   '+wasser_nn
      }

      if(wasser_nn.length < 3){
        wasser_nn = '  '+wasser_nn
      }

      if(wasser_nn.length < 4){
        wasser_nn = ' '+wasser_nn
      }

      updateDisplay()

      console.log('wasser_nn',wasser_nn)
  	}
  });



}

function updateDisplay(){

    if(displayInUpdate == true){ return }

    displayInUpdate = true

    const start = Buffer.from([0x2]);
    const timea = Buffer.from(hours+minutes, 'ascii');
    const temp = Buffer.from(temp_c+'°C', 'ascii');
    const press = Buffer.from(pressure_mb, 'ascii');
    const water = Buffer.from(wasser_c+'°C', 'ascii');
    const wind = Buffer.from(wind_beaufort, 'ascii');
    const pegel = Buffer.from(wasser_nn, 'ascii');
    const dir = Buffer.from(wind_dir, 'ascii');
    const end = Buffer.from([0x3]);

    const buf = Buffer.concat([start,timea,temp,press,water,wind,pegel,dir,end]);

    console.log('-- Writing Data to Display:', buf.length)
    console.log(buf.toString())

    port.write(buf,'ascii',function(err) {
      if (err) {
        return console.log('Error on write: ', err.message);
      }

      displayInUpdate = false

    })


}
