const authenticationRepository = require('./authentication-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');

// Map untuk menyimpan informasi tentang percobaan login dan waktu terakhir
// percobaan login untuk setiap email pengguna.
const loginAttempts = new Map();
const loginAttemptsTime = new Map(); // Define loginAttemptsTime map

/**
 * Check username and password for login.
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function checkLoginCredentials(email, password) {
  const user = await authenticationRepository.getUserByEmail(email);

  // Mendapatkan jumlah percobaan login sebelumnya untuk email ini.
  const attempts = loginAttempts.get(email) || 0;

  // Periksa apakah batasan percobaan login telah tercapai.
  if (attempts >= 5) {
    const lastAttemptTime = loginAttemptsTime.get(email); // Get last attempt time
    const currentTime = new Date();
    // Jika waktu terakhir percobaan login adalah lebih dari 30 menit yang lalu, reset percobaan.
    if (currentTime - lastAttemptTime > 30 * 60 * 1000) {
      loginAttempts.delete(email);
      loginAttemptsTime.delete(email);
    } else {
      // Jika masih dalam batas waktu, kembalikan error.
      throw new Error('403 Forbidden: Too many failed login attempts');
    }
  }

  // We define default user password here as '<RANDOM_PASSWORD_FILTER>'
  // to handle the case when the user login is invalid. We still want to
  // check the password anyway, so that it prevents the attacker in
  // guessing login credentials by looking at the processing time.
  const userPassword = user ? user.password : '<RANDOM_PASSWORD_FILLER>';
  const passwordChecked = await passwordMatched(password, userPassword);

  // Jika email dan password cocok, buat token dan kembalikan.
  if (user && passwordChecked) {
    // Hapus informasi percobaan login untuk email ini.
    loginAttempts.delete(email);
    loginAttemptsTime.delete(email);

    return {
      email: user.email,
      name: user.name,
      user_id: user.id,
      token: generateToken(user.email, user.id),
    };
  } else {
    // Jika percobaan login gagal, tambahkan 1 ke jumlah percobaan login.
    loginAttempts.set(email, attempts + 1);
    loginAttemptsTime.set(email, new Date()); // Set the current time
  }

  return null;
}

module.exports = {
  checkLoginCredentials,
};
