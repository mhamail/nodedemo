const Cart = require("../models/cart")
const Order = require("../models/order")
const { errorCode, errorHandler } = require('../helpers/errorHandler')
const formidable = require('formidable');
const Product = require('../models/product')


exports.createCodOrder = async (req, res) => {
    // const { cod } = req.body;
    // if (!cod) return errorCode(res, 400, "Order Failed")
    let user = req.profile

    Cart.findOne({ orderedBy: user._id })
        .exec((err, cart) => {
            if (err) {
                return errorCode(res, 400, "Order Failed")
            }
            let order = new Order({
                products: cart.products,
                paymentIntent: {
                    id: Date.now().toString(),
                    amount: cart.cartTotal,
                    currency: "pkr",
                    status: "Cash on Delivery",
                    created: Date.now(),
                    payment_method: "cod",
                    discount: cart.totalAfterDiscount,
                },
                userDetail: {
                    _id: user._id,
                    name: user.name,
                    phone: user.phone,
                    address: user.address,
                },
                orderedBy: user._id,
                orderStatus: "Cash on Delivery"
            })
            order.save((err, result) => {
                if (err) {
                    return errorCode(res, 400, "Order Failed")
                }
                cart.remove({ _id: cart._id })
                res.json({ ok: true })
            })
        })
}
exports.anonymousCodOrder = (req, res) => {
    let form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
        if (err) {
            return errorCode(res, 400, 'upload error')
        }

        let { items, name, phone, address } = fields;
        phone = Number(phone)

        if (!name || !phone || !address) {
            return errorCode(res, 400, 'all field required')
        }
        else {
            items = JSON.parse(items);

            let products = []
            for (let i = 0; i < items.length; i++) {
                let object = {};
                object.product = items[i]._id;
                object.count = items[i].count;

                let { price, title, postedBy } = await Product.findById(items[i]._id).select("price title postedBy").exec()
                object.price = price;
                object.title = title;
                object.postedBy = postedBy;

                products.push(object)
            }

            let totalPrice = 0;
            for (let i = 0; i < products.length; i++) {
                totalPrice = totalPrice + products[i].price * products[i].count;
            }

            let order = new Order({
                products: products,
                paymentIntent: {
                    id: Date.now().toString(),
                    amount: totalPrice,
                    currency: "pkr",
                    status: "Cash on Delivery",
                    created: Date.now(),
                    payment_method: "cod",
                    discount: 0,
                },
                userDetail: {
                    name: name,
                    phone: phone,
                    address: address,
                },
                orderStatus: "Cash on Delivery"
            })

            order.save((err, result) => {
                if (err) {
                    return errorCode(res, 400, "Order Failed")
                }
                res.json({ ok: true })
            })
        }
    })
}

exports.getUserOrders = (req, res) => {
    let user = req.profile
    Order.find({ orderedBy: user._id })
        .populate("products.product")
        .sort({ createdAt: -1 })
        .exec((err, orders) => {
            if (err) {
                return errorCode(res, 400, "no order found")
            }
            res.json(orders)
        })
}

exports.allOrder = (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let page = req.body.page ? parseInt(req.body.page) : 1;
    let skip = (page - 1) * limit;
    let user = req.profile
    Order.find()
        .populate("products.product")
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 })
        .exec((err, orders) => {
            if (err) {
                return errorCode(res, 400, "no order found")
            }
            res.json(orders)
        })
}
exports.allOrdersByVendor = (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let page = req.body.page ? parseInt(req.body.page) : 1;
    let skip = (page - 1) * limit;
    let user = req.profile

    Order.find({ "products.postedBy": user._id })
        .exec((err, orders) => {
            if (err) {
                return errorCode(res, 400, "no order found")
            }
            count = orders.length
            Order.find({ "products.postedBy": user._id })
                .populate("products.product")
                .limit(limit)
                .skip(skip)
                .sort({ createdAt: -1 })
                .exec((err, orders) => {
                    if (err) {
                        return errorCode(res, 400, "no order found")
                    }
                    orders.map(order => order.products = order.products.filter(product => product.postedBy == user._id.toString()))
                    res.json({ orders, count })
                })
        })

}

exports.orderCount = (req, res) => {
    Order.find({})
        .estimatedDocumentCount()
        .exec((err, total) => {
            if (err) {
                return errorCode(res, 400, "No User found")
            }
            res.json(total)
        })
}

exports.orderStatus = (req, res) => {
    const { orderId, orderStatus } = req.body;
    Order.findByIdAndUpdate(
        orderId,
        { $set: { orderStatus } },
        { new: true }
    ).exec((err, updated) => {
        if (err) {
            return errorCode(res, 400, "no order found")
        }
        res.json({ ok: "true" })
    })
}
