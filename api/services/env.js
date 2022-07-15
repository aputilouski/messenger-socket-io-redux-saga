const debug = require('debug')('api:server');

const config = {
  is_production: process.env.NODE_ENV === 'production',
  is_development: process.env.NODE_ENV === 'development',

  // database
  postgres_db: process.env.POSTGRES_DB,
  postgres_user: process.env.POSTGRES_USER,
  postgres_user_password: process.env.POSTGRES_PASSWORD,
  postgres_host: process.env.POSTGRES_HOST,
  postgres_port: process.env.POSTGRES_PORT || 5432,

  jwt_secret: process.env.JWT_SECRET,
};

debug(config);

Object.keys(config).forEach(key => {
  if (config[key] === undefined) throw new Error(`Need to set value for environment variable: ${key}`);
});

module.exports = config;
