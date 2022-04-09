const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const {
    name,
    version,
    description,
    main,
    dependencies,
    license,
    author
} = require('./package.json')

const app = express()

//------------ Passport Configuration ------------//
require('./config/passport')(passport)

//------------ DB Configuration ------------//
const db = require('./config/key').MongoURL

//------------ Mongo Connection ------------//
mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
    .then(() => console.log("\n Mongo Database Connection Healthy"))
    .catch(err => console.log(err))

//------------ EJS Configuration ------------//
app.use(expressLayouts)
app.use("/assets", express.static('./assets'))
app.set('view engine', 'ejs')

//------------ Bodyparser Configuration ------------//
app.use(express.urlencoded({
    extended: false
}))

//------------ Express Session Configuration ------------//
app.use(
    session({
        secret: '62BB31CD8683E5453B49698B3355D',
        resave: true,
        saveUninitialized: true
    })
)

//------------ Passport Middlewares ------------//
app.use(passport.initialize())
app.use(passport.session())

//------------ Share Current User Info Within All Routes ------------//
app.use((req, res, next) => {
    res.locals.currentUser = req.user
    next()
})

//------------ Connecting Flash ------------//
app.use(flash())

//------------ Global Variables ------------//
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    next()
})

//------------ Routes ------------//
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))

const PORT = require('./config/key').PORT

app.listen(PORT, console.clear() & console.log(`\n Server Running On PORT ${PORT} 
\n URL : https://localhost:${PORT} 
\n Product Name : ${name}
\n Author : ${author}
\n Version Number : ${version}
\n Description : ${description}
\n Main File : ${main}
\n Used Technologies : ${dependencies}
\n License : ${license}
`))