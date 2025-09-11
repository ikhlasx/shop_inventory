import axios from 'axios';
import config from '../config';

const BACKEND_URL = config.BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const testApiConnection = async () => {
  console.log('Testing API connection...');
  console.log('Backend URL:', BACKEND_URL);
  console.log('API URL:', API);
  
  try {
    const response = await axios.get(`${API}`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API connection successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ API connection failed:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    return { success: false, error: error.message };
  }
};

export default testApiConnection; 