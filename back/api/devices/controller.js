const models = require('../../models');
const jwt = require('jsonwebtoken');

exports.getAll = async (ctx) => {
  // get userId from cookie
  let { userId, isAdmin } = jwt.decode(ctx.cookies.get('user'));
  console.log('userId: ' + userId + ' isAdmin: ' + isAdmin)
  try {
    // search roles, check isAdmin
    if (isAdmin) {
      // load every device if user is Admin
      await models.device.findAll().then((res) => {
        ctx.body = res;
      }).catch((err) => {
        ctx.body = err;
      });
    } else {
      let devices = [];
      // search device from role table
      await models.role.findAll({
        where: {
          userId: userId
        }
      }).then((res) => {
        for (let i = 0; i < res.length; i++) {
          devices.push(res[i].deviceId);
        }
      })

      // return devices based on role
      await models.device.findAll({
        where: {
          deviceId: devices
        }
      }).then((res) => {
        ctx.body = res;
      })
    }
  } catch (err) {
    console.log(err)
    ctx.body = err;
    ctx.status = 500;
  }
};

exports.createOne = async (ctx) => {
  const {
    name,
    macAddress,
    companyName,
    chargeName,
    chargePhone,
    latitude,
    longitude,
    measureMode,
    sensorOneId,
    sensorTwoId,
    sensorThreeId,
    analogNormal,
    analogWarning,
    analogDanger,
    analogOutlier,
  } = ctx.request.body;

  try {
    await models.device.create({
      name,
      macAddress,
      companyName,
      chargeName,
      chargePhone,
      latitude,
      longitude,
      measureMode,
      sensorOneId,
      sensorTwoId,
      sensorThreeId,
      analogNormal,
      analogWarning,
      analogDanger,
      analogOutlier,
    }).then((res) => {
      ctx.status = 201;
      ctx.body = res;
    })
  } catch (err) {
    ctx.status = 400;
    ctx.body = err;
  }
};

exports.deleteOne = async (ctx) => {
  const { deviceId } = ctx.params;

  try {
    // delete role due to constraints
    await models.role.destroy({
      where: {
        deviceId: deviceId
      }
    })

    // delete log due to constraints
    await models.log.destroy({
      where: {
        deviceId: deviceId
      }
    })

    await models.device.destroy({
      where: {
        deviceId: deviceId
      }
    })

    ctx.status = 200;
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      ctx.status = 409;
    } else {
      ctx.status = 500;
    }
  };
};

exports.update = async (ctx) => {
  const { deviceId } = ctx.params;

  try {
    await models.device.update(
      ctx.request.body, {
        where: {
          deviceId
        }
      }
    ).then((res) => {
      ctx.body = res;
    })
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      ctx.status = 409;
    } else {
      ctx.status = 500;
    }
  }
  
};

exports.replace = async (ctx) => {
  ctx.status = 405;
};
