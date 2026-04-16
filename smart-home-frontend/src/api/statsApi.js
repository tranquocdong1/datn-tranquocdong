import api from "./axios";

export const getOverview = () => api.get("/stats/overview");
export const getSummary = () => api.get("/stats/summary");
export const getAccessStats = (days) => api.get(`/stats/access?days=${days}`);
export const getTempHistory = (hours) =>
  api.get(`/stats/temperature?hours=${hours}`);
export const getLogs = (params) => api.get("/stats/logs", { params });
