import { api } from "./client";

export const respondToMatch = (matchId, response) =>
  api.patch(`/matches/${matchId}/respond`, { response }).then((r) => r.data);