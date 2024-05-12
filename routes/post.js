const mongoose = require('mongoose')
const postSchema = mongoose.Schema({
  caption : String,
  url : String,
  comments :[{
    type: mongoose.Schema.Types.ObjectId,
    ref : "comment"
  }],
  location : String,
  user : { 
    type: mongoose.Schema.Types.ObjectId,
    ref : "user"
  },
  likes :[{
    type: mongoose.Schema.Types.ObjectId,
    ref : "user"
  }],
  time : {
    type : Date,
    default : Date.now()
  }
})

module.exports = mongoose.model("post",postSchema)