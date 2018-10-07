/*
IT Contact at GDE
Hr Kraus 273, 0821 9071 5959 EDV Abtilung
*/

// Author: Chris Bentley DL1C(at)DARC.DE +49 173 7070 2569
var config = require('./config')
var scrape = require('html-scrape');  

// weather station data
var hours = '00'
var minutes= '00'
var wind_degrees = 0
var wind_dir = ' N'
var wind_kph = 0
var wind_beaufort = '00'
var temp_c = '00'
var pressure_mb = '0000'
var wasser_c = '00'
var wasser_nn = '0000'

var preventUpdate = false
var preventScrapetemp_c = false
var preventScrapewasser_c = false
var preventScrapewasser_nn = false
var preventScrapepressure_mb = false
var preventScrapewebcam = false

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

}

function scrapetemp_c() {

  if ( preventScrapetemp_c ) {
    console.log('preventScrapetemp_c',preventScrapetemp_c)
    return
  } 

  preventScrapetemp_c = true

  scrape ('https://www.gkd.bayern.de/de/meteo/lufttemperatur/kelheim/obersteinbach-200055/messwerte',
  
  { value: { el: 'td.center:first' }},
  
  function (error, data) {
    
    if (error) {
    
      console.log(error);
      preventScrapetemp_c = false
    
    } else {

      temp_c = data.value
      temp_c   = temp_c.replace(',','.')
      temp_c = Number(temp_c)

      temp_c = Math.abs(temp_c)
      temp_c = Math.round(temp_c)
      temp_c = temp_c.toString()
      temp_c = temp_c.substr(0,2)

      // correct temp_c to 2 characters
      if(temp_c.length < 2){
        temp_c = ' '+temp_c
      }

      console.log('temp_c',temp_c)
      preventScrapetemp_c = false
  	}
  });

}

function scrapewasser_c() {

  if ( preventScrapewasser_c ) {
    console.log('preventScrapewasser_c',preventScrapewasser_c)
    return
  } 

  preventScrapewasser_c = true

  scrape ('https://www.gkd.bayern.de/de/seen/wassertemperatur/kelheim/brombachsee-vorsperre-24214445/messwerte', 

  { value: { el: 'td.center:first' }}, 
  
  function (error, data) {
    if (error) {
      console.log(error);
      preventScrapewasser_c = false
    } else {

      if(true){ 
        wasser_c = data.value
        wasser_c = wasser_c.replace(',','.')
        wasser_c = Number(wasser_c)

        wasser_c = Math.abs(wasser_c)
        wasser_c = Math.round(wasser_c)
        wasser_c = wasser_c.toString()
        wasser_c = wasser_c.substr(0,2)

        // correct wasser_c to 2 characters
        if(wasser_c.length < 2){
          wasser_c = ' '+wasser_c
        }
      }

      console.log('wasser_c',wasser_c)
      preventScrapewasser_c = false
    }
  });

}


function scrapewasser_nn() {

  if ( preventScrapewasser_nn ) {
    console.log('preventScrapewasser_nn',preventScrapewasser_nn)
    return
  } 

  preventScrapewasser_nn = true

  scrape ('https://www.gkd.bayern.de/de/fluesse/wasserstand/kelheim/brombachsee-24214456/messwerte', 

  { value: { el: 'td.center:first' }},
  
  function (error, data) {

  if (error) {
      
      console.log(error);
      preventScrapewasser_nn = false

    } else {
    
      wasser_nn = data.value
      wasser_nn = wasser_nn.replace(',','.')
      wasser_nn = Number(wasser_nn)
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

      console.log('wasser_nn',wasser_nn)
     
      preventScrapewasser_nn = false

    }
  });
}

