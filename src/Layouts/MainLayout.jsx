import { useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Home, Box, ShoppingCart, Package, CircleDollarSign, Users, GitBranch, Settings } from "lucide-react";
import Navbar from "../Components/Navbar";
import { useAuth } from "../auth/AuthContext";

const ALL_NAV_ITEMS = [
  { key: "home", label: "Home", href: "/home", icon: createIcon(Home), showLabel: true },
  { key: "products", label: "Products", href: "/products", icon: createIcon(Box) },
  { key: "sales", label: "Sales", href: "/sales", icon: createIcon(ShoppingCart) },
  { key: "inventory", label: "Inventory", href: "/inventory", icon: createIcon(Package) },
  { key: "profit", label: "Profit", href: "/profit", icon: createIcon(CircleDollarSign) },
  { key: "employees", label: "Employees", href: "/employees", icon: createIcon(Users), adminOnly: true },
  { key: "branches", label: "Branches", href: "/branches", icon: createIcon(GitBranch), adminOnly: true },
  { key: "settings", label: "Settings", href: "/settings", icon: createIcon(Settings), adminOnly: true },
];

function createIcon(LucideIcon) {
  return () => <LucideIcon className="h-5 w-5" />;
}

function formatRoleLabel(role) {
  const normalized = String(role || "employee")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");

  if (!normalized) return "Employee";
  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function MainLayout() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const roleLabel = formatRoleLabel(role);

  const navItems = useMemo(() => {
    if (role === "admin") return ALL_NAV_ITEMS;
    return ALL_NAV_ITEMS.filter((item) => !item.adminOnly);
  }, [role]);

  const handleRoleButtonClick = () => {
    window.alert(`Current role: ${roleLabel}`);
  };

  return (
    <div className="container w-full m-auto">
      <Navbar
        items={navItems}
        showAdmin
        adminLabel={roleLabel}
        routerNavigate={navigate}
        onAdminClick={handleRoleButtonClick}
      />
      <Outlet />
    </div>
  );
}
