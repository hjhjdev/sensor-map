const models = require('../../models');

exports.getAll = async (ctx) => {
  await models.role.findAll()
    .then((res) => {
      ctx.body = res;
    })
    .catch((err) => {
      ctx.body = err;
    });
};

exports.getByUserId = async (ctx) => {
  const { userId } = ctx.params;

  await models.role.findAll({
    where: {
      userId
    }
  })
    .then((res) => {
      ctx.body = res;
    })
    .catch((err) => {
      ctx.body = err;
    });
};

exports.createOne = async (ctx) => {
  const { userId, deviceId } = ctx.request.body;

  await models.role.create({
    userId: userId,
    deviceId: deviceId
  })
    .then((res) => {
      ctx.body = res;
      ctx.status = 201;
    })
    .catch((err) => {
      ctx.body = err;
    });
};

exports.deleteById = async (ctx) => {
  const {
    roleId
  } = ctx.params;

  await models.role.destroy({
    where: {
      roleId
    }
  })
    .then((res) => {
      ctx.body = res;
    })
    .catch((err) => {
      ctx.status = 400;
      ctx.body = err;
    });
};

exports.update = async (ctx) => {
  const {
    roleId
  } = ctx.params;

  await models.role.update(
    ctx.request.body, {
      where: {
        roleId
      }
    }
  )
    .catch((err) => {
      ctx.body = err;
    });
};

exports.deleteAll = async (ctx) => {
  ctx.status = 405;
};

exports.replace = async (ctx) => {
  ctx.status = 405;
};