function scrapepressure_mb() {

  if ( preventScrapepressure_mb ) {
    console.log('preventScrapepressure_mb',preventScrapepressure_mb)
    return
  } 

  preventScrapepressure_mb = true

  scrape ('https://www.gkd.bayern.de/de/meteo/luftdruck/elbe/roedental-schoenstaedt-speicher-6249/messwerte', 

{ value: { el: 'td.center:first' }},

function (error, data) {

  if (error) {

      console.log(error);
      preventScrapepressure_mb = false

    } else {
  
      pressure_mb = data.value
      pressure_mb = pressure_mb.replace(',','.')
      pressure_mb = Number(pressure_mb)
      pressure_mb = Math.abs(pressure_mb)
      pressure_mb = Math.round(pressure_mb)
      pressure_mb = pressure_mb.toString()
      pressure_mb = pressure_mb.substr(0,3)

      if(pressure_mb.length < 2){
        pressure_mb = '   '+pressure_mb
      }

      if(pressure_mb.length < 3){
        pressure_mb = '  '+pressure_mb
      }

      if(pressure_mb.length < 4){
        pressure_mb = ' '+pressure_mb
      }

      console.log('pressure_mb',pressure_mb)

      preventScrapepressure_mb = false

    }
  });
}

function scrapewebcam() {

  if ( preventScrapewebcam ) {
    console.log('preventScrapewebcam',preventScrapewebcam)
    return
  } 

  preventScrapewebcam = true

  scrape ('https://www.wwa-an.bayern.de/webcam', 

  {  
    windspeed: { el: '#webcamdata > div:nth(4)' },  
    winddirection: { el: '#webcamdata > div:nth(8)' }
  }, 

  function (error, data) {

    if (error) {

      console.log(error);
      preventScrapewebcam = false
    
    } else {
            
      wind_mps = data.windspeed
      
      wind_mps = wind_mps.substr(0,(wind_mps.length-3))

      var kmhLimits = [0.3,1.5,3.3,5.5,7.9,10.7,13.8,17.1,20.7,24.4,28.4,32.6,32.1];
      wind_beaufort = kmhLimits.reduce(function(previousValue, currentValue, index, array) {
        return previousValue + (wind_mps > currentValue ? 1 : 0);
      },0);

      wind_beaufort = Number(wind_beaufort)
      wind_beaufort = Math.abs(wind_beaufort)
      wind_beaufort = Math.round(wind_beaufort)
      wind_beaufort = wind_beaufort.toString()
      wind_beaufort = wind_beaufort.substr(0,3)

      if(wind_beaufort.length < 2){
        wind_beaufort = ' '+wind_beaufort
      }

      console.log('wind_beaufort',wind_beaufort)

      wind_degrees = data.winddirection
        
      wind_degrees = wind_degrees.substr(0,(wind_degrees.length-1))

      wind_degrees = Number(wind_degrees)

      // correct wind_degrees
      if(wind_degrees < 0){
        wind_degrees=0
      }

      // convert wind_degrees to wind_dir
      var val = Math.floor((wind_degrees / 22.5) + 0.5);
      var arr = [" N", "NO", "NO", "NO", " O", "SO", "SO", "SO", " S", "SW", "SW", "SW", " W", "NW", "NW", "NW"];
      wind_dir = arr[(val % 16)];
      
      console.log('wind_dir',wind_dir)

      preventScrapewebcam = false
    }
  });
}


function updateDisplay(){

  console.log('updateDisplay')

  if( preventUpdate ) {   
    console.log('preventUpdate... ',preventUpdate)
    return 
  }

  preventUpdate = true

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

  if(typeof(port) != 'undefined'){
    port.write(buf,'ascii',function(err) { 
      if (err) {
        console.log('Error on write: ', err.message);
      }
    })
  }

  preventUpdate = false

}

function run (){

  console.log('Ramsberg Weather Display Driver')

  // Get Current Time and Update Display every 20 seconds
  setInterval(function(){
    getCurrentTime()
    updateDisplay()
  },20000)

  // Get Current Weather and Update Display every 3 minutes
  setInterval(function(){
    scrapetemp_c()
    scrapewasser_c()
    scrapewasser_nn()
    scrapepressure_mb()
    scrapewebcam()
  },180000)

  getCurrentTime()
  updateDisplay()

  scrapetemp_c()
  scrapewasser_c()
  scrapewasser_nn()
  scrapepressure_mb()
  scrapewebcam()

}


run()

/*
var SerialPort = require('serialport');
var port = new SerialPort(config.serialport, { autoOpen: false ,baudRate:19200});

// Open errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message);
})

// The open event is always emitted
port.on('open', function() {
  console.log('starting...')
  
})

port.open(function (err) {
  if (err) {
    return console.log('Error opening port: ', err.message);
  }
});
*/



