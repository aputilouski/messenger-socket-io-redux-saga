const express = require('express');
const router = express.Router();
const Joi = require('joi');

const LoginCredentialsScheme = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().label('Username'),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).label('Password'),
});

router.post('/login', (req, res, next) => {
  const { username, password } = req.body;

  const { error } = LoginCredentialsScheme.validate({ username, password });
  if (error?.details) return res.status(400).json({ message: error.details[0].message });

  res.json({
    token: Math.random().toString(36).substring(2),
    user: {
      name: 'Andrei Putilouski',
      username,
    },
  });
});

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
