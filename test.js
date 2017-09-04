
var config = require('./config')

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
  console.log('Ramsberg Wetterstation Anzeigetafel Test')
});

// The open event is always emitted
port.on('open', function() {

  const start = Buffer.from([0x2]);
  const time = Buffer.from('1234', 'ascii');
  const temp = Buffer.from('18', 'ascii');
  const press = Buffer.from('1020', 'ascii');
  const water = Buffer.from('16', 'ascii');
  const wind = Buffer.from('12', 'ascii');
  const pegel = Buffer.from('5432', 'ascii');
  const dir = Buffer.from('NO', 'ascii');
  const end = Buffer.from([0x3]);


  const buf = Buffer.concat([start,time,temp,press,water,wind,pegel,dir,end]);

  console.log('writing ascii',buf);

  port.write(buf,'ascii',function(err) {
    if (err) {
      return console.log('Error on write: ', err.message);
    }
  })

})
