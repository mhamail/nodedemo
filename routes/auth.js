const express = require('express');
const router = express.Router();

const {signup,signin,forgotPassword,resetPassword} = require('../controllers/auth')

// router.post("/pre-signup",preSignup);
router.post('/signup',signup)
router.post('/signin',signin)
router.put("/forgot-password",forgotPassword);
router.put("/reset-password",resetPassword);

module.exports = router;