import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiSave, FiArrowLeft, FiDollarSign, FiPackage, FiCalendar, FiUser, FiAlertCircle, FiCheckCircle, FiClock, FiTruck, FiSearch, FiFilter, FiEdit3, FiEye, FiCheck, FiX, FiDownload, FiPrinter, FiMail } from 'react-icons/fi';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import CardHeader from '@/components/shared/CardHeader';
import CardLoader from '@/components/shared/CardLoader';
import useCardTitleActions from '@/hooks/useCardTitleActions';

// Enhanced mock data (same as create page)
const mockSuppliers = [
  { 
    id: 1, 
    name: 'Acme Pharma', 
    rating: 4.5, 
    contact: '+91-9876543210', 
    email: 'acme@pharma.com',
    address: '123 Pharma Street, Mumbai, Maharashtra',
    paymentTerms: 'Net 30',
    deliveryTime: '3-5 business days'
  },
  { 
    id: 2, 
    name: 'Global Meds', 
    rating: 4.2, 
    contact: '+91-9876543211', 
    email: 'global@meds.com',
    address: '456 Medical Avenue, Delhi, NCR',
    paymentTerms: 'Net 45',
    deliveryTime: '5-7 business days'
  },
  { 
    id: 3, 
    name: 'HealthFirst', 
    rating: 4.8, 
    contact: '+91-9876543212', 
    email: 'health@first.com',
    address: '789 Health Road, Bangalore, Karnataka',
    paymentTerms: 'Net 30',
    deliveryTime: '2-4 business days'
  },
  { 
    id: 4, 
    name: 'Wellness Corp', 
    rating: 4.0, 
    contact: '+91-9876543213', 
    email: 'wellness@corp.com',
    address: '321 Wellness Lane, Chennai, Tamil Nadu',
    paymentTerms: 'Net 60',
    deliveryTime: '7-10 business days'
  },
];

const mockProducts = [
  { 
    id: 1, 
    name: 'Paracetamol', 
    category: 'Painkillers', 
    sku: 'P-001',
    description: 'Pain relief and fever reduction',
    currentStock: 150,
    reorderLevel: 50,
    unit: 'tablets',
    variations: [
      { id: 1, name: '500mg', price: 10.50, stock: 100 },
      { id: 2, name: '1000mg', price: 18.00, stock: 50 }
    ]
  },
  { 
    id: 2, 
    name: 'Ibuprofen', 
    category: 'Painkillers', 
    sku: 'I-001',
    description: 'Anti-inflammatory pain relief',
    currentStock: 80,
    reorderLevel: 30,
    unit: 'tablets',
    variations: [
      { id: 3, name: '400mg', price: 15.00, stock: 60 },
      { id: 4, name: '600mg', price: 22.00, stock: 20 }
    ]
  },
  { 
    id: 3, 
    name: 'Amoxicillin', 
    category: 'Antibiotics', 
    sku: 'A-001',
    description: 'Broad-spectrum antibiotic',
    currentStock: 25,
    reorderLevel: 20,
    unit: 'capsules',
    variations: [
      { id: 5, name: '250mg', price: 25.00, stock: 15 },
      { id: 6, name: '500mg', price: 45.00, stock: 10 }
    ]
  },
  { 
    id: 4, 
    name: 'Vitamin C', 
    category: 'Vitamins', 
    sku: 'V-001',
    description: 'Immune system support',
    currentStock: 200,
    reorderLevel: 100,
    unit: 'tablets',
    variations: [
      { id: 7, name: '500mg', price: 8.00, stock: 150 },
      { id: 8, name: '1000mg', price: 12.00, stock: 50 }
    ]
  },
  { 
    id: 5, 
    name: 'Omeprazole', 
    category: 'Gastrointestinal', 
    sku: 'O-001',
    description: 'Acid reflux medication',
    currentStock: 45,
    reorderLevel: 25,
    unit: 'capsules',
    variations: [
      { id: 9, name: '20mg', price: 35.00, stock: 30 },
      { id: 10, name: '40mg', price: 55.00, stock: 15 }
    ]
  },
];

