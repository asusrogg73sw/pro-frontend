import axios from 'axios';

const API = axios.create({
  baseURL: 'https://pro-backend-production-72bc.up.railway.app/api', // Aapka live URL
});

export default API;