import axios from "axios";

const API = "/api/wall";

const getAuthConfig = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  };
};

const getPosts = () =>
  axios.get(`${API}/posts`, getAuthConfig()).then((res) => res.data);

const createPost = (formData) => {
  const auth = getAuthConfig();
  return axios
    .post(`${API}/posts`, formData, {
      ...auth,
      // IMPORTANT: do NOT set Content-Type manually for FormData
    })
    .then((res) => res.data);
};

const toggleLike = (postId) =>
  axios.post(`${API}/posts/${postId}/like`, {}, getAuthConfig()).then((r) => r.data);

const toggleSave = (postId) =>
  axios.post(`${API}/posts/${postId}/save`, {}, getAuthConfig()).then((r) => r.data);

const addComment = (postId, data) =>
  axios.post(`${API}/posts/${postId}/comments`, data, getAuthConfig()).then((r) => r.data);

const deletePost = (postId) =>
  axios.delete(`${API}/posts/${postId}`, getAuthConfig()).then((r) => r.data);

export default { getPosts, createPost, toggleLike, toggleSave, addComment, deletePost };

