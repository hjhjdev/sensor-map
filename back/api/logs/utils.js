const addDays = require('date-fns/addDays');
const parseISO = require('date-fns/parseISO');
const formatISO = require('date-fns/formatISO');
const format = require('date-fns/format');
const differenceInDays = require('date-fns/differenceInDays');
const { Op } = require('sequelize');
const models = require('../../models');

exports.getInputDaysArray = (startDate, endDate) => {
  let daysCount = differenceInDays(parseISO(endDate), parseISO(startDate));
  let daysArray = [];

  for (let i = 0; i < daysCount; i++) {
    daysArray.push({
      addedStartDate: addDays(parseISO(startDate), i),
      addedEndDate: addDays(parseISO(startDate), i + 1),
    })
  }

  return daysArray;
};

exports.getCount = async (deviceId, sensorId, startDate, endDate) => {
  return await models.log.count({
    where: {
      deviceId,
      sensorId,
      createdAt: {
        [Op.gt]: startDate,
        [Op.lt]: endDate
      }
    },
    raw: true
  })
};

exports.createSheet = (workbook, startDate) => {
  // create filename to creation date  
  const fileName = formatISO(startDate, { representation: 'date' })
  workbook.addWorksheet(fileName, { properties: { defaultColWidth: 15 } });
  workbook.getWorksheet(fileName);

  let worksheet = workbook.getWorksheet(fileName);

  // set column to add rows by returned json key
  worksheet.columns = [
    { header: 'created_at', key: 'createdAt', width: 20},
    { header: 'device_name', key: 'device.name', width: 15 },
    { header: 'sensor_name', key: 'sensor.name', width: 15 },
    { header: 'measure_mode', key: 'measureMode', width: 15 },
    { header: 'measure_value', key: 'measureModeValue', width: 15 },
    { header: 'warn_level', key: 'measureModeWarnLevel', width: 15 },
    { header: 'device_id', key: 'deviceId', width: 15 },
    { header: 'sensor_id', key: 'sensorId', width: 15 }
  ];

  return worksheet;
};

exports.getDataByDate = async (workbook, deviceId, sensorId, startDate, endDate) => {
  let worksheet = exports.createSheet(workbook, startDate);
  // get count of date range
  const count = await exports.getCount(deviceId, sensorId, startDate, endDate);
  // get offset value using count
  const splitMax = Math.ceil(count / 1000);
  let workArray = [];

  console.log('c: ' + count + ' m: ' + splitMax);

  let adder = exports.rowAdder(splitMax, worksheet);

  for (let i = 0; i < splitMax; i++) {
    workArray.push(exports.saveRows(adder, i, deviceId, sensorId, startDate, endDate, i * 1000));
  }

  await Promise.all(workArray);
  console.log('finished workArray');
};

exports.rowAdder = (splitMax, worksheet) => {
  let arr = new Array(splitMax);
  let commitIndex = 0;

  return function (newData, index) {
    // save data to array
    arr[index] = newData;

    // check array element with commitIndex is not undefined;
    // if not undefined, means we can commit data
    if (arr[commitIndex] !== undefined) {
      // increase commitIndex until data empty
      while(arr[commitIndex] != undefined) {
        for (let i = 0; i < arr[commitIndex].length; i++) {
          arr[commitIndex][i].createdAt = format(arr[commitIndex][i].createdAt, 'yyyy-MM-dd HH:mm:ss');
          worksheet.addRow(arr[commitIndex][i]).commit();
        }
        commitIndex++;
      }
    }
  }
};

exports.saveRows = async (adder, index, deviceId, sensorId, startDate, endDate, offset) => {
  await models.log.findAll({
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
    raw: true,
    offset: offset,
    limit: 1000
  }).then((res) => {
    adder(res, index);
  });
}
  