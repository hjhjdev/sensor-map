const request = require('request');
const io = require('socket.io-client');
let setMilliseconds = require('date-fns/setMilliseconds')
let zonedTimeToUtc = require('date-fns-tz/zonedTimeToUtc');

let devices = [
  { macAddress: 'AAAAAAAAAAAA', sensorId: 1 },
  { macAddress: 'AAAAAAAAAAAA', sensorId: 2 },
  { macAddress: 'AAAAAAAAAAAA', sensorId: 3 },
  { macAddress: 'BBBBBBBBBBBB', sensorId: 1 },
  { macAddress: 'BBBBBBBBBBBB', sensorId: 2 },
  { macAddress: 'BBBBBBBBBBBB', sensorId: 3 },
  { macAddress: 'CCCCCCCCCCCC', sensorId: 4 },
  { macAddress: 'CCCCCCCCCCCC', sensorId: 5 },
  { macAddress: 'CCCCCCCCCCCC', sensorId: 6 }
]

let val2 = 1000
let val = 0
let i = 2
let j = 5
let k = 8

let aa = streamHelper('AAAAAAAAAAAA');
let bb = streamHelper('BBBBBBBBBBBB');
let cc = streamHelper('CCCCCCCCCCCC');

function streamHelper(macAddress) {
  return io(
    'http://127.0.0.1:3000/stream/device', {
      query: {
        macAddress: macAddress
      }
    }
  );
}

async function emitHelper(stream, i, date, val) {
  let request = {
    macAddress: devices[i].macAddress,
    sensorId: devices[i].sensorId,
    createdAt: date,
    value: val
  };

  await stream.emit('newData', request);
}

async function run () {
  let date = zonedTimeToUtc(setMilliseconds(new Date(), 0))

  await emitHelper(aa, i, date, val2 * (i + 1));
  await emitHelper(aa, i - 1, date, val2 * (i + 1));
  await emitHelper(aa, i - 2, date, val2 * (i + 1));
  console.log(devices[i].macAddress + " : " + devices[i].sensorId + " : "+ val2 * (i + 1))
  console.log(devices[i - 1].macAddress + " : " + devices[i - 1].sensorId + " : "+ val2 * (i + 1))
  console.log(devices[i - 2].macAddress + " : " + devices[i - 2].sensorId + " : "+ val2 * (i + 1))
  
  await emitHelper(bb, j, date, val * (j + 1));
  await emitHelper(bb, j - 1, date, val * (j + 1));
  await emitHelper(bb, j - 2, date, val * (j + 1));
  console.log(devices[j].macAddress + " : " + devices[j].sensorId + " : "+ val * (j + 1))
  console.log(devices[j - 1].macAddress + " : " + devices[j - 1].sensorId + " : "+ val * (j + 1))
  console.log(devices[j - 2].macAddress + " : " + devices[j - 2].sensorId + " : "+ val * (j + 1))

  await emitHelper(cc, k, date, val * (k + 1));
  await emitHelper(cc, k - 1, date, val * (k + 1));
  await emitHelper(cc, k - 2, date, val * (k + 1));
  console.log(devices[k].macAddress + " : " + devices[k].sensorId + " : "+ val * (k + 1))
  console.log(devices[k - 1].macAddress + " : " + devices[k - 1].sensorId + " : "+ val * (k + 1))
  console.log(devices[k - 2].macAddress + " : " + devices[k - 2].sensorId + " : "+ val * (k + 1))

  if (val === 1000)
    val = 0;
  else
    val += 100;

  if (val2 === 0)
    val2 = 1000;
  else
    val2 -= 100;
    
  console.log("sent")
}

setInterval(run, 1000);
