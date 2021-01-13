const Router = require('koa-router');

const devices = new Router();
const devicesControl = require('./controller');

// status 200 method
devices.get('/', devicesControl.getAll);
devices.post('/', devicesControl.createOne);
devices.delete('/:deviceId', devicesControl.deleteOne);
devices.patch('/:deviceId', devicesControl.update);

// status 405 method
devices.put('/', devicesControl.replace);

module.exports = devices;
