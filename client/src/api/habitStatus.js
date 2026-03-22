import axiosInstance from './axiosInstance';

export const getStatusByDate = (date) => axiosInstance.get(`/habit-status/${date}`);
export const updateHabitStatus = (data) => axiosInstance.post('/habit-status', data);
export const getStreak = (habitId) => axiosInstance.get(`/habit-status/streak/${habitId}`);