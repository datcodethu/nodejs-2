import axiosClient from "../utils/axiosClient";

export const fileApi = {
    getAll: () => axiosClient.get("/files"),
    getById: (id) => axiosClient.get(`files/${id}`),
    share: (id) => axiosClient.post(`/files/share/${id}`),
    upload: (formData) => {
    return axiosClient.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
}