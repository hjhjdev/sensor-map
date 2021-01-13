const Router = require('koa-router');

const sensors = new Router();
const devicesControl = require('./controller');

// status 200 method
sensors.get('/', devicesControl.getAll);
sensors.post('/', devicesControl.createOne);
sensors.delete('/:sensorId', devicesControl.deleteOne);
sensors.patch('/:sensorId', devicesControl.update);

// status 405 method
sensors.put('/', devicesControl.replace);

module.exports = sensors;
