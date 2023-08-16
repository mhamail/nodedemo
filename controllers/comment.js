const Comment = require('../models/commentModel/comment')
const CommentReply = require('../models/commentModel/commentReply')
const User = require('../models/user')
const { errorHandler2, errorHandler, errorCode } = require('../helpers/errorHandler')

exports.create = (req, res) => {
  const {comment}=req.body
  const user=req.profile;
  let postedBy=user._id
  const newComment=new Comment({
    comment,
    postedBy
  })

  newComment.save((err,result)=>{
    if(err){}
    res.json(result)
  })
}
exports.createReply = (req, res) => {
  const {comment,parent,replyParent}=req.body
  const user=req.profile;
  let postedBy=user._id
  const newComment=new CommentReply({
    parent,
    replyParent,
    comment,
    postedBy
  })

  newComment.save((err,result)=>{
    if(err){}
    res.json(result)
  })
}
exports.list=(req,res)=>{
  Comment.find({})
  .populate("parent","comment")
  .exec((err,comments)=>{
    if(err){}
    return res.json(comments)
  })
}

