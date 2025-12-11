import axiosClient from "../utils/axiosClient";

export const fileApi = {
    getAll: () => axiosClient.get("/files"),
    getById: (id) => axiosClient.get(`files/${id}`),
    share: (id) => axiosClient.post(`/files/share/${id}`)
}