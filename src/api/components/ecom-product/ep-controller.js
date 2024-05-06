const epService = require('./ep-service');
const { errorResponder, errorTypes } = require('../../../core/errors');
const epValidator = require('./ep-validator');

/**
 * Handle get paginated list of products request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getProducts(request, response, next) {
  try {
    const page_number = parseInt(request.query.page_number) || 1;
    const page_size = parseInt(request.query.page_size) || 5;
    const search = request.query.search
      ? request.query.search.split(':')[1]
      : '';
    const sort = request.query.sort ? request.query.sort.split(':')[1] : 'asc';

    const countProducts = await epService.getProductsCount(search, sort);

    const products = await epService.getProducts(
      page_number,
      page_size,
      search.toString().toUpperCase(),
      sort
    );

    const totalPages = Math.ceil(countProducts / page_size);
    const hasNextPage = page_number < countProducts;
    const hasPreviousPage = page_number > 1;

    return response.status(200).json({
      page_number: page_number,
      page_size: page_size,
      count: countProducts,
      total_pages: totalPages,
      has_previous_page: hasPreviousPage,
      has_next_page: hasNextPage,
      data: products,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create product detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function inputProduct(request, response, next) {
  try {
    const productName = request.body.productName;
    const productPrice = request.body.productPrice;
    const productStock = request.body.productStock;

    const success = await epService.inputProduct(
      productName,
      productPrice,
      productStock
    );
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to input product'
      );
    }

    return response
      .status(200)
      .json({ productName, productPrice, productStock });
  } catch (error) {
    return next(error);
  }
}

/**
 * Update existing product
 * @param {string} id - Product ID
 * @param {string} productPrice - Price
 * @param {string} productStock - Stock
 * @returns {boolean}
 */
async function updateProduct(request, response, next) {
  try {
    const id = request.params.id;
    const productName = request.params.productName;
    const productPrice = request.body.productPrice;
    const productStock = request.body.productStock;

    const success = await epService.updateProduct(
      id,
      productPrice,
      productStock
    );
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update product'
      );
    }

    return response.status(200).json({ productPrice, productStock });
  } catch (error) {
    return next(error);
  }
}

/**
 * Delete product
 * @param {string} id - Product ID
 * @returns {boolean}
 */
async function deleteProduct(request, response, next) {
  try {
    const id = request.params.id;

    const success = await epService.deleteProduct(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete product'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getProducts,
  inputProduct,
  updateProduct,
  deleteProduct,
};
