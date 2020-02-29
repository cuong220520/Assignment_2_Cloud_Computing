const express = require('express')
const router = express.Router()

const Product = require('../models/product')

const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

// All product route
router.get('/', checkAuthenticated, async (req, res) => {
    let searchOptions = {};
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i');
    }
    if (req.query.brand != null && req.query.brand !== '') {
        searchOptions.brand = new RegExp(req.query.brand, 'i');
    }
    try {
        const products = await Product.find(searchOptions)
        res.render('products/index', {
            products: products,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

// Create product route
router.get('/new', checkAuthenticated, (req, res) => {
    renderNewPage(res, new Product())
})

// Create product route
router.post('/', checkAuthenticated, async (req, res) => {
    const product = new Product({
        name: req.body.name,
        brand: req.body.brand,
        publishDate: new Date(req.body.publishDate),
        description: req.body.description
    })

    saveCover(product, req.body.cover)

    try {
        const newProduct = await product.save()
        res.redirect(`products/${newProduct.id}`)
    } catch {
        renderNewPage(res, product, true)
    }
})

// Show product route
router.get('/:id', checkAuthenticated, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        res.render('products/show', { product: product })
    } catch {
        res.redirect('/')
    }
})

// Update product route
router.get('/:id/edit', checkAuthenticated, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        renderEditPage(res, product)
    } catch {
        res.render('/')
    }
})

// Update product route
router.put('/:id', checkAuthenticated, async (req, res) => {
    let product
    try {
        product = await Product.findById(req.params.id)
        product.name = req.body.name
        product.brand = req.body.brand
        product.publishDate = new Date(req.body.publishDate)
        product.description = req.body.description
        if (req.body.cover != null && req.body.cover !== '') {
            saveCover(product, req.body.cover)
        }
        await product.save()
        res.redirect(`/products/${product.id}`)
    } catch {
        if (product != null) {
            renderEditPage(res, product, true)
        } else {
            res.redirect('/')
        }
    }
})

// Delete product route
router.delete('/:id', checkAuthenticated, async (req, res) => {
    let product
    try {
        product = await Product.findById(req.params.id)
        await product.remove()
        res.redirect('/products')
    } catch (error) {
        if (product != null) {
            res.render('products/show', {
                product: product,
                errorMessage: 'Could not remove product'
            })
        } else {
            res.redirect('/')
        }
    }
})

function renderNewPage(res, product, hasError = false) {
    renderFormPage(res, product, 'new', hasError)
}

function renderEditPage(res, product, hasError = false) {
    renderFormPage(res, product, 'edit', hasError)
}

function renderFormPage(res, product, form, hasError = false) {
    try {
        const params = {
            product: product
        }
        if(hasError) {
            if (form === 'edit') {
                params.errorMessage = 'Error Updating Product'
            } else {
                params.errorMessage = 'Error Creating Product'
            }
        }
        res.render(`products/${form}`, params)
    } catch {
        res.redirect('/products')
    }
}

function saveCover(product, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        product.coverImage = new Buffer.from(cover.data, 'base64')
        product.coverImageType = cover.type
    }
}

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

module.exports = router