const express = require('express');
const router = express.Router();
const Product = require('../models/product')
const passport = require('passport')
const bcrypt = require('bcrypt')
const User = require('../models/user')

// index page
router.get('/', checkAuthenticated, async (req, res) => {
    let products
    try {
        products = await Product.find().sort({ publishDate: 'desc' }).limit(10)
    } catch {
        products = []
    }
    res.render('index', { products: products });
});

// render register page
router.get('/register', checkNotAuthenticated,(req, res) => {
    res.render('register.ejs')
})

// register an account
router.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        })
        await user.save()
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})

// render login page
router.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

// check email and password is corrected
router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

// logout
router.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

// check user is authenticated
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

// check user is not authenticated
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }

    next()
}

module.exports = router;