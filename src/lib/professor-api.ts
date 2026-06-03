import { api } from "./api";

export const professorApi = {
  getPendingProjects: (pageNumber = 1, pageSize = 20) =>
    api.get("/api/Professor/projects/pending", { params: { pageNumber, pageSize } }),

  reviewProject: (projectId: string | number, approve: boolean) =>
    api.post(`/api/Professor/projects/${projectId}/review`, { approve }),

  addFeedback: (projectId: string | number, content: string) =>
    api.post(`/api/Professor/projects/${projectId}/feedback`, { content }),

  getSupervisedProjects: () =>
    api.get("/api/Professor/projects"),

  getSupervisedTeams: () =>
    api.get("/api/Professor/teams"),

  getFeedbackHistory: () =>
    api.get("/api/Professor/feedback"),

  getTeamChat: (teamId: string | number) =>
    api.get(`/api/Professor/teams/${teamId}/chat`),

  sendChatMessage: (teamId: string | number, content: string) =>
    api.post(`/api/Professor/teams/${teamId}/chat/messages`, { content }),
};
