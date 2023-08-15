const mongoose = require('mongoose')

mongoose.connect(process.env.db)
.then(()=>console.log("db connection successful"))
.catch((err)=>console.log("db connection error"))