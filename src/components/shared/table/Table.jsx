import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
// import { FiRefreshCw } from 'react-icons/fi';
import TableSearch from './TableSearch';
import TablePagination from './TablePagination';

const Table = ({
  data = [],
  columns = [],
  onRefresh,
  emptyMessage = 'No records found',
  onPrint,
  showPrint = false,
  printRef,
  forcePageSize,
  defaultSorting,
  isRefreshing = false,
  cardHeader = null,
}) => {
  const [sorting, setSorting] = useState(defaultSorting || []);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const prevDataLength = useRef(data.length);

  // ✅ Reset to first page if current page exceeds data count
  useEffect(() => {
    if (data.length !== prevDataLength.current) {
      prevDataLength.current = data.length;
      const maxPage = Math.max(0, Math.floor(data.length / pagination.pageSize) - 1);
      if (pagination.pageIndex > maxPage) {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      }
    }
  }, [data.length, pagination.pageIndex, pagination.pageSize]);

  // ✅ Memoize table config to prevent unnecessary recalculations
  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      pagination: { ...pagination, pageSize: forcePageSize || pagination.pageSize },
      sorting,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  });

  const hasData = table.getRowModel().rows.length > 0;

  return (
    <div className="col-lg-12" ref={printRef}>
      <div className="card stretch stretch-full function-table">
        {cardHeader && (
          <div className="card-header">
            {typeof cardHeader === 'function' ? cardHeader({ table }) : cardHeader}
          </div>
        )}
        <div className="card-body p-0">
          <div className="table-responsive">
            <div className="dataTables_wrapper dt-bootstrap5 no-footer">
              <TableSearch
                table={table}
                setGlobalFilter={setGlobalFilter}
                globalFilter={globalFilter}
                onRefresh={onRefresh}
                onPrint={onPrint}
                showPrint={showPrint}
                isRefreshing={isRefreshing}
              />

              <div className="row dt-row">
                <div className="col-sm-12 px-0">
                  <table className="table table-hover dataTable no-footer" id="projectList">
                    <thead>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              className={header.column.columnDef.meta?.headerClassName}
                            >
                              <SortableHeader header={header} />
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {!hasData ? (
                        <tr>
                          <td colSpan={columns.length} className="text-center py-4 text-muted">
                            {emptyMessage}
                          </td>
                        </tr>
                      ) : (
                        table.getRowModel().rows.map((row) => (
                          <tr key={row.id} className="single-item chat-single-item">
                            {row.getVisibleCells().map((cell) => (
                              <td
                                key={cell.id}
                                className={cell.column.columnDef.meta?.className}
                              >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <TablePagination table={table} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Table);

/* ---------------------- SORTABLE HEADER ---------------------- */
const SortableHeader = React.memo(({ header }) => {
  const sortState = header.column.getIsSorted();
  const canSort = header.column.getCanSort();

  const handleClick = header.column.getToggleSortingHandler();

  return (
    <div
      className="table-head d-flex align-items-center gap-1"
      style={{ cursor: canSort ? 'pointer' : 'default' }}
      onClick={canSort ? handleClick : undefined}
    >
      {flexRender(header.column.columnDef.header, header.getContext())}
      {canSort && (
        <>
          {sortState === 'asc' && <FaSortUp size={13} />}
          {sortState === 'desc' && <FaSortDown size={13} />}
          {!sortState && <FaSort size={13} opacity={0.3} />}
        </>
      )}
    </div>
  );
});
