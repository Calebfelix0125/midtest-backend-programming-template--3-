const { Product, User } = require('../../../models');

/**
 * Input new product
 * @param {string} productName - Name
 * @param {string} productPrice - Price
 * @param {string} productStock - Stock
 * @returns {Promise}
 */
async function inputProduct(productName, productPrice, productStock) {
  return Product.create({
    productName,
    productPrice,
    productStock,
  });
}

/**
 * Update existing product
 * @param {string} id - Product ID
 * @param {string} productPrice - Price
 * @param {string} productStock - Stock
 * @returns {Promise}
 */
async function updateProduct(id, productPrice, productStock) {
  return Product.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        productPrice,
        productStock,
      },
    }
  );
}

/**
 * Delete a product
 * @param {string} id - Product ID
 * @returns {Promise}
 */
async function deleteProduct(id) {
  return Product.deleteOne({ _id: id });
}

module.exports = {
  inputProduct,
  updateProduct,
  deleteProduct,
};