// Mock purchase order data
const mockPurchaseOrder = {
  id: 1,
  poNumber: 'PO-2024-001',
  supplier: 1,
  orderDate: '2024-06-01',
  expectedDate: '2024-06-15',
  status: 'pending',
  priority: 'normal',
  items: [
    { 
      id: 1,
      productId: 1, 
      productName: 'Paracetamol',
      variationId: 1, 
      variationName: '500mg',
      sku: 'P-001',
      quantity: 100, 
      price: 10.50, 
      total: 1050,
      received: 0,
      notes: 'Regular monthly order'
    },
    { 
      id: 2,
      productId: 2, 
      productName: 'Ibuprofen',
      variationId: 3, 
      variationName: '400mg',
      sku: 'I-001',
      quantity: 50, 
      price: 15.00, 
      total: 750,
      received: 0,
      notes: ''
    },
  ],
  totalAmount: 1800,
  notes: 'Regular monthly order for painkillers',
  createdBy: 'Admin User',
  approvedBy: null,
  approvedDate: null,
  deliveryAddress: 'Clinic Address, City, State',
  contactPerson: 'Dr. Smith',
  contactPhone: '+91-9876543210',
  contactEmail: 'clinic@example.com',
  terms: 'Net 30',
  history: [
    {
      id: 1,
      action: 'Created',
      user: 'Admin User',
      timestamp: '2024-06-01T10:00:00Z',
      details: 'Purchase order created'
    }
  ]
};

const PurchaseOrderEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  const [form, setForm] = useState({
    supplierId: '',
    expectedDate: '',
    priority: 'normal',
    notes: '',
    items: [],
    terms: '',
    deliveryAddress: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: ''
  });
  
  const [selectedProduct, setSelectedProduct] = useState({
    productId: '',
    variationId: '',
    quantity: '',
    price: '',
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  
  const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete: handleCardDelete } = useCardTitleActions();

  // Load purchase order data
  useEffect(() => {
    const loadPurchaseOrder = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - in real app, fetch by ID
        const foundOrder = mockPurchaseOrder;
        
        if (foundOrder) {
          setOrder(foundOrder);
          setForm({
            supplierId: foundOrder.supplier.toString(),
            expectedDate: foundOrder.expectedDate,
            priority: foundOrder.priority,
            notes: foundOrder.notes || '',
            items: foundOrder.items,
            terms: foundOrder.terms || '',
            deliveryAddress: foundOrder.deliveryAddress || '',
            contactPerson: foundOrder.contactPerson || '',
            contactPhone: foundOrder.contactPhone || '',
            contactEmail: foundOrder.contactEmail || ''
          });
        } else {
          toast.error('Purchase order not found');
          navigate('/inventory/purchase-orders/purchase-orders-list');
        }
      } catch (error) {
        toast.error('Failed to load purchase order');
        console.error('Error loading purchase order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPurchaseOrder();
  }, [id, navigate]);

  if (isRemoved) return null;
  if (isLoading) {
    return (
      <>
        <PageHeader />
        <div className="main-content">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading purchase order...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <PageHeader />
        <div className="main-content">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body text-center py-5">
                  <FiAlertCircle size={48} className="text-muted mb-3" />
                  <h5>Purchase Order Not Found</h5>
                  <p>The purchase order you're looking for doesn't exist or has been removed.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/inventory/purchase-orders/purchase-orders-list')}
                  >
                    Back to Purchase Orders
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Filter products based on search and filters
  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesLowStock = !showLowStock || product.currentStock <= product.reorderLevel;
    
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  // Get unique categories
  const categories = [...new Set(mockProducts.map(p => p.category))];

  // Calculate totals
  const subtotal = form.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + tax;

  const selectedSupplier = mockSuppliers.find(s => s.id === parseInt(form.supplierId));

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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct(prev => ({ ...prev, [name]: value }));
    
    if (name === 'variationId' && value) {
      const product = mockProducts.find(p => p.id === parseInt(selectedProduct.productId));
      const variation = product?.variations.find(v => v.id === parseInt(value));
      if (variation) {
        setSelectedProduct(prev => ({ ...prev, price: variation.price }));
      }
    }
  };

  const addItem = () => {
    const newErrors = {};
    
    if (!selectedProduct.productId) newErrors.productId = 'Product is required';
    if (!selectedProduct.variationId) newErrors.variationId = 'Variation is required';
    if (!selectedProduct.quantity || selectedProduct.quantity <= 0) newErrors.quantity = 'Valid quantity is required';
    if (!selectedProduct.price || selectedProduct.price <= 0) newErrors.price = 'Valid price is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const product = mockProducts.find(p => p.id === parseInt(selectedProduct.productId));
    const variation = product?.variations.find(v => v.id === parseInt(selectedProduct.variationId));
    
    const newItem = {
      id: Date.now(),
      productId: selectedProduct.productId,
      productName: product.name,
      variationId: selectedProduct.variationId,
      variationName: variation.name,
      sku: product.sku,
      quantity: parseInt(selectedProduct.quantity),
      price: parseFloat(selectedProduct.price),
      total: parseInt(selectedProduct.quantity) * parseFloat(selectedProduct.price),
      notes: selectedProduct.notes,
      received: 0
    };

    setForm(prev => ({ ...prev, items: [...prev.items, newItem] }));
    setSelectedProduct({
      productId: '',
      variationId: '',
      quantity: '',
      price: '',
      notes: ''
    });
    setErrors({});
    toast.success('Item added to purchase order');
  };

  const removeItem = (itemId) => {
    setForm(prev => ({ ...prev, items: prev.items.filter(item => item.id !== itemId) }));
    toast.success('Item removed from purchase order');
  };

  const updateItemQuantity = (itemId, newQuantity) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { ...item, quantity: parseInt(newQuantity), total: parseInt(newQuantity) * item.price }
          : item
      )
    }));
  };

  const updateItemPrice = (itemId, newPrice) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { ...item, price: parseFloat(newPrice), total: item.quantity * parseFloat(newPrice) }
          : item
      )
    }));
  };

  const handleStatusChange = async (newStatus) => {
    if (window.confirm(`Are you sure you want to change the status to "${newStatus}"?`)) {
      setIsSubmitting(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setOrder(prev => ({
          ...prev,
          status: newStatus,
          approvedBy: newStatus === 'approved' ? 'Current User' : prev.approvedBy,
          approvedDate: newStatus === 'approved' ? new Date().toISOString().split('T')[0] : prev.approvedDate,
          history: [
            ...prev.history,
            {
              id: Date.now(),
              action: `Status changed to ${newStatus}`,
              user: 'Current User',
              timestamp: new Date().toISOString(),
              details: `Purchase order status updated to ${newStatus}`
            }
          ]
        }));
        
        toast.success(`Purchase order status updated to ${newStatus}`);
      } catch (error) {
        console.log('Failed to update status');
        // toast.error('Failed to update status');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.supplierId) newErrors.supplierId = 'Supplier is required';
    if (!form.expectedDate) newErrors.expectedDate = 'Expected delivery date is required';
    if (form.items.length === 0) newErrors.items = 'At least one item is required';
    
    if (form.expectedDate && new Date(form.expectedDate) < new Date()) {
      newErrors.expectedDate = 'Expected date cannot be in the past';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedOrder = {
        ...order,
        ...form,
        supplier: parseInt(form.supplierId),
        totalAmount: total,
        history: [
          ...order.history,
          {
            id: Date.now(),
            action: 'Updated',
            user: 'Current User',
            timestamp: new Date().toISOString(),
            details: 'Purchase order details updated'
          }
        ]
      };
      
      setOrder(updatedOrder);
      setIsEditing(false);
      toast.success('Purchase order updated successfully!');
    } catch (error) {
      // toast.error('Failed to update purchase order');
      console.error('Error updating purchase order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const data = {
      poNumber: order.poNumber,
      supplier: selectedSupplier?.name,
      orderDate: order.orderDate,
      expectedDate: order.expectedDate,
      status: order.status,
      items: order.items,
      total: total
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${order.poNumber}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Purchase order exported successfully!');
  };

  const TabButton = ({ tab, icon: Icon, label, count }) => (
    <button
      className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline-secondary'} btn-sm`}
      onClick={() => setActiveTab(tab)}
    >
      <Icon className="me-1" />
      {label}
      {count && <span className="badge bg-light text-dark ms-1">{count}</span>}
    </button>
  );

  return (
    <>
      <PageHeader />
      <div className="main-content">
        <div className="row">
          <div className="col-12">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
              <CardHeader 
                title={`Purchase Order: ${order.poNumber}`}
                children={
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-outline-secondary btn-sm" 
                      onClick={() => navigate('/inventory/purchase-orders/purchase-orders-list')}
                    >
                      <FiArrowLeft className="me-1" />
                      Back to List
                    </button>
                    <button 
                      className="btn btn-outline-secondary btn-sm" 
                      onClick={handlePrint}
                    >
                      <FiPrinter className="me-1" />
                      Print
                    </button>
                    <button 
                      className="btn btn-outline-secondary btn-sm" 
                      onClick={handleExport}
                    >
                      <FiDownload className="me-1" />
                      Export
                    </button>
                    {!isEditing && order.status === 'pending' && (
                      <button 
                        className="btn btn-success btn-sm" 
                        onClick={() => handleStatusChange('approved')}
                        disabled={isSubmitting}
                      >
                        <FiCheck className="me-1" />
                        Approve
                      </button>
                    )}
                    {!isEditing && ['pending', 'approved'].includes(order.status) && (
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => handleStatusChange('cancelled')}
                        disabled={isSubmitting}
                      >
                        <FiX className="me-1" />
                        Cancel
                      </button>
                    )}
                    {!isEditing && (
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => setIsEditing(true)}
                      >
                        <FiEdit3 className="me-1" />
                        Edit
                      </button>
                    )}
                    {isEditing && (
                      <>
                        <button 
                          className="btn btn-primary btn-sm" 
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                        >
                          <FiSave className="me-1" />
                          {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button 
                          className="btn btn-outline-secondary btn-sm" 
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel Edit
                        </button>
                      </>
                    )}
                  </div>
                }
              />
              <div className="card-body">
                {/* Status and Priority Badges */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center gap-3">
                      <span className={`badge ${getStatusBadge(order.status)} fs-6`}>
                        {getStatusIcon(order.status)}
                        <span className="ms-1">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                      </span>
                      <span className={`badge ${getPriorityBadge(order.priority)}`}>
                        {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)} Priority
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6 text-end">
                    <small className="text-muted">
                      Created by {order.createdBy} on {new Date(order.orderDate).toLocaleDateString()}
                    </small>
                  </div>
                </div>

                {/* Tabs */}
                <div className="mb-4">
                  <div className="btn-group" role="group">
                    <TabButton tab="details" icon={FiEye} label="Details" />
                    <TabButton tab="items" icon={FiPackage} label="Items" count={order.items.length} />
                    <TabButton tab="history" icon={FiClock} label="History" count={order.history.length} />
                  </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'details' && (
                  <div className="row">
                    <div className="col-lg-8">
                      <div className="card">
                        <div className="card-header">
                          <h6 className="mb-0">Order Information</h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6">
                              <label className="form-label">Supplier</label>
                              {isEditing ? (
                                <select 
                                  className={`form-select ${errors.supplierId ? 'is-invalid' : ''}`}
                                  name="supplierId"
                                  value={form.supplierId}
                                  onChange={handleFormChange}
                                >
                                  <option value="">Choose a supplier...</option>
                                  {mockSuppliers.map(supplier => (
                                    <option value={supplier.id} key={supplier.id}>
                                      {supplier.name}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <div className="form-control-plaintext">
                                  {selectedSupplier?.name}
                                </div>
                              )}
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Expected Delivery Date</label>
                              {isEditing ? (
                                <input 
                                  type="date"
                                  className={`form-control ${errors.expectedDate ? 'is-invalid' : ''}`}
                                  name="expectedDate"
                                  value={form.expectedDate}
                                  onChange={handleFormChange}
                                />
                              ) : (
                                <div className="form-control-plaintext">
                                  {new Date(order.expectedDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {selectedSupplier && (
                            <div className="mt-3 p-3 bg-light rounded">
                              <div className="row">
                                <div className="col-md-6">
                                  <strong>{selectedSupplier.name}</strong><br />
                                  <small className="text-muted">
                                    📧 {selectedSupplier.email}<br />
                                    📞 {selectedSupplier.contact}<br />
                                    📍 {selectedSupplier.address}
                                  </small>
                                </div>
                                <div className="col-md-6">
                                  <small className="text-muted">
                                    <strong>Payment Terms:</strong> {selectedSupplier.paymentTerms}<br />
                                    <strong>Delivery Time:</strong> {selectedSupplier.deliveryTime}<br />
                                    <strong>Rating:</strong> {selectedSupplier.rating}⭐
                                  </small>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-lg-4">
                      <div className="card">
                        <div className="card-header">
                          <h6 className="mb-0">Order Summary</h6>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <div className="d-flex justify-content-between mb-2">
                              <span>Subtotal:</span>
                              <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                              <span>GST (18%):</span>
                              <span>₹{tax.toFixed(2)}</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between fw-bold">
                              <span>Total:</span>
                              <span>₹{total.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="mb-3">
                            <h6>Order Statistics</h6>
                            <div className="row text-center">
                              <div className="col-6">
                                <div className="border rounded p-2">
                                  <div className="h5 mb-0">{order.items.length}</div>
                                  <small className="text-muted">Items</small>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="border rounded p-2">
                                  <div className="h5 mb-0">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</div>
                                  <small className="text-muted">Total Qty</small>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'items' && (
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0">Order Items</h6>
                    </div>
                    <div className="card-body">
                      {isEditing && (
                        <div className="mb-4">
                          <h6>Add New Item</h6>
                          <div className="row">
                            <div className="col-md-3">
                              <label className="form-label">Product</label>
                              <select 
                                className={`form-select ${errors.productId ? 'is-invalid' : ''}`}
                                name="productId"
                                value={selectedProduct.productId}
                                onChange={handleProductChange}
                              >
                                <option value="">Select Product</option>
                                {filteredProducts.map(product => (
                                  <option value={product.id} key={product.id}>
                                    {product.name} ({product.sku})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-2">
                              <label className="form-label">Variation</label>
                              <select 
                                className={`form-select ${errors.variationId ? 'is-invalid' : ''}`}
                                name="variationId"
                                value={selectedProduct.variationId}
                                onChange={handleProductChange}
                              >
                                <option value="">Select</option>
                                {selectedProduct.productId && mockProducts
                                  .find(p => p.id === parseInt(selectedProduct.productId))
                                  ?.variations.map(v => (
                                    <option value={v.id} key={v.id}>
                                      {v.name} (₹{v.price})
                                    </option>
                                  ))}
                              </select>
                            </div>
                            <div className="col-md-2">
                              <label className="form-label">Quantity</label>
                              <input 
                                type="number"
                                className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
                                name="quantity"
                                value={selectedProduct.quantity}
                                onChange={handleProductChange}
                                min="1"
                                placeholder="Qty"
                              />
                            </div>
                            <div className="col-md-2">
                              <label className="form-label">Price (₹)</label>
                              <input 
                                type="number"
                                className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                                name="price"
                                value={selectedProduct.price}
                                onChange={handleProductChange}
                                min="0.01"
                                step="0.01"
                                placeholder="Price"
                              />
                            </div>
                            <div className="col-md-2">
                              <label className="form-label">Notes</label>
                              <input 
                                type="text"
                                className="form-control"
                                name="notes"
                                value={selectedProduct.notes}
                                onChange={handleProductChange}
                                placeholder="Optional"
                              />
                            </div>
                            <div className="col-md-1 d-flex align-items-end">
                              <button 
                                type="button"
                                className="btn btn-primary"
                                onClick={addItem}
                              >
                                <FiPlus />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead className="table-light">
                            <tr>
                              <th>Product</th>
                              <th>Variation</th>
                              <th>SKU</th>
                              <th>Quantity</th>
                              <th>Price (₹)</th>
                              <th>Total (₹)</th>
                              <th>Received</th>
                              {isEditing && <th>Actions</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {form.items.map(item => (
                              <tr key={item.id}>
                                <td>{item.productName}</td>
                                <td>{item.variationName}</td>
                                <td>{item.sku}</td>
                                <td>
                                  {isEditing ? (
                                    <input
                                      type="number"
                                      className="form-control form-control-sm"
                                      value={item.quantity}
                                      onChange={e => updateItemQuantity(item.id, e.target.value)}
                                      min="1"
                                      style={{ width: '80px' }}
                                    />
                                  ) : (
                                    item.quantity
                                  )}
                                </td>
                                <td>
                                  {isEditing ? (
                                    <input
                                      type="number"
                                      className="form-control form-control-sm"
                                      value={item.price}
                                      onChange={e => updateItemPrice(item.id, e.target.value)}
                                      min="0.01"
                                      step="0.01"
                                      style={{ width: '80px' }}
                                    />
                                  ) : (
                                    `₹${item.price}`
                                  )}
                                </td>
                                <td>₹{item.total.toFixed(2)}</td>
                                <td>
                                  <span className="badge bg-info">
                                    {item.received || 0} / {item.quantity}
                                  </span>
                                </td>
                                {isEditing && (
                                  <td>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => removeItem(item.id)}
                                    >
                                      <FiTrash2 />
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0">Order History</h6>
                    </div>
                    <div className="card-body">
                      <div className="timeline">
                        {order.history.map((event, index) => (
                          <div key={event.id} className="timeline-item">
                            <div className="timeline-marker"></div>
                            <div className="timeline-content">
                              <div className="d-flex justify-content-between">
                                <h6 className="mb-1">{event.action}</h6>
                                <small className="text-muted">
                                  {new Date(event.timestamp).toLocaleString()}
                                </small>
                              </div>
                              <p className="mb-1 text-muted">{event.details}</p>
                              <small className="text-muted">By {event.user}</small>
                            </div>
                          </div>
                        ))}
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
        .timeline {
          position: relative;
          padding-left: 30px;
        }
        .timeline-item {
          position: relative;
          margin-bottom: 20px;
        }
        .timeline-marker {
          position: absolute;
          left: -35px;
          top: 5px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: #007bff;
          border: 2px solid #fff;
          box-shadow: 0 0 0 2px #007bff;
        }
        .timeline-content {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-left: 3px solid #007bff;
        }
        .form-control-plaintext {
          padding: 0.375rem 0;
          margin-bottom: 0;
          color: #212529;
          background-color: transparent;
          border: solid transparent;
          border-width: 1px 0;
        }
      `}</style>
    </>
  );
};

export default PurchaseOrderEdit; 