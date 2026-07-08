import jwt from 'jsonwebtoken';

const checkSecret = (secretName) => {
  if (!process.env[secretName]) {
    throw new Error(`CRITICAL ERROR: Environment variable ${secretName} is not defined. Secure authentication cannot proceed.`);
  }
};

/**
 * Sign an Access Token
 * @param {string} userId - The user ID to include in the token payload
 * @returns {string} - The signed JWT token
 */
export const signAccessToken = (userId) => {
  checkSecret('ACCESS_TOKEN_SECRET');
  
  return jwt.sign(
    { id: userId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );
};

/**
 * Sign a Refresh Token
 * @param {string} userId - The user ID to include in the token payload
 * @returns {string} - The signed JWT token
 */
export const signRefreshToken = (userId) => {
  checkSecret('REFRESH_TOKEN_SECRET');

  return jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Verify an Access Token
 * @param {string} token - The access token to verify
 * @returns {object} - The decoded token payload
 */
export const verifyAccessToken = (token) => {
  checkSecret('ACCESS_TOKEN_SECRET');

  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid access token');
    } else {
      throw new Error('Access token verification failed');
    }
  }
};

/**
 * Verify a Refresh Token
 * @param {string} token - The refresh token to verify
 * @returns {object} - The decoded token payload
 */
export const verifyRefreshToken = (token) => {
  checkSecret('REFRESH_TOKEN_SECRET');

  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    } else {
      throw new Error('Refresh token verification failed');
    }
  }
};
