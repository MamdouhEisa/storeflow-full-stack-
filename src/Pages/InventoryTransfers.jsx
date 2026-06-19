import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { approveTransfer, fetchTransfers, rejectTransfer } from "../api/transfers";

export default function InventoryTransfersPage() {
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const result = await fetchTransfers();
        if (!isMounted) return;
        setTransfers(result.transfers || []);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Failed to load transfers.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return transfers;
    return transfers.filter((t) => {
      return (
        String(t.productName).toLowerCase().includes(q) ||
        String(t.fromBranch).toLowerCase().includes(q) ||
        String(t.toBranch).toLowerCase().includes(q) ||
        String(t.status).toLowerCase().includes(q)
      );
    });
  }, [transfers, query]);

  const updateTransfer = (next) => {
    if (!next) return;
    setTransfers((prev) => prev.map((t) => (t.id === next.id ? next : t)));
  };

  const handleApprove = async (transfer) => {
    try {
      const updated = await approveTransfer(transfer.id);
      updateTransfer(updated);
    } catch (err) {
      setError(err.message || "Failed to approve transfer.");
    }
  };

  const handleReject = async (transfer) => {
    try {
      const updated = await rejectTransfer(transfer.id);
      updateTransfer(updated);
    } catch (err) {
      setError(err.message || "Failed to reject transfer.");
    }
  };

  return (
    <div className="min-h-screen text-[#23262b]">
      <main className="mx-auto w-full max-w-[1560px] px-4 pb-14 pt-8 sm:px-8 lg:px-14">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[34px] font-semibold">Transfers</h1>
          <button
            type="button"
            onClick={() => navigate("/inventory")}
            className="rounded-xl border border-[#d7d7d7] bg-white px-4 py-2 text-sm font-semibold text-[#252a31]"
          >
            Back to inventory
          </button>
        </div>

        <section className="rounded-[26px] border border-white/80 p-5 shadow-[0_10px_24px_rgba(17,24,39,0.08)] sm:p-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product or branch..."
            className="h-[62px] w-full rounded-[20px] border border-[#d3d3d3] bg-[#f8f8f8] px-5 text-[16px] outline-none"
          />
        </section>

        <section className="mt-8 space-y-6">
          {isLoading && (
            <div className="rounded-[28px] border border-dashed border-[#d3d3d3] bg-[#f7f7f7] p-10 text-center text-sm text-[#8d929a]">
              Loading transfers...
            </div>
          )}

          {error && !isLoading && (
            <div className="rounded-[28px] border border-dashed border-[#f3c5c5] bg-[#fff7f7] p-10 text-center text-sm text-[#b42323]">
              {error}
            </div>
          )}

          {!isLoading && !error && filtered.map((transfer) => (
            <article
              key={transfer.id}
              className="rounded-[28px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-[20px] font-semibold text-[#252a31]">
                    {transfer.productName || "Product"}
                  </h3>
                  <p className="mt-1 text-[14px] text-[#8a8f97]">
                    {transfer.fromBranch} → {transfer.toBranch}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-[#f8f8f8] px-3 py-1 text-[13px] font-medium text-[#252a31]">
                    {transfer.status}
                  </span>
                  <span className="rounded-full bg-[#e6f3ec] px-3 py-1 text-[13px] font-medium text-[#27ae60]">
                    {transfer.quantity} Units
                  </span>
                </div>
              </div>

              <div className="my-5 h-px bg-[#d5d5d5]" />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-[14px] text-[#8b9097]">
                  Requested by {transfer.createdBy || "System"}
                </div>

                {transfer.status === "pending" && (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleApprove(transfer)}
                      className="rounded-xl bg-[#27ae60] px-4 py-2 text-sm font-semibold text-white"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(transfer)}
                      className="rounded-xl bg-[#ef5d5d] px-4 py-2 text-sm font-semibold text-white"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}

          {!isLoading && !error && filtered.length === 0 && (
            <div className="rounded-[28px] border border-dashed border-[#d3d3d3] bg-[#f7f7f7] p-10 text-center text-sm text-[#8d929a]">
              No transfers found.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
