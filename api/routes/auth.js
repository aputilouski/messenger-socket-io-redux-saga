const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { User } = require('../models');

const LoginCredentialsScheme = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().label('Username'),
  password: Joi.string().min(3).max(30).required().label('Password'),
});

router.post('/register', async (req, res, next) => {
  try {
    const { name, username, password } = req.body;

    if (!name || name.length < 4) return res.status(400).json({ message: 'Required information not provided' });
    const { error } = LoginCredentialsScheme.validate({ username, password });
    if (error?.details) return res.status(400).json({ message: error.details[0].message });

    await User.create({ name, username, password });
    res.status(201).json({ message: 'User has been registered' });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message || 'Some error occurred while creating the user');
  }
});

router.post('/check-username', async (req, res, next) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ where: { username } });
    res.json({ available: !user });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message || 'Some error occurred while creating the user');
  }
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

module.exports = router;
