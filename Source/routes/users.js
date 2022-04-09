const express = require('express')
const router = express.Router()
const User = require('../models/User')

router.get('/register', (req, res) => {
    res.render('site/register')

})

router.post('/register', (req, res) => {
    User.create(req.body, (error, user) => {
        req.session.sessionFlash = {
            type: "alert alert-success",
            message: `Başarılı! Sistemimize Başarılı Bir Şekilde Kayıt Eklendi. Kaydı Eklenen Kişi ${user.username}!`
        }
        res.redirect("/admin")
    })
})

router.get('/login', (req, res) => {
    if (!req.session.userId) {
        return res.render('site/login')
    } else {
        res.redirect('/')
    }
})


router.post('/login', (req, res) => {
    const { email, password } = req.body
    User.findOne({ email }, (error, user) => {
        if (user) {
            if (user.password == password) {
                req.session.userId = user._id

                res.redirect('/')
            } else {
                res.redirect('/users/login')
            }
        } else {
            res.redirect('/users/register')
        }
        console.log('Aldığınız Hata > ', error, 'Hatanız Yok İse undefined / null Yazıyordur! DEBUG:01')
    })
})

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
})


module.exports = router