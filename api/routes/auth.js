const express = require('express');
const router = express.Router();

router.post('/login', (req, res, next) => {
  res.json({
    token: 'token-string',
    user: {
      login: 'aputilouski',
      name: 'Andrei Putilouski',
    },
  });
});

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
