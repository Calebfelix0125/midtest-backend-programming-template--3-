const express = require('express');

const celebrate = require('../../../core/celebrate-wrappers');
const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const epControllers = require('./ep-controller');
const epValidator = require('./ep-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/products', route);

  // Get list of products
  route.get('/', authenticationMiddleware, epControllers.getProducts);

  // Input the new product
  route.post('/', authenticationMiddleware, epControllers.inputProduct);

  // Update product
  route.put(
    '/:id',
    authenticationMiddleware,
    celebrate(epValidator.updateProduct),
    epControllers.updateProduct
  );

  // Delete user
  route.delete('/:id', authenticationMiddleware, epControllers.deleteProduct);
};
