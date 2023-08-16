const Product = require('../models/product');


exports.listFeatured = (req, res) => {
    Product.find({ featured: true })
        .limit(24)
        .then((product) => {
            res.json(product)
        })
        .catch(err => {
            errorCode(res, 400, "featured product not found")
        })
}