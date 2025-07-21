import axios from "axios";

const apiRequest = axios.create({
  baseURL: "https://homi-fy-hh4z.vercel.app/api",
  withCredentials: true,
});

export default apiRequest;