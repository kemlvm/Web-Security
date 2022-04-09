const passport = require('passport')
const bcryptjs = require('bcryptjs')
const nodemailer = require('nodemailer')
const { google } = require("googleapis")
const OAuth2 = google.auth.OAuth2
const jwt = require('jsonwebtoken')
const JWT_KEY = "jwtactive987"
const JWT_RESET_KEY = "jwtreset987"

//------------ User Model ------------//
const User = require('../models/User')

//------------ Register Handle ------------//
exports.registerHandle = (req, res) => {
    const { name, email, password, password2 } = req.body
    let errors = []

    //------------ Checking Required Fields ------------//
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please Enter All Fields' })
    }

    //------------ Checking Password Mismatch ------------//
    if (password != password2) {
        errors.push({ msg: 'Passwords Do Not Match' })
    }

    //------------ Checking Password Length ------------//
    if (password.length < 8) {
        errors.push({ msg: 'Password Must Be At Least 8 Characters' })
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        })
    } else {
        //------------ Validation Passed ------------//
        User.findOne({ email: email }).then(user => {
            if (user) {
                //------------ User Already Exists ------------//
                errors.push({ msg: 'Email ID Already Registered' })
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                })
            } else {

                const oauth2Client = new OAuth2(
                    "173872994719-pvsnau5mbj47h0c6ea6ojrl7gjqq1908.apps.googleusercontent.com", // ClientID
                    "OKXIYR14wBB_zumf30EC__iJ", // Client Secret
                    "https://developers.google.com/oauthplayground" // Redirect URL
                )

                oauth2Client.setCredentials({
                    refresh_token: "1//04T_nqlj9UVrVCgYIARAAGAQSNwF-L9IrGm-NOdEKBOakzMn1cbbCHgg2ivkad3Q_hMyBkSQen0b5ABfR8kPR18aOoqhRrSlPm9w"
                })
                const accessToken = oauth2Client.getAccessToken()

                const token = jwt.sign({ name, email, password }, JWT_KEY, { expiresIn: '30m' })
                const CLIENT_URL = 'http://' + req.headers.host

                const output = `
                <h2>Please Click On Below Link To Activate Your Account</h2>
                <p>${CLIENT_URL}/auth/activate/${token}</p>
                <p><b>NOTE: </b> The Above Activation Link Expires In 30 Minutes.</p>
                `

                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        type: "OAuth2",
                        user: "nodejsa@gmail.com",
                        clientId: "173872994719-pvsnau5mbj47h0c6ea6ojrl7gjqq1908.apps.googleusercontent.com",
                        clientSecret: "OKXIYR14wBB_zumf30EC__iJ",
                        refreshToken: "1//04T_nqlj9UVrVCgYIARAAGAQSNwF-L9IrGm-NOdEKBOakzMn1cbbCHgg2ivkad3Q_hMyBkSQen0b5ABfR8kPR18aOoqhRrSlPm9w",
                        accessToken: accessToken
                    },
                })

                // Send Mail With Defined Transport Object
                const mailOptions = {
                    from: '"WSC Technologies Admin" <nodejsa@gmail.com>', // Sender Address
                    to: email, // List Of Receivers
                    subject: "Account Verification: WSC Technologies ✔", // Subject Line
                    generateTextFromHTML: true,
                    html: output, // Html Body
                }

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error)
                        req.flash(
                            'error_msg',
                            'Something Went Wrong On Our End. Please Register Again.'
                        )
                        res.redirect('/auth/login')
                    }
                    else {
                        console.log('Mail sent : %s', info.response)
                        req.flash(
                            'success_msg',
                            'Activation Link Sent To Email ID. Please Activate To Log In.'
                        )
                        res.redirect('/auth/login')
                    }
                })

            }
        })
    }
}

//------------ Activate Account Handle ------------//
exports.activateHandle = (req, res) => {
    const token = req.params.token
    let errors = []
    if (token) {
        jwt.verify(token, JWT_KEY, (err, decodedToken) => {
            if (err) {
                req.flash(
                    'error_msg',
                    'Incorrect Or Expired Link! Please Register Again.'
                )
                res.redirect('/auth/register')
            }
            else {
                const { name, email, password } = decodedToken
                User.findOne({ email: email }).then(user => {
                    if (user) {
                        //------------ User Already Exists ------------//
                        req.flash(
                            'error_msg',
                            'Email ID Already Registered! Please Log In.'
                        )
                        res.redirect('/auth/login')
                    } else {
                        const newUser = new User({
                            name,
                            email,
                            password
                        })

                        bcryptjs.genSalt(10, (err, salt) => {
                            bcryptjs.hash(newUser.password, salt, (err, hash) => {
                                if (err) throw err
                                newUser.password = hash
                                newUser
                                    .save()
                                    .then(user => {
                                        req.flash(
                                            'success_msg',
                                            'Account Activated. You Can Now Log In.'
                                        )
                                        res.redirect('/auth/login')
                                    })
                                    .catch(err => console.log(err))
                            })
                        })
                    }
                })
            }

        })
    }
    else {
        console.log("Account Activation Error!")
    }
}

//------------ Forgot Password Handle ------------//
exports.forgotPassword = (req, res) => {
    const { email } = req.body

    let errors = []

    //------------ Checking Required Fields ------------//
    if (!email) {
        errors.push({ msg: 'Please Enter An Email ID' })
    }

    if (errors.length > 0) {
        res.render('forgot', {
            errors,
            email
        })
    } else {
        User.findOne({ email: email }).then(user => {
            if (!user) {
                //------------ User Already Exists ------------//
                errors.push({ msg: 'User With Email ID Does Not Exist!' })
                res.render('forgot', {
                    errors,
                    email
                })
            } else {

                const oauth2Client = new OAuth2(
                    "173872994719-pvsnau5mbj47h0c6ea6ojrl7gjqq1908.apps.googleusercontent.com", // ClientID
                    "OKXIYR14wBB_zumf30EC__iJ", // Client Secret
                    "https://developers.google.com/oauthplayground" // Redirect URL
                )

                oauth2Client.setCredentials({
                    refresh_token: "1//04T_nqlj9UVrVCgYIARAAGAQSNwF-L9IrGm-NOdEKBOakzMn1cbbCHgg2ivkad3Q_hMyBkSQen0b5ABfR8kPR18aOoqhRrSlPm9w"
                })
                const accessToken = oauth2Client.getAccessToken()

                const token = jwt.sign({ _id: user._id }, JWT_RESET_KEY, { expiresIn: '30m' })
                const CLIENT_URL = 'http://' + req.headers.host
                const output = `
                <h2>Please Click On Below Link To Reset Your Account Password</h2>
                <p>${CLIENT_URL}/auth/forgot/${token}</p>
                <p><b>NOTE: </b> The Activation Link Expires In 30 Minutes.</p>
                `

                User.updateOne({ resetLink: token }, (err, success) => {
                    if (err) {
                        errors.push({ msg: 'Error Resetting Password!' })
                        res.render('forgot', {
                            errors,
                            email
                        })
                    }
                    else {
                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                type: "OAuth2",
                                user: "nodejsa@gmail.com",
                                clientId: "173872994719-pvsnau5mbj47h0c6ea6ojrl7gjqq1908.apps.googleusercontent.com",
                                clientSecret: "OKXIYR14wBB_zumf30EC__iJ",
                                refreshToken: "1//04T_nqlj9UVrVCgYIARAAGAQSNwF-L9IrGm-NOdEKBOakzMn1cbbCHgg2ivkad3Q_hMyBkSQen0b5ABfR8kPR18aOoqhRrSlPm9w",
                                accessToken: accessToken
                            },
                        })

                        // Send Mail With Defined Transport Object
                        const mailOptions = {
                            from: '"WSC Technologies" <nodejsa@gmail.com>', // Sender Address
                            to: email, // List Of Receivers
                            subject: "Account Password Reset: WSC Technologies ✔", // Subject Line
                            html: output, // Html Body
                        }

                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.log(error)
                                req.flash(
                                    'error_msg',
                                    'Something Went Wrong On Our End. Please Try Again Later.'
                                )
                                res.redirect('/auth/forgot')
                            }
                            else {
                                console.log('Mail sent : %s', info.response)
                                req.flash(
                                    'success_msg',
                                    'Password Reset Link Sent To Email ID. Please Follow The Instructions.'
                                )
                                res.redirect('/auth/login')
                            }
                        })
                    }
                })

            }
        })
    }
}

//------------ Redirect To Reset Handle ------------//
exports.gotoReset = (req, res) => {
    const { token } = req.params

    if (token) {
        jwt.verify(token, JWT_RESET_KEY, (err, decodedToken) => {
            if (err) {
                req.flash(
                    'error_msg',
                    'Incorrect Or Expired Link! Please Try Again.'
                )
                res.redirect('/auth/login')
            }
            else {
                const { _id } = decodedToken
                User.findById(_id, (err, user) => {
                    if (err) {
                        req.flash(
                            'error_msg',
                            'User With Email ID Does Not Exist! Please Try Again.'
                        )
                        res.redirect('/auth/login')
                    }
                    else {
                        res.redirect(`/auth/reset/${_id}`)
                    }
                })
            }
        })
    }
    else {
        console.log("Password Reset Error!")
    }
}


exports.resetPassword = (req, res) => {
    var { password, password2 } = req.body
    const id = req.params.id
    let errors = []

    //------------ Checking Required Fields ------------//
    if (!password || !password2) {
        req.flash(
            'error_msg',
            'Please Enter All Fields.'
        )
        res.redirect(`/auth/reset/${id}`)
    }

    //------------ Checking Password Length ------------//
    else if (password.length < 8) {
        req.flash(
            'error_msg',
            'Password Must Be At Least 8 Characters.'
        )
        res.redirect(`/auth/reset/${id}`)
    }

    //------------ Checking Password Mismatch ------------//
    else if (password != password2) {
        req.flash(
            'error_msg',
            'Passwords do not match.'
        )
        res.redirect(`/auth/reset/${id}`)
    }

    else {
        bcryptjs.genSalt(10, (err, salt) => {
            bcryptjs.hash(password, salt, (err, hash) => {
                if (err) throw err
                password = hash

                User.findByIdAndUpdate(
                    { _id: id },
                    { password },
                    function (err, result) {
                        if (err) {
                            req.flash(
                                'error_msg',
                                'Error Resetting Password!'
                            )
                            res.redirect(`/auth/reset/${id}`)
                        } else {
                            req.flash(
                                'success_msg',
                                'Password Reset Successfully!'
                            )
                            res.redirect('/auth/login')
                        }
                    }
                )

            })
        })
    }
}

//------------ Login Handle ------------//
exports.loginHandle = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/auth/login',
        failureFlash: true
    })(req, res, next)
}

//------------ Logout Handle ------------//
exports.logoutHandle = (req, res) => {
    req.logout()
    req.flash('success_msg', 'Exit Has Been Successfully Made!')
    res.redirect('/auth/login')
}