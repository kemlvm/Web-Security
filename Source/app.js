const express = require('express')
const exphbs = require('express-handlebars')

const app = express()
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const hostname = '127.0.0.1'
const port = 3000
const { generateDate, limit, truncate, paginate } = require('./helpers/hbs')

const mongoose = require('mongoose')
const expressSession = require('express-session')
const connectMongo = require('connect-mongo')
const methodOverride = require('method-override')


const DBUrl = 'mongodb://127.0.0.1/denemeab'

mongoose.connect(DBUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})

const mongoStore = connectMongo(expressSession)

app.use(
    expressSession({
        secret: 'test',
        resave: false,
        saveUninitialized: false,
        store: new mongoStore({ mongooseConnection: mongoose.connection })
    })
);



app.use(fileUpload())

app.use(express.static('public'))

app.use(methodOverride('_method'))


const hbs = exphbs.create({
    helpers: {
        generateDate: generateDate,
        limit: limit,
        truncate: truncate,
        paginate: paginate
    }
})

// Handlebars Helpers
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Display - Link Middleware

app.use((req, res, next) => {
    const { userId } = req.session
    if (userId) {
        res.locals = {
            displayLink: true
        }
    } else {
        res.locals = {
            displayLink: false
        }
    }
    next()
})

// Flash - Message Middleware

app.use((req, res, next) => {
    res.locals.sessionFlash = req.session.sessionFlash
    delete req.session.sessionsFlash
    next()

})



const manage = require('./routes/manage')
const post = require('./routes/posts')
const users = require('./routes/users')
const admin = require('./routes/admin/index')

app.use('/', manage)
app.use('/posts', post)
app.use('/users', users)
app.use('/admin', admin)
app.use('/contact', manage)
app.use('/contacts', admin)
app.use('/comments', admin)


app.listen(port, hostname, () => {
    console.log(`\n Uranusflix Web Sunucusu Başarılı Bir Şekilde Çalıştırılmıştır \n 
    Çalıştığı URL: http://${hostname}:${port} Tıklayarak Gidebilirsiniz \n
    Developed By: Kemal 'Eukqla' | Role: Founder; `)
})