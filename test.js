
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
  const timea = Buffer.from('1', 'ascii');
  const colon = Buffer.from([0x9F]);
  const timeb = Buffer.from('231', 'ascii');

  const temp = Buffer.from('18°C', 'ascii');
  const press = Buffer.from('1020', 'ascii');
  const water = Buffer.from('16°C', 'ascii');
  const wind = Buffer.from(' 1', 'ascii');
  const pegel = Buffer.from('    ', 'ascii');
  const dir = Buffer.from('NO', 'ascii');
  const end = Buffer.from([0x3]);

  const buf = Buffer.concat([start,timea,colon,timeb,temp,press,water,wind,pegel,dir,end]);

  console.log('writing ascii',buf);

  port.write(buf,'ascii',function(err) {
    if (err) {
      return console.log('Error on write: ', err.message);
    }
    setTimeout(function(){},3000)
  })

})
