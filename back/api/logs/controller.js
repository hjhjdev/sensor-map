const { IndexHints, Op, Sequelize } = require('sequelize');
const addMinutes = require('date-fns/addMinutes');
const addSeconds = require('date-fns/addSeconds');
const utils = require('./utils');
const models = require('../../models');
const jwt = require('jsonwebtoken');
const excel = require('exceljs');
const passThrough = require('stream').PassThrough;

exports.getEntries = async (ctx) => {
  const { deviceId, sensorId, startDate, endDate, offset } = ctx.request.query;

  let query = {
    include: [{
      model: models.device,
      attributes: ['name'],
      required: true
    },{
      model: models.sensor,
      attributes: ['name'],
      required: true
    }],
    where: {
      deviceId,
      sensorId,
      createdAt: {
        [Op.gt]: startDate,
        [Op.lt]: endDate
      }
    },
    offset: offset === undefined ? 0 : parseInt(offset, 10),
    limit: 30
  }

  try {
    await models.log.findAndCountAll(query).then((log) => {
      ctx.body = log;
    })
  } catch (err) {
    ctx.status = 500;
    ctx.body = err;
  }
};

exports.getBlobs = async (ctx) => {
  const excelStream = new passThrough;
  const { deviceId, sensorId, startDate, endDate } = ctx.request.query;
  const daysArray = utils.getInputDaysArray(startDate, endDate); 

  ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  ctx.attachment("report.xlsx");

  // construct a streaming XLSX workbook writer with styles and shared strings
  let workbook = new excel.stream.xlsx.WorkbookWriter({
    stream: excelStream
  });

  // seperate database select by single date
  let promises = daysArray.map(item => 
    utils.getDataByDate(workbook, deviceId, sensorId, item.addedStartDate, item.addedEndDate));

  await Promise.all(promises).then(() => {
    workbook.commit();
    console.log('done');
  });

  ctx.body = excelStream;
};

exports.getEntriesByDeviceId = async (ctx) => {
  const { deviceId } = ctx.params;
  const sensorIds = [];
  const response = [];
  
  // find device
  await models.device.findOne({
    where: {
      deviceId,
    }
  }).then((res) => {
      // save sensorIds
      sensorIds[0] = res.sensorOneId;
      sensorIds[1] = res.sensorTwoId;
      sensorIds[2] = res.sensorThreeId;
    })
    .catch((err) => {
      ctx.status = 400;
      ctx.body = err;
      console.log(err);
    });

  // set search date
  const searchEnd = new Date();
  const searchStart = addSeconds(searchEnd, -130);
  let searchResult = [];

  // find logs per sensorIds
  for (let i = 0; i < 3; i++) {
    await models.log.findAll({
      where: {
        deviceId,
        sensorId: sensorIds[i],
        createdAt: {
          [Op.gte]: searchStart,
          [Op.lte]: searchEnd
        }
      },
      attributes: [
        'logId',
        'sensorId',
        'value',
        'createdAt',
        'measureModeValue'
      ],
      order: [['logId', 'ASC']],
    })
      .then((res) => {
        // check log doesn't exist; exclude when returns null
        if (res != null) {
          searchResult = {
            // always add sensorId for front's partial chart update
            sensorId: sensorIds[i],
            createdAt: res.map((d) => d.createdAt),
            measureModeValue: res.map((d) => d.measureModeValue),
            labels: res.map((d) => d.createdAt),
            data: res.map((d) => d.value),
            count: res.length
          };
        }
        response.push(searchResult);
        searchResult = [];
      })
      .catch((err) => {
        ctx.status = 400;
        ctx.body = err;
        console.log(err);
      });
  }

  ctx.body = response;
};

exports.getAvg = async (ctx) => {
  const { deviceId, sensorId, measureMode } = ctx.request.query;

  // set interval by measuremode
  let interval;

  switch (measureMode) {
    case 'ST':
      interval = -15;
      break;
    case 'TW':
      interval = -60 * 8;
      break;
    default:
      ctx.status = 400;
      return;
  }

  // set search date
  const searchEnd = new Date();
  const searchStart = addMinutes(searchEnd, interval);

  await models.log.findOne({
    where: {
      deviceId,
      sensorId,
      createdAt: {
        [Op.gte]: searchStart,
        [Op.lte]: searchEnd
      },
    },
    attributes: [
      Sequelize.fn('AVG', Sequelize.col('value')),
      'createdAt'
    ],
  })
    .then((log) => {
      ctx.body = log;
    })
    .catch((err) => {
      ctx.status = 400;
      ctx.body = err;
      console.log(err);
    });
};

