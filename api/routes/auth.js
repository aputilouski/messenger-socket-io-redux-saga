const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { User } = require('../models');
const { generateUserAccessToken, verifyUser } = require('../services/passport');

const USERNAME = Joi.string().alphanum().min(3).max(30).required().label('Username');
const PASSWORD = Joi.string().min(3).max(30).required().label('Password');
const NAME = Joi.string().min(3).max(50).required().label('Full Name');

const LoginCredentialsScheme = Joi.object({ username: USERNAME, password: PASSWORD });
const RegistrationCredentialsScheme = Joi.object({ name: NAME, username: USERNAME, password: PASSWORD });
const UserScheme = Joi.object({ name: NAME, username: USERNAME });

router.post('/register', async (req, res) => {
  try {
    const { name, username, password } = req.body;

    const { error } = RegistrationCredentialsScheme.validate({ name, username, password });
    if (error?.details) return res.status(400).json({ message: error.details[0].message });

    const encryptedPassword = await User.encryptPassword(password);
    await User.create({ name, username, password: encryptedPassword });

    res.status(201).json({ message: 'User has been registered' });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message || 'Some error occurred while creating the user');
  }
});

router.post('/check-username', async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ where: { username } });
    res.json({ available: !user });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message || 'Some error occurred while creating the user');
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const { error } = LoginCredentialsScheme.validate({ username, password });
    if (error?.details) return res.status(400).json({ message: error.details[0].message });

    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(403).json({ message: 'Wrong credentials' });

    const passwordConfirmed = await user.confirmPassword(password);
    if (!passwordConfirmed) return res.status(403).json({ message: 'Wrong credentials' });

    res.json({ token: generateUserAccessToken(user), user: user.getPublicFields() });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message || 'An error occurred while logging in');
  }
});

router.post('/user', verifyUser, async (req, res) => {
  try {
    const { name, username } = req.body;

    const { error } = UserScheme.validate({ name, username });
    if (error?.details) return res.status(400).json({ message: error.details[0].message });

    if (req.user.username !== username) {
      const user = await User.findOne({ where: { username } });
      if (user) return res.status(400).json({ message: 'User with the same username already exists' });
    }

    req.user.name = name;
    req.user.username = username;
    await req.user.save();

    res.json({ user: req.user.getPublicFields(), message: 'User information updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message || 'Some error occurred while updating the user');
  }
});

module.exports = router;
