const API_URL = "http://localhost:3000/api/v1"; // backend URL

// Auth
export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include"
  });
  return res.json();
};

export const refreshToken = async () => {
  const res = await fetch(`${API_URL}/auth/refresh-token`, { credentials: "include" });
  return res.json();
};

// Users
export const getUsers = async (token) => {
  const res = await fetch(`${API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

export const deleteUser = async (id, token) => {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

export const updateUser = async (id, data, token) => {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

// Files (admin only)
export const getFiles = async (token) => {
  const res = await fetch(`${API_URL}/admin/files`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

export const deleteFile = async (id, token) => {
  const res = await fetch(`${API_URL}/admin/files/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

export const getFileStatus = async (token) => {
  const res = await fetch(`${API_URL}/admin/files/status`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};
