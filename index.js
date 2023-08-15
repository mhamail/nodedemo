const express = require('express');
require('dotenv').config();
require('./dbconn')


const app = express()

app.use(express.json())

const port = process.env.PORT || 7000;


app.get("/",(req,res)=>{res.send("home page")})
app.get("/api",(req,res)=>{res.send("mhmarket")})

console.log("mhmarket mhmarket")

app.listen(port, () => {
    console.log(`App is running on port # ${port}`)
})