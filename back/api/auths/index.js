const Router = require('koa-router');

const auths = new Router();
const authsControl = require('./controller');

auths.post('/login', authsControl.login);

module.exports = auths;
