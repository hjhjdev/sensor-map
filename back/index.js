require('dotenv').config();

const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');

const app = new Koa();
const router = new Router();
const api = require('./api');
const jwt = require('koa-jwt');

const db = require('./models');
db.sequelize.sync();

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`sensor-map backend at port ${port}`);
});

app.use(bodyParser());
app.use(cors({
  credentials: true
}));

// jwt authentication
const key = process.env.JWT_SECRET_KEY;

app.use(jwt({
  secret: key, cookie: 'user',
}).unless({
  path: [/(\/api\/auths\/login)(\/api\/logs)/],
  method: 'POST',
}));

// socket.io
const io = require('socket.io').listen(server);
const deviceHandler = require('./stream/device');

app.use(async (ctx, next) => {
  ctx.io = io;
  await next();
});

router.use('/api', api.routes());
app.use(router.routes()).use(router.allowedMethods());


io.on('connection', async (socket) => {
  console.log("user connected " + socket.id);

  socket.on('disconnect', () => {
      console.log('user disconnected' + socket.id);
  });
});

// for frontend
const alert = io.of('/stream/alert');
const log = io.of('/stream/log');
const map = io.of('/stream/map');

// for logging device
const device = io.of('/stream/device');

let alertNumber = 0;
let logNumber = 0;
let mapNumber = 0;
let deviceNumber = 0;

alert.on('connection', async (socket) => {
  console.log("alert receiver connected to room " + socket.handshake.query.userId);
  console.log("alert receiver connected count: ", ++alertNumber);
  // let client join the room by userId
  await socket.join(socket.handshake.query.userId)

  socket.on('disconnect', () => {
    console.log('alert receiver disconnected from room ' + socket.handshake.query.userId);
    console.log("alert receiver connected count: ", --alertNumber);
  });
});

log.on('connection', async (socket) => {
  console.log("log stream receiver connected to room " + socket.handshake.query.deviceId)
  console.log("log receiver connected count: ", ++logNumber);
  // let client join the room by deviceId
  await socket.join(socket.handshake.query.deviceId);

  socket.on('disconnect', () => {
    console.log('log receiver disconnected from room ' + socket.handshake.query.deviceId);
    console.log("log receiver connected count: ", --logNumber);
  });
});

map.on('connection', async (socket) => {
  console.log("map stream receiver connected to room " + socket.handshake.query.userId);
  console.log("map receiver connected count: ", ++mapNumber);
  // let client join the room by userId
  await socket.join(socket.handshake.query.userId);

  socket.on('disconnect', () => {
    console.log('map receiver disconnected from room ' + socket.handshake.query.userId);
    console.log("map receiver connected count: ", --mapNumber);
  });
});


device.on('connection', async (socket) => {
  console.log('device, log sender connect request from device' + socket.handshake.query.macAddress);
  console.log("device, log sender connected count: ", ++deviceNumber);

  await deviceHandler.join({ socket, io });

  socket.on('newData', (data) => {
    deviceHandler.create({ data, io })
  })

  socket.on('disconnect', () => {
    console.log('device, log sender disconnected from room ' + socket.handshake.query.macAddress);
    console.log("device, log sender connected count: ", --deviceNumber);
  });
});
