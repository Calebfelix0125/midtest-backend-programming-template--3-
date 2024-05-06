const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');
const { MongoClient } = require('mongodb');

// /**
//  * Get list of users
//  * @returns {Array}
//  */
// async function getUsers() {
//   const users = await usersRepository.getUsers();

//   const results = [];
//   for (let i = 0; i < users.length; i += 1) {
//     const user = users[i];
//     results.push({
//       id: user.id,
//       name: user.name,
//       email: user.email,
//     });
//   }

//   return results;
// }

/**
 * Get list of paginated users
 * @param {object} pageNumber - pageNumber params to show the current page
 * @param {object} pageSize - pageSize params to show the apperance limit of data in current page
 * @param {object} search - search params to search based on email or name
 * @param {object} sort - sort params to sort email/name ascendingly/descendingly
 * @returns {Array}
 */
async function getUsers(pageNumber, pageSize, search, sort = 'asc') {
  // Connect to db
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('demo-untar');
    const collection = database.collection('users');

    const query = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    // Email sort
    const sortVal = {};
    if (sort === 'asc' || sort === 'desc') {
      if (sort === 'asc') {
        sortVal.email = 1;
      } else {
        sortVal.email = -1;
      }
    }

    // Name sort
    if (sort === 'ascName' || sort === 'descName') {
      if (sort === 'ascName') {
        sortVal.name = 1;
      } else {
        sortVal.name = -1;
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
    await client.close(); // Close connection
  }
}

/**
 * Get list of paginated users
 * @param {object} search - search params to search based on email or name
 * @param {object} sort - sort params to sort email/name ascendingly/descendingly
 * @returns {Number}
 */
async function getUserCount(search = '', sort = '') {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('demo-untar');
    const collection = database.collection('users');

    const query = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    // Email sort
    const sortVal = {};
    if (sort === 'asc' || sort === 'desc') {
      if (sort === 'asc') {
        sortVal.email = 1;
      } else {
        sortVal.email = -1;
      }
    }

    // Name sort
    if (sort === 'ascName' || sort === 'descName') {
      if (sort === 'ascName') {
        sortVal.name = 1;
      } else {
        sortVal.name = -1;
      }
    }

    // Count documents in database
    const count = await collection.countDocuments(query);

    return count;
  } finally {
    await client.close();
  }
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const user = await usersRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(userId, password) {
  const user = await usersRepository.getUser(userId);
  return passwordMatched(password, user.password);
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(userId, password) {
  const user = await usersRepository.getUser(userId);

  // Check if user not found
  if (!user) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await usersRepository.changePassword(
    userId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

module.exports = {
  getUsers,
  getUserCount,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  emailIsRegistered,
  checkPassword,
  changePassword,
};
