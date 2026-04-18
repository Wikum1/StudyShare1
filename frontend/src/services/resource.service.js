import axios from "axios";

const API = "http://localhost:5000/api/resources";

/* ================= UPLOAD RESOURCE ================= */
const uploadResource = async (data) => {
  const token = localStorage.getItem("token");

  const res = await axios.post(API, data, {
    headers: {
      Authorization: `Bearer ${token}`,   // 🔥 IMPORTANT
      "Content-Type": "multipart/form-data"
    }
  });

  return res.data;
};

/* ================= GET MY RESOURCES ================= */
const getMyResources = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${API}/my`, {
    headers: {
      Authorization: `Bearer ${token}`   // 🔥 IMPORTANT
    }
  });

  return res.data;
};

export default {
  uploadResource,
  getMyResources
};