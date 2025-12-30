import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiSearch, FiFilter, FiRefreshCw, FiDownload, FiEdit2, FiTrash2, FiTag, FiList, FiGrid, FiSettings, FiBarChart2, FiPackage, FiCheck, FiX, FiCopy, FiMove, FiCalendar } from 'react-icons/fi';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import CardHeader from '@/components/shared/CardHeader';
import CardLoader from '@/components/shared/CardLoader';
import useCardTitleActions from '@/hooks/useCardTitleActions';

// Enhanced attribute data structure
const mockAttributes = [
  { 
    id: 1, 
    name: 'Color', 
    slug: 'color',
    description: 'Product color variations',
    type: 'select', // select, text, number, boolean
    values: [
      { id: 1, name: 'Red', code: '#dc3545', sortOrder: 1, isActive: true },
      { id: 2, name: 'Blue', code: '#007bff', sortOrder: 2, isActive: true },
      { id: 3, name: 'Green', code: '#28a745', sortOrder: 3, isActive: true },
      { id: 4, name: 'Yellow', code: '#ffc107', sortOrder: 4, isActive: true },
      { id: 5, name: 'Black', code: '#343a40', sortOrder: 5, isActive: true }
    ],
    isRequired: false,
    isActive: true,
    productCount: 45,
    createdAt: '2024-01-15',
    updatedAt: '2024-06-01',
    createdBy: 'Admin User'
  },
  { 
    id: 2, 
    name: 'Size', 
    slug: 'size',
    description: 'Product size options',
    type: 'select',
    values: [
      { id: 6, name: 'Small', code: 'S', sortOrder: 1, isActive: true },
      { id: 7, name: 'Medium', code: 'M', sortOrder: 2, isActive: true },
      { id: 8, name: 'Large', code: 'L', sortOrder: 3, isActive: true },
      { id: 9, name: 'Extra Large', code: 'XL', sortOrder: 4, isActive: true }
    ],
    isRequired: true,
    isActive: true,
    productCount: 32,
    createdAt: '2024-01-15',
    updatedAt: '2024-06-01',
    createdBy: 'Admin User'
  },
  { 
    id: 3, 
    name: 'Dosage', 
    slug: 'dosage',
    description: 'Medication dosage strength',
    type: 'select',
    values: [
      { id: 10, name: '250mg', code: '250', sortOrder: 1, isActive: true },
      { id: 11, name: '500mg', code: '500', sortOrder: 2, isActive: true },
      { id: 12, name: '1000mg', code: '1000', sortOrder: 3, isActive: true }
    ],
    isRequired: true,
    isActive: true,
    productCount: 28,
    createdAt: '2024-01-20',
    updatedAt: '2024-06-01',
    createdBy: 'Admin User'
  },
  { 
    id: 4, 
    name: 'Flavor', 
    slug: 'flavor',
    description: 'Product flavor options',
    type: 'select',
    values: [
      { id: 13, name: 'Vanilla', code: 'VAN', sortOrder: 1, isActive: true },
      { id: 14, name: 'Chocolate', code: 'CHO', sortOrder: 2, isActive: true },
      { id: 15, name: 'Strawberry', code: 'STR', sortOrder: 3, isActive: true },
      { id: 16, name: 'Mint', code: 'MIN', sortOrder: 4, isActive: true }
    ],
    isRequired: false,
    isActive: true,
    productCount: 15,
    createdAt: '2024-02-01',
    updatedAt: '2024-06-01',
    createdBy: 'Admin User'
  },
  { 
    id: 5, 
    name: 'Brand', 
    slug: 'brand',
    description: 'Product brand information',
    type: 'text',
    values: [],
    isRequired: false,
    isActive: true,
    productCount: 67,
    createdAt: '2024-02-15',
    updatedAt: '2024-06-01',
    createdBy: 'Admin User'
  },
  { 
    id: 6, 
    name: 'Expiry Date', 
    slug: 'expiry-date',
    description: 'Product expiry date',
    type: 'date',
    values: [],
    isRequired: true,
    isActive: true,
    productCount: 89,
    createdAt: '2024-03-01',
    updatedAt: '2024-06-01',
    createdBy: 'Admin User'
  }
];

