import axios from "axios";

const API = "/api/resources";

const uploadResource = async (data) => {
  const res = await axios.post(API, data, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
};

const getMyResources = async () => {
  const res = await axios.get(`${API}/my`);
  return res.data;
};

export default {
  uploadResource,
  getMyResources
};