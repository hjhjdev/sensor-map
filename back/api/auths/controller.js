const Jwt = require('jsonwebtoken');
const models = require('../../models');
const bcrypt = require('bcrypt');

const key = process.env.JWT_SECRET_KEY;

exports.login = async (ctx) => {
  const {
    userName,
    password,
  } = ctx.request.body;

  try {
    await models.user.findOne({
      where: {
        userName: userName
      }
    }).then(async (user) => {
      if (!user) {
        ctx.status = 401;
        return;
      }
      
      let isAuth = await bcrypt.compare(password, user.password);

      if (isAuth) {
        const payload = {
          userId: user.userId,
          userName: user.userName,
          name: user.name,
          isAdmin: user.isAdmin
        };

        const token = Jwt.sign(payload, key, { expiresIn: '48h' });
        // save token to cookie
        ctx.cookies.set('user', token, {
          expires: new Date(8640000000000),
          overwrite: true,
          httpOnly: false,
          sameSite: 'lax'
        });
        ctx.status = 200;
      } else {
        ctx.status = 401;
      }
    })
  } catch (err) {
    ctx.status = 400;
    ctx.body = err;
  }
};
