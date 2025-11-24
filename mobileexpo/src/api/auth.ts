import axios from "axios";
import { BACKEND_URL } from "./config";

const API_BASE_URL = BACKEND_URL + "/api/auth";

async function login(idToken: string) {
  const response = await axios.post(`${API_BASE_URL}/login`, {
    idToken,
  });
  return response.data;
}

async function register(idToken: string, email: string, name: string) {
  const response = await axios.post(`${API_BASE_URL}/register`, {
    idToken,
    email,
    name,
  });
  return response.data;
}

export default {
  login,
  register,
};
