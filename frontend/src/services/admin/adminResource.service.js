import axios from "axios";

const API = "/api/admin/resources";

const getAllResources = async () => {
  const res = await axios.get(API);
  return res.data;
};

const approveResource = async (id) => {
  const res = await axios.put(`${API}/${id}/approve`);
  return res.data;
};

const rejectResource = async (id) => {
  const res = await axios.put(`${API}/${id}/reject`);
  return res.data;
};

export default {
  getAllResources,
  approveResource,
  rejectResource
};