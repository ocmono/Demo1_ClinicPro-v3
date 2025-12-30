import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiFilter, FiRefreshCw, FiDownload, FiEye, FiEdit3, FiTrash2, FiCheck, FiX, FiClock, FiTruck, FiDollarSign, FiPackage, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import CardHeader from '@/components/shared/CardHeader';
import CardLoader from '@/components/shared/CardLoader';
import useCardTitleActions from '@/hooks/useCardTitleActions';

// Enhanced mock data
const mockSuppliers = [
  { id: 1, name: 'Acme Pharma', rating: 4.5, contact: '+91-9876543210', email: 'acme@pharma.com' },
  { id: 2, name: 'Global Meds', rating: 4.2, contact: '+91-9876543211', email: 'global@meds.com' },
  { id: 3, name: 'HealthFirst', rating: 4.8, contact: '+91-9876543212', email: 'health@first.com' },
  { id: 4, name: 'Wellness Corp', rating: 4.0, contact: '+91-9876543213', email: 'wellness@corp.com' },
];

const mockProducts = [
  { id: 1, name: 'Paracetamol', category: 'Painkillers', sku: 'P-001' },
  { id: 2, name: 'Ibuprofen', category: 'Painkillers', sku: 'I-001' },
  { id: 3, name: 'Amoxicillin', category: 'Antibiotics', sku: 'A-001' },
  { id: 4, name: 'Vitamin C', category: 'Vitamins', sku: 'V-001' },
  { id: 5, name: 'Omeprazole', category: 'Gastrointestinal', sku: 'O-001' },
];

const mockOrders = [
  {
    id: 1,
    poNumber: 'PO-2024-001',
    supplier: 1,
    orderDate: '2024-06-01',
    expectedDate: '2024-06-15',
    status: 'pending',
    priority: 'normal',
    items: [
      { product: 1, quantity: 100, price: 10.50, received: 0 },
      { product: 2, quantity: 50, price: 15.00, received: 0 },
    ],
    totalAmount: 1800,
    notes: 'Regular monthly order',
    createdBy: 'Admin User',
    approvedBy: null,
    approvedDate: null,
  },
  {
    id: 2,
    poNumber: 'PO-2024-002',
    supplier: 2,
    orderDate: '2024-06-05',
    expectedDate: '2024-06-20',
    status: 'approved',
    priority: 'high',
    items: [
      { product: 3, quantity: 75, price: 25.00, received: 0 },
      { product: 4, quantity: 200, price: 8.00, received: 0 },
    ],
    totalAmount: 3475,
    notes: 'Emergency restock for antibiotics',
    createdBy: 'Dr. Smith',
    approvedBy: 'Admin User',
    approvedDate: '2024-06-06',
  },
  {
    id: 3,
    poNumber: 'PO-2024-003',
    supplier: 3,
    orderDate: '2024-06-10',
    expectedDate: '2024-06-25',
    status: 'received',
    priority: 'normal',
    items: [
      { product: 5, quantity: 60, price: 35.00, received: 60 },
      { product: 1, quantity: 150, price: 10.50, received: 150 },
    ],
    totalAmount: 4650,
    notes: 'Received on time',
    createdBy: 'Pharmacist Brown',
    approvedBy: 'Admin User',
    approvedDate: '2024-06-11',
  },
  {
    id: 4,
    poNumber: 'PO-2024-004',
    supplier: 4,
    orderDate: '2024-06-12',
    expectedDate: '2024-06-30',
    status: 'cancelled',
    priority: 'low',
    items: [
      { product: 2, quantity: 30, price: 15.00, received: 0 },
    ],
    totalAmount: 450,
    notes: 'Cancelled due to budget constraints',
    createdBy: 'Nurse Johnson',
    approvedBy: null,
    approvedDate: null,
  },
];

function getSupplierName(id) {
  const s = mockSuppliers.find(s => s.id === id);
  return s ? s.name : '';
}

function getProductName(id) {
  const p = mockProducts.find(p => p.id === id);
  return p ? p.name : '';
}

function getProductSKU(id) {
  const p = mockProducts.find(p => p.id === id);
  return p ? p.sku : '';
}

