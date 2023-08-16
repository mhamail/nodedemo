const Product = require('../models/product');
const Category = require('../models/category')
const User = require('../models/user')
const slugify = require('slugify')
const formidable = require('formidable')
const fs = require('fs')
const { errorHandler2, errorHandler, errorCode } = require('../helpers/errorHandler')
const _ = require('lodash')

exports.create = (req, res) => {
    const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
        if (err) {
            return errorCode(res, 400, "all fields required")
        }
        const { title, price, category } = fields
        // if(!title,!highlight,!description,!price,!category,!subcategory,!images,!shipping){
        //     return errorCode(res,400,"all fields required")
        // }

        let { bossId } = await Category.findById({ _id: category })
        // let random = Date.now().toString()
        // const slug = slugify(title + random).toLowerCase();
        const slug = slugify(title)

        let images = [fields.images0, fields.images1, fields.images2, fields.images3]
        images = images.filter(function (element) {
            return element !== undefined;
        });
        let product = new Product({ ...fields });

        product.price = Number(price)
        product.slug = slug;
        product.images = images
        product.bossCategory = bossId
        product.postedBy = req.auth._id

        product.save((err, result) => {
            if (err) {
                return err.code === 11000 ?
                    errorCode(res, 400, errorHandler2(err))
                    :
                    errorCode(res, 400, errorHandler(err))
            }
            res.json({message:"product create successfully"})
        })

    })
}
exports.list = (req, res) => {
    const sortPrice = req.body.sortPrice
    let limit = req.body.limit ? parseInt(req.body.limit) : 12;
    let page = req.body.page ? parseInt(req.body.page) : 1;
    let skip = (page - 1) * limit;

    Product.find({})
        .populate('category')
        .populate('postedBy', '_id username')
        .skip(skip)
        .limit(limit)
        .sort(sortPrice ? { "price": sortPrice } : { "createdAt": -1 })
        .exec((err, product) => {
            if (err) {
                return errorCode(res, 400, "product not find")
            }
            res.json(product)
        })
}
exports.productCount = (req, res) => {
    Product.find({})
        .estimatedDocumentCount()
        .exec((err, total) => {
            if (err) {
                return errorCode(res, 400, "products not found")
            }
            res.json(total)
        })
}

exports.listByUser = (req, res) => {
    const { userId, sortPrice } = req.body
    let limit = req.body.limit ? parseInt(req.body.limit) : 10;
    let page = req.body.page ? parseInt(req.body.page) : 1;
    let skip = (page - 1) * limit;
    let user = req.profile
    Product.find(
        user.username === "hashir" ?
            {}
            :
            { postedBy: userId }
    )
        .exec((err, product) => {
            if (err) {
                return errorCode(res, 400, "product not find")
            }
            count = product.length
            Product.find(
                user.username === "hashir" ?
                    {}
                    :
                    { postedBy: userId }
            )
                .populate('category')
                .populate('postedBy', '_id username')
                .skip(skip)
                .limit(limit)
                .sort(sortPrice ? { "price": sortPrice } : { "createdAt": -1 })
                .exec((err, product) => {
                    res.json({ product, count })
                })
        })

}

exports.photos = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Product.findOne({ slug })
        .select('images')
        .exec((err, product) => {
            if (err) {
                return errorCode(res, 400, "images not find")
            }
            res.json(product.images)
        })
}

exports.update = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Product.findOne({ slug }).exec((err, product) => {
        if (err) {
            return errorCode(res, 400, "product not found in database")
        }
        let form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            if (err) {
                return errorCode(res, 400, "form sumbit error from server")
            }
            let images = [fields.images0, fields.images1, fields.images2, fields.images3]
            images = images.filter(function (element) {
                return element !== undefined;
            });

            const { price, category } = fields

            product = _.extend(product, fields)
            product.slug = slug

            if (price) {
                product.price = Number(price)
            }

            if (fields.images0) {
                product.images = images
            }
            if (category) {
                let { bossId } = await Category.findById({ _id: category })
                product.bossCategory = bossId
            }
            product.save((err, result) => {
                if (err) {
                    return err.code === 11000 ?
                        errorCode(res, 400, errorHandler2(err))
                        :
                        errorCode(res, 400, errorHandler(err))
                }
                res.json({ message: "Product update successfully" })
            })


        })
    })

}

exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Product.findOne({ slug })
        .populate('category')
        .exec((err, product) => {
            if (err) {
                return errorCode(res, 400, "Something wrong in backend")
            }
            res.json(product)
        })
}

