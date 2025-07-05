// backend/routes/debug.js
const express = require('express');
const router = express.Router();
const { User } = require('../database'); // Ajuste conforme sua estrutura

router.get('/debug/users', async (req, res) => {
    const users = await User.findAll({ attributes: ['id', 'username', 'role'] });
    res.json(users);
});

module.exports = router;
