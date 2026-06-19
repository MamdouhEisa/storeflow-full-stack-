import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMe, login as loginRequest, registerAdmin } from "../api/auth";
import { getAuthToken, setAuthToken } from "../api/client";

const AuthContext = createContext(null);

const USER_KEY = "storeflow_auth_user";
const ADMIN_ROLES = ["admin", "superadmin"];

function normalizeRoleKey(roleValue) {
  return String(roleValue || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function hasAnyRole(currentRole, allowedRoles) {
  if (!allowedRoles) return true;

  const roleList = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (roleList.length === 0) return true;

  const currentRoleKey = normalizeRoleKey(currentRole);
  return roleList.some((role) => normalizeRoleKey(role) === currentRoleKey);
}

function safeJsonParse(rawValue, fallbackValue) {
  try {
    const parsed = JSON.parse(rawValue);
    return parsed ?? fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function readStoredUser() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  return safeJsonParse(raw, null);
}

function persistUser(user) {
  if (typeof window === "undefined") return;
  if (user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(USER_KEY);
  }
}

function mapEmployeeToUser(employee) {
  if (!employee) return null;
  const name = employee.fullName || employee.username || employee.email || "User";
  return {
    id: employee.id || employee._id,
    name,
    email: employee.email || "",
    role: employee.role || "employee",
    branchId: employee.branch || employee.branchId || "",
    branchName: employee.branchName || "",
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const bootstrap = async () => {
      const storedUser = readStoredUser();
      const token = getAuthToken();
      if (token) setAuthToken(token);

      if (token) {
        try {
          const data = await getMe();
          const nextUser = mapEmployeeToUser(data?.employee);
          if (!isMounted) return;
          persistUser(nextUser);
          setUser(nextUser);
          setIsReady(true);
          return;
        } catch {
          if (!isMounted) return;
          setAuthToken(null);
          persistUser(null);
        }
      }

      if (!isMounted) return;
      setUser(storedUser);
      setIsReady(true);
    };

    bootstrap();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async ({ email, password }) => {
    const identifier = String(email || "").trim().toLowerCase();
    const normalizedPassword = String(password || "");

    if (!identifier || !normalizedPassword) {
      return { ok: false, message: "Email and password are required." };
    }

    try {
      const data = await loginRequest({ identifier, password: normalizedPassword });
      if (!data?.success) {
        const msg = data?.message || "Login failed.";
        if (/invalid credentials/i.test(msg)) {
          return { ok: false, field: "password", message: msg };
        }
        return { ok: false, message: msg };
      }

      setAuthToken(data.token);
      const nextUser = mapEmployeeToUser(data.employee);
      persistUser(nextUser);
      setUser(nextUser);
      return { ok: true, user: nextUser };
    } catch (error) {
      const msg = error.message || "Unable to login.";
      if (/not found|no longer exists|disabled/i.test(msg)) {
        return { ok: false, field: "email", message: msg };
      }
      return { ok: false, message: msg };
    }
  };

  const signup = async ({ name, phone, email, password }) => {
    const normalizedName = String(name || "").trim();
    const normalizedPhone = String(phone || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedPassword = String(password || "");

    if (!normalizedName || !normalizedEmail || !normalizedPassword) {
      return { ok: false, message: "Please fill in all required fields." };
    }

    try {
      const data = await registerAdmin({
        name: normalizedName,
        email: normalizedEmail,
        phone: normalizedPhone,
        password: normalizedPassword,
      });

      if (!data?.success) {
        const msg = data?.message || "Unable to sign up.";
        if (/already exists/i.test(msg)) {
          return { ok: false, field: "email", message: msg };
        }
        return { ok: false, message: msg };
      }

      setAuthToken(data.token);
      const nextUser = mapEmployeeToUser(data.admin);
      persistUser(nextUser);
      setUser(nextUser);
      return { ok: true, user: nextUser };
    } catch (error) {
      const msg = error.message || "Unable to sign up.";
      if (/already exists/i.test(msg)) {
        return { ok: false, field: "email", message: msg };
      }
      return { ok: false, message: msg };
    }
  };

  const logout = () => {
    setAuthToken(null);
    persistUser(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      role: user?.role || "guest",
      isAuthenticated: Boolean(user),
      isAdmin: hasAnyRole(user?.role, ADMIN_ROLES),
      hasRole: (roles) => hasAnyRole(user?.role, roles),
      isReady,
      login,
      signup,
      logout,
    }),
    [user, isReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
