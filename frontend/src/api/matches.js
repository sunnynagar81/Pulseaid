import { api } from "./client";

export const respondToMatch = (matchId, response) =>
  api.patch(`/matches/${matchId}/respond`, { response }).then((r) => r.data);

export const confirmDonation = (matchId) =>
  api.patch(`/matches/${matchId}/confirm`, {}).then((r) => r.data);