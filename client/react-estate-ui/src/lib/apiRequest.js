import axios from "axios";

const apiRequest = axios.create({
  baseURL: "https://homify-api-3wrq.onrender.com/api",
  withCredentials: true,
});

export default apiRequest;