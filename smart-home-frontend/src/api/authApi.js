import api from "./axios";

export const login = (data) => api.post("/auth/login", data);
export const getMe = () => api.get("/auth/me");

export const verifyOTP = (data) => api.post("/auth/verify-otp", data);
export const resendOTP = (data) => api.post("/auth/resend-otp", data);
