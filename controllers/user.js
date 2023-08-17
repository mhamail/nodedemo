const User = require('../models/user')
const Product = require("../models/product")
const Cart = require("../models/cart")
const { errorCode, errorHandler } = require('../helpers/errorHandler')
const formidable = require('formidable');
const fs = require('fs')
const _ = require('lodash')

exports.getAllUser = (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let page = req.body.page ? parseInt(req.body.page) : 1;
    let skip = (page - 1) * limit;
    let user = req.profile;
    user.username="hashir" &&
    User.find()
    .skip(skip)
    .limit(limit)
    .exec((err, data) => {
        if (err, !data) {
            return errorCode(res, 401, "unauthorized")
        }
        res.json(data)
    })
}
exports.userCount = (req, res) => {
    User.find({})
        .estimatedDocumentCount()
        .exec((err, total) => {
            if (err) {
                return errorCode(res, 400, "No User found")
            }
            res.json(total)
        })
}

exports.read = (req, res) => {
    let user = req.profile
    user.hashed_password = undefined;
    user.salt = undefined;
    user.resetPasswordLink = undefined;
    user.wishlist = undefined;
    return res.json(user)
}

exports.update = (req, res) => {
    let form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        if (err) {
            return errorCode(res, 400, 'upload error')
        }

        let user = req.profile;

        const existingRole = user.role;
        // const existingEmail = user.email;

        user = _.merge(user, fields)
        user.role = existingRole;
        // user.email = existingEmail;

        user.save((err, result) => {
            if (err) {
                return errorCode(res, errorHandler(err))
            }
            user.hashed_password = undefined;
            user.salt = undefined;
            user.resetPasswordLink = undefined;
            res.json(result);
        })
    })
}

exports.photo = (req, res) => {
    const username = req.params.username;
    User.findOne({ username }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        if (user.photo) {
            return res.send(user.photo);
        }
    });
}

exports.updateByAdmin = (req, res) => {
    const username = req.params.username
    User.findOne({ username })
        .exec((err, user) => {
            if (err) {
                return errorCode(res, 400, "user not found")
            }
            let form = new formidable.IncomingForm();
            form.parse(req, (err, fields, files) => {
                if (err) {
                    return errorCode(res, 400, 'upload error')
                }
                user = _.merge(user, fields)

                user.save((err, result) => {
                    if (err) {
                        return errorCode(res, errorHandler(err))
                    }
                    user.hashed_password = undefined;
                    user.salt = undefined;
                    user.resetPasswordLink = undefined;
                    res.json(result);
                })
            })
        })

}
exports.deleteUser = (req, res) => {
    const username = req.params.username
    User.deleteOne({ username })
        .exec((err, user) => {
            if (err) {
                return errorCode(res, 400, "user not found")
            }
            res.json({
                message: "User deleted successfully"
            })
        })
}
exports.searchUser = (req, res) => {
    const { search } = req.query;
    let phone = Number(req.query.phone);
    const filter = [
        { username: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
    ]
    if (search) {
        User.find(
            !phone ? 
            {$or: filter} 
                :
            {phone: phone},
        )
            .exec((err, user) => {
                if (err) {
                    return errorCode(res, 400, "user not found")
                }
                res.json(user)
            })
    }
}

exports.userCart = (req, res) => {
    let form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
        if (err) {
            return errorCode(res, 400, 'upload error')
        }
        let { cart } = fields
        cart = JSON.parse(cart)

        let user = req.profile;

        let existCartByThisUser = await Cart.findOne({ orderedBy: user._id })

        if (existCartByThisUser) {
            existCartByThisUser.remove()
        }

        let products = []
        for (let i = 0; i < cart.length; i++) {
            let object = {};
            object.product = cart[i]._id;
            object.count = cart[i].count;

            let { price, title,postedBy } = await Product.findById(cart[i]._id).select("price title postedBy").exec()
            object.price = price;
            object.title = title;
            object.postedBy = postedBy;

            products.push(object)
        }

        let cartTotal = 0;
        for (let i = 0; i < products.length; i++) {
            cartTotal = cartTotal + products[i].price * products[i].count
        }
        cartTotal > 4999 ?
        cartTotal
        :
        cartTotal = cartTotal + 200 

        let newCart = new Cart({
            products,
            cartTotal,
            orderedBy: user._id
        })

        newCart.save((err, result) => {
            if (err) {
                return errorCode(res, 400, errorHandler(err))
            }
            res.json({ ok: true })
        })
    })

}
exports.readCart = (req, res) => {
    let user = req.profile
    Cart.findOne({ orderedBy: user._id })
        .exec((err, cart) => {
            if (err) {
                return errorCode(res, 400, "Try Again or refresh the page")
            }
            res.json(cart)
        })
}
exports.addtoWishList = (req, res) => {
    const { productId } = req.body;
    let user = req.profile
    User.findOneAndUpdate(
        { email: user.email },
        { $addToSet: { wishlist: productId } },
        { new: true }
    ).exec((err, list) => {
        if (err) {
            return errorCode(res, 400, "no added to wishlist")
        }
        res.json({ ok: true })
    })
}
exports.wishlist = (req, res) => {
    let user = req.profile
    User.findOne({ email: user.email })
        .select("wishlist")
        .populate('wishlist', "_id title images price slug")
        .exec((err, list) => {
            if (err) {
                return errorCode(res, 400, "no product found in wishlist")
            }
            res.json(list)
        })
}
exports.removeWishlist = (req, res) => {
    const { productId } = req.body;
    let user = req.profile
    User.findOneAndUpdate(
        { email: user.email },
        { $pull: { wishlist: productId } },
        { new: true }
    ).exec((err, list) => {
        if (err) {
            return errorCode(res, 400, "no added to wishlist")
        }
        res.json({ ok: true })
    })
}