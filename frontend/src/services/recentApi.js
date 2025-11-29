import axiosClient from "../utils/axiosClient";

export const recentApi = {
  getAll: () => axiosClient.get("/recently-opened"),
};
