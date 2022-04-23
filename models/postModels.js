const mongoose = require('mongoose')

const postSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: [true, '貼文姓名未填寫']
        },
        image: {
            type: String,
            default: ""
        },
        content: {
            type: String,
            required: [true, '貼文內容未填寫']
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            select: true
        },
    },
    {
        versionKey: false
    }
);

const Post = mongoose.model('Postlt', postSchema)

module.exports = Post