exports.getLastEntries = async (ctx) => {
  let devices = [];
  const entries = [];
  // get device list
  await models.device.findAll()
    .then((res) => {
      devices = res;
    })
    .catch((err) => {
      ctx.status = 400;
      ctx.body = err;
      console.log(err);
    });

  // find latest row of analog sensor per device
  for (let i = 0; i < devices.length; i++) {
    await models.log.findOne({
      where: {
        deviceId: devices[i].deviceId,
        sensorId: devices[i].sensorThreeId
      },
      attributes: [
        ['logId', 'logId'],
        ['deviceId', 'deviceId'],
        ['measureModeWarnLevel', 'measureModeWarnLevel'],
      ],
      order: [['logId', 'DESC']],
    })
      .then((res) => {
        // check log doesn't exist; exclude when returns null
        if (res != null) entries.push(res);
      })
      .catch((err) => {
        ctx.status = 400;
        ctx.body = err;
        console.log(err);
      });
  }

  ctx.body = entries;
};

exports.getAlerts = async (ctx) => {
  // get userId from cookie
  let { userId, isAdmin } = jwt.decode(ctx.cookies.get('user'));
  const { startDate, endDate, cursor } = ctx.request.query;
  let deviceIds = [];

  // find warn and danger filtered logs per device
  if (isAdmin) {
    await models.device.findAll({})
    .then((res) => {
      res.map(x => deviceIds.push(x.deviceId));
    })
    .catch((err) => {
      ctx.status = 500;
      ctx.body = err;
      console.log(err);
    });
  } else {
    await models.role.findAll({
      where: {
        userId: userId
      },
    })
    .then((res) => {
      res.map(x => deviceIds.push(x.deviceId));
    })
    .catch((err) => {
      ctx.status = 500;
      ctx.body = err;
      console.log(err);
    });
  }

  let analogSensorIds = [];

  await models.sensor.findAll({
    where: {
      isAnalog: true,
    },
  })
  .then((res) => {
    res.map(x => analogSensorIds.push(x.sensorId));
  });

  let alertBuilder = {
    indexHints: [
      { type: IndexHints.USE, values: ['logs_sensor_id_device_id_created_at'] }
    ],
    include: [
      {
        model: models.device,
        attributes: ['name']
      },
      {
        model: models.sensor,
        attributes: ['name']
      },
    ],
    where: {
      sensorId: {
        [Op.or]: analogSensorIds
      },
      deviceId: {
        [Op.or]: deviceIds
      },
      createdAt: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
      measureModeWarnLevel: {
        [Op.gte]: 1,
      }
    },
    attributes: [
      'logId',
      'value',
      'measureModeValue',
      'measureModeWarnLevel',
      'createdAt'
    ],
    order: [['logId', 'DESC']]
  }
  
  // check cursor is not undefined
  if (cursor !== undefined) {
    console.log('here: ',  cursor)
    alertBuilder.where.logId = {
      [Op.lt]: cursor
    }
  } else {
    console.log('cursor: undefined')
  }

  try {
    let data;

    await models.log.findAll(alertBuilder)
    .then((item) => {
      data = item;
    })

    alertBuilder.attributes = [[Sequelize.fn('COUNT', Sequelize.col('logId')), 'count']];
    await models.log.findOne(alertBuilder)
    .then(item => item.get({ plain: true }))
    .then((item) => {
      console.log(item)
      ctx.body = { 
        count: item.count,
        data
      }
    })

  } catch (err) {
      ctx.status = 400;
      ctx.body = err;
      console.log(err);
    }
};

exports.deleteByDeviceId = async (ctx) => {
  const {
    deviceId,
  } = ctx.params;

  await models.log.destroy({
    where: {
      deviceId,
    },
  })
    .then((res) => {
      ctx.body = res;
    })
    .catch((err) => {
      ctx.body = err;
    });
};

exports.deleteByDeviceIdAndSensorId = async (ctx) => {
  const {
    deviceId,
    sensorId,
  } = ctx.params;

  await models.log.destroy({
    where: {
      deviceId,
      sensorId,
    },
  })
    .then((res) => {
      ctx.body = res;
    })
    .catch((err) => {
      ctx.body = err;
    });
};

exports.createOne = async (ctx) => {
  ctx.status = 405;
};

exports.deleteOne = async (ctx) => {
  ctx.status = 405;
};

exports.replace = async (ctx) => {
  ctx.status = 405;
};

exports.update = async (ctx) => {
  ctx.status = 405;
};
