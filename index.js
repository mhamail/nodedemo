const express = require('express');
require('dotenv').config();
require('./dbconn')

const productRoutes = require('./routes/product')

const app = express()

app.use(express.json())

const port = process.env.PORT || 7000;


app.use("/api",productRoutes)


app.listen(port, () => {
    console.log(`App is running on port # ${port}`)
})