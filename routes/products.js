const express = require('express')
const router = express.Router()
// const multer = require('multer')
// const path = require('path')
// const fs = require('fs')

const Product = require('../models/product')

// const uploadPath = path.join('public', Product.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

// const upload = multer({
//     dest: uploadPath,
//     fileFilter: (req, file, callback) => {
//         callback(null, imageMimeTypes.includes(file.mimetype))
//     }
// })

router.get('/', async (req, res) => {
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

router.get('/new', (req, res) => {
    renderNewPage(res, new Product())
})

router.post('/', async (req, res) => {
    // const fileName = req.file != null ? req.file.filename : null
    const product = new Product({
        name: req.body.name,
        brand: req.body.brand,
        publishDate: new Date(req.body.publishDate),
        // coverImageName: fileName, 
        description: req.body.description
    })

    saveCover(product, req.body.cover)

    try {
        const newProduct = await product.save()
        res.redirect(`products`)
    } catch {
        // if (product.coverImageName != null) {
        //     removeProductCover(product.coverImageName)
        // }
        renderNewPage(res, product, true)
    }
})

// function removeProductCover(fileName) {
//     fs.unlink(path.join(uploadPath, fileName), err => {
//         if (err) console.error(err)
//     })
// }

function renderNewPage(res, product, hasError = false) {
    try {
        const params = {
            product: product
        }
        if (hasError) params.errorMessage = 'Error Creating Product'
        res.render('products/new', params)
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

module.exports = router