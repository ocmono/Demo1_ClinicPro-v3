import { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-toastify';
import { FiSearch, FiFilter, FiRefreshCw, FiDownload, FiTrendingUp, FiTrendingDown, FiPackage, FiAlertTriangle } from 'react-icons/fi';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import CardHeader from '@/components/shared/CardHeader';
import CardLoader from '@/components/shared/CardLoader';
import Table from '@/components/shared/table/Table';
import useCardTitleActions from '@/hooks/useCardTitleActions';
import { useMedicines } from '../../../context/MedicinesContext';

// Helper functions to get medicine info
function getMedicineInfoByVariation(medicines, variationId) {
  for (const medicine of medicines) {
    const variation = medicine.variations?.find(v => v.id === variationId || String(v.id) === String(variationId))
    if (variation) {
      return {
        name: medicine.name || 'Unknown Medicine',
        category: medicine.category || 'Unknown Category',
        sku: variation.sku || 'Unknown SKU'
      };
    }
  }
  return { name: 'Unknown Medicine', category: 'Unknown Category', sku: `VAR-${variationId}` };
}

function getMedicineName(medicines, variationId) {
  const medicine = getMedicineInfoByVariation(medicines, variationId);
  return medicine ? medicine.name || medicine.medicineName || 'Unknown Medicine' : 'Unknown Medicine';
}

function getMedicineCategory(medicines, variationId) {
  const medicine = getMedicineInfoByVariation(medicines, variationId);
  return medicine ? medicine.category || medicine.medicine_category || 'Unknown Category' : 'Unknown Category';
}

function getVariationSKU(medicines, variationId) {
  if (!medicines || !variationId) return 'Unknown SKU';

  for (const medicine of medicines) {
    if (medicine.variations && Array.isArray(medicine.variations)) {
      const variation = medicine.variations.find(v =>
        v.id === variationId ||
        v.id === String(variationId) ||
        String(v.id) === String(variationId) ||
        v.sku === variationId
      );
      if (variation) {
        console.log("Variation found:", { variationId, variation });
        return variation.sku || variation.variation_sku || `VAR-${variationId}`;
      }
    }
  }

  console.log("Variation not found:", { variationId, medicines: medicines.length });
  return `SKU-${variationId}`;
}

const StockHistory = () => {
  const { medicines, getStockHistory } = useMedicines();
  console.log("Medicines Data", medicines);
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [filter, setFilter] = useState({
    medicine_id: '',
    variation_id: '',
    stock_type: '',
    reason: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const [viewMode, setViewMode] = useState('table'); // table, chart

  const {
    refreshKey,
    isRemoved,
    isExpanded
  } = useCardTitleActions();

  if (isRemoved) return null;

  // Fetch stock history on component mount
  useEffect(() => {
    fetchStockHistory();
  }, []);

  const fetchStockHistory = async (filters = {}) => {
    setIsLoading(true);
    try {
      const result = await getStockHistory(filters);
      if (result.success) {
        console.log("Stock history data sample:", result.data);
        console.log("Medicines data sample:", medicines?.[0]);
        console.log("All medicine IDs:", medicines.map(m => ({ id: m.id, name: m.name })));
        if (result.data?.[0]) {
          console.log("Stock history medicine_id:", result.data[0].medicine_id);
          console.log("Stock history variation_id:", result.data[0].variation_id);
        }
        setHistory(result.data || []);
        setFilteredHistory(result.data || []);
      } else {
        console.log(result.error || 'Failed to fetch stock history');
        // toast.error(result.error || 'Failed to fetch stock history');
        setHistory([]);
        setFilteredHistory([]);
      }
    } catch (error) {
      console.error('Error fetching stock history:', error);
      // toast.error('Failed to fetch stock history');
      setHistory([]);
      setFilteredHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and process history
  useEffect(() => {
    let filtered = [...history];

    // Search filter
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filtered = filtered.filter(item =>
        getMedicineName(medicines, item.medicine_id, item.variation_id).toLowerCase().includes(searchTerm) ||
        getVariationSKU(medicines, item.variation_id).toLowerCase().includes(searchTerm) ||
        (item.reason && item.reason.toLowerCase().includes(searchTerm))
      );
    }

    // Medicine filter
    if (filter.medicine_id) {
      filtered = filtered.filter(item => {
        const variationId = item.variation_id;
        const matchingMedicine = medicines.find(medicine =>
          medicine.id == filter.medicine_id &&
          medicine.variations?.some(v => String(v.id) === String(variationId))
        );
        return !!matchingMedicine;
      });
    }

    // Variation filter
   if (filter.variation_id) {
    filtered = filtered.filter(item => String(item.variation_id) === String(filter.variation_id));
  }

    // Stock type filter
    if (filter.stock_type) {
      filtered = filtered.filter(item => item.stock_type === filter.stock_type);
    }

    // Reason filter
    if (filter.reason) {
      filtered = filtered.filter(item => item.reason && item.reason.includes(filter.reason));
    }

    setFilteredHistory(filtered);
  }, [history, filter, medicines]);

  // Calculate statistics
  const totalStockIn = filteredHistory.filter(item => item.stock_type === 'in').reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalStockOut = filteredHistory.filter(item => item.stock_type === 'out').reduce((sum, item) => sum + (item.quantity || 0), 0);
  const netChange = totalStockIn - totalStockOut;

  // Get unique values for filters
  const uniqueReasons = [...new Set(history.map(item => item.reason).filter(Boolean))];
  const uniqueVariations = [];
  medicines.forEach(medicine => {
    if (medicine.variations) {
      medicine.variations.forEach(variation => {
        uniqueVariations.push({
          id: variation.id,
          sku: variation.sku,
          medicineName: medicine.name || medicine.medicineName
        });
      });
    }
  });

  const handleFilterChange = (key, value) => {
    setFilter(prev => ({ ...prev, [key]: String(value) }));
  };

  const handleClearFilters = () => {
    setFilter({
      medicine_id: '',
      variation_id: '',
      stock_type: '',
      reason: '',
      search: ''
    });
  };

  const handleRefreshData = async () => {
    await fetchStockHistory();
    toast.success('Stock history refreshed successfully!');
  };

  const handleExport = () => {
    const headers = ['Medicine', 'SKU', 'Type', 'Quantity', 'Reason'];
    const rows = filteredHistory.map(item => [
      getMedicineName(medicines, item.medicine_id),
      getVariationSKU(medicines, item.variation_id),
      item.stock_type,
      item.quantity,
      item.reason || ''
    ]);

    let csv = headers.join(',') + '\n' + rows.map(r => r.map(x => '"' + String(x).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Stock history exported successfully!');
  };



  const getTypeIcon = (type) => {
    switch (type) {
      case 'in': return <FiTrendingUp className="text-success" />;
      case 'out': return <FiTrendingDown className="text-danger" />;
      default: return <FiPackage className="text-secondary" />;
    }
  };

  const getTypeBadge = (type) => {
    const colors = {
      'in': 'success',
      'out': 'danger'
    };
    return `bg-${colors[type] || 'secondary'}`;
  };

  const printRef = useRef();

  // Transform history data for table
  const tableData = useMemo(() => {
    return filteredHistory.map((item, index) => {
    const { name, category, sku } = getMedicineInfoByVariation(medicines, item.variation_id);

    return {
      id: item.id || index,
      medicine_name: name,
      category: category,
      sku: sku,
      stock_type: item.stock_type || 'unknown',
      quantity: item.quantity || 0,
      reason: item.reason || 'No reason provided',
      actions: item
    };
  });
}, [filteredHistory, medicines]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const printHTML = `
      <html>
        <head>
          <title>Stock History Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>Stock History Report</h2>
          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>SKU</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              ${tableData.map(item => `
                <tr>
                  <td>${item.medicine_name}</td>
                  <td>${item.sku}</td>
                  <td>${item.stock_type.toUpperCase()}</td>
                  <td>${item.stock_type === 'in' ? '+' : '-'}${item.quantity}</td>
                  <td>${item.reason}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.open();
    printWindow.document.write(printHTML);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const columns = [
    {
      accessorKey: 'id',
      header: ({ table }) => {
        const checkboxRef = useRef(null);
        return (
          <input
            type="checkbox"
            className="custom-table-checkbox"
            ref={checkboxRef}
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        );
      },
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="custom-table-checkbox"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      meta: { headerClassName: 'width-30' },
    },
    {
      accessorKey: 'medicine_name',
      header: () => 'Medicine',
      cell: ({ getValue, row }) => (
        <div>
          <div className="fw-bold">{getValue()}</div>
          <small className="text-muted">{row.original.category}</small>
        </div>
      )
    },
    {
      accessorKey: 'sku',
      header: () => 'SKU',
      cell: ({ getValue }) => (
        <code className="text-primary">{getValue()}</code>
      ),
    },
    {
      accessorKey: 'stock_type',
      header: () => 'Type',
      cell: ({ getValue }) => {
        const type = getValue();
        return (
          <span className={`badge ${getTypeBadge(type)}`}>
            {getTypeIcon(type)}
            <span className="ms-1">{type.toUpperCase()}</span>
          </span>
        );
      }
    },
    {
      accessorKey: 'quantity',
      header: () => 'Quantity',
      cell: ({ getValue, row }) => {
        const quantity = getValue();
        const type = row.original.stock_type;
        return (
          <span className={`fw-bold ${type === 'in' ? 'text-success' : 'text-danger'}`}>
            {type === 'in' ? '+' : '-'}{quantity}
          </span>
        );
      }
    },
    {
      accessorKey: 'reason',
      header: () => 'Reason',
      cell: ({ getValue }) => (
        <span className="badge bg-light text-dark">
          {getValue()}
        </span>
      ),
    },
  ];

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="col-xl-3 col-md-6 mb-4">
      <div className="card border-left-primary shadow h-100 py-2" style={{ borderLeft: `4px solid ${color}` }}>
        <div className="card-body">
          <div className="row no-gutters align-items-center">
            <div className="col mr-2">
              <div className="text-xs font-weight-bold text-uppercase mb-1" style={{ color }}>
                {title}
              </div>
              <div className="h5 mb-0 font-weight-bold text-gray-800">{value}</div>
              {subtitle && <div className="text-xs text-muted">{subtitle}</div>}
            </div>
            <div className="col-auto">
              <Icon size={24} style={{ color }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <PageHeader />
      <div className="main-content">
        <div className="row">
          <div className="col-12">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
              <CardHeader
                title="Stock Movement History"
                children={
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm" onClick={handleRefreshData} disabled={isLoading}>
                      <FiRefreshCw className={`me-1 ${isLoading ? 'spinner-border spinner-border-sm' : ''}`} />
                      Refresh
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={handleExport}>
                      <FiDownload className="me-1" />
                      Export
                    </button>
                    <div className="btn-group btn-group-sm">
                      <button
                        className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setViewMode('table')}
                      >
                        Table
                      </button>
                      <button
                        className={`btn ${viewMode === 'chart' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setViewMode('chart')}
                      >
                        Chart
                      </button>
                    </div>
                  </div>
                }
              />
              <div className="card-body">
                {/* Statistics Cards */}
                <div className="row mb-4">
                  <StatCard
                    title="Total Stock In"
                    value={totalStockIn.toLocaleString()}
                    icon={FiTrendingUp}
                    color="#1cc88a"
                    subtitle="All time"
                  />
                  <StatCard
                    title="Total Stock Out"
                    value={totalStockOut.toLocaleString()}
                    icon={FiTrendingDown}
                    color="#e74a3b"
                    subtitle="All time"
                  />
                  <StatCard
                    title="Net Change"
                    value={netChange.toLocaleString()}
                    icon={FiPackage}
                    color={netChange >= 0 ? "#1cc88a" : "#e74a3b"}
                    subtitle="Overall change"
                  />
                  <StatCard
                    title="Total Records"
                    value={filteredHistory.length.toLocaleString()}
                    icon={FiAlertTriangle}
                    color="#6f42c1"
                    subtitle="Filtered results"
                  />
                </div>

                {/* Filters */}
                <div className="card mb-4">
                  <div className="card-header">
                    <h6 className="mb-0">
                      <FiFilter className="me-2" />
                      Filters
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3">
                        <label className="form-label">Medicine</label>
                        <select
                          className="form-select"
                          value={filter.medicine_id}
                          onChange={e => handleFilterChange('medicine_id', e.target.value || '')}
                        >
                          <option value="">All Medicines</option>
                          {medicines.map(m => <option value={m.id} key={m.id}>{m.name || m.medicineName}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Variation</label>
                        <select
                          className="form-select"
                          value={filter.variation_id}
                          onChange={e => handleFilterChange('variation_id', e.target.value)}
                        >
                          <option value="">All Variations</option>
                          {uniqueVariations.map(v => <option value={v.id} key={v.id}>{v.sku} - {v.medicineName}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Type</label>
                        <select
                          className="form-select"
                          value={filter.stock_type}
                          onChange={e => handleFilterChange('stock_type', e.target.value)}
                        >
                          <option value="">All Types</option>
                          <option value="in">Stock In</option>
                          <option value="out">Stock Out</option>
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Reason</label>
                        <select
                          className="form-select"
                          value={filter.reason}
                          onChange={e => handleFilterChange('reason', e.target.value)}
                        >
                          <option value="">All Reasons</option>
                          {uniqueReasons.map(reason => <option value={reason} key={reason}>{reason}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="row mt-3">
                      <div className="col-md-6 d-flex align-items-end">
                        <button className="btn btn-outline-secondary" onClick={handleClearFilters}>
                          Clear Filters
                        </button>
                        <div className="ms-auto">
                          <small className="text-muted">
                            Showing {filteredHistory.length} of {history.length} records
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Table */}
                {viewMode === 'table' && (
                  <Table
                    data={tableData}
                    columns={columns}
                    onPrint={handlePrint}
                    showPrint={true}
                    printRef={printRef}
                    emptyMessage="No stock movements found. Try adjusting your filter criteria."
                  />
                )}

                {/* Chart View */}
                {viewMode === 'chart' && (
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0">Stock Movement Chart</h6>
                    </div>
                    <div className="card-body">
                      <div className="text-center py-5">
                        <div className="text-muted">
                          <FiTrendingUp size={48} className="mb-3" />
                          <h5>Chart View Coming Soon</h5>
                          <p>Interactive charts and analytics will be available soon</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <CardLoader refreshKey={refreshKey} />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .border-left-primary {
          border-left: 4px solid #4e73df !important;
        }
        .table-hover tbody tr:hover {
          background-color: rgba(0,0,0,.075);
        }
        .badge {
          font-size: 0.75rem;
        }
        code {
          background-color: #f8f9fa;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
        }
      `}</style>
    </>
  );
};

export default StockHistory; 