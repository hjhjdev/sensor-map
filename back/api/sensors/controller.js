const models = require('../../models');

exports.getAll = async (ctx) => {
  await models.sensor.findAll()
    .then((res) => {
      ctx.body = res;
    })
    .catch((err) => {
      ctx.body = err;
    });
};

exports.createOne = async (ctx) => {
  const {
    name,
    isAnalog,
  } = ctx.request.body;

  await models.sensor.create({
    name,
    isAnalog,
  })
    .then((res) => {
      ctx.body = res;
    })
    .catch((err) => {
      ctx.status = 400;
      ctx.body = err;
    });
};

exports.deleteOne = async (ctx) => {
  const { sensorId } = ctx.params;

  try {
    await models.sensor.destroy({
      where: {
        sensorId: sensorId
      }
    })

    // delete status code should be 200, not 204
    ctx.status = 200;
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      ctx.status = 409;
    } else {
      ctx.status = 400;
    }
  }
};

exports.update = async (ctx) => {
  const {
    sensorId,
  } = ctx.params;

  await models.sensor.update(
    ctx.request.body, {
      where: {
        sensorId,
      },
    },
  ).then(() => {
    ctx.body = ctx.request.body;
  }).catch((err) => {
    ctx.body = err;
  });
};

exports.replace = async (ctx) => {
  ctx.status = 405;
};
