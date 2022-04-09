const express = require('express')
const router = express.Router()
const Post = require('../models/Post')
const Category = require('../models/Category')
const User = require('../models/User')
const Contact = require('../models/Contact')
const path = require('path')


router.get('/', (req, res) => {
    console.log("\n Aktif Giriş Yapan Session Kullanıcı ID'si: ", req.session.userId)
    res.render('site/index')
})

router.get('/about', (req, res) => {
    res.render('site/about')
})

router.get('/blog', (req, res) => {
    const postPerPage = 4
    const page = req.query.page || 1


    Post.find({}).populate({ path: 'author', model: User }).sort({ $natural: -1 })
        .skip((postPerPage * page) - postPerPage)
        .limit(postPerPage)
        .then(posts => {
            Post.countDocuments().then(postCount => {
                Category.aggregate([{
                        $lookup: {
                            from: 'posts',
                            localField: '_id',
                            foreignField: 'category',
                            as: 'posts'
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            num_of_posts: { $size: '$posts' }
                        }
                    }
                ]).then(categories => {
                    res.render('site/blog', {
                        posts: posts.map(item => item.toJSON()),
                        categories: categories,
                        current: parseInt(page),
                        pages: Math.ceil(postCount / postPerPage)

                    })
                })
            })
        })
})

router.get('/contact', (req, res) => {
    res.render('site/contact')
})

router.post('/contact', (req, res) => {
    Contact.create(req.body, (error, contact) => {
        res.redirect("/contact")
    })
    req.session.sessionFlash = {
        type: "alert alert-success",
        message: `Wow! Merhaba ${req.body.name} Mesajını Aldık Bile Bizimle İletişime Geçtiğin İçin Teşekkür Ederiz :) En Kısa Sürede Email Yolu İle Ulaşacağız!`
    }
})

router.get('/admin/contacts/:id', (req, res) => {
    if (req.session.userId) {
        Contact.findById(req.params.id).lean().then(contact => {
            Category.find({}).then(categories => {
                res.render('admin/detailcontact', {
                    contact: contact,
                    categories: categories.map(item => item.toJSON())
                })
            })
        })
    } else {
        res.redirect('/users/login')
    }

})

router.delete('/admin/contacts/:id', (req, res) => {
    Contact.remove({ _id: req.params.id }).then(() => {
        res.redirect('/admin/contacts')
    })

})


router.get('/updates', (req, res) => {
    res.render('site/updates')
})

module.exports = router