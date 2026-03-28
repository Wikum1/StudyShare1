import axios from "axios";

const API = "/api/study-plans";

// 🔑 Get token from localStorage
const getAuthConfig = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  };
};

export const createPlan = (data) =>
  axios.post(API, data, getAuthConfig());

export const getPlans = () =>
  axios.get(API, getAuthConfig());

export const addTask = (planId, data) =>
  axios.post(`${API}/${planId}/tasks`, data, getAuthConfig());

export const updateTask = (planId, taskId, data) =>
  axios.put(`${API}/${planId}/tasks/${taskId}`, data, getAuthConfig());

export const deletePlan = (id) =>
  axios.delete(`/api/study-plans/${id}`);

// delete task
export const deleteTask = (planId, taskId) =>
  axios.delete(`/api/study-plans/${planId}/tasks/${taskId}`);

// update plan name
export const updatePlan = (id, data) =>
  axios.put(`/api/study-plans/${id}`, data);