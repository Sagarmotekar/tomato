import axios from 'axios';

const api = axios.create({
    // CHANGE THIS: Replace localhost with your Render link
    baseURL: "https://tomato-backend-p79y.onrender.com", 
    withCredentials: true 
});

export default api;