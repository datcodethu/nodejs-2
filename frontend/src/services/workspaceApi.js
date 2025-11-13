
import axiosClient from "../utils/axiosClient";

export const workspaceApi = {
  getAll: () => axiosClient.get("/workspaces").then(res => res.data),
  getById: (id) => axiosClient.get(`/workspaces/${id}`).then(res => res.data)
};
