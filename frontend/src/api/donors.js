import { api } from "./client";

export const getMyMatches = () => api.get("/donors/me/matches").then((r) => r.data);

export const getEligibility = () => api.get("/donors/me/eligibility").then((r) => r.data);

export const updateAvailability = (isAvailable) =>
  api.patch("/donors/me/availability", { isAvailable }).then((r) => r.data);

export const updateLocation = (coordinates) =>
  api.patch("/donors/me/location", { coordinates }).then((r) => r.data);

export const recordDonation = () => api.post("/donors/me/donations").then((r) => r.data);

export const updateProfile = (payload) => api.patch("/donors/me", payload).then((r) => r.data);

export const changePassword = (payload) => api.patch("/donors/me/password", payload).then((r) => r.data);