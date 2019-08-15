// Author: Chris Bentley DL1C(at)DARC.DE +49 173 7070 2569
var config = require('./config')
var scrape = require('html-scrape');
var asciitable = require('asciitable');
var request = require('request');

console.log('Ramsberg Wetter Anzeige')

var SerialPort = require('serialport');
var port = new SerialPort(config.serialport, { autoOpen: true ,baudRate:19200});

weatherdata =  {
    hours : '00',
    minutes : '00',
    wind_dir : ' N',
    wind_beaufort : '00',
    temp_c : '00',
    pressure_mb : '0000',
    wasser_c : '00',
    wasser_nn : '0000'
}

function printweather(weatherdata){

    console.log(asciitable([

        {name:'hours',value:weatherdata.hours},
        {name:'minutes',value:weatherdata.minutes},
        {name:'wind_dir',value:weatherdata.wind_dir},
        {name:'wind_beaufort',value:weatherdata.wind_beaufort},
        {name:'temp_c',value:weatherdata.temp_c},
        {name:'pressure_mb',value:weatherdata.pressure_mb},
        {name:'wasser_c',value:weatherdata.wasser_c},
        {name:'wasser_nn',value:weatherdata.wasser_nn}

    ]))

}  

function getCurrentTime(weatherdata){

    var currentTime = new Date()
  
    hours   = currentTime.getHours().toString()
    minutes = currentTime.getMinutes().toString()
  
    // correct hours to 2 chracters
    if(hours.length < 2 ){
        hours = '0'+hours
    }

    // correct minutes to 2 characters
    if(minutes.length < 2){
        minutes = '0'+minutes
    }
    
    weatherdata.hours = hours
    weatherdata.minutes = minutes

}

function getWasser_c(weatherdata) {

    scrape ('https://www.gkd.bayern.de/de/seen/wassertemperatur/kelheim/brombachsee-vorsperre-24214445/messwerte', 
  
    { value: { el: 'td.center:first' }}, 
    
    function (error, data) {
      if (error) {
        console.log(error);
      } else {
  
        if(data && data.value){ 
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


          //console.log('wasser_c',wasser_c)
          weatherdata.wasser_c = wasser_c

        }
  


      }
    });
  
  }
  
  
function getWasser_nn(weatherdata) {
  
    scrape ('https://www.gkd.bayern.de/de/fluesse/wasserstand/kelheim/brombachsee-24214456/messwerte', 
  
    { value: { el: 'td.center:first' }},
    
    function (error, data) {
  
    if (error) {
          console.log(error);
      } else {
        if(data && data-value) {
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
      
            //console.log('wasser_nn',wasser_nn)
            weatherdata.wasser_nn = wasser_nn
        }
      }
    });
}

function getWunderground(weatherdata){

  var url = 'http://api.weather.com/v2/pws/observations/current?stationId=IPLEINFE4&format=json&units=m&apiKey=876777051d264fe8a777051d263fe850'

  request(url, function (error, response, body) {
    var json = false;
    if (!error && response.statusCode === 200) {
        error = false;
        try {

          json = JSON.parse(body);

          observation = json.observations[0]

          wind_degrees = observation.winddir
          wind_kph = observation.metric.windSpeed
          temp_c = observation.metric.temp
          pressure_mb = String(observation.metric.pressure).substr(0,4)

          
          if(wind_degrees < 0){
            wind_degrees=0
          }
  
          // convert wind_degrees to string
          var val = Math.floor((wind_degrees / 22.5) + 0.5);
          var arr = [" N", "NE", "NE", "NE", " E", "SE", "SE", "SE", " S", "SW", "SW", "SW", " W", "NW", "NW", "NW"];
          wind_dir = arr[(val % 16)];
    
          weatherdata.wind_dir = wind_dir
      
          
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

          weatherdata.wind_beaufort = wind_beaufort

          // correct wind to temp_c value, e.g 1.1 -> 1
          temp_c = Math.abs(temp_c)
          temp_c = Math.round(temp_c)
          temp_c = temp_c.toString()
          temp_c = temp_c.substr(0,2)
    
          // correct temp_c to 2 characters
          if(temp_c.length < 2){
            temp_c = ' '+temp_c
          }

          weatherdata.temp_c = temp_c
          weatherdata.pressure_mb = pressure_mb
      
        } catch (err) {
            console.error('Exception caught in JSON.parse', body);
            console.log(err)
            error = err;
        }
    } // if 
  }) // funtion
} // wunder


function updateDisplay(weatherdata){

    const start = Buffer.from([0x2]);
    const timea = Buffer.from(weatherdata.hours+weatherdata.minutes, 'ascii');
    const temp  = Buffer.from(weatherdata.temp_c+'°C', 'ascii');
    const press = Buffer.from(weatherdata.pressure_mb, 'ascii');
    const water = Buffer.from(weatherdata.wasser_c+'°C', 'ascii');
    const wind  = Buffer.from(weatherdata.wind_beaufort, 'ascii');
    const pegel = Buffer.from(weatherdata.wasser_nn, 'ascii');
    const dir   = Buffer.from(weatherdata.wind_dir, 'ascii');
    const end   = Buffer.from([0x3]);
  
    const buf = Buffer.concat([start,timea,temp,press,water,wind,pegel,dir,end]);
  
    //console.log('-- Writing Data to Display:', buf.length)  
    //console.log(buf.toString())
  
    if(typeof(port) != 'undefined'){
      port.write(buf,'ascii',function(err) { 
        if (err) {
          console.log('Error on write: ', err.message);
        }
      })
    }
  
  }

getCurrentTime(weatherdata)
getWasser_c(weatherdata)
getWasser_nn(weatherdata)
getWunderground(weatherdata)
printweather(weatherdata)

// Get Current Time and Update Display every 10 seconds

setInterval(function(){
  getCurrentTime(weatherdata)
  printweather(weatherdata)
  updateDisplay(weatherdata)
},10000)

// Get Current Weather and Update Display every 3 minutes
setInterval(function(){
    getWunderground(weatherdata)
},180000)

// Get Current Weather and Update Display every 30 minutes
setInterval(function(){
   getWasser_c(weatherdata)
    getWasser_nn(weatherdata)
},1800000)

