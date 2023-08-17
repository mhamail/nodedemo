const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema

const categorySchema = new mongoose.Schema(
    {  
      name: {
          type: String,
          trim: true,
          required: [true, 'name is required'],
          maxlength: [32, "name should be less than 32"],
      },
      slug: {
          type: String,
          // unique: [true, 'category should be unique'],
          index: true
      },
      parentId:{
        type:String
      },
      bossId:{
        type: ObjectId,
        ref:"Category",
      },
      relate:[]
  },
  {timestamps:true}
  );
  
  module.exports = mongoose.model('Category',categorySchema)