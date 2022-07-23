const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;
const jwt = require('jwt-simple');
const { jwt_secret } = require('./env');
const { User } = require('../models');

exports.useBearerStrategy = () =>
  passport.use(
    new BearerStrategy(async (token, done) => {
      try {
        const { uuid } = jwt.decode(token, jwt_secret);
        const user = await User.findOne({ where: { uuid } });
        if (user) done(null, user);
        else done(null, false);
      } catch (error) {
        done(error);
      }
    })
  );

exports.generateUserAccessToken = user => {
  return jwt.encode({ uuid: user.uuid }, jwt_secret);
};

exports.getUserUuidByAccessToken = token => {
  const { uuid } = jwt.decode(token, jwt_secret);
  return uuid;
};

exports.verifyUser = passport.authenticate('bearer', { session: false });
