import { api } from "../api/axios";

// Faz login no backend e salva token + usuário
export async function login(email: string, password: string) {
  const { data } = await api.post("/auth/login", { email, password });

  localStorage.setItem("token", data.access_token);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
}

// Remove token e dados do usuário
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// Retorna dados do usuário logado
export function getCurrentUser() {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}

// Verifica se está autenticado
export function isAuthenticated() {
  return !!localStorage.getItem("token");
}
