const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            minlength: [3, "title is too small"],
            maxlength: [160, "title is too large"],
            required: [true, 'title missing']
        },
        slug: {
            type: String,
            unique: [true, "dublicate error"],
            index: true,
            lowercase: true,
            required: true
        },
        highlight: {
            type: {},
            maxlength: [255, "title is too large"],
            required: true
        },
        description: {
            type: {},
            required: [true, "body missing"],
            maxlength: [200000, "body is too large"],
        },
        price: {
            type: Number,
            required: [true, "price missing"],
            maxlength: [8, "price length is too large"],
            trim: true,
        },
        quantity: {
            type: Number,
        },
        category: {
            type: ObjectId,
            ref: "Category"
        },
        bossCategory: {
            type: ObjectId,
        },
        // subcategory: {
        //     type: ObjectId,
        //     ref: "SubCategory",
        //     required: [true, "category missing"],
        // },
        shipping: {
            type: String,
            required: [true, "shipping missing"],
            enum: ["Yes", "No"]
        },
        color: {
            type: String,
            enum: ["Black", "Brown", "Silver", "White", "Blue"]
        },
        brand: {
            type: String,
            enum: ["no brand", "smt", "master"]
        },
        images: {
            type: Array,
            required: [true, "image required"]
        },
        ratings: [
            {
                star: Number,
                postedBy: { type: ObjectId, ref: "users" },
            }
        ],
        featured: {
            type: Boolean,
            enum: [true, false]
        },
        postedBy: {
            type: ObjectId,
            ref: 'users'
        }

    },
    { timestamps: true }
)

module.exports = mongoose.model('Product', productSchema)