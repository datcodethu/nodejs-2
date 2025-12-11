import axiosClient from "../utils/axiosClient";

export const folderApi = {
    getAll: () => axiosClient.get("/folders"),
    getById: (id) => axiosClient.get(`folders/${id}`)
}