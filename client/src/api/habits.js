import axiosInstance from './axiosInstance';

export const getHabits = () => axiosInstance.get('/habits');
export const createHabit = (data) => axiosInstance.post('/habits', data);
export const updateHabit = (id, data) => axiosInstance.put(`/habits/${id}`, data);
export const deleteHabit = (id) => axiosInstance.delete(`/habits/${id}`);