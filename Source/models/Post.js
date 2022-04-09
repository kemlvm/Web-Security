const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now },
    post_image: { type: String, required: true },
    link: { type: String, required: false },
    link_title: { type: String, required: false },
    link2: { type: String, required: false },
    link_title2: { type: String, required: false },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' }
})

module.exports = mongoose.model('Post', PostSchema)