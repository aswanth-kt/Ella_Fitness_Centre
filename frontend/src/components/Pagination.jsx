
function getPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3)
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function Pagination({
  current = 1,
  total = 1,
  totalItems = 0,
  item = "",
  perPage = 10,
  colSpan = 3,
  onPageChange = () => {},
}) {
  const pages = getPageRange(current, total);
  const from = (current - 1) * perPage + 1;
  const to = Math.min(current * perPage, totalItems);

  return (
    <tr>
      <td colSpan={colSpan} className="pt-4 pb-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">

          {/* Result count */}
          <p className="text-xs text-gray-500 shrink-0">
            Showing{" "}
            <span className="text-[var(--color-gold)] font-medium">{from}–{to}</span>{" "}
            of <span className="text-gray-400">{totalItems}</span> {item}
          </p>

          {/* Page buttons */}
          <div className="flex items-center gap-1 flex-wrap justify-center">

            <button
              onClick={() => onPageChange(current - 1)}
              disabled={current === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-gray-500 text-sm bg-transparent transition-all disabled:opacity-25 disabled:cursor-not-allowed hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] cursor-pointer"
            >
              ‹
            </button>

            {pages.map((p, i) =>
              p === "..." ? (
                <span key={i} className="w-8 h-8 flex items-end justify-center pb-1.5 text-gray-600 text-xs select-none">
                  ···
                </span>
              ) : (
                <button
                  key={i}
                  onClick={() => onPageChange(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all cursor-pointer
                    ${p === current
                      ? "bg-[var(--color-gold)] border border-[var(--color-gold)] text-[var(--color-deep-black)] font-semibold"
                      : "bg-transparent border border-white/10 text-gray-400 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                    }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => onPageChange(current + 1)}
              disabled={current === total}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-gray-500 text-sm bg-transparent transition-all disabled:opacity-25 disabled:cursor-not-allowed hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] cursor-pointer"
            >
              ›
            </button>

          </div>

          {/* Page x of y */}
          <p className="text-xs text-gray-600 shrink-0 tracking-widest uppercase">
            Page <span className="text-gray-500">{current}</span> / {total}
          </p>

        </div>
      </td>
    </tr>
  );
}