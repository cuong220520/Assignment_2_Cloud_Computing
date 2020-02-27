const mongoose = require('mongoose')
const path = require('path')

const coverImageBasePath = 'uploads/productCovers'

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  publishDate: {
    type: Date,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  coverImageName: {
    type: String,
    required: true
  }
})

productSchema.virtual('coverImagePath').get(function() {
  if (this.coverImageName != null) {
    return path.join('/', coverImageBasePath, this.coverImageName)
  }
})

module.exports = mongoose.model('Product', productSchema)
module.exports.coverImageBasePath = coverImageBasePath