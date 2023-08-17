const express = require('express');
const router = express.Router();

const {create,list,remove}= require('../controllers/category')
const {requireSignin,adminMiddleware} = require('../controllers/auth')


router.post("/category",requireSignin,adminMiddleware,create);
router.get('/categories',list)
router.delete('/category/:_id',requireSignin,adminMiddleware,remove)

module.exports = router;