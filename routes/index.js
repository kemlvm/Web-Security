const express = require('express')
const router = express.Router()
const { ensureAuthenticated } = require('../config/checkAuth')


router.get('/', (req, res) => {
    res.render('home')
})
router.get('/contact', (req, res) => {
    res.render('contact')
})
router.get('/about', (req, res) => {
    res.render('about')
})
router.get('/blog', (req, res) => {
    res.render('blog')
})


router.get('/admin', ensureAuthenticated, (req, res) => res.render('admin', {
    name: req.user.name
}))

module.exports = router