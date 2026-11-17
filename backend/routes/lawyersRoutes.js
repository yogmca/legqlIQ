const express = require('express');
const router = express.Router();
const Lawyer = require('../models/Lawyer');
router.get('/', async (req, res) => { res.json({ data: [], total: 0 }); }); module.exports = router;
