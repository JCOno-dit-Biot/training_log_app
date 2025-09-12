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
    <div className="flex justify-center items-center gap-4 mt-6">
      <button
        onClick={() => onPageChange(Math.max(offset - limit, 0))}
        disabled={offset === 0}
        className="px-4 py-1 border rounded disabled:opacity-50"
      >
        Previous
      </button>

      <span className="text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(offset + limit)}
        disabled={offset + limit >= total}
        className="px-4 py-1 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}