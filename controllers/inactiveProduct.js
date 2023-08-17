const InactiveProduct = require('../models/inactiveProduct');
const Product = require('../models/product');
const slugify = require('slugify')
const formidable = require('formidable')
const fs = require('fs')
const { errorHandler2, errorHandler, errorCode } = require('../helpers/errorHandler')


exports.create = (req, res, next) => {
    const productsId = req.body.productsId;
    Product.find({ _id: { $in: productsId } })
        .exec((err, products) => {
            if (err) {
                return errorz(res, 400, "Something wrong in backend, delete Product error")
            }
            InactiveProduct.insertMany(products, (err, result) => {
                if (err) {
                    return errorCode(res, 400, errorHandler(err))
                }
                req.products = result
                next()
                // res.json("product inactive successfully")
            })
        })
}

exports.list = (req, res) => {
    let userId = req.body.userId
    let limit = req.body.limit ? parseInt(req.body.limit) : 10;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    InactiveProduct.find({ postedBy: userId })
        .exec((err, product) => {
            if (err) {
                return errorCode(res, 400, "product not find")
            }
            count = product.length
            InactiveProduct.find({ postedBy: userId })
                .populate('category')
                .populate('postedBy', '_id username')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec((err, product) => {
                    res.json({ product, count })

                })
        })
}

exports.inactiveTOactive = (req, res, next) => {
    const productsId = req.body.productsId;
    InactiveProduct.find({ _id: { $in: productsId } })
        .exec((err, products) => {
            if (err) {
                return errorz(res, 400, "Something wrong in backend, delete Product error")
            }
            Product.insertMany(products, (err, result) => {
                if (err) {
                    return errorCode(res, 400, errorHandler(err))
                }
                req.products = result
                next()
            })
        })
}

exports.removeInactive = (req, res) => {
    //req.product are inactive product
    const productsId = req.body.productsId || req.products;
    InactiveProduct.deleteMany({ _id: { $in: productsId } })
        .exec((err) => {
            if (err) {
                return errorz(res, 400, "Something wrong in backend, delete Product error")
            }
            res.json({
                message: "Product deleted successfully"
            })
        })
}