import { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import { FiDownload, FiFilter, FiRefreshCw, FiTrendingUp, FiTrendingDown, FiPackage, FiDollarSign, FiAlertTriangle, FiCalendar, FiBarChart2 } from 'react-icons/fi';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import CardHeader from '@/components/shared/CardHeader';
import CardLoader from '@/components/shared/CardLoader';
import useCardTitleActions from '@/hooks/useCardTitleActions';

// Enhanced mock data
const mockProducts = [
  { id: 1, name: 'Paracetamol', category: 'Painkillers' },
  { id: 2, name: 'Ibuprofen', category: 'Painkillers' },
  { id: 3, name: 'Amoxicillin', category: 'Antibiotics' },
  { id: 4, name: 'Vitamin C', category: 'Vitamins' },
  { id: 5, name: 'Omeprazole', category: 'Gastrointestinal' },
];

const mockSuppliers = [
  { id: 1, name: 'Acme Pharma', rating: 4.5 },
  { id: 2, name: 'Global Meds', rating: 4.2 },
  { id: 3, name: 'HealthFirst', rating: 4.8 },
  { id: 4, name: 'Wellness Corp', rating: 4.0 },
];

const mockInventory = [
  { id: 1, product: 1, supplier: 1, stock: 100, value: 1000, date: '2024-06-01', status: 'active', lowStock: false },
  { id: 2, product: 2, supplier: 2, stock: 50, value: 750, date: '2024-06-02', status: 'active', lowStock: true },
  { id: 3, product: 3, supplier: 1, stock: 30, value: 300, date: '2024-06-03', status: 'active', lowStock: true },
  { id: 4, product: 4, supplier: 3, stock: 200, value: 2000, date: '2024-06-04', status: 'active', lowStock: false },
  { id: 5, product: 5, supplier: 4, stock: 75, value: 1500, date: '2024-06-05', status: 'active', lowStock: false },
];

const mockStockHistory = [
  { date: '2024-06-01', stockIn: 150, stockOut: 50, netChange: 100 },
  { date: '2024-06-02', stockIn: 100, stockOut: 75, netChange: 25 },
  { date: '2024-06-03', stockIn: 200, stockOut: 100, netChange: 100 },
  { date: '2024-06-04', stockIn: 80, stockOut: 120, netChange: -40 },
  { date: '2024-06-05', stockIn: 120, stockOut: 90, netChange: 30 },
];

function getProductName(id) {
  const p = mockProducts.find(p => p.id === id);
  return p ? p.name : '';
}

function getSupplierName(id) {
  const s = mockSuppliers.find(s => s.id === id);
  return s ? s.name : '';
}

function getProductCategory(id) {
  const p = mockProducts.find(p => p.id === id);
  return p ? p.category : '';
}

const InventoryReport = () => {
  const [filter, setFilter] = useState({ 
    product: '', 
    supplier: '', 
    category: '',
    status: '',
    from: '', 
    to: '',
    lowStock: false 
  });
  const [reportType, setReportType] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  const {
    refreshKey,
    isRemoved,
    isExpanded,
    handleRefresh,
    handleExpand,
    handleDelete
  } = useCardTitleActions();

  if (isRemoved) return null;

  // Filtering
  const filtered = mockInventory.filter(item => {
    const productMatch = !filter.product || item.product === Number(filter.product);
    const supplierMatch = !filter.supplier || item.supplier === Number(filter.supplier);
    const categoryMatch = !filter.category || getProductCategory(item.product) === filter.category;
    const statusMatch = !filter.status || item.status === filter.status;
    const dateFromMatch = !filter.from || item.date >= filter.from;
    const dateToMatch = !filter.to || item.date <= filter.to;
    const lowStockMatch = !filter.lowStock || item.lowStock === filter.lowStock;
    
    return productMatch && supplierMatch && categoryMatch && statusMatch && dateFromMatch && dateToMatch && lowStockMatch;
  });

  // Calculate statistics
  const totalStock = filtered.reduce((sum, item) => sum + item.stock, 0);
  const totalValue = filtered.reduce((sum, item) => sum + item.value, 0);
  const lowStockItems = filtered.filter(item => item.lowStock).length;
  const activeItems = filtered.filter(item => item.status === 'active').length;
  const avgStockValue = totalValue / (filtered.length || 1);

  // Get unique categories
  const categories = [...new Set(mockProducts.map(p => p.category))];

  // Stock movement analysis
  const recentStockMovement = mockStockHistory.slice(-7);
  const totalStockIn = recentStockMovement.reduce((sum, item) => sum + item.stockIn, 0);
  const totalStockOut = recentStockMovement.reduce((sum, item) => sum + item.stockOut, 0);
  const netStockChange = totalStockIn - totalStockOut;

  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Inventory report refreshed successfully!');
    } catch (error) {
      console.log('Failed to refresh inventory report');
      // toast.error('Failed to refresh inventory report');
    } finally {
      setIsLoading(false);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Product', 'Category', 'Supplier', 'Stock', 'Value', 'Status', 'Low Stock', 'Date'];
    const rows = filtered.map(item => [
      getProductName(item.product),
      getProductCategory(item.product),
      getSupplierName(item.supplier),
      item.stock,
      item.value,
      item.status,
      item.lowStock ? 'Yes' : 'No',
      item.date
    ]);
    
    let csv = headers.join(',') + '\n' + rows.map(r => r.map(x => '"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `inventory-report-${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Report exported successfully!');
  };

  // Export to PDF (simulated)
  const exportToPDF = () => {
    toast.info('PDF export functionality coming soon!');
  };

  const clearFilters = () => {
    setFilter({ 
      product: '', 
      supplier: '', 
      category: '',
      status: '',
      from: '', 
      to: '',
      lowStock: false 
    });
  };

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

              <div className="card-body">
                {/* Report Type Selector */}
                <div className="mb-4">
                  <div className="btn-group" role="group">
                    <input type="radio" className="btn-check" name="reportType" id="overview" 
                           checked={reportType === 'overview'} onChange={() => setReportType('overview')} />
                    <label className="btn btn-outline-primary" htmlFor="overview">
                      <FiBarChart2 className="me-1" />
                      Overview
                    </label>
                    
                    <input type="radio" className="btn-check" name="reportType" id="detailed" 
                           checked={reportType === 'detailed'} onChange={() => setReportType('detailed')} />
                    <label className="btn btn-outline-primary" htmlFor="detailed">
                      <FiPackage className="me-1" />
                      Detailed
                    </label>
                    
                    <input type="radio" className="btn-check" name="reportType" id="movement" 
                           checked={reportType === 'movement'} onChange={() => setReportType('movement')} />
                    <label className="btn btn-outline-primary" htmlFor="movement">
                      <FiTrendingUp className="me-1" />
                      Stock Movement
                    </label>
                  </div>
                </div>

                {/* Statistics Cards */}
                {reportType === 'overview' && (
                  <div className="row mb-4">
                    <StatCard 
                      title="Total Stock" 
                      value={totalStock.toLocaleString()} 
                      icon={FiPackage} 
                      color="#4e73df"
                      subtitle={`${filtered.length} items`}
                    />
                    <StatCard 
                      title="Total Value" 
                      value={`₹${totalValue.toLocaleString()}`} 
                      icon={FiDollarSign} 
                      color="#1cc88a"
                      subtitle={`Avg: ₹${avgStockValue.toFixed(0)}`}
                    />
                    <StatCard 
                      title="Low Stock Items" 
                      value={lowStockItems} 
                      icon={FiAlertTriangle} 
                      color="#f6c23e"
                      subtitle="Needs attention"
                    />
                    <StatCard 
                      title="Active Items" 
                      value={activeItems} 
                      icon={FiTrendingUp} 
                      color="#36b9cc"
                      subtitle={`${((activeItems / filtered.length) * 100).toFixed(1)}% of total`}
                    />
                  </div>
                )}

                {/* Stock Movement Summary */}
                {reportType === 'movement' && (
                  <div className="row mb-4">
                    <StatCard 
                      title="Stock In (7 days)" 
                      value={totalStockIn.toLocaleString()} 
                      icon={FiTrendingUp} 
                      color="#1cc88a"
                    />
                    <StatCard 
                      title="Stock Out (7 days)" 
                      value={totalStockOut.toLocaleString()} 
                      icon={FiTrendingDown} 
                      color="#e74a3b"
                    />
                    <StatCard 
                      title="Net Change" 
                      value={netStockChange.toLocaleString()} 
                      icon={netStockChange >= 0 ? FiTrendingUp : FiTrendingDown} 
                      color={netStockChange >= 0 ? "#1cc88a" : "#e74a3b"}
                    />
                    <StatCard 
                      title="Movement Rate" 
                      value={`${((totalStockOut / totalStock) * 100).toFixed(1)}%`} 
                      icon={FiCalendar} 
                      color="#6f42c1"
                    />
                  </div>
                )}

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
                      <div className="col-md-2">
                        <label className="form-label">Product</label>
                        <select className="form-select" value={filter.product} onChange={e => setFilter(f => ({ ...f, product: e.target.value }))}>
                          <option value="">All Products</option>
                          {mockProducts.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">Category</label>
                        <select className="form-select" value={filter.category} onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}>
                          <option value="">All Categories</option>
                          {categories.map(cat => <option value={cat} key={cat}>{cat}</option>)}
                        </select>
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">Supplier</label>
                        <select className="form-select" value={filter.supplier} onChange={e => setFilter(f => ({ ...f, supplier: e.target.value }))}>
                          <option value="">All Suppliers</option>
                          {mockSuppliers.map(s => <option value={s.id} key={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">Status</label>
                        <select className="form-select" value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
                          <option value="">All Status</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">From Date</label>
                        <input type="date" className="form-control" value={filter.from} onChange={e => setFilter(f => ({ ...f, from: e.target.value }))} />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">To Date</label>
                        <input type="date" className="form-control" value={filter.to} onChange={e => setFilter(f => ({ ...f, to: e.target.value }))} />
                      </div>
                    </div>
                    <div className="row mt-3">
                      <div className="col-md-3">
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id="lowStock" 
                            checked={filter.lowStock} 
                            onChange={e => setFilter(f => ({ ...f, lowStock: e.target.checked }))} 
                          />
                          <label className="form-check-label" htmlFor="lowStock">
                            Show Low Stock Items Only
                          </label>
                        </div>
                      </div>
                      <div className="col-md-9 text-end">
                        <button className="btn btn-outline-secondary btn-sm" onClick={clearFilters}>
                          Clear Filters
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Table */}
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Inventory Data</h6>
                    <small className="text-muted">
                      Showing {filtered.length} of {mockInventory.length} records
                    </small>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Supplier</th>
                            <th>Stock</th>
                            <th>Value</th>
                            <th>Status</th>
                            <th>Low Stock</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map(item => (
                            <tr key={item.id}>
                              <td>
                                <strong>{getProductName(item.product)}</strong>
                              </td>
                              <td>
                                <span className="badge bg-secondary">
                                  {getProductCategory(item.product)}
                                </span>
                              </td>
                              <td>{getSupplierName(item.supplier)}</td>
                              <td>
                                <span className={`badge ${item.lowStock ? 'bg-warning' : 'bg-success'}`}>
                                  {item.stock}
                                </span>
                              </td>
                              <td>
                                <strong>₹{item.value.toLocaleString()}</strong>
                              </td>
                              <td>
                                <span className={`badge bg-${item.status === 'active' ? 'success' : 'secondary'}`}>
                                  {item.status}
                                </span>
                              </td>
                              <td>
                                {item.lowStock ? (
                                  <span className="text-warning">
                                    <FiAlertTriangle className="me-1" />
                                    Yes
                                  </span>
                                ) : (
                                  <span className="text-success">No</span>
                                )}
                              </td>
                              <td>
                                <small className="text-muted">
                                  {new Date(item.date).toLocaleDateString()}
                                </small>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {filtered.length === 0 && (
                      <div className="text-center py-5">
                        <div className="text-muted">
                          <FiPackage size={48} className="mb-3" />
                          <h5>No inventory records found</h5>
                          <p>Try adjusting your filter criteria</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary Footer */}
                <div className="mt-4 p-3 bg-light rounded">
                  <div className="row text-center">
                    <div className="col-md-3">
                      <h6 className="text-muted">Total Items</h6>
                      <h4>{filtered.length}</h4>
                    </div>
                    <div className="col-md-3">
                      <h6 className="text-muted">Total Stock</h6>
                      <h4>{totalStock.toLocaleString()}</h4>
                    </div>
                    <div className="col-md-3">
                      <h6 className="text-muted">Total Value</h6>
                      <h4>₹{totalValue.toLocaleString()}</h4>
                    </div>
                    <div className="col-md-3">
                      <h6 className="text-muted">Low Stock Items</h6>
                      <h4 className="text-warning">{lowStockItems}</h4>
                    </div>
                  </div>
                </div>
              </div>
              <CardLoader refreshKey={refreshKey} />
            
      </div>

      <style jsx>{`
        .border-left-primary {
          border-left: 4px solid #4e73df !important;
        }
        .table-hover tbody tr:hover {
          background-color: rgba(0,0,0,.075);
        }
        .btn-check:checked + .btn-outline-primary {
          background-color: #0d6efd;
          border-color: #0d6efd;
          color: white;
        }
      `}</style>
    </>
  );
};

export default InventoryReport; 