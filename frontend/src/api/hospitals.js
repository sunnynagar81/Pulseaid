import { api } from "./client";

export const getDashboard = () => api.get("/hospitals/me/dashboard").then((r) => r.data);

export const updateProfile = (payload) => api.patch("/hospitals/me", payload).then((r) => r.data);

export const changePassword = (payload) => api.patch("/hospitals/me/password", payload).then((r) => r.data);