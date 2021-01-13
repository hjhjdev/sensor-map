const Router = require('koa-router');

const users = new Router();
const usersControl = require('./controller');

// status 200 method
users.get('/', usersControl.getAll);
users.get('/:userId', usersControl.getById);
users.post('/', usersControl.createOne);
users.delete('/:userId', usersControl.deleteById);
users.patch('/:userId', usersControl.update);

// status 405 method
users.delete('/', usersControl.deleteAll);
users.put('/', usersControl.replace);

module.exports = users;
