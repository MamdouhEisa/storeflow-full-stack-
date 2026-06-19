import api from "./client";

const DEFAULT_PAGE_SIZE = 200;

const ROLE_LABELS = ["Admin", "Manager", "Cashier", "Employee"];

function normalizeRoleLabel(value) {
  const raw = String(value || "Employee").trim().toLowerCase();
  if (raw === "admin") return "Admin";
  if (raw === "manager") return "Manager";
  if (raw === "cashier" || raw === "csahier") return "Cashier";
  return "Employee";
}

function mapRoleToBackend(label) {
  const normalized = normalizeRoleLabel(label);
  return normalized === "Admin" ? "admin" : "sales";
}

function mapEmployeeFromApi(employee) {
  if (!employee) return null;
  return {
    id: employee._id || employee.id,
    fullName: employee.fullName || employee.username || "",
    email: employee.email || "",
    phone: employee.phone || "",
    role: normalizeRoleLabel(employee.roleLabel || employee.role),
    status: employee.isActive === false ? "Inactive" : "Active",
    branch: employee.branch?.name || employee.branch?.location || employee.branchName || employee.branch || "",
  };
}

function mapEmployeeToApi(payload) {
  return {
    username: payload.email ? String(payload.email).trim().toLowerCase() : undefined,
    fullName: payload.fullName || "",
    email: payload.email || "",
    phone: payload.phone || "",
    role: mapRoleToBackend(payload.role),
    roleLabel: normalizeRoleLabel(payload.role),
    branch: payload.branch || "",
    password: payload.password || undefined,
  };
}

export async function fetchEmployees({ page = 1, limit = DEFAULT_PAGE_SIZE } = {}) {
  const response = await api.get("/api/employees", { params: { page, limit } });
  const data = response.data;
  const items = Array.isArray(data?.data) ? data.data : [];
  return {
    employees: items.map(mapEmployeeFromApi).filter(Boolean),
    page: data?.page || page,
    pages: data?.pages || 1,
    total: data?.total || items.length,
  };
}

export async function fetchEmployeeById(employeeId) {
  if (!employeeId) return null;
  const response = await api.get(`/api/employees/${employeeId}`);
  const employee = response.data?.employee || response.data?.data;
  return mapEmployeeFromApi(employee);
}

export async function createEmployee(payload) {
  const response = await api.post("/api/employees", mapEmployeeToApi(payload));
  const employee = response.data?.employee || response.data?.data;
  return mapEmployeeFromApi(employee);
}

export async function updateEmployee(employeeId, payload) {
  if (!employeeId) return null;
  const response = await api.put(`/api/employees/${employeeId}`, mapEmployeeToApi(payload));
  const employee = response.data?.employee || response.data?.data;
  return mapEmployeeFromApi(employee);
}

export async function updateEmployeeStatus(employeeId, status) {
  if (!employeeId) return null;
  const response = await api.patch(`/api/employees/${employeeId}/status`, {
    status: String(status || "Active"),
  });
  const employee = response.data?.employee || response.data?.data;
  return mapEmployeeFromApi(employee);
}

export async function deleteEmployee(employeeId) {
  if (!employeeId) return false;
  await api.delete(`/api/employees/${employeeId}`);
  return true;
}

export { ROLE_LABELS, normalizeRoleLabel };