exports.remove = (req, res) => {
    //req.product are inactive product
    const productsId = req.body.productsId || req.products;
    Product.deleteMany({ _id: { $in: productsId } })
        .exec((err) => {
            if (err) {
                return errorCode(res, 400, "Something wrong in backend, delete Product error")
            }
            res.json({
                message: "Product deleted successfully"
            })
        })
}

exports.productStar = async (req, res) => {
    const { star } = req.body;
    const product = await Product.findById(req.params.productId)
    const user = req.profile
    let existingRatingObject = product.ratings.find(
        (ele) => ele.postedBy.toString() === user._id.toString())


    if (existingRatingObject === undefined) {
        Product.findByIdAndUpdate(product._id,
            {
                $push: { ratings: { star, postedBy: user._id } }
            },
            { new: true }
        ).exec((err, rateProduct) => {
            if (err) {
                return errorCode(res, 400, "error")
            }
            res.json({ message: "rate added" })
        })
    }
    else {
        Product.updateOne(
            {
                ratings: { $elemMatch: existingRatingObject }
            },
            { $set: { "ratings.$.star": star } },
            { new: true }
        ).exec((err, rateProduct) => {
            if (err) {
                return errorCode(res, 400, "error")
            }
            res.json({ message: "rate added" })
        })
    }
}

exports.categoryRelated = async (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 8;
    const { _id, category } = req.body.product;
    Product.find({
        _id: { $ne: _id },
        bossCategory: category.bossId,
    })
        .populate('category')
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec((err, product) => {
            if (err) {
                return errorCode(res, 400, "product not find")
            }
            res.json(product)
        })
}

exports.listSearch = (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 12;
    let page = req.body.page ? parseInt(req.body.page) : 1;
    let skip = (page - 1) * limit;
    const { search } = req.query;
    const filter = [
        { title: { $regex: search, $options: 'i' } },
        { highlight: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
    ]

    if (search) {
        Product.find({
            $or: filter
        })
            .exec((err, product) => {
                count = product.length;
                Product.find({
                    $or: filter
                })
                    .populate('category')
                    .limit(limit)
                    .skip(skip)
                    .sort({ createdAt: -1 })
                    .exec((err, product) => {
                        if (err) {
                            return errorCode(res, 400, "product not find")
                        }
                        res.json({ product, count })
                    })
            })
    }
}

exports.filterProducts = async (req, res) => {
    const price = req.body
    const { category } = req.body
    // const cate = await Category.find({bossId:{$in:category}}).select("bossId")
    let limit = req.body.limit ? parseInt(req.body.limit) : 12;
    let page = req.body.page ? parseInt(req.body.page) : 1;
    let skip = (page - 1) * limit;
    const filter = {
        $gte: price[0],
        $lte: price[1]
    }
    if (price !== undefined) {
        Product.find({
            $or: [
                { price: filter },
                { bossCategory: { $in: category } },
                { category: { $in: category } },
                // { category:{$in:cate} },
            ]
        })
            .exec((err, count) => {
                count = count.length
                Product.find({
                    $or: [
                        { price: filter },
                        { bossCategory: { $in: category } },
                        { category: { $in: category } },
                        // { category:{$in:cate} },
                    ]
                })
                    .populate('category', "_id name")
                    .limit(limit)
                    .skip(skip)
                    .sort({ createdAt: -1 })
                    .exec((err, product) => {
                        if (err) {
                            return errorCode(res, 400, "product not find")
                        }
                        res.json({ product, count })
                    })

            })
    }
}
exports.filterCategory = async (req, res) => {
    const { slug } = req.body
    let limit = req.body.limit ? parseInt(req.body.limit) : 12;
    let skip = req.body.skip;
    const category = await Category.findOne({ slug })
    
    if(category){
    Product.find({
        bossCategory: category._id
    })
        .exec((err, count) => {
            count = count.length
            Product.find({
                bossCategory: category._id
            })
                .populate('category')
                .limit(limit)
                .skip(skip)
                .sort({ createdAt: -1 })
                .exec((err, products) => {
                    if (err) {
                        return errorCode(res, 400, "product not find")
                    }
                    res.json({ products, count })
                })

        })
    }
}

// featured product
exports.featuredProduct = (req, res) => {
    const { productId, featured } = req.body
    Product.findByIdAndUpdate({ _id: productId },
        { $set: { featured } },
        { new: true }
    )
        .exec((err, f) => {
            if (err) {
                return errorCode(res, 400, "featured error")
            }
            res.json({ ok: "true" })
        })
}

exports.listFeatured = (req, res) => {
    Product.find({ featured: true })
        .limit(24)
        .exec((err, product) => {
            if (err) {
                return errorCode(res, 400, "featured product not found")
            }
            res.json(product)
        })
}