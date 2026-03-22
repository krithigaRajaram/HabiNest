import axiosInstance from './axiosInstance';

export const register = (data) => axiosInstance.post('/auth/register', data);
export const login = (data) => axiosInstance.post('/auth/login', data);
export const googleLogin = (data) => axiosInstance.post('/auth/google-login', data);
export const getMe = () => axiosInstance.get('/auth/me');