const AttributeList = () => {
  const [attributes, setAttributes] = useState(mockAttributes);
  const [filteredAttributes, setFilteredAttributes] = useState(mockAttributes);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'select',
    isRequired: false,
    isActive: true,
    values: []
  });
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [viewMode, setViewMode] = useState('list'); // list, grid
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // details, values
  const [newValue, setNewValue] = useState({ name: '', code: '', sortOrder: 1 });

  const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete: handleCardDelete } = useCardTitleActions();

  if (isRemoved) return null;

  // Filter attributes based on search and filters
  useEffect(() => {
    let filtered = [...attributes];

    if (search) {
      const searchTerm = search.toLowerCase();
      filtered = filtered.filter(attr => 
        attr.name.toLowerCase().includes(searchTerm) ||
        attr.description.toLowerCase().includes(searchTerm) ||
        attr.slug.toLowerCase().includes(searchTerm)
      );
    }

    if (selectedType) {
      filtered = filtered.filter(attr => attr.type === selectedType);
    }

    setFilteredAttributes(filtered);
  }, [attributes, search, selectedType]);

  // Calculate statistics
  const totalAttributes = attributes.length;
  const activeAttributes = attributes.filter(attr => attr.isActive).length;
  const selectAttributes = attributes.filter(attr => attr.type === 'select').length;
  const textAttributes = attributes.filter(attr => attr.type === 'text').length;
  const totalValues = attributes.reduce((sum, attr) => sum + attr.values.length, 0);

  const openAdd = () => {
    setEditId(null);
    setForm({
      name: '',
      description: '',
      type: 'select',
      isRequired: false,
      isActive: true,
      values: []
    });
    setErrors({});
    setActiveTab('details');
    setModalOpen(true);
  };

  const openEdit = (attr) => {
    setEditId(attr.id);
    setForm({
      name: attr.name,
      description: attr.description,
      type: attr.type,
      isRequired: attr.isRequired,
      isActive: attr.isActive,
      values: [...attr.values]
    });
    setErrors({});
    setActiveTab('details');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm({
      name: '',
      description: '',
      type: 'select',
      isRequired: false,
      isActive: true,
      values: []
    });
    setEditId(null);
    setErrors({});
    setNewValue({ name: '', code: '', sortOrder: 1 });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) {
      newErrors.name = 'Attribute name is required';
    }
    
    if (attributes.some(attr => 
      attr.name.toLowerCase() === form.name.trim().toLowerCase() && 
      attr.id !== editId
    )) {
      newErrors.name = 'Attribute already exists';
    }
    
    if (!form.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (form.type === 'select' && form.values.length === 0) {
      newErrors.values = 'At least one value is required for select type';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    if (editId) {
      setAttributes(attrs => attrs.map(attr => 
        attr.id === editId 
          ? { 
              ...attr, 
              ...form, 
              slug: form.name.toLowerCase().replace(/\s+/g, '-'),
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : attr
      ));
      toast.success('Attribute updated successfully!');
    } else {
      const newAttribute = {
        id: Date.now(),
        ...form,
        slug: form.name.toLowerCase().replace(/\s+/g, '-'),
        productCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: 'Current User'
      };
      setAttributes(attrs => [...attrs, newAttribute]);
      toast.success('Attribute added successfully!');
    }
    closeModal();
  };

  const handleDelete = (id) => {
    const attribute = attributes.find(attr => attr.id === id);
    const hasProducts = attribute.productCount > 0;

    let message = `Are you sure you want to delete "${attribute.name}"?`;
    if (hasProducts) message += ' This attribute is used by products.';

    if (window.confirm(message)) {
      setAttributes(attrs => attrs.filter(attr => attr.id !== id));
      setSelectedAttributes(prev => prev.filter(attrId => attrId !== id));
      toast.success('Attribute deleted successfully!');
    }
  };

  const handleBulkDelete = () => {
    if (selectedAttributes.length === 0) {
      toast.warning('Please select attributes to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedAttributes.length} selected attributes?`)) {
      setAttributes(attrs => attrs.filter(attr => !selectedAttributes.includes(attr.id)));
      setSelectedAttributes([]);
      toast.success(`${selectedAttributes.length} attributes deleted successfully!`);
    }
  };

  const handleBulkActivate = (activate) => {
    if (selectedAttributes.length === 0) {
      toast.warning('Please select attributes to update');
      return;
    }

    setAttributes(attrs => attrs.map(attr => 
      selectedAttributes.includes(attr.id) 
        ? { ...attr, isActive: activate, updatedAt: new Date().toISOString().split('T')[0] }
        : attr
    ));
    setSelectedAttributes([]);
    toast.success(`${selectedAttributes.length} attributes ${activate ? 'activated' : 'deactivated'} successfully!`);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedAttributes(filteredAttributes.map(attr => attr.id));
    } else {
      setSelectedAttributes([]);
    }
  };

  const handleSelectAttribute = (attributeId) => {
    setSelectedAttributes(prev => {
      if (prev.includes(attributeId)) {
        return prev.filter(id => id !== attributeId);
      } else {
        return [...prev, attributeId];
      }
    });
  };

  const addValue = () => {
    if (!newValue.name.trim()) {
      toast.error('Value name is required');
      return;
    }

    if (form.values.some(v => v.name.toLowerCase() === newValue.name.trim().toLowerCase())) {
      toast.error('Value already exists');
      return;
    }

    const value = {
      id: Date.now(),
      name: newValue.name.trim(),
      code: newValue.code.trim() || newValue.name.trim().substring(0, 3).toUpperCase(),
      sortOrder: newValue.sortOrder,
      isActive: true
    };

    setForm(prev => ({ ...prev, values: [...prev.values, value] }));
    setNewValue({ name: '', code: '', sortOrder: newValue.sortOrder + 1 });
    toast.success('Value added successfully!');
  };

  const removeValue = (valueId) => {
    setForm(prev => ({ ...prev, values: prev.values.filter(v => v.id !== valueId) }));
    toast.success('Value removed successfully!');
  };

  const updateValueOrder = (valueId, newOrder) => {
    setForm(prev => ({
      ...prev,
      values: prev.values.map(v => 
        v.id === valueId ? { ...v, sortOrder: parseInt(newOrder) } : v
      ).sort((a, b) => a.sortOrder - b.sortOrder)
    }));
  };

  const handleExport = () => {
    const data = filteredAttributes.map(attr => ({
      ID: attr.id,
      Name: attr.name,
      Description: attr.description,
      Type: attr.type,
      Required: attr.isRequired ? 'Yes' : 'No',
      Active: attr.isActive ? 'Yes' : 'No',
      Values: attr.values.map(v => v.name).join(', '),
      Products: attr.productCount,
      Created: attr.createdAt,
      Updated: attr.updatedAt
    }));
    
    const headers = Object.keys(data[0]);
    const csv = headers.join(',') + '\n' + data.map(row => 
      headers.map(header => `"${row[header]}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attributes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Attributes exported successfully!');
  };

  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Attributes refreshed successfully!');
    } catch {
      console.log('Failed to refresh attributes');
      // toast.error('Failed to refresh attributes');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'select': return <FiList className="text-primary" />;
      case 'text': return <FiTag className="text-success" />;
      case 'number': return <FiBarChart2 className="text-warning" />;
      case 'boolean': return <FiCheck className="text-info" />;
      case 'date': return <FiCalendar className="text-danger" />;
      default: return <FiTag className="text-secondary" />;
    }
  };

  const getTypeBadge = (type) => {
    const colors = {
      'select': 'primary',
      'text': 'success',
      'number': 'warning',
      'boolean': 'info',
      'date': 'danger'
    };
    return `bg-${colors[type] || 'secondary'}`;
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
                    title="Total Attributes" 
                    value={totalAttributes} 
                    icon={FiTag} 
                    color="#4e73df"
                    subtitle={`${activeAttributes} active attributes`}
                  />
                  <StatCard 
                    title="Select Attributes" 
                    value={selectAttributes} 
                    icon={FiList} 
                    color="#1cc88a"
                    subtitle="Dropdown options"
                  />
                  <StatCard 
                    title="Text Attributes" 
                    value={textAttributes} 
                    icon={FiTag} 
                    color="#36b9cc"
                    subtitle="Free text input"
                  />
                  <StatCard 
                    title="Total Values" 
                    value={totalValues} 
                    icon={FiPackage} 
                    color="#f6c23e"
                    subtitle="Across all attributes"
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
                      <div className="col-md-4">
                        <label className="form-label">Search</label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FiSearch />
                          </span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search attributes..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Type</label>
                        <select 
                          className="form-select" 
                          value={selectedType} 
                          onChange={e => setSelectedType(e.target.value)}
                        >
                          <option value="">All Types</option>
                          <option value="select">Select</option>
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                          <option value="date">Date</option>
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">View Mode</label>
                        <div className="btn-group w-100">
                          <button 
                            className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setViewMode('list')}
                          >
                            <FiList className="me-1" />
                            List
                          </button>
                          <button 
                            className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setViewMode('grid')}
                          >
                            <FiGrid className="me-1" />
                            Grid
                          </button>
                        </div>
                      </div>
                      <div className="col-md-2 d-flex align-items-end">
                        <div className="w-100">
                          <small className="text-muted">
                            Showing {filteredAttributes.length} of {attributes.length} attributes
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attributes Table/Grid */}
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Attributes</h6>
                    {selectedAttributes.length > 0 && (
                      <small className="text-muted">
                        {selectedAttributes.length} attributes selected
                      </small>
                    )}
                  </div>
                  <div className="card-body">
                    {viewMode === 'list' ? (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>
                                <input
                                  type="checkbox"
                                  checked={selectedAttributes.length === filteredAttributes.length && filteredAttributes.length > 0}
                                  onChange={handleSelectAll}
                                />
                              </th>
                              <th>Attribute</th>
                              <th>Type</th>
                              <th>Values</th>
                              <th>Required</th>
                              <th>Products</th>
                              <th>Status</th>
                              <th>Created</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredAttributes.map(attr => {
                              const isSelected = selectedAttributes.includes(attr.id);
                              
                              return (
                                <tr key={attr.id} className={isSelected ? 'table-primary' : ''}>
                                  <td>
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handleSelectAttribute(attr.id)}
                                    />
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <span className="me-2">
                                        {getTypeIcon(attr.type)}
                                      </span>
                                      <div>
                                        <strong>{attr.name}</strong>
                                        <br />
                                        <small className="text-muted">{attr.description}</small>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <span className={`badge ${getTypeBadge(attr.type)}`}>
                                      {attr.type.charAt(0).toUpperCase() + attr.type.slice(1)}
                                    </span>
                                  </td>
                                  <td>
                                    {attr.values.length > 0 ? (
                                      <div>
                                        <span className="badge bg-light text-dark">
                                          {attr.values.length} values
                                        </span>
                                        <br />
                                        <small className="text-muted">
                                          {attr.values.slice(0, 3).map(v => v.name).join(', ')}
                                          {attr.values.length > 3 && ` +${attr.values.length - 3} more`}
                                        </small>
                                      </div>
                                    ) : (
                                      <span className="text-muted">No values</span>
                                    )}
                                  </td>
                                  <td>
                                    <span className={`badge ${attr.isRequired ? 'bg-danger' : 'bg-secondary'}`}>
                                      {attr.isRequired ? 'Required' : 'Optional'}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="badge bg-light text-dark">
                                      {attr.productCount}
                                    </span>
                                  </td>
                                  <td>
                                    <span className={`badge ${attr.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                      {attr.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                  </td>
                                  <td>
                                    <small className="text-muted">
                                      {new Date(attr.createdAt).toLocaleDateString()}
                                    </small>
                                  </td>
                                  <td>
                                    <div className="btn-group btn-group-sm">
                                      <button 
                                        className="btn btn-outline-primary"
                                        onClick={() => openEdit(attr)}
                                      >
                                        <FiEdit2 />
                                      </button>
                                      <button 
                                        className="btn btn-outline-danger"
                                        onClick={() => handleDelete(attr.id)}
                                      >
                                        <FiTrash2 />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="row">
                        {filteredAttributes.map(attr => {
                          const isSelected = selectedAttributes.includes(attr.id);
                          
                          return (
                            <div key={attr.id} className="col-md-6 col-lg-4 mb-3">
                              <div 
                                className={`card h-100 ${isSelected ? 'border-primary' : ''}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSelectAttribute(attr.id)}
                              >
                                <div className="card-body">
                                  <div className="d-flex align-items-center mb-3">
                                    <span className="me-2">
                                      {getTypeIcon(attr.type)}
                                    </span>
                                    <div className="flex-grow-1">
                                      <h6 className="card-title mb-1">{attr.name}</h6>
                                      <small className="text-muted">{attr.description}</small>
                                    </div>
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleSelectAttribute(attr.id);
                                      }}
                                    />
                                  </div>
                                  
                                  <div className="mb-3">
                                    <span className={`badge ${getTypeBadge(attr.type)} me-2`}>
                                      {attr.type.charAt(0).toUpperCase() + attr.type.slice(1)}
                                    </span>
                                    <span className={`badge ${attr.isRequired ? 'bg-danger' : 'bg-secondary'} me-2`}>
                                      {attr.isRequired ? 'Required' : 'Optional'}
                                    </span>
                                    <span className={`badge ${attr.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                      {attr.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>
                                  
                                  <div className="mb-3">
                                    <small className="text-muted">
                                      {attr.values.length > 0 ? (
                                        <>
                                          <strong>{attr.values.length} values:</strong> {attr.values.slice(0, 3).map(v => v.name).join(', ')}
                                          {attr.values.length > 3 && ` +${attr.values.length - 3} more`}
                                        </>
                                      ) : (
                                        'No values defined'
                                      )}
                                    </small>
                                  </div>
                                  
                                  <div className="d-flex justify-content-between align-items-center">
                                    <small className="text-muted">
                                      {attr.productCount} products
                                    </small>
                                    <div className="btn-group btn-group-sm">
                                      <button 
                                        className="btn btn-outline-primary"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openEdit(attr);
                                        }}
                                      >
                                        <FiEdit2 />
                                      </button>
                                      <button 
                                        className="btn btn-outline-danger"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(attr.id);
                                        }}
                                      >
                                        <FiTrash2 />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {filteredAttributes.length === 0 && (
                      <div className="text-center py-5">
                        <div className="text-muted">
                          <FiTag size={48} className="mb-3" />
                          <h5>No attributes found</h5>
                          <p>Try adjusting your search criteria or create a new attribute</p>
                          <button className="btn btn-primary" onClick={openAdd}>
                            <FiPlus className="me-1" />
                            Create First Attribute
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <CardLoader refreshKey={refreshKey} />
            

      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content card" style={{
            background: '#fff',
            padding: 24,
            borderRadius: 8,
            minWidth: 600,
            maxWidth: 800,
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h4 className="mb-3">{editId ? 'Edit' : 'Add'} Attribute</h4>
            
            {/* Tabs */}
            <div className="mb-3">
              <div className="btn-group" role="group">
                <button
                  className={`btn btn-sm ${activeTab === 'details' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActiveTab('details')}
                >
                  Details
                </button>
                {form.type === 'select' && (
                  <button
                    className={`btn btn-sm ${activeTab === 'values' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setActiveTab('values')}
                  >
                    Values ({form.values.length})
                  </button>
                )}
              </div>
            </div>

            {activeTab === 'details' && (
              <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label">Attribute Name *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      value={form.name}
                      onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter attribute name"
                      autoFocus
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Type *</label>
                    <select
                      className="form-select"
                      value={form.type}
                      onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="select">Select (Dropdown)</option>
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="date">Date</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Description *</label>
                  <textarea
                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                    value={form.description}
                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter attribute description"
                    rows="3"
                  />
                  {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isRequired"
                        checked={form.isRequired}
                        onChange={e => setForm(prev => ({ ...prev, isRequired: e.target.checked }))}
                      />
                      <label className="form-check-label" htmlFor="isRequired">
                        Required Attribute
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isActive"
                        checked={form.isActive}
                        onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      />
                      <label className="form-check-label" htmlFor="isActive">
                        Active Attribute
                      </label>
                    </div>
                  </div>
                </div>
                
                {errors.values && <div className="text-danger small mb-3">{errors.values}</div>}
                
                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editId ? 'Update' : 'Add'} Attribute
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'values' && (
              <div>
                <div className="mb-3">
                  <h6>Add New Value</h6>
                  <div className="row">
                    <div className="col-md-4">
                      <label className="form-label">Value Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newValue.name}
                        onChange={e => setNewValue(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter value name"
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Code</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newValue.code}
                        onChange={e => setNewValue(prev => ({ ...prev, code: e.target.value }))}
                        placeholder="Code (optional)"
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Sort Order</label>
                      <input
                        type="number"
                        className="form-control"
                        value={newValue.sortOrder}
                        onChange={e => setNewValue(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 1 }))}
                        min="1"
                      />
                    </div>
                    <div className="col-md-3 d-flex align-items-end">
                      <button 
                        type="button"
                        className="btn btn-primary"
                        onClick={addValue}
                      >
                        <FiPlus className="me-1" />
                        Add Value
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <h6>Attribute Values ({form.values.length})</h6>
                  {form.values.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Code</th>
                            <th>Sort Order</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {form.values.map(value => (
                            <tr key={value.id}>
                              <td>{value.name}</td>
                              <td>{value.code}</td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  value={value.sortOrder}
                                  onChange={e => updateValueOrder(value.id, e.target.value)}
                                  min="1"
                                  style={{ width: '80px' }}
                                />
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => removeValue(value.id)}
                                >
                                  <FiTrash2 />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-3 text-muted">
                      No values defined yet
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleSave}>
                    {editId ? 'Update' : 'Add'} Attribute
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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

export default AttributeList; 