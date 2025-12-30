import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiSave, FiArrowLeft, FiDollarSign, FiPackage, FiCalendar, FiUser, FiAlertCircle, FiCheckCircle, FiClock, FiTruck, FiSearch, FiFilter } from 'react-icons/fi';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import CardHeader from '@/components/shared/CardHeader';
import CardLoader from '@/components/shared/CardLoader';
import useCardTitleActions from '@/hooks/useCardTitleActions';

// Enhanced mock data
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

const PurchaseOrderCreate = () => {
  const navigate = useNavigate();
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  
  const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete: handleCardDelete } = useCardTitleActions();

  if (isRemoved) return null;

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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct(prev => ({ ...prev, [name]: value }));
    
    // Auto-fill price when variation is selected
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
      currentStock: variation.stock
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.supplierId) newErrors.supplierId = 'Supplier is required';
    if (!form.expectedDate) newErrors.expectedDate = 'Expected delivery date is required';
    if (form.items.length === 0) newErrors.items = 'At least one item is required';
    
    // Check if expected date is not in the past
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const poData = {
        ...form,
        id: Date.now(),
        poNumber: `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        orderDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        subtotal,
        tax,
        total,
        createdBy: 'Current User',
        createdAt: new Date().toISOString()
      };
      
      console.log('Purchase Order Data:', poData);
      toast.success('Purchase order created successfully!');
      navigate('/inventory/purchase-orders/purchase-orders-list');
    } catch (error) {
      // toast.error('Failed to create purchase order');
      console.error('Error creating purchase order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSupplier = mockSuppliers.find(s => s.id === parseInt(form.supplierId));

  return (
    <>
      <PageHeader />
      <div className="main-content">
        <div className="row">
          <div className="col-12">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
              <CardHeader 
                title="Create Purchase Order" 
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
                      className="btn btn-primary btn-sm" 
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      <FiSave className="me-1" />
                      {isSubmitting ? 'Creating...' : 'Create Purchase Order'}
                    </button>
                  </div>
                }
              />
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Left Column - Order Details */}
                    <div className="col-lg-8">
                      {/* Supplier Selection */}
                      <div className="card mb-4">
                        <div className="card-header">
                          <h6 className="mb-0">
                            <FiUser className="me-2" />
                            Supplier Information
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6">
                              <label className="form-label">Select Supplier *</label>
                              <select 
                                className={`form-select ${errors.supplierId ? 'is-invalid' : ''}`}
                                name="supplierId"
                                value={form.supplierId}
                                onChange={handleFormChange}
                              >
                                <option value="">Choose a supplier...</option>
                                {mockSuppliers.map(supplier => (
                                  <option value={supplier.id} key={supplier.id}>
                                    {supplier.name} (Rating: {supplier.rating}⭐)
                                  </option>
                                ))}
                              </select>
                              {errors.supplierId && <div className="invalid-feedback">{errors.supplierId}</div>}
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Priority</label>
                              <select 
                                className="form-select"
                                name="priority"
                                value={form.priority}
                                onChange={handleFormChange}
                              >
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                              </select>
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

                      {/* Product Selection */}
                      <div className="card mb-4">
                        <div className="card-header">
                          <h6 className="mb-0">
                            <FiPackage className="me-2" />
                            Add Products
                          </h6>
                        </div>
                        <div className="card-body">
                          {/* Product Filters */}
                          <div className="row mb-3">
                            <div className="col-md-4">
                              <div className="input-group">
                                <span className="input-group-text">
                                  <FiSearch />
                                </span>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Search products..."
                                  value={searchTerm}
                                  onChange={e => setSearchTerm(e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="col-md-3">
                              <select 
                                className="form-select"
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                              >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                  <option value={category} key={category}>{category}</option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-3">
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="showLowStock"
                                  checked={showLowStock}
                                  onChange={e => setShowLowStock(e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="showLowStock">
                                  Show Low Stock Only
                                </label>
                              </div>
                            </div>
                            <div className="col-md-2">
                              <small className="text-muted">
                                {filteredProducts.length} products
                              </small>
                            </div>
                          </div>

                          {/* Product Selection Form */}
                          <div className="row mb-3">
                            <div className="col-md-3">
                              <label className="form-label">Product *</label>
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
                              {errors.productId && <div className="invalid-feedback">{errors.productId}</div>}
                            </div>
                            <div className="col-md-2">
                              <label className="form-label">Variation *</label>
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
                              {errors.variationId && <div className="invalid-feedback">{errors.variationId}</div>}
                            </div>
                            <div className="col-md-2">
                              <label className="form-label">Quantity *</label>
                              <input 
                                type="number"
                                className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
                                name="quantity"
                                value={selectedProduct.quantity}
                                onChange={handleProductChange}
                                min="1"
                                placeholder="Qty"
                              />
                              {errors.quantity && <div className="invalid-feedback">{errors.quantity}</div>}
                            </div>
                            <div className="col-md-2">
                              <label className="form-label">Price (₹) *</label>
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
                              {errors.price && <div className="invalid-feedback">{errors.price}</div>}
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

                          {/* Selected Items Table */}
                          {form.items.length > 0 && (
                            <div className="table-responsive">
                              <table className="table table-sm table-bordered">
                                <thead className="table-light">
                                  <tr>
                                    <th>Product</th>
                                    <th>Variation</th>
                                    <th>SKU</th>
                                    <th>Quantity</th>
                                    <th>Price (₹)</th>
                                    <th>Total (₹)</th>
                                    <th>Current Stock</th>
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {form.items.map(item => (
                                    <tr key={item.id}>
                                      <td>{item.productName}</td>
                                      <td>{item.variationName}</td>
                                      <td>{item.sku}</td>
                                      <td>
                                        <input
                                          type="number"
                                          className="form-control form-control-sm"
                                          value={item.quantity}
                                          onChange={e => updateItemQuantity(item.id, e.target.value)}
                                          min="1"
                                          style={{ width: '80px' }}
                                        />
                                      </td>
                                      <td>
                                        <input
                                          type="number"
                                          className="form-control form-control-sm"
                                          value={item.price}
                                          onChange={e => updateItemPrice(item.id, e.target.value)}
                                          min="0.01"
                                          step="0.01"
                                          style={{ width: '80px' }}
                                        />
                                      </td>
                                      <td>₹{item.total.toFixed(2)}</td>
                                      <td>
                                        <span className={`badge ${item.currentStock <= 10 ? 'bg-danger' : item.currentStock <= 30 ? 'bg-warning' : 'bg-success'}`}>
                                          {item.currentStock}
                                        </span>
                                      </td>
                                      <td>
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() => removeItem(item.id)}
                                        >
                                          <FiTrash2 />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                          
                          {errors.items && <div className="text-danger small">{errors.items}</div>}
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="card mb-4">
                        <div className="card-header">
                          <h6 className="mb-0">
                            <FiCalendar className="me-2" />
                            Order Details
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6">
                              <label className="form-label">Expected Delivery Date *</label>
                              <input 
                                type="date"
                                className={`form-control ${errors.expectedDate ? 'is-invalid' : ''}`}
                                name="expectedDate"
                                value={form.expectedDate}
                                onChange={handleFormChange}
                                min={new Date().toISOString().split('T')[0]}
                              />
                              {errors.expectedDate && <div className="invalid-feedback">{errors.expectedDate}</div>}
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Delivery Address</label>
                              <textarea
                                className="form-control"
                                name="deliveryAddress"
                                value={form.deliveryAddress}
                                onChange={handleFormChange}
                                rows="2"
                                placeholder="Enter delivery address..."
                              />
                            </div>
                          </div>
                          <div className="row mt-3">
                            <div className="col-md-4">
                              <label className="form-label">Contact Person</label>
                              <input
                                type="text"
                                className="form-control"
                                name="contactPerson"
                                value={form.contactPerson}
                                onChange={handleFormChange}
                                placeholder="Contact person name"
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label">Contact Phone</label>
                              <input
                                type="tel"
                                className="form-control"
                                name="contactPhone"
                                value={form.contactPhone}
                                onChange={handleFormChange}
                                placeholder="Contact phone number"
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label">Contact Email</label>
                              <input
                                type="email"
                                className="form-control"
                                name="contactEmail"
                                value={form.contactEmail}
                                onChange={handleFormChange}
                                placeholder="Contact email address"
                              />
                            </div>
                          </div>
                          <div className="row mt-3">
                            <div className="col-12">
                              <label className="form-label">Notes</label>
                              <textarea
                                className="form-control"
                                name="notes"
                                value={form.notes}
                                onChange={handleFormChange}
                                rows="3"
                                placeholder="Additional notes for this purchase order..."
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Summary */}
                    <div className="col-lg-4">
                      <div className="card sticky-top" style={{ top: '20px' }}>
                        <div className="card-header">
                          <h6 className="mb-0">
                            <FiDollarSign className="me-2" />
                            Order Summary
                          </h6>
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
                                  <div className="h5 mb-0">{form.items.length}</div>
                                  <small className="text-muted">Items</small>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="border rounded p-2">
                                  <div className="h5 mb-0">{form.items.reduce((sum, item) => sum + item.quantity, 0)}</div>
                                  <small className="text-muted">Total Qty</small>
                                </div>
                              </div>
                            </div>
                          </div>

                          {form.items.length > 0 && (
                            <div className="mb-3">
                              <h6>Low Stock Alerts</h6>
                              {form.items.filter(item => item.currentStock <= 10).map(item => (
                                <div key={item.id} className="alert alert-warning py-2 mb-2">
                                  <small>
                                    <FiAlertCircle className="me-1" />
                                    {item.productName} - Only {item.currentStock} in stock
                                  </small>
                                </div>
                              ))}
                              {form.items.filter(item => item.currentStock <= 10).length === 0 && (
                                <div className="text-success small">
                                  <FiCheckCircle className="me-1" />
                                  All products have sufficient stock
                                </div>
                              )}
                            </div>
                          )}

                          <div className="d-grid gap-2">
                            <button 
                              type="submit"
                              className="btn btn-primary"
                              disabled={isSubmitting || form.items.length === 0}
                            >
                              {isSubmitting ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" />
                                  Creating Purchase Order...
                                </>
                              ) : (
                                <>
                                  <FiSave className="me-2" />
                                  Create Purchase Order
                                </>
                              )}
                            </button>
                            <button 
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => navigate('/inventory/purchase-orders/purchase-orders-list')}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <CardLoader refreshKey={refreshKey} />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .sticky-top {
          position: sticky;
          top: 20px;
        }
        .table-sm td, .table-sm th {
          padding: 0.5rem;
          font-size: 0.875rem;
        }
        .form-control-sm {
          height: calc(1.5em + 0.5rem + 2px);
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }
      `}</style>
    </>
  );
};

export default PurchaseOrderCreate; 