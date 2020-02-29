const express = require('express');
const router = express.Router();
const Product = require('../models/product')
const passport = require('passport')
const bcrypt = require('bcrypt')
const User = require('../models/user')

router.get('/', checkAuthenticated,async (req, res) => {
    let products
    try {
        products = await Product.find().sort({ publishDate: 'desc' }).limit(10)
    } catch {
        products = []
    }
    res.render('index', { products: products });
});

router.get('/register', checkNotAuthenticated,(req, res) => {
    res.render('register.ejs')
})

router.post('/register', checkNotAuthenticated,async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        })  
        await user.save()
        res.redirect('/login')
    } catch (err) {
        console.log(err)
        renderFormPage(res, user, true)
    }
})

router.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

router.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }

    next()
}

function renderFormPage(res, user, hasError = false) {
    try {
        const params = {
            user: user
        }
        if(hasError) params.errorMessage = 'Error Creating Account'
        res.render('/login')
    } catch {
        res.redirect('/register')
    }
}

module.exports = router;