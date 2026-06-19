import api from "./client";

export async function login({ identifier, password }) {
  const response = await api.post("/api/auth/login", {
    username: identifier,
    password,
  });
  return response.data;
}

export async function registerAdmin({ name, email, phone, password }) {
  const response = await api.post("/api/auth/register-admin", {
    name,
    email,
    phone,
    password,
  });
  return response.data;
}

export async function getMe() {
  const response = await api.get("/api/auth/me");
  return response.data;
}
