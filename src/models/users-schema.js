const usersSchema = {
  name: String,
  email: String,
  password: String,
};

const productsSchema = {
  productName: String,
  productPrice: Number,
  productStock: Number,
};

module.exports = { usersSchema, productsSchema };
