const epRepository = require('./ep-repository');
const { MongoClient } = require('mongodb');

/**
 * Get list of paginated products
 * @param {object} pageNumber - pageNumber params to show the current page
 * @param {object} pageSize - pageSize params to show the apperance limit of data in current page
 * @param {object} search - search params to search based on email or name
 * @param {object} sort - sort params to sort email/name ascendingly/descendingly
 * @returns {Array}
 */
async function getProducts(pageNumber, pageSize, search, sort = 'asc') {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('demo-untar');
    const collection = database.collection('products');

    const query = {};
    if (search) {
      query.$or = [{ productName: { $regex: search, $options: 'i' } }];
    }

    const sortVal = {};
    if (sort === 'asc' || sort === 'desc') {
      if (sort === 'asc') {
        sortVal.productPrice = 1;
      } else {
        sortVal.productPrice = -1;
      }
    }

    if (sort === 'ascStock' || sort === 'descStock') {
      if (sort === 'ascStock') {
        sortVal.productStock = 1;
      } else {
        sortVal.productStock = -1;
      }
    }

    const users = await collection
      .find(query)
      .sort(sortVal)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    return users;
  } finally {
    await client.close();
  }
}

/**
 * Get list of paginated products
 * @param {object} search - search params to search based on email or name
 * @param {object} sort - sort params to sort email/name ascendingly/descendingly
 * @returns {Number}
 */
async function getProductsCount(search = '', sort = '') {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('demo-untar');
    const collection = database.collection('products');

    const query = {};
    if (search) {
      query.$or = [{ productName: { $regex: search, $options: 'i' } }];
    }

    const sortVal = {};
    if (sort === 'asc' || sort === 'desc') {
      if (sort === 'asc') {
        sortVal.productPrice = 1;
      } else {
        sortVal.productPrice = -1;
      }
    }

    if (sort === 'asc' || sort === 'desc') {
      if (sort === 'asc') {
        sortVal.productStock = 1;
      } else {
        sortVal.productStock = -1;
      }
    }

    const count = await collection.countDocuments(query);

    return count;
  } finally {
    await client.close();
  }
}

/**
 * Input new product
 * @param {string} productName - Name
 * @param {string} productPrice - Price
 * @param {string} productStock - Stock
 * @returns {boolean}
 */
async function inputProduct(productName, productPrice, productStock) {
  try {
    await epRepository.inputProduct(productName, productPrice, productStock);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing product
 * @param {string} id - Product ID
 * @param {string} productPrice - Price
 * @param {string} productStock - Stock
 * @returns {boolean}
 */
async function updateProduct(id, productPrice, productStock) {
  const product = await epRepository.updateProduct(id);

  // User not found
  if (!product) {
    return null;
  }

  try {
    await epRepository.updateProduct(id, productPrice, productStock);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete product
 * @param {string} id - Product ID
 * @returns {boolean}
 */
async function deleteProduct(id) {
  const product = await epRepository.inputProduct(id);

  // User not found
  if (!product) {
    return null;
  }

  try {
    await epRepository.deleteProduct(id);
  } catch (err) {
    return null;
  }

  return true;
}

module.exports = {
  getProducts,
  getProductsCount,
  inputProduct,
  updateProduct,
  deleteProduct,
};
