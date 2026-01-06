// frontend/src/api/axios.js
import axios from 'axios';

const api = axios.create({
    baseURL: "https://tomato-backend-p79y.onrender.com/",
    withCredentials: true // MANDATORY for the cookies to work
});