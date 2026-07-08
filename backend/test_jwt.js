import dotenv from 'dotenv';
dotenv.config();

// Provide dummy secrets if not exist for testing purposes only
if (!process.env.ACCESS_TOKEN_SECRET) process.env.ACCESS_TOKEN_SECRET = 'test_access';
if (!process.env.REFRESH_TOKEN_SECRET) process.env.REFRESH_TOKEN_SECRET = 'test_refresh';

import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from './utils/jwt.js';

try {
  const userId = '12345';
  
  const accessToken = signAccessToken(userId);
  console.log('Access token generated:', accessToken.substring(0, 20) + '...');
  
  const refreshToken = signRefreshToken(userId);
  console.log('Refresh token generated:', refreshToken.substring(0, 20) + '...');
  
  const decodedAccess = verifyAccessToken(accessToken);
  console.log('Access token decoded ID:', decodedAccess.id);
  
  const decodedRefresh = verifyRefreshToken(refreshToken);
  console.log('Refresh token decoded ID:', decodedRefresh.id);
  
  console.log('All tests passed successfully.');
} catch (error) {
  console.error('Test failed:', error.message);
  process.exit(1);
}
