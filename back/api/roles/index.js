const Router = require('koa-router');

const roles = new Router();
const rolesControl = require('./controller');

// status 200 method
roles.get('/', rolesControl.getAll);
roles.get('/users/:userId', rolesControl.getByUserId);
roles.post('/', rolesControl.createOne);
roles.delete('/:roleId', rolesControl.deleteById);
roles.patch('/:roleId', rolesControl.update);

// status 405 method
roles.delete('/', rolesControl.deleteAll);
roles.put('/', rolesControl.replace);

module.exports = roles;
