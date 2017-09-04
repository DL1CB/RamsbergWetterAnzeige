
var config = require('./config')
var Wunderground = require('wundergroundnode');
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
  console.log('Ramsberg Wetterstation Anzeigetafel')
});

// The open event is always emitted
port.on('open', function() {
  updateDisplay()
  setInterval(function(){
    updateDisplay()
  },10000)
})


function updateDisplay(){

wunderground.conditions().request('PWS:IPLEINFE4', function(err, response){

  //console.log(response)

    var time = new Date(response.current_observation.local_time_rfc822)
    var hours = time.getHours().toString()
    var minutes= time.getMinutes().toString()
    var wind_degrees = response.current_observation.wind_degrees
    var wind_kph = response.current_observation.wind_kph
    var temp_c = response.current_observation.temp_c
    var pressure_mb = response.current_observation.pressure_mb

    // correct Hours to 2 characters
    if(hours.length < 2){
      hours = '0'+hours
    }

    // correct minutes to 2 characters
    if(minutes.length < 2){
      minutes = '0'+minutes
    }



    // Beaufor conversion
    // each array element is the max windspeed in kmh for that beaufort
    // number (starting with 1)
    // http://about.metservice.com/assets/downloads/learning/winds_poster_web.pdf

    var kmhLimits = [1,6,11,19,30,39,50,61,74,87,102,117,177,249,332,418,512];

    if(wind_kph < 0 || wind_kph == undefined) return 0;

    var wind_beaufort = kmhLimits.reduce(function(previousValue, currentValue, index, array) {
      return previousValue + (wind_kph > currentValue ? 1 : 0);
    },0);

    wind_beaufort = wind_beaufort.toString()

    if(wind_beaufort.length < 2){
      wind_beaufort = '0'+wind_beaufort
    }



    // correct wind to round value, e.g 1.1 -> 1
    //wind_kph = Math.abs(wind_kph)
    //wind_kph = Math.round(wind_kph)
    //wind_kph =   wind_kph.toString()

    // correct minutes to 2 characters
    //if(wind_kph.length < 2){
    //  wind_kph = '0'+wind_kph
    //}

    // correct wind to temp_c value, e.g 1.1 -> 1
    temp_c = Math.abs(temp_c)
    temp_c = Math.round(temp_c)
    temp_c = temp_c.toString()

    // correct temp_c to 2 characters
    if(temp_c.length < 2){
      temp_c = '0'+temp_c
    }

    // correct wind_degrees
    if(wind_degrees < 0){
        wind_degrees=0
    }

    // convert wind_degrees to string
    var val = Math.floor((wind_degrees / 22.5) + 0.5);
    var arr = ["__N", "NNE", "_NE", "ENE", "__E", "ESE", "_SE", "SSE", "__S", "SSW", "_SW", "WSW", "__W", "WNW", "_NW", "NNW"];
    var wind_dir = arr[(val % 16)];

    console.log('hours \t\t',hours);
    console.log('minutes \t',minutes);
    console.log('wind_dir \t', wind_dir)
    //console.log('wind_kph \t',wind_kph);
    console.log('wind_beaufort \t',wind_beaufort);
    console.log('temp_c \t\t',temp_c);
    console.log('pressure_mb \t',pressure_mb);

    var datastring = hours+minutes+wind_dir+wind_beaufort+temp_c+pressure_mb

    const buf = Buffer.from(datastring+'\r\n', 'ascii');

    console.log('writing ascii',buf.toString('ascii'));

    port.write(buf,'ascii',function(err) {
      if (err) {
        return console.log('Error on write: ', err.message);
      }
    })

  })
}
