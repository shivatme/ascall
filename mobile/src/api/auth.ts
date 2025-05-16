import axios from "axios";
import { BACKEND_URL } from "./config";

const API_BASE_URL = BACKEND_URL + "/api/v1/auth";

async function login(email: string, password: string) {
  const response = await axios.post(`${API_BASE_URL}/login`, {
    email,
    password,
  });
  return response.data;
}

async function register(email: string, password: string, name: string) {
  const response = await axios.post(`${API_BASE_URL}/register`, {
    email,
    password,
    name,
  });
  return response.data;
}

export default {
  login,
  register,
};
