const express = require('express');
const router = express.Router();

const {create,list,productCount,listByUser,photos,update,read,remove,productStar,
    categoryRelated,listSearch,filterProducts,filterCategory,featuredProduct,listFeatured}= require('../controllers/product')
const {requireSignin,authMiddleware,adminMiddleware} = require('../controllers/auth')

router.put("/product/:slug",requireSignin,adminMiddleware,update);
router.put('/product/:productId',requireSignin,authMiddleware,productStar)
router.post("/product",requireSignin,adminMiddleware,create);
router.post('/products/featured',requireSignin,adminMiddleware,featuredProduct)
router.post('/products/listByUser',requireSignin,adminMiddleware,listByUser)
router.get('/products/featured',listFeatured)
router.post('/products/related',categoryRelated)
router.post("/product/checkedRemove",requireSignin,adminMiddleware,remove);
router.get("/products/total",productCount);
router.get("/product/:slug",read);
router.post('/products',list)


//filter
router.post('/products/listSearch',listSearch)
router.post('/products/filterProducts',filterProducts)
router.post('/products/filterCategory',filterCategory)

router.get('/product/photos/:slug',photos)

module.exports = router;