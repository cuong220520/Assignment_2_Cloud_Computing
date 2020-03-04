if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

// initiate express 
const express = require('express')
const app = express()
// initiate express layouts
const expressLayouts = require('express-ejs-layouts')
// initiate bodyParser dependency
const bodyParser = require('body-parser')
// initiate method-override dependency
const methodOverride = require('method-override')
// initiate express-flash dependency
const flash = require('express-flash')
// initiate passport dependency
const passport = require('passport')
// initiate express-session dependency
const session = require('express-session')

// initiate routes
const indexRouter = require('./routes/index')
const productRouter = require('./routes/products')

require('./passport-config')(passport)

// use url encoded to change the url into ASCII 
app.use(express.urlencoded({ extended: false }))
// set view engine is ejs
app.set('view engine', 'ejs')
// set path of ejs file begin with views folder
app.set('views', __dirname + '/views')
// set layout of web application is views/layouts/layout.ejs
app.set('layout', 'layouts/layout')
// use express layout
app.use(expressLayouts)
// use method-override
app.use(methodOverride('_method'))
// set path to javascripts and stylesheets of web application is public/
app.use(express.static('public'))
// set limit of uploading json file is 10mb
app.use(bodyParser.json({ limit: '10mb' }))
// set limit of body-parser is 10mb
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))
// use flash to display error message when login
app.use(flash())
// use session
app.use(session({   
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))
// use initialize() function of passport library
app.use(passport.initialize())
// use passport session
app.use(passport.session())
// check user is authenticated.
app.use(function(req, res, next) {
    res.locals.isAuthenticated = req.isAuthenticated()
    next()
})

// initiate mongoose
const mongoose = require('mongoose')
// connect to database
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

// index page
app.use('/', indexRouter)
// products page
app.use('/products', productRouter)

// server listen at port 3000
app.listen(process.env.PORT || 3000)