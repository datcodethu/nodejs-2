import axiosClient from "../utils/axiosClient";

export const fileApi = {
    getAll: (userId) => axiosClient.get("/files", { 
        params: { ownerId: userId } 
    }),
    getById: (id) => axiosClient.get(`files/${id}`),
    share: (id) => axiosClient.post(`/files/share/${id}`),

    upload: (formData) => {
    return axiosClient.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
   },
   rename: (id, newName) => axiosClient.put(`/files/rename/${id}`, { newName }),
   delete: (id) => axiosClient.delete(`/files/${id}`),
}