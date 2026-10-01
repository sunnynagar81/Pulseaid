import { api } from "./client";

export const getPublicStats = () => api.get("/stats/public").then((r) => r.data);