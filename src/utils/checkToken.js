import {jwtDecode} from "jwt-decode";

export function isTokenExpired() {
  const token = localStorage.getItem("token");
  if (!token) return true;

  try {
    const { exp } = jwtDecode(token);
    return Date.now() >= exp * 1000;
  } catch (err) {
    return true;
  }
}
