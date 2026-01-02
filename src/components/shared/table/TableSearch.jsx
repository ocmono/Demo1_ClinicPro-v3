import React from 'react'
import { FiRefreshCw, FiPrinter } from 'react-icons/fi';
import './TableSearch.css'

const TableSearch = ({ table, setGlobalFilter, globalFilter, onRefresh, onPrint, showPrint, showFilter, isRefreshing }) => {
    return (
        <div className='row gy-2 no-print py-3'>
            <div className='col-sm-12 col-md-6 p-0 m-0 pb-10'>
                <div className='dataTables_length d-flex justify-content-md-start justify-content-center'>
                    <label className='d-flex align-items-center gap-1'>
                        Show
                        <select
                            className='form-select form-select-sm w-auto pe-4' 
                            value={table.getState().pagination.pageSize}
                            onChange={e => {
                                table.setPageSize(Number(e.target.value))
                            }}
                        >
                            {[10, 20, 30, 40, 50].map(pageSize => (
                                <option key={pageSize} value={pageSize}>
                                    {pageSize}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>
            <div className='col-sm-12 col-md-6 p-0 m-0 pb-10'>
                <div className='dataTables_filter d-flex justify-content-md-end justify-content-center gap-2'>
                    <label className='d-inline-flex align-items-center gap-2'>
                        Search:
                        <input
                            type="text"
                            value={globalFilter ?? ""}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder='Search...'
                            className="form-control form-control-sm"
                        />
                    </label>
                    <button className="btn btn-primary" onClick={onRefresh} title="Refresh" disabled={isRefreshing}> <FiRefreshCw className={isRefreshing ? 'spinner-border spinner-border-sm' : ''} /></button>
                    {
                        showPrint && (
                            <button className="btn btn-outline-primary" onClick={onPrint} title="Print"><FiPrinter /></button>
                        )
                    }
                </div>
            </div>
            {showFilter && (
                <div className="col-md-12 mt-2">
                    <div className="alert alert-light border d-flex justify-content-between align-items-center">
                        {/* You can add your filter dropdowns here */}
                        <div>Put your custom filters here (status/category/date etc.)</div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TableSearch