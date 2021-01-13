const Router = require('koa-router');

const logs = new Router();
const logsControl = require('./controller');

// status 200 method
logs.get('/', logsControl.getEntries);
logs.get('/blobs', logsControl.getBlobs);
logs.get('/device/:deviceId', logsControl.getEntriesByDeviceId);
logs.get('/lastentry', logsControl.getLastEntries);
logs.get('/alerts', logsControl.getAlerts);
logs.delete('/device/:deviceId', logsControl.deleteByDeviceId);
logs.delete('/device/:deviceId/sensor/:sensorId', logsControl.deleteByDeviceIdAndSensorId);

// status 405 method
logs.post('/', logsControl.createOne);
logs.delete('/', logsControl.deleteOne);
logs.put('/', logsControl.replace);
logs.patch('/', logsControl.update);

module.exports = logs;
