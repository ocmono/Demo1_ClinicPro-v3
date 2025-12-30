import React from 'react';

const TablePagination = ({ table }) => {
  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="row gy-2 no-print">
      <div className="col-sm-12 col-md-5 p-0">
        <div className="dataTables_info text-lg-start text-center" role="status" aria-live="polite">
          Showing {totalRows > 0 ? `${startRow} to ${endRow}` : '0'} of {totalRows} entries
        </div>
      </div>
      <div className="col-sm-12 col-md-7 p-0">
        <div className="dataTables_paginate paging_simple_numbers">
          <ul className="pagination mb-0 justify-content-md-end justify-content-center gap-2">
            <li className={`paginate_button page-item previous ${!table.getCanPreviousPage() ? "disabled" : ""} `}>
              <button
                type="button"
                className="page-link"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              >
                Previous
              </button>
            </li>
            <li className="paginate_button page-item active">
              <span className="page-link">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
            </li>
            <li className={`paginate_button page-item next ${!table.getCanNextPage() ? "disabled" : ""}`}>
              <button
                type="button"
                className="page-link"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
              >
                Next
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TablePagination;
