const joi = require('joi');
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = joi.extend(joiPasswordExtendCore);

module.exports = {
  inputProduct: {
    body: {
      productName: joi
        .string()
        .min(1)
        .max(100)
        .required()
        .label('Product Name'),
      productPrice: joi.number().required().label('Product Price'),
      productStock: joi.number().required().label('Product Stock'),
    },
  },

  updateProduct: {
    body: {
      productStock: joi.number().required().label('Product Stock'),
      productPrice: joi.number().required().label('Product Price'),
    },
  },
};
