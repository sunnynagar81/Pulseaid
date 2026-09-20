import { api } from "./client";

export const createRequest = (payload) => api.post("/requests", payload).then((r) => r.data);

export const getOpenRequests = () => api.get("/requests").then((r) => r.data);

export const getRequestMatches = (requestId) =>
  api.get(`/requests/${requestId}/matches`).then((r) => r.data);