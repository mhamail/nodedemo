const express = require('express');
const router = express.Router();

const {create,createReply,list}= require('../controllers/comment')
const {requireSignin,authMiddleware} = require('../controllers/auth')


router.post("/comment",requireSignin,authMiddleware,create);
router.post("/commentReply",requireSignin,authMiddleware,createReply);
router.get("/comment/list",list)

module.exports = router;