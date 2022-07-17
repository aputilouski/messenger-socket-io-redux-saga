require('pg').defaults.parseInt8 = true;
const debug = require('debug')('api:database');
const { Sequelize } = require('sequelize');
const env = require('../services/env');

const db = new Sequelize(env.postgres_db, env.postgres_user, env.postgres_user_password, {
  host: env.postgres_host,
  port: env.postgres_port,
  dialect: 'postgres',
  logging: env.is_development ? str => debug(str) : false,
});

const User = require('./User')(db);
const Message = require('./Message')(db);

const models = {
  User,
  Message,
};

Object.values(models).forEach(Model => {
  if (Model.associate) Model.associate(models);
});

db.authenticate()
  .then(() => debug('Database connected.'))
  .catch(err => debug('DATABASE CONNECTION ERROR', err));

// db.sync({ alter: true })
//   .then(() => debug('All tables were successfully synced.'))
//   .catch(err => debug('ON TABLE SYNC', err));

module.exports = models;
