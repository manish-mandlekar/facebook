const mongoose = require('mongoose')
const plm = require("passport-local-mongoose");
mongoose.connect("mongodb://localhost/singup")
const userSchema = mongoose.Schema({
    username:String,
    surname : String,
    email : String,
    password : String,
    dob : String,
    gender : String,
    dp : {
        type: String,
        default : "def.png"
    },
    cover :{
        type : String,
        default : "default.png"
    },
    
    role : {
        type : String,
        default : 'user'
    },
    blocked : {
        type: Boolean,
        default : false
    },
    posts : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "post"
    }],
    comments : [{
   type:mongoose.Schema.Types.ObjectId,
   ref : 'comment'
    }],
    key : String
})
userSchema.plugin(plm);
module.exports = mongoose.model("user",userSchema)