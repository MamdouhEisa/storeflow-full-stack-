import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../api/products";

export default function InventoryPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const result = await fetchProducts();
        if (!isMounted) return;
        setProducts(result.products || []);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Failed to load inventory.");
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
    if (!q) return products;
    return products.filter((p) => {
      const name = String(p.name || "").toLowerCase();
      const code = String(p.code || "").toLowerCase();
      const branch = String(p.branch || "").toLowerCase();
      return name.includes(q) || code.includes(q) || branch.includes(q);
    });
  }, [products, query]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const lowStockItems = products.filter((p) => Number(p.stock) <= 5).length;
    const bestSellerProducts = products.filter((p) => Number(p.stock) >= 10).length;
    return { totalProducts, lowStockItems, bestSellerProducts };
  }, [products]);

  const statusMeta = (stock) => {
    const s = Number(stock) || 0;
    if (s <= 0) return { label: "Out", cls: "text-[#ef4444]" };
    if (s <= 5) return { label: "Low", cls: "text-[#e6b934]" };
    return { label: "Good", cls: "text-[#27ae60]" };
  };

  return (
    <div className="min-h-screen text-[#23262b]">
      <main className="mx-auto w-full max-w-[1560px] px-4 pb-14 pt-8 sm:px-8 lg:px-14">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/inventory/transfers")}
            className="rounded-xl bg-[#ff7a1a] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(255,122,26,0.28)] transition hover:-translate-y-0.5"
          >
            View Transfers
          </button>
        </div>
        <section className="grid gap-5 md:grid-cols-3">
          <StatCard title="Best Seller Products" value={stats.bestSellerProducts} tone="orange" />
          <StatCard title="Total Products" value={stats.totalProducts} tone="yellow" />
          <StatCard title="Low Stock Items" value={stats.lowStockItems} tone="red" />
        </section>

        <section className="mt-6 rounded-[26px] border border-white/80 p-5 shadow-[0_10px_24px_rgba(17,24,39,0.08)] sm:p-6">
          <label
            htmlFor="inventory-search"
            className="flex h-[64px] items-center gap-3 rounded-[20px] border border-[#d3d3d3] bg-[#f8f8f8] px-5"
          >
            <SearchIcon />
            <input
              id="inventory-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Products By Name Or Code..."
              className="h-full w-full border-0 bg-transparent text-[15px] text-[#5e636b] outline-none placeholder:text-[#8d929a]"
            />
          </label>
        </section>

        <section className="mt-8 space-y-6">
          {isLoading && (
            <div className="rounded-[28px] border border-dashed border-[#d3d3d3] bg-[#f7f7f7] p-10 text-center text-sm text-[#8d929a]">
              Loading inventory...
            </div>
          )}

          {error && !isLoading && (
            <div className="rounded-[28px] border border-dashed border-[#f3c5c5] bg-[#fff7f7] p-10 text-center text-sm text-[#b42323]">
              {error}
            </div>
          )}

          {!isLoading && !error && filtered.map((product) => {
            const status = statusMeta(product.stock);
            return (
              <article
                key={product.id}
                className="rounded-[28px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex min-w-[220px] items-center gap-4">
                    <div className="grid h-[72px] w-[72px] place-items-center rounded-[20px] border border-[#d5d5d5] text-[#8b8f96]">
                      <CubeIcon />
                    </div>
                    <div>
                      <h3 className="text-[20px] font-semibold text-[#252a31]">{product.name}</h3>
                      <p className="mt-1 text-[14px] text-[#8a8f97]">Code: {product.code}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-[14px] font-medium ${
                      product.stock <= 0 ? "bg-[#fef2f2] text-[#ef4444]" :
                      product.stock <= (product.minStock || 10) ? "bg-[#fffbeb] text-[#e6b934]" :
                      "bg-[#e6f3ec] text-[#27ae60]"
                    }`}>
                      {product.stock} Units
                    </span>

                    <ActionButton tone="green" onClick={() => navigate(`/inventory/add/${product.id}`)} ariaLabel="Add stock">
                      <PlusIcon />
                    </ActionButton>
                    <ActionButton tone="red" onClick={() => navigate(`/inventory/deduct/${product.id}`)} ariaLabel="Deduct stock">
                      <MinusIcon />
                    </ActionButton>
                    <ActionButton tone="orange" onClick={() => navigate(`/inventory/transfer/${product.id}`)} ariaLabel="Transfer stock" disabled={product.stock <= 0}>
                      <TransferIcon />
                    </ActionButton>
                  </div>
                </div>

                <div className="my-5 h-px bg-[#d5d5d5]" />

                <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                  <Metric label="Branch" value={product.branch} />
                  <Metric label="Current Stock" value={`${product.stock} Units`} />
                  <Metric label="Min Stock Level" value={`${product.minStock || 10} Units`} />
                  <Metric label="Status" value={status.label} valueClassName={status.cls} />
                </div>
              </article>
            );
          })}

          {!isLoading && !error && filtered.length === 0 && (
            <div className="rounded-[28px] border border-dashed border-[#d3d3d3] bg-[#f7f7f7] p-10 text-center text-sm text-[#8d929a]">
              No products found.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({ title, value, tone }) {
  const toneMap = {
    orange: "text-[#ff7a1a] bg-[#fff3e9]",
    yellow: "text-[#e6b934] bg-[#fff9e8]",
    red: "text-[#ef5d5d] bg-[#fff0f0]",
  };
  return (
    <article className="rounded-[26px] border border-white/80 p-6 shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
      <div className={`mb-4 inline-grid h-14 w-14 place-items-center rounded-2xl ${toneMap[tone]}`}>
        <CubeIcon className="h-7 w-7" />
      </div>
      <p className="text-[15px] text-[#848a93]">{title}</p>
      <p className="mt-2 text-[42px] leading-none font-semibold text-[#23272f]">{value}</p>
    </article>
  );
}

function ActionButton({ children, onClick, ariaLabel, tone = "orange", disabled = false }) {
  const toneClass =
    tone === "green"
      ? "text-[#27ae60]"
      : tone === "red"
      ? "text-[#ef5d5d]"
      : "text-[#ff7a1a]";

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-14 w-14 place-items-center rounded-2xl border border-white bg-white ${toneClass} shadow-[0_8px_16px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

function Metric({ label, value, valueClassName = "" }) {
  return (
    <div>
      <p className="text-[14px] text-[#8b9097]">{label}</p>
      <p className={`mt-2 text-[18px] font-medium text-[#252a31] ${valueClassName}`}>{value}</p>
    </div>
  );
}

function IconSvg({ children, className = "h-7 w-7" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
function SearchIcon() { return <IconSvg className="h-7 w-7 shrink-0 text-[#8a8f97]"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></IconSvg>; }
function CubeIcon({ className = "h-8 w-8" }) { return <IconSvg className={className}><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="M12 3v9m8-4.5-8 4.5-8-4.5" /></IconSvg>; }
function PlusIcon() { return <IconSvg className="h-7 w-7"><path d="M12 5v14M5 12h14" /></IconSvg>; }
function MinusIcon() { return <IconSvg className="h-7 w-7"><path d="M5 12h14" /></IconSvg>; }
function TransferIcon() { return <IconSvg className="h-7 w-7"><path d="M4 7h14" /><path d="m14 3 4 4-4 4" /><path d="M20 17H6" /><path d="m10 13-4 4 4 4" /></IconSvg>; }
