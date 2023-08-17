const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema;

const commentSchema = new mongoose.Schema(
    {
        comment: { type: String },
        postedBy: {
            type: ObjectId,
            ref: "users"
        },
        created: {
            type: Date,
            default: Date.now
        },

    },
    { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema)