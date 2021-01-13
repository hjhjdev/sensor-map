const Router = require('koa-router');

const api = new Router();

// non-auth routes
const auths = require('./auths');
// auth routes
const devices = require('./devices');
const logs = require('./logs');
const user = require('./users');
const sensor = require('./sensors');
const role = require('./roles')

// non-auth routes
api.use('/auths', auths.routes());
// auth routes
api.use('/devices', devices.routes());
api.use('/logs', logs.routes());
api.use('/users', user.routes());
api.use('/sensors', sensor.routes());
api.use('/roles', role.routes());

module.exports = api;
