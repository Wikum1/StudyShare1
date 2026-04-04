import axios from "axios";

const API = "/api/study-plans";

const getAuthConfig = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  };
};

// ── Plans ──────────────────────────────────────────────
export const createPlan = (data) =>
  axios.post(API, data, getAuthConfig()).then(res => res.data);

export const getPlans = () =>
  axios.get(API, getAuthConfig()).then(res => res.data);

export const getPlan = (id) =>
  axios.get(`${API}/${id}`, getAuthConfig()).then(res => res.data);

export const updatePlan = (id, data) =>
  axios.put(`${API}/${id}`, data, getAuthConfig()).then(res => res.data);

export const deletePlan = (id) =>
  axios.delete(`${API}/${id}`, getAuthConfig()).then(res => res.data);

// ── Tasks ──────────────────────────────────────────────
export const addTask = (planId, data) =>
  axios.post(`${API}/${planId}/tasks`, data, getAuthConfig()).then(res => res.data);

export const getTasks = (planId) =>
  axios.get(`${API}/${planId}/tasks`, getAuthConfig()).then(res => res.data);

export const updateTask = (planId, taskId, data) =>
  axios.put(`${API}/${planId}/tasks/${taskId}`, data, getAuthConfig()).then(res => res.data);

export const deleteTask = (planId, taskId) =>
  axios.delete(`${API}/${planId}/tasks/${taskId}`, getAuthConfig()).then(res => res.data);