const express = require('express');
const router = express.Router();
const { listFeatured } = require('../controllers/product')

router.get('/products/featured', listFeatured)

module.exports = router;