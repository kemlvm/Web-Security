const express = require('express')
const router = express.Router()
const path = require('path')
const Category = require('../../models/Category')
const Post = require('../../models/Post')
const Contact = require('../../models/Contact')
const { route } = require('../manage')
const User = require('../../models/User')

router.get('/', (req, res) => {
    if (req.session.userId) {
        return res.render('admin/index')
    } else {
        res.redirect('/users/login')
    }

})

router.get('contacts', (req, res) => {
    if (req.session.userId) {
        return res.render('admin/contacts')
    } else {
        res.redirect('/users/login')
    }

})

router.get('/contacts', (req, res) => {
    if (req.session.userId) {
        Contact.find({}).then(contact => {
            res.render('admin/contacts', { contact: contact.map(item => item.toJSON()) })

        })
    } else {
        res.redirect('/users/login')
    }

})


router.get('/posts', (req, res) => {
    if (req.session.userId) {
        Post.find({}).populate({ path: 'category', model: Category }).populate({ path: 'author', model: User }).sort({ $natural: -1 }).then(posts => {
            res.render('admin/posts', {
                posts: posts.map(item => item.toJSON())
            })

        })

    } else {
        res.redirect('/users/login')
    }


})


router.get('/categories', (req, res) => {
    if (req.session.userId) {
        Category.find({}).sort({ $natural: -1 }).lean().then(categories => {
            res.render('admin/categories', { categories: categories })
        })
    } else {
        res.redirect('/users/login')
    }

})

router.get('/:id', (req, res) => {
    Category.findById(req.params.id).lean().then(categories => {
        res.render('admin/categories', { categories: categories })
    })

})

router.post('/categories', (req, res) => {
    Category.create(req.body, (error, category) => {
        if (!error) {
            res.redirect('categories')
        }
    })
})

router.delete('/categories/:id', (req, res) => {
    Category.remove({ _id: req.params.id }).then(() => {
        res.redirect('/admin/categories')
    })

})

router.delete('/posts/:id', (req, res) => {
    Post.remove({ _id: req.params.id }).then(() => {
        res.redirect('/admin/posts')
    })

})


router.get('/posts/edit/:id', (req, res) => {
    if (req.session.userId) {
        Post.findById(req.params.id).lean().then(post => {
            Category.find({}).then(categories => {
                res.render('admin/editpost', {
                    post: post,
                    categories: categories.map(item => item.toJSON())
                })
            })
        })
    } else {
        res.redirect('/users/login')
    }

})

router.get('/posts/edit-image/:id', (req, res) => {
    if (req.session.userId) {
        Post.findById(req.params.id).lean().then(post => {
            Category.find({}).then(categories => {
                res.render('admin/edit-image', {
                    post: post,
                    categories: categories.map(item => item.toJSON())
                })
            })
        })
    } else {
        res.redirect('/users/login')
    }

})

router.put('/posts/:id', (req, res) => {
    Post.findById(req.params.id).then(post => {
        post.title = req.body.title
        post.content = req.body.content
        post.date = req.body.date
        post.category = req.body.category
        post.link = req.body.link
        post.link2 = req.body.link2
        post.link_title = req.body.link_title
        post.link_title2 = req.body.link_title2

        post.save().then(post => {
            res.redirect('/admin/posts')
        })
    })
})


router.put('/posts/edit-image/:id', (req, res) => {
    let post_image = req.files.post_image
    post_image.mv(path.resolve(__dirname, '../../public/img/post-images', post_image.name))

    Post.findById(req.params.id).then(post => {
        post.post_image = `/img/post-images/${post_image.name}`

        post.save().then(post => {
            res.redirect('/admin/posts')
        })
    })
})



module.exports = router