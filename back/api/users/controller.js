const models = require('../../models');
const bcrypt = require('bcrypt');

exports.getAll = async (ctx) => {
  await models.user.findAll({
    attributes: [
      'userId',
      'userName',
      'name',
      'isAdmin'
    ]
  })
    .then((res) => {
      ctx.body = res;
    })
    .catch((err) => {
      ctx.body = err;
    });
};

exports.getById = async (ctx) => {
  const { userId } = ctx.params;

  await models.user.findOne({
    where: {
      userId,
    },
    attributes: [
      'userId',
      'userName',
      'name',
      'isAdmin'
    ]
  }).then((res) => {
    ctx.body = res;
  })
  .catch((err) => {
    ctx.body = err;
  });
};

exports.createOne = async (ctx) => {

  const {
    userName,
    password,
    name,
    isAdmin,
  } = ctx.request.body;

  try {
    let hashedPassword;

    await bcrypt.hash(password, 10).then((hash) => {
      hashedPassword = hash;
    })

    await models.user.create({
      'userName': userName,
      'password': hashedPassword,
      'name': name,
      'isAdmin': isAdmin,
    }).then((res) => {
      // delete password info
      res.password = '***';
      ctx.body = res;
      ctx.status = 201;
    })
  } catch (err) {
    console.log(err)
    ctx.body = err;
    ctx.status = 500;
  }
};

exports.deleteById = async (ctx) => {
  const {
    userId,
  } = ctx.params;

  try {
    // delete roles first
    await models.role.destroy({
      where: {
        userId: userId
      }
    })
    // then delete user
    await models.user.destroy({
      where: {
        userId
      }
    }).then(() => {
      ctx.status = 200;
    })
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError')
      ctx.status = 409;
    else
      ctx.status = 500;
  };
};

exports.update = async (ctx) => {
  const { userId } = ctx.params;
  const { userName, password, name, isAdmin } = ctx.request.body;

  let builder = {
    userName: userName,
    name: name,
    isAdmin: isAdmin
  }

  if (password) {
    console.log('pw change')
    let hashedPassword;

    await bcrypt.hash(ctx.request.body.password, 10).then((hash) => {
      hashedPassword = hash;
    })

    builder.password = hashedPassword;
  }
  
  await models.user.update(
    builder, {
      where: {
        userId: userId
      }
    },
  ).then(() => {
    ctx.request.body.password = '******';
    ctx.body = ctx.request.body;
  }).catch((err) => {
    ctx.body = err;
  });
};

exports.deleteAll = async (ctx) => {
  ctx.status = 405;
};

exports.replace = async (ctx) => {
  ctx.status = 405;
};