const PurchaseOrdersList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState(mockOrders);
  const [filteredOrders, setFilteredOrders] = useState(mockOrders);
  const [filter, setFilter] = useState({ 
    supplier: '', 
    status: '', 
    priority: '',
    dateFrom: '', 
    dateTo: '',
    search: '',
    amountRange: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [viewMode, setViewMode] = useState('table');

  const {
    refreshKey,
    isRemoved,
    isExpanded,
    handleRefresh,
    handleExpand,
    handleDelete: handleCardDelete
  } = useCardTitleActions();

  if (isRemoved) return null;

  // Filter and process orders
  useEffect(() => {
    let filtered = [...orders];

    // Search filter
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filtered = filtered.filter(order => 
        order.poNumber.toLowerCase().includes(searchTerm) ||
        getSupplierName(order.supplier).toLowerCase().includes(searchTerm) ||
        order.notes.toLowerCase().includes(searchTerm) ||
        order.createdBy.toLowerCase().includes(searchTerm)
      );
    }

    // Supplier filter
    if (filter.supplier) {
      filtered = filtered.filter(order => order.supplier === parseInt(filter.supplier));
    }

    // Status filter
    if (filter.status) {
      filtered = filtered.filter(order => order.status === filter.status);
    }

    // Priority filter
    if (filter.priority) {
      filtered = filtered.filter(order => order.priority === filter.priority);
    }

    // Date range filter
    if (filter.dateFrom) {
      filtered = filtered.filter(order => order.orderDate >= filter.dateFrom);
    }
    if (filter.dateTo) {
      filtered = filtered.filter(order => order.orderDate <= filter.dateTo);
    }

    // Amount range filter
    if (filter.amountRange) {
      const [min, max] = filter.amountRange.split('-').map(Number);
      filtered = filtered.filter(order => {
        if (max) {
          return order.totalAmount >= min && order.totalAmount <= max;
        }
        return order.totalAmount >= min;
      });
    }

    setFilteredOrders(filtered);
  }, [orders, filter]);

  // Calculate statistics
  const totalOrders = filteredOrders.length;
  const pendingOrders = filteredOrders.filter(order => order.status === 'pending').length;
  const approvedOrders = filteredOrders.filter(order => order.status === 'approved').length;
  const receivedOrders = filteredOrders.filter(order => order.status === 'received').length;
  const totalValue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const averageValue = totalValue / (totalOrders || 1);

  const handleFilterChange = (key, value) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilter({ 
      supplier: '', 
      status: '', 
      priority: '',
      dateFrom: '', 
      dateTo: '',
      search: '',
      amountRange: ''
    });
  };

  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Purchase orders refreshed successfully!');
    } catch {
      toast.error('Failed to refresh purchase orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const headers = ['PO Number', 'Supplier', 'Order Date', 'Expected Date', 'Status', 'Priority', 'Total Amount', 'Items', 'Created By', 'Notes'];
    const rows = filteredOrders.map(order => [
      order.poNumber,
      getSupplierName(order.supplier),
      order.orderDate,
      order.expectedDate,
      order.status,
      order.priority,
      order.totalAmount,
      order.items.length,
      order.createdBy,
      order.notes
    ]);
    
    let csv = headers.join(',') + '\n' + rows.map(r => r.map(x => '"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Purchase orders exported successfully!');
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(filteredOrders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  const handleBulkApprove = () => {
    if (selectedOrders.length === 0) {
      toast.warning('Please select orders to approve');
      return;
    }
    
    if (window.confirm(`Approve ${selectedOrders.length} selected purchase orders?`)) {
      setOrders(prev => prev.map(order => {
        if (selectedOrders.includes(order.id) && order.status === 'pending') {
          return {
            ...order,
            status: 'approved',
            approvedBy: 'Admin User',
            approvedDate: new Date().toISOString().split('T')[0]
          };
        }
        return order;
      }));
      setSelectedOrders([]);
      toast.success(`${selectedOrders.length} orders approved successfully!`);
    }
  };

  const handleBulkCancel = () => {
    if (selectedOrders.length === 0) {
      toast.warning('Please select orders to cancel');
      return;
    }
    
    if (window.confirm(`Cancel ${selectedOrders.length} selected purchase orders?`)) {
      setOrders(prev => prev.map(order => {
        if (selectedOrders.includes(order.id) && ['pending', 'approved'].includes(order.status)) {
          return { ...order, status: 'cancelled' };
        }
        return order;
      }));
      setSelectedOrders([]);
      toast.success(`${selectedOrders.length} orders cancelled successfully!`);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this purchase order? This action cannot be undone.')) {
      setOrders(prev => prev.filter(order => order.id !== id));
      setSelectedOrders(prev => prev.filter(orderId => orderId !== id));
      toast.success('Purchase order deleted successfully!');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="text-warning" />;
      case 'approved': return <FiCheck className="text-primary" />;
      case 'received': return <FiTruck className="text-success" />;
      case 'cancelled': return <FiX className="text-danger" />;
      default: return <FiPackage className="text-secondary" />;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'pending': 'warning',
      'approved': 'primary',
      'received': 'success',
      'cancelled': 'danger'
    };
    return `bg-${colors[status] || 'secondary'}`;
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      'low': 'success',
      'normal': 'primary',
      'high': 'warning',
      'urgent': 'danger'
    };
    return `bg-${colors[priority] || 'secondary'}`;
  };

  const isOverdue = (expectedDate) => {
    return new Date(expectedDate) < new Date() && new Date(expectedDate).toDateString() !== new Date().toDateString();
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
                {/* Statistics Cards */}
                <div className="row mb-4">
                  <StatCard 
                    title="Total Orders" 
                    value={totalOrders} 
                    icon={FiPackage} 
                    color="#4e73df"
                    subtitle={`₹${totalValue.toLocaleString()} total value`}
                  />
                  <StatCard 
                    title="Pending Approval" 
                    value={pendingOrders} 
                    icon={FiClock} 
                    color="#f6c23e"
                    subtitle="Awaiting approval"
                  />
                  <StatCard 
                    title="Approved Orders" 
                    value={approvedOrders} 
                    icon={FiCheck} 
                    color="#1cc88a"
                    subtitle="Ready for delivery"
                  />
                  <StatCard 
                    title="Received Orders" 
                    value={receivedOrders} 
                    icon={FiTruck} 
                    color="#36b9cc"
                    subtitle="Successfully delivered"
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
                        <label className="form-label">Search</label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FiSearch />
                          </span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search PO number, supplier, notes..."
                            value={filter.search}
                            onChange={e => handleFilterChange('search', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">Supplier</label>
                        <select 
                          className="form-select" 
                          value={filter.supplier} 
                          onChange={e => handleFilterChange('supplier', e.target.value)}
                        >
                          <option value="">All Suppliers</option>
                          {mockSuppliers.map(s => <option value={s.id} key={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">Status</label>
                        <select 
                          className="form-select" 
                          value={filter.status} 
                          onChange={e => handleFilterChange('status', e.target.value)}
                        >
                          <option value="">All Status</option>
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="received">Received</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">Priority</label>
                        <select 
                          className="form-select" 
                          value={filter.priority} 
                          onChange={e => handleFilterChange('priority', e.target.value)}
                        >
                          <option value="">All Priorities</option>
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Amount Range</label>
                        <select 
                          className="form-select" 
                          value={filter.amountRange} 
                          onChange={e => handleFilterChange('amountRange', e.target.value)}
                        >
                          <option value="">All Amounts</option>
                          <option value="0-1000">Under ₹1,000</option>
                          <option value="1000-5000">₹1,000 - ₹5,000</option>
                          <option value="5000-10000">₹5,000 - ₹10,000</option>
                          <option value="10000-">Above ₹10,000</option>
                        </select>
                      </div>
                    </div>
                    <div className="row mt-3">
                      <div className="col-md-3">
                        <label className="form-label">From Date</label>
                        <input 
                          type="date" 
                          className="form-control" 
                          value={filter.dateFrom} 
                          onChange={e => handleFilterChange('dateFrom', e.target.value)} 
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">To Date</label>
                        <input 
                          type="date" 
                          className="form-control" 
                          value={filter.dateTo} 
                          onChange={e => handleFilterChange('dateTo', e.target.value)} 
                        />
                      </div>
                      <div className="col-md-6 d-flex align-items-end">
                        <button className="btn btn-outline-secondary" onClick={handleClearFilters}>
                          Clear Filters
                        </button>
                        <div className="ms-auto">
                          <small className="text-muted">
                            Showing {filteredOrders.length} of {orders.length} orders
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Table */}
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Purchase Orders</h6>
                    {selectedOrders.length > 0 && (
                      <small className="text-muted">
                        {selectedOrders.length} orders selected
                      </small>
                    )}
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>
                              <input
                                type="checkbox"
                                checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                                onChange={handleSelectAll}
                              />
                            </th>
                            <th>PO Number</th>
                            <th>Supplier</th>
                            <th>Order Date</th>
                            <th>Expected Date</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Total Amount</th>
                            <th>Items</th>
                            <th>Created By</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map(order => (
                            <tr key={order.id} className={isOverdue(order.expectedDate) ? 'table-warning' : ''}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedOrders.includes(order.id)}
                                  onChange={() => handleSelectOrder(order.id)}
                                />
                              </td>
                              <td>
                                <div>
                                  <strong>{order.poNumber}</strong>
                                  {isOverdue(order.expectedDate) && (
                                    <div>
                                      <small className="text-danger">
                                        <FiAlertTriangle className="me-1" />
                                        Overdue
                                      </small>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div>
                                  <strong>{getSupplierName(order.supplier)}</strong>
                                  <br />
                                  <small className="text-muted">
                                    {mockSuppliers.find(s => s.id === order.supplier)?.email}
                                  </small>
                                </div>
                              </td>
                              <td>
                                <small className="text-muted">
                                  {new Date(order.orderDate).toLocaleDateString()}
                                </small>
                              </td>
                              <td>
                                <small className={`${isOverdue(order.expectedDate) ? 'text-danger' : 'text-muted'}`}>
                                  {new Date(order.expectedDate).toLocaleDateString()}
                                </small>
                              </td>
                              <td>
                                <span className={`badge ${getStatusBadge(order.status)}`}>
                                  {getStatusIcon(order.status)}
                                  <span className="ms-1">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${getPriorityBadge(order.priority)}`}>
                                  {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
                                </span>
                              </td>
                              <td>
                                <strong>₹{order.totalAmount.toLocaleString()}</strong>
                              </td>
                              <td>
                                <span className="badge bg-light text-dark">
                                  {order.items.length} items
                                </span>
                              </td>
                              <td>
                                <small className="text-muted">
                                  {order.createdBy}
                                </small>
                              </td>
                              <td>
                                <div className="btn-group btn-group-sm">
                                  <button 
                                    className="btn btn-outline-primary" 
                                    title="View Details"
                                    onClick={() => navigate(`/inventory/purchase-orders/purchase-order-edit/${order.id}`)}
                                  >
                                    <FiEye />
                                  </button>
                                  <button 
                                    className="btn btn-outline-secondary" 
                                    title="Edit"
                                    onClick={() => navigate(`/inventory/purchase-orders/purchase-order-edit/${order.id}`)}
                                  >
                                    <FiEdit3 />
                                  </button>
                                  <button 
                                    className="btn btn-outline-danger" 
                                    title="Delete"
                                    onClick={() => handleDelete(order.id)}
                                  >
                                    <FiTrash2 />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {filteredOrders.length === 0 && (
                      <div className="text-center py-5">
                        <div className="text-muted">
                          <FiPackage size={48} className="mb-3" />
                          <h5>No purchase orders found</h5>
                          <p>Try adjusting your filter criteria or create a new purchase order</p>
                          <button className="btn btn-primary" onClick={() => navigate('/inventory/purchase-orders/purchase-order-create')}>
                            <FiPlus className="me-1" />
                            Create First Purchase Order
                          </button>
                        </div>
                      </div>
                    )}
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
        .badge {
          font-size: 0.75rem;
        }
        .btn-group-sm .btn {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }
      `}</style>
    </>
  );
};

export default PurchaseOrdersList; 