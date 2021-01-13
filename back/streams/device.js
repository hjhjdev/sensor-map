const models = require('../models');
const { Op } = require('sequelize');
const addMinutes = require('date-fns/addMinutes');
const { Sequelize } = require('../models');

exports.join = async (socket) => {
  try {
    await models.device.findOne({
      where: {
        macAddress: socket.handshake.query.macAddress
      }
    }).then((res) => {
      if (!res) {
        throw Error('no device');
      } else {
        // let client join the room by deviceId
        socket.join(res.deviceId);
        console.log("device, log sender connected to room " + res.deviceId);
      }
    });
  } catch (err) {
    return err;
  }
}

// receive data from device
// device alrea
exports.create = async ({ data, io }) => {
  const {
    macAddress,
    sensorId,
    value,
    createdAt
  } = data;

  // search device and save deviceId
  let device;
  let isAnalog;

  try {
    await models.device.findOne({
      where: {
        macAddress: macAddress
      }
    }).then((res) => {
      if (!res) {
        throw Error('no device');
      } else {
        device = res;
      }
    });

    await models.sensor.findOne({
      where: {
        sensorId: sensorId
      }
    }).then((sensor) => {
      if (!sensor) {
        throw Error('no sensor in table');
      } else if (![device.sensorOneId, device.sensorTwoId, device.sensorThreeId].includes(sensorId)) {
        throw Error('non-device sensor');
      } else {
        // check device 
        isAnalog = sensor.isAnalog;
      }
    })
  } catch (err) {
    return;
  }

  // set search date
  let interval;

  switch (device.measureMode) {
    case 'ST':
      interval = -15;
      break;
    case 'TW':
      interval = -60 * 8;
      break;
    case 'CE':
      interval = 0;
      break;
  }

  // get log average and count without new value
  let searchStart = addMinutes(new Date(createdAt), interval);
  let logAverage, logCount;

  await models.log.findOne({
    raw: true,
    where: {
      deviceId: device.deviceId,
      sensorId: sensorId,
      createdAt: {
        [Op.gte]: searchStart,
        [Op.lte]: createdAt
      },
    },
    attributes: [
      [Sequelize.fn('AVG', Sequelize.col('value')), 'logAverage'],
      [Sequelize.fn('COUNT', Sequelize.col('logId')), 'logCount'],
    ]
  })
  .then((res) => {
    logAverage = res.logAverage;
    logCount = res.logCount;
  })
  .catch((err) => {
    console.log(err);
  });

  // logCount can be 0 if database is empty,
  if (logCount === 0 || device.measureMode === 'CE') {
    // set lovAverage and createdAt  same as request body
    logAverage = value;
  } else {
    // calculate logAverage again with new value from request body
    logAverage = (logAverage * logCount + value) / (logCount + 1);
  }

  // check value >= outlier first
  // doesn't matter whether measureMode is not CE
  let checkWarnLevel;

  if (value >= device.analogOutlier) {
    checkWarnLevel = 3;
  } else if (logAverage >= device.analogDanger) {
    checkWarnLevel = 2;
  } else if (logAverage >= device.analogWarning) {
    checkWarnLevel = 1;
  } else {
    checkWarnLevel = 0;
  }
  
  // insert into log table
  let resultLogId;

  try {
    await models.log.create({
      deviceId: device.deviceId,
      sensorId: sensorId,
      value: value,
      measureMode: device.measureMode,
      measureModeValue: logAverage,
      measureModeWarnLevel: isAnalog ? checkWarnLevel : -1,
      createdAt: createdAt
    })
    .then((res) => {
      resultLogId = res.logId;
    })
  } catch (err) {
    // catch if error, no need to do further things
    // so return early
    console.log(err.message);
    return;
  }

  // search socket room userId
  let registeredUsers = [];
  let adminUsers = [];

  await models.role.findAll({
    where: {
      deviceId: device.deviceId
    }
  })
  .then((res) => {
    for (let i = 0; i < res.length; i++) {
      registeredUsers.push(res[i].userId);
    }
  })
  .catch((err) => {
    console.log(err);
  });

  // search admin users
  await models.user.findAll({
    where: {
      isAdmin: true
    }
  })
  .then((res) => {
    for (let i = 0; i < res.length; i++) {
      adminUsers.push(res[i].userId);
    }
  })
  .catch((err) => {
    console.log(err);
  });
  
  // send result to socket
  await models.log.findOne({
    include: [{
      model: models.device,
      attributes: ['deviceId', 'name']
    }, {
      model: models.sensor,
      attributes: ['sensorId', 'name', 'isAnalog']
    }],
    where: {
      logId: resultLogId
    },
    attributes: [
      ['value', 'value'],
      ['measureModeValue', 'measureModeValue'],
      ['measureModeWarnLevel', 'measureModeWarnLevel'],
      ['createdAt', 'createdAt']
    ]
  })
  .then((res) => {
    // emit to device socket stream
    io.of('/streams/log').to(device.deviceId).emit('newData', {
      sensorId: res.sensor.sensorId,
      isAnalog: res.sensor.isAnalog,
      measureModeWarnLevel: res.measureModeWarnLevel,
      measureModeValue: res.measureModeValue,
      createdAt: res.createdAt,
      labels: res.createdAt,
      data: res.value
    });

    // emit analog data to socket streams
    if (res.sensor.isAnalog === true) {
      if (res.measureModeWarnLevel > 0) {
        // emit warnlevel > 0 data to role registered users and admins
        registeredUsers.forEach((userId) => {
          io.of('/streams/alert').to(userId).emit('newAlert', res);
        });
        adminUsers.forEach((userId) => {
          io.of('/streams/alert').to(userId).emit('newAlert', res);
        });
      }
  
      // emit every data to role registered users and admins
      registeredUsers.forEach((userId) => {
        io.of('/streams/map').to(userId).emit('newData', {
          deviceId: res.device.deviceId,
          measureModeValue: res.measureModeValue,
          measureModeWarnLevel: res.measureModeWarnLevel
        });
      });
      adminUsers.forEach((userId) => {
        io.of('/streams/map').to(userId).emit('newData', {
          deviceId: res.device.deviceId,
          measureModeValue: res.measureModeValue,
          measureModeWarnLevel: res.measureModeWarnLevel
        });
      });
      
    }
  })
  .catch((err) => {
    console.log(err.message);
  });
};