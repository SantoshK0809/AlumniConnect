import API from "./index";

const BASE = "/jobs";

export async function fetchJobs(params = {}) {
  const query = new URLSearchParams();
  if (params.type && params.type !== "All") query.set("type", params.type);
  if (params.search) query.set("search", params.search);
  if (params.skills) query.set("skills", params.skills);

  const url = query.toString() ? `${BASE}?${query}` : BASE;
  const res = await API.get(url);
  return res.data;
}

export async function fetchJobById(id) {
  const res = await API.get(`${BASE}/${id}`);
  return res.data;
}

export async function createJob(data) {
  const res = await API.post(BASE, data);
  return res.data;
}

export async function updateJob(id, data) {
  const res = await API.put(`${BASE}/${id}`, data);
  return res.data;
}

export async function deleteJob(id) {
  const res = await API.delete(`${BASE}/${id}`);
  return res.data;
}
