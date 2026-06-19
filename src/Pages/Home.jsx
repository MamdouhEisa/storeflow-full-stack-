import { useEffect, useRef, useState } from "react";
import { fetchDashboard } from "../api/analytics";
import { useNavigate } from "react-router-dom";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Box,
  CircleDollarSign,
  Clock3,
  List,
  Plus,
  ShoppingCart,
  Users,
} from "lucide-react";



/* ================= COMPONENT ================= */


 
export default function HomePage() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await fetchDashboard();
        if (!isMounted) return;
        setDashboard(data);
      } catch {
        if (!isMounted) return;
        setDashboard(null);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const navigate = useNavigate();

  const branchRef = useRef(null);
  

  /* ================= NAV ================= */

  const routes = {
    addStock: "/inventory",
    products: "/products",
    sales: "/sales",
    profit: "/profit",
    addSale: "/sales/add",
    addProduct: "/products/add",
    branchPerformance: "/branches/performance",
  };

  const handleActionClick = (label) => {
    const map = {
      "Add Stock": routes.addStock,
      "All Products": routes.products,
      "View Sales": routes.sales,
      "View Profit": routes.profit,
      "Add Sale": routes.addSale,
      "Add Product": routes.addProduct,
    };

    if (map[label]) navigate(map[label]);
  };

  // const scrollToSection = (ref) => {
  //   ref.current?.scrollIntoView({ behavior: "smooth" });
    
  // };
  

  /* ================= DATA ================= */

  const QuickActionsTop = [
    { label: "Add Stock", icon: Box, iconColor: "text-[#f2c94c]" },
    { label: "All Products", icon: List, iconColor: "text-[#1b1b1b]" },
    { label: "View Sales", icon: ShoppingCart, iconColor: "text-[#eb5757]" },
    { label: "View Profit", icon: CircleDollarSign, iconColor: "text-[#27ae60]" },
  ];

  const QuickActionsBottom = [
    { label: "Add Sale", icon: Plus },
    { label: "Add Product", icon: Box },
  ];

  
  /* ================= HELPERS ================= */
  

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function formatMoney(value) {
  return `${Math.round(value).toLocaleString("en-US")} EGP`;
}

function formatShort(value) {
  const v = num(value);
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (abs >= 1_000) return `${Math.round(v / 1_000)}K`;
  return `${Math.round(v)}`;
}

function percentDelta(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function pctText(value) {
  const v = num(value);
  return `${v >= 0 ? "+" : ""}${v.toFixed(1).replace(".0", "")}%`;
}

function agoText(date, now = new Date()) {
  if (!date) return "No date";

  const d = new Date(date);
  if (isNaN(d)) return "Invalid date";

  const diffMin = Math.max(
    0,
    Math.floor((now.getTime() - d.getTime()) / 60000)
  );

  if (diffMin < 1) return "Now";
  if (diffMin < 60) return `${diffMin} Min Ago`;

  const h = Math.floor(diffMin / 60);
  if (h < 24) return `${h} Hour Ago`;

  const days = Math.floor(h / 24);
  return `${days} Day Ago`;
}

function activityIcon(kind) {
  switch (kind) {
    case "sale":
      return {
        icon: ShoppingCart,
        wrap: "bg-[rgba(39,174,96,0.14)] text-[#27ae60]",
      };
    case "alert":
      return {
        icon: AlertTriangle,
        wrap: "bg-[rgba(235,87,87,0.14)] text-[#eb5757]",
      };
    default:
      return {
        icon: Users,
        wrap: "bg-[rgba(113,128,150,0.14)] text-[#717f96]",
      };
  }
}

const d = dashboard || {};
const tp = d.todayPerformance || [];
const mp = d.monthPerformance || [];
const alerts = d.alerts || [];
const branchPerf = d.branchPerformance || [];
const topProds = d.topProducts || [];
const recentAct = d.recentActivity || [];

const TodayPerformance = [
  {
    title: "Sales Today",
    value: formatMoney(tp[0]?.value ?? 0),
    badge: pctText(tp[0]?.badge ?? 0),
    icon: CircleDollarSign,
    iconWrap: "bg-[rgba(255,125,45,0.14)] text-[#ff7d2d]",
  },
  {
    title: "Profit Today",
    value: formatMoney(tp[1]?.value ?? 0),
    badge: pctText(tp[1]?.badge ?? 0),
    icon: CircleDollarSign,
    iconWrap: "bg-[rgba(39,174,96,0.14)] text-[#27ae60]",
  },
  {
    title: "Transactions",
    value: `${tp[2]?.value ?? 0}`,
    badge: "...",
    icon: ShoppingCart,
    iconWrap: "bg-[rgba(242,201,76,0.2)] text-[#d9a106]",
  },
  {
    title: "Active Users",
    value: `${tp[3]?.value ?? 0}`,
    badge: "Online",
    icon: Users,
    iconWrap: "bg-[rgba(255,125,45,0.14)] text-[#ff7d2d]",
  },
];

const MonthPerformance = [
  {
    title: "Monthly Sales",
    value: formatMoney(mp[0]?.value ?? 0),
    delta: pctText(percentDelta(mp[0]?.value ?? 0, mp[0]?.previous ?? 0)),
    base: formatMoney(mp[0]?.previous ?? 0),
    deltaTone: percentDelta(mp[0]?.value ?? 0, mp[0]?.previous ?? 0) >= 0
      ? "text-[#27ae60] bg-[rgba(39,174,96,0.14)]"
      : "text-[#eb5757] bg-[rgba(235,87,87,0.14)]",
  },
  {
    title: "Monthly Profit",
    value: formatMoney(mp[1]?.value ?? 0),
    delta: pctText(percentDelta(mp[1]?.value ?? 0, mp[1]?.previous ?? 0)),
    base: formatMoney(mp[1]?.previous ?? 0),
    deltaTone: percentDelta(mp[1]?.value ?? 0, mp[1]?.previous ?? 0) >= 0
      ? "text-[#27ae60] bg-[rgba(39,174,96,0.14)]"
      : "text-[#eb5757] bg-[rgba(235,87,87,0.14)]",
  },
  {
    title: "Transactions",
    value: `${mp[2]?.value ?? 0}`,
    delta: pctText(percentDelta(mp[2]?.value ?? 0, mp[2]?.previous ?? 0)),
    base: `${mp[2]?.previous ?? 0}`,
    deltaTone: percentDelta(mp[2]?.value ?? 0, mp[2]?.previous ?? 0) >= 0
      ? "text-[#27ae60] bg-[rgba(39,174,96,0.14)]"
      : "text-[#eb5757] bg-[rgba(235,87,87,0.14)]",
  },
  {
    title: "Avg Transaction",
    value: formatMoney(mp[3]?.value ?? 0),
    delta: pctText(percentDelta(mp[3]?.value ?? 0, mp[3]?.previous ?? 0)),
    base: formatMoney(mp[3]?.previous ?? 0),
    deltaTone: percentDelta(mp[3]?.value ?? 0, mp[3]?.previous ?? 0) >= 0
      ? "text-[#27ae60] bg-[rgba(39,174,96,0.14)]"
      : "text-[#eb5757] bg-[rgba(235,87,87,0.14)]",
  },
];

const InventoryAlerts = alerts.map((a) => ({
  name: a.name,
  stock: `${a.stock ?? 0} Units`,
  min: `${a.min ?? 10}`,
  branch: a.branch || "Main Branch",
  level: a.level || "Low",
}));

const BranchPerformance = branchPerf.map((b) => ({
  branch: b.branch,
  stock: formatShort(b.stock ?? 0),
  profit: formatShort(b.profit ?? 0),
  orders: `${b.orders ?? 0}`,
  trend: b.trend || "up",
}));

const TopProducts = topProds.map((x, idx) => ({
  name: x.name,
  sold: `${x.sold ?? 0} Unit`,
  revenue: formatShort(x.revenue ?? 0),
  profit: formatShort(x.profit ?? 0),
  rank: `#${idx + 1}`,
}));

const RecentActivity = recentAct.map((r) => ({
  text: r.text || "",
  meta: agoText(r.meta),
  kind: r.kind || "sale",
}));


  /* ================= UI ================= */

  return (
    <div className="space-y-10">

      {/* ===== QUICK ACTIONS ===== */}
      <section>
       <h2 className="text-center text-2xl font-semibold ">Quick Actions</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {QuickActionsTop.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                onClick={() => handleActionClick(item.label)}
                className="flex items-center justify-center gap-3 rounded-2xl bg-white p-5 text-xl font-semibold shadow transition hover:-translate-y-1 hover:shadow-lg"
              >
                <Icon className={`h-6 w-6 ${item.iconColor}`} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {QuickActionsBottom.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                onClick={() => handleActionClick(item.label)}
                className="flex items-center justify-center gap-3 rounded-2xl bg-white p-5 text-xl font-semibold shadow transition hover:bg-orange-500 hover:text-white"
              >
                <Icon className="h-6 w-6" />
                {item.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ===== TODAY ===== */}
      <section>
        <h2 className="text-center text-3xl font-semibold">Today Performance</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {TodayPerformance.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl bg-white p-4 shadow"
              >
                <div className="flex justify-between">
                  <span className={`rounded-xl p-2 ${item.iconWrap}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-green-600 text-sm">{item.badge}</span>
                </div>

                <p className="mt-2 text-gray-500">{item.title}</p>
                <p className="text-3xl font-bold">{item.value}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== MONTH ===== */}

      <section>
        <h2 className="text-center text-3xl font-semibold">This Month</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {MonthPerformance.map((item) => (
            <div key={item.title} className="rounded-2xl bg-white p-4 shadow">
              <p className="text-gray-500">{item.title}</p>
              <p className="text-3xl font-bold">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== BRANCH + ALERTS ===== */}
      {/* ===== LAST SECTION ===== */}
<section className="grid gap-4 xl:grid-cols-2">

  {/* ================= BRANCH PERFORMANCE ================= */}
  <div className="rounded-3xl bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="flex items-center gap-2 text-2xl font-semibold">
        <Box className="h-6 w-6 text-[#1b1b1b]" />
        Branch Performance
      </h3>

      <button
        onClick={() => navigate("/branches")}
        className="text-sm font-semibold text-[#ff7d2d] hover:underline"
      >
        View All
      </button>
    </div>

    <div ref={branchRef} className="space-y-3">
      {BranchPerformance.map((item) => (
        <div
          key={item.branch}
          className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:shadow-md"
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-lg font-semibold">{item.branch}</p>

            {item.trend === "up" ? (
              <ArrowUpRight className="h-5 w-5 text-green-500" />
            ) : (
              <ArrowDownRight className="h-5 w-5 text-red-500" />
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Stock</p>
              <p>{item.stock}</p>
            </div>
            <div>
              <p className="text-gray-500">Profit</p>
              <p className="text-green-600">{item.profit}</p>
            </div>
            <div>
              <p className="text-gray-500">Orders</p>
              <p>{item.orders}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* ================= RIGHT SIDE ================= */}

  <div className="space-y-4">

    {/* ===== TOP PRODUCTS ===== */}
    <div className="rounded-3xl bg-white p-5 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-2xl font-semibold">
          <ShoppingCart className="h-6 w-6 text-[#27ae60]" />
          Top Products
        </h3>

        <button 
          className="text-sm font-semibold text-[#ff7d2d] hover:underline"
          onClick={() => navigate("/products")}
        >
          View All
        </button>
      </div>

      <div className="space-y-3">
        {TopProducts.map((item) => (
          <div
            key={item.name}
            className="rounded-2xl border border-zinc-200 p-3 transition hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold">{item.name}</p>

              <span className="rounded-full bg-[#ff7d2d] px-2 py-1 text-xs font-bold text-white">
                {item.rank}
              </span>
            </div>

            <div className="mt-2 grid grid-cols-3 text-sm">
              <div>
                <p className="text-gray-500">Sold</p>
                <p>{item.sold}</p>
              </div>

              <div>
                <p className="text-gray-500">Revenue</p>
                <p>{item.revenue}</p>
              </div>

              <div>
                <p className="text-gray-500">Profit</p>
                <p className="text-green-600">{item.profit}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>


    {/* ===== RECENT ACTIVITY ===== */}

    <div className="rounded-3xl bg-white p-5 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-2xl font-semibold">
          <Clock3 className="h-6 w-6 text-[#f2c94c]" />
          Recent Activity
        </h3>
      </div>

      <div className="space-y-3">
        {RecentActivity.map((item, index) => {
          const info = activityIcon(item.kind);
          const Icon = info.icon;

          return (
            <div
              key={index}
              className="flex gap-3 rounded-xl p-3 transition hover:bg-gray-50"
            >
              <span className={`rounded-xl p-2 ${info.wrap}`}>
                <Icon className="h-5 w-5" />
              </span>

              <div>
                <p className="font-medium">{item.text}</p>
                <p className="text-sm text-gray-500">{item.meta}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>

  </div>
</section>

    </div>
  );
}
