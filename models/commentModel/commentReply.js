const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema;

const commentReplySchema = new mongoose.Schema(
    {
        comment: { type: String },
        created: {
            type: Date,
            default: Date.now
        },
        parent: {
            type: ObjectId,
            ref: "Comment",
            required: [true, 'parent comment Required']
        },
        replyParent: {
            type: ObjectId,
            ref:"CommentReply"
        },
        postedBy: {
            type: ObjectId,
            ref: "users",
            required: true
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('CommentReply', commentReplySchema)