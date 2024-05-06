const { errorResponder, errorTypes } = require('../../../core/errors');
const User = require('../../../models/users-schema');
const authenticationServices = require('./authentication-service');

// Map to store failed login attempts and their timestamps
const failedLoginAttempts = new Map();

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function login(request, response, next) {
  const { email, password } = request.body;

  try {
    // Check if the user has exceeded the login attempt limit
    const attempts = failedLoginAttempts.get(email) || 0;
    if (attempts >= 5) {
      const lastAttemptTime = failedLoginAttempts.get(`${email}_timestamp`);
      const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
      if (lastAttemptTime && lastAttemptTime > thirtyMinutesAgo) {
        throw errorResponder(
          errorTypes.FORBIDDEN,
          'Too many failed login attempts. Please try again.'
        );
      } else {
        // Reset login attempts since it's been more than 30 minutes
        failedLoginAttempts.delete(email);
        failedLoginAttempts.delete(`${email}_timestamp`);
      }
    }

    // Check login credentials
    const loginSuccess = await authenticationServices.checkLoginCredentials(
      email,
      password
    );

    if (!loginSuccess) {
      // Increment failed login attempt count
      failedLoginAttempts.set(email, attempts + 1);
      failedLoginAttempts.set(`${email}_timestamp`, Date.now());

      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS,
        `Wrong email or password. Attempt ${attempts + 1} of 5`
      );
    }

    // Reset failed login attempt count upon successful login
    failedLoginAttempts.delete(email);
    failedLoginAttempts.delete(`${email}_timestamp`);

    return response.status(200).json(loginSuccess);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
};
