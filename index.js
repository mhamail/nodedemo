const express = require('express');

const cors = require('cors')
require('dotenv').config();
require('./db/conn')
const {listFeatured} = require("./controllers/product")

const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const categoryRoutes = require('./routes/category')
const productRoutes = require('./routes/product')
const inactiveProductRoutes = require('./routes/inactiveProduct')
const orderRoutes = require('./routes/order')
const commentRoutes = require('./routes/comment')

const app = express()

app.use(cors())
app.use(express.json())

const port = process.env.PORT || 7000;


//routes
app.get("/",(req,res)=>{res.send("market")})
app.get("/api",listFeatured)
app.use("/api",authRoutes);
app.use("/api",userRoutes);
app.use('/api',categoryRoutes);
app.use("/api",productRoutes);
app.use("/api",inactiveProductRoutes);
app.use("/api",orderRoutes);
app.use("/api",commentRoutes)


app.listen(port, () => {
    console.log(`App is running on port # ${port}`)
})