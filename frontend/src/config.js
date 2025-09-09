// Configuration file for environment variables
const config = {
  // Backend API URL - can be set via environment variable or use default
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 'https://your-backend-domain.com',
  
  // Environment detection
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  
  // Feature flags
  ENABLE_HOT_RELOAD: process.env.DISABLE_HOT_RELOAD !== 'true',
};

export default config; 