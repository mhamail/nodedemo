const express = require('express');
const router = express.Router();

const { createCodOrder,anonymousCodOrder, getUserOrders, allOrder, allOrdersByVendor, orderCount, orderStatus } = require('../controllers/order')
const { requireSignin, authMiddleware, adminMiddleware } = require('../controllers/auth')

router.post('/order/cod', requireSignin, authMiddleware, createCodOrder)
router.post('/order/anonymousCod',anonymousCodOrder);
router.get('/order/getUserOrders', requireSignin, authMiddleware, getUserOrders)
router.post('/order/getOrders', requireSignin, adminMiddleware, allOrder)
router.post('/order/ordersVendor', requireSignin, adminMiddleware, allOrdersByVendor)
router.get('/orders/total', requireSignin, adminMiddleware, orderCount)
router.post('/order/orderStatus', requireSignin, adminMiddleware, orderStatus)

module.exports = router