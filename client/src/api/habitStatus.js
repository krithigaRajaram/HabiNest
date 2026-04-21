import axiosInstance from './axiosInstance';

export const getStatusByDate = (date) => axiosInstance.get(`/habit-status/${date}`);
export const updateHabitStatus = (data) => axiosInstance.post('/habit-status', data);
export const getStreak = (habitId) => axiosInstance.get(`/habit-status/streak/${habitId}`);

// Fetch all status records for a specific habit within date range
export const getHabitHistory = (habitId, startDate, endDate) =>
  axiosInstance.get(`/habit-status/habit/${habitId}`, {
    params: { startDate, endDate }
  });