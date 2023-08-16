const express = require('express')
const router = express.Router();
const Product = require("../models/product")

router.get("/",(req,res)=>{res.send("home page")})

router.get("/product",(req,res)=>{
    Product.find({})
    .then((data)=>res.json(data))
    .catch(err=>res.json(err))

})

module.exports = router;