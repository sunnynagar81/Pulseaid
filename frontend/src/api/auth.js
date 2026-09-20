import { api } from "./client";

export const registerDonor = (payload) => api.post("/auth/register/donor", payload).then((r) => r.data);

export const registerHospital = (payload) => api.post("/auth/register/hospital", payload).then((r) => r.data);

export const login = (payload) => api.post("/auth/login", payload).then((r) => r.data);

export const logout = () => api.post("/auth/logout").then((r) => r.data);

export const getMe = () => api.get("/auth/me").then((r) => r.data);