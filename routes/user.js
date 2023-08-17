const express = require('express');
const router = express.Router();

const { getAllUser, userCount, read, update, updateByAdmin, deleteUser, searchUser, photo, userCart, readCart,
    addtoWishList, wishlist, removeWishlist } = require('../controllers/user')
const { requireSignin, authMiddleware, adminMiddleware } = require('../controllers/auth')

router.get('/user/Profile', requireSignin, authMiddleware, read)
router.get('/users', requireSignin, adminMiddleware, getAllUser)
router.get('/users/total', requireSignin, adminMiddleware, userCount)
router.put('/user/Profile', requireSignin, authMiddleware, update)
router.put('/user/updateByAdmin/:username', requireSignin, adminMiddleware, updateByAdmin)
router.delete('/user/:username', requireSignin, adminMiddleware, deleteUser)
router.get('/user/photo/:username', photo)
router.post('/user/searchUser', searchUser)
router.post('/cart/userCart', requireSignin, authMiddleware, userCart)
router.get('/cart/userCart', requireSignin, authMiddleware, readCart)
router.post('/user/addWishlist', requireSignin, authMiddleware, addtoWishList)
router.post('/user/removeWishlist', requireSignin, authMiddleware, removeWishlist)
router.get('/user/wishlist', requireSignin, authMiddleware, wishlist)


module.exports = router;