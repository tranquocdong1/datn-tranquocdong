import api from "./axios";

export const getSchedules = () => api.get("/schedules");
export const createSchedule = (data) => api.post("/schedules", data);
export const updateSchedule = (id, data) => api.put(`/schedules/${id}`, data);
export const toggleSchedule = (id) => api.patch(`/schedules/${id}/toggle`);
export const deleteSchedule = (id) => api.delete(`/schedules/${id}`);
export const getScheduleLogs = () => api.get("/schedules/logs");
