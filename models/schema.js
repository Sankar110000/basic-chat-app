const mongoose = require('mongoose')


const chatSchema = mongoose.Schema({
    from: {
        type: String,
        require: true
    },
    to: {
        type: String,
        require: true
    },
    message:String,
    created_at: Date
})

const Chat = mongoose.model('Chat', chatSchema)

module.exports = Chat;