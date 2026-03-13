type PaginationProps = {
  total: number;
  limit: number;
  offset: number;
  onPageChange: (newOffset: number) => void;
};

export default function Pagination({ total, limit, offset, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="mt-6 flex items-center justify-center gap-4">
      <button
        onClick={() => onPageChange(Math.max(offset - limit, 0))}
        disabled={offset === 0}
        className="rounded border px-4 py-1 disabled:opacity-50"
      >
        Previous
      </button>

      <span className="text-sm text-gray-700">
        Page {currentPage} of {totalPages ? totalPages : 1}
      </span>

      <button
        onClick={() => onPageChange(offset + limit)}
        disabled={offset + limit >= total}
        className="rounded border px-4 py-1 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
