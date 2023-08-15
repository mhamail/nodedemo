const express = require('express');


const app = express()

app.use(express.json())

const port = 7000;


app.use("/",(req,res)=>{res.send("home page")})
app.use("/api",(req,res)=>{res.send("mhmarket")})

console.log("mhmarket mhmarket")

app.listen(port, () => {
    console.log(`App is running on port # ${port}`)
})