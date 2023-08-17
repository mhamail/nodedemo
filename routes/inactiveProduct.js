const express = require('express');
const router = express.Router();

const {create,list,inactiveTOactive,removeInactive}= require('../controllers/inactiveProduct')
const {remove} = require('../controllers/product')
const {requireSignin,adminMiddleware} = require('../controllers/auth')


router.post("/inactive/product",requireSignin,adminMiddleware,create,remove);
router.post('/inactive/products',requireSignin,adminMiddleware,list)
router.post("/inactiveTOactive",requireSignin,adminMiddleware,inactiveTOactive,removeInactive);
router.post("/inactive/checkedRemove",requireSignin,adminMiddleware,removeInactive);

module.exports = router;