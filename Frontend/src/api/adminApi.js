import axios from "axios";

const API_BASE = "http://localhost:4000/api/admin";

function authHeaders() {
  return {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };
}

export async function fetchAllUsers() {
  const res = await axios.get(`${API_BASE}/users`, authHeaders());
  return res.data;
}

export async function deleteUser(id) {
  const res = await axios.delete(`${API_BASE}/users/${id}`, authHeaders());
  return res.data;
}

export async function uploadCsv(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(`${API_BASE}/upload-csv`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data;
}
