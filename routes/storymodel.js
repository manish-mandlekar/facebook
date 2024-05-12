const mongoose = require('mongoose')

const storySchema = mongoose.Schema({
    author : {
        type:mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    file:{
        type:String,
        required : true
    },
    views:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }],
    date : {
        type:Date,
        default : Date.now
    },
    expiresAt: { type: Date, default: () => Date.now() + 24 * 60 * 60 * 1000 }
})

module.exports = mongoose.model('story',storySchema)