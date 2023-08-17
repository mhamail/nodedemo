const Product = require('../models/product');


exports.listFeatured = (req, res) => {
    Product.find({ featured: true })
        .limit(1)
        .exec((err, product) => {
            if (err) {
                return errorCode(res, 400, "featured product not found")
            }
            res.json(product)
        })
}