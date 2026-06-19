import { useEffect, useMemo, useState } from "react";
import { fetchLogs } from "../api/logs";

const ACTION_OPTIONS = [
  "",
  "create_product", "update_product", "delete_product",
  "transfer", "login", "failed_login",
  "create_employee", "update_employee", "disable_employee",
  "approve_transfer", "reject_transfer",
  "create_branch", "update_branch", "delete_branch",
  "low_stock", "create_sale", "return_sale", "return_sale_item",
];

const ACTION_LABELS = {
  "": "All Actions",
  create_product: "Create Product",
  update_product: "Update Product",
  delete_product: "Delete Product",
  transfer: "Transfer",
  login: "Login",
  failed_login: "Failed Login",
  create_employee: "Create Employee",
  update_employee: "Update Employee",
  disable_employee: "Disable Employee",
  approve_transfer: "Approve Transfer",
  reject_transfer: "Reject Transfer",
  create_branch: "Create Branch",
  update_branch: "Update Branch",
  delete_branch: "Delete Branch",
  low_stock: "Low Stock",
  create_sale: "Create Sale",
  return_sale: "Return Sale",
  return_sale_item: "Return Sale Item",
};

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const params = { page, limit: 50 };
        if (actionFilter) params.action = actionFilter;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const result = await fetchLogs(params);
        if (!isMounted) return;
        setLogs(result.logs || []);
        setPages(result.pages || 1);
        setTotal(result.total || 0);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Failed to load logs.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [page, actionFilter, startDate, endDate]);

  const resetFilters = () => {
    setActionFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  return (
    <div className="min-h-screen text-[#23262b]">
      <main className="mx-auto w-full max-w-[1560px] px-4 pb-14 pt-8 sm:px-8 lg:px-14">
        <h1 className="text-[34px] font-semibold">Audit Logs</h1>
        <p className="mt-2 text-[17px] text-[#8b9098]">System activity and audit trail</p>

        <section className="mt-6 rounded-[26px] border border-white/80 p-5 shadow-[0_10px_24px_rgba(17,24,39,0.08)] sm:p-6">
          <div className="flex flex-wrap items-end gap-3">
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="h-[50px] flex-1 rounded-[18px] border border-[#d3d3d3] bg-[#f8f8f8] px-4 text-[15px] outline-none"
            >
              {ACTION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{ACTION_LABELS[opt] || opt}</option>
              ))}
            </select>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="h-[50px] rounded-[18px] border border-[#d3d3d3] bg-[#f8f8f8] px-4 text-[15px] outline-none"
              placeholder="Start date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="h-[50px] rounded-[18px] border border-[#d3d3d3] bg-[#f8f8f8] px-4 text-[15px] outline-none"
              placeholder="End date"
            />
            <button
              type="button"
              onClick={resetFilters}
              className="h-[50px] rounded-[18px] border border-[#d3d3d3] bg-white px-5 text-[15px] font-medium text-[#575b63]"
            >
              Reset
            </button>
          </div>
        </section>

        <section className="mt-6 space-y-4">
          {isLoading && (
            <div className="rounded-[28px] border border-dashed border-[#d3d3d3] bg-[#f7f7f7] p-10 text-center text-sm text-[#8d929a]">
              Loading logs...
            </div>
          )}

          {error && !isLoading && (
            <div className="rounded-[28px] border border-dashed border-[#f3c5c5] bg-[#fff7f7] p-10 text-center text-sm text-[#b42323]">
              {error}
            </div>
          )}

          {!isLoading && !error && logs.length === 0 && (
            <div className="rounded-[28px] border border-dashed border-[#d3d3d3] bg-[#f7f7f7] p-10 text-center text-sm text-[#8d929a]">
              No logs found.
            </div>
          )}

          {!isLoading && logs.map((log) => (
            <div
              key={log._id}
              className="rounded-[20px] border border-white/80 bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-[16px] font-medium text-[#252a31]">{log.message}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[13px] text-[#8b9097]">
                    <span className="rounded-full bg-[#f0f0f0] px-3 py-1">{ACTION_LABELS[log.action] || log.action}</span>
                    {log.user && (
                      <span>by {log.user?.username || log.user}</span>
                    )}
                    {log.branch && (
                      <span>at {log.branch?.name || log.branch}</span>
                    )}
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {!isLoading && pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border border-[#d3d3d3] px-4 py-2 text-sm font-medium text-[#575b63] disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-[#8d929a]">Page {page} of {pages} ({total} total)</span>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              className="rounded-xl border border-[#d3d3d3] px-4 py-2 text-sm font-medium text-[#575b63] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
