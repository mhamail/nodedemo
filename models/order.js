const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema;

const orderSchema = new mongoose.Schema(
    {
        products: [
            {
                product: {
                    type: ObjectId,
                    ref: "Product"
                },
                count: Number,
                price: Number,
                title: String,
                postedBy: {
                    type: ObjectId,
                    ref: 'users'
                },
            }
        ],
        paymentIntent: {},
        orderStatus: {
            type: String,
            default: "Not Processed",
            enum: [
                "Not Processed",
                "Cash on Delivery",
                "Processing",
                "Cancelled",
                "Completed",
            ],
        },
        userDetail: {},
        orderedBy: {
            type: ObjectId,
            ref: "users"
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema)