import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiFolder, FiFile, FiEdit2, FiTrash2, FiPlus, FiSearch, FiFilter, FiRefreshCw, FiDownload, FiChevronDown, FiChevronRight, FiGrid, FiList, FiSettings, FiBarChart2, FiUsers, FiPackage, FiCheck } from 'react-icons/fi';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import CardHeader from '@/components/shared/CardHeader';
import CardLoader from '@/components/shared/CardLoader';
import useCardTitleActions from '@/hooks/useCardTitleActions';
import PropTypes from 'prop-types';

// Enhanced category data structure
const initialCategories = [
  { 
    id: 1, 
    parent: 0, 
    name: 'Antibiotics', 
    description: 'Medications that fight bacterial infections',
    slug: 'antibiotics',
    color: '#dc3545',
    icon: 'FiShield',
    productCount: 45,
    isActive: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-06-01',
    createdBy: 'Admin User',
    sortOrder: 1
  },
  { 
    id: 2, 
    parent: 0, 
    name: 'Painkillers', 
    description: 'Medications for pain relief and management',
    slug: 'painkillers',
    color: '#fd7e14',
    icon: 'FiDroplet',
    productCount: 32,
    isActive: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-06-01',
    createdBy: 'Admin User',
    sortOrder: 2
  },
  { 
    id: 3, 
    parent: 0, 
    name: 'Supplements', 
    description: 'Vitamins, minerals, and dietary supplements',
    slug: 'supplements',
    color: '#20c997',
    icon: 'FiHeart',
    productCount: 78,
    isActive: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-06-01',
    createdBy: 'Admin User',
    sortOrder: 3
  },
  { 
    id: 4, 
    parent: 1, 
    name: 'Penicillins', 
    description: 'Beta-lactam antibiotics',
    slug: 'penicillins',
    color: '#e83e8c',
    icon: 'FiShield',
    productCount: 12,
    isActive: true,
    createdAt: '2024-01-20',
    updatedAt: '2024-06-01',
    createdBy: 'Admin User',
    sortOrder: 1
  },
  { 
    id: 5, 
    parent: 1, 
    name: 'Cephalosporins', 
    description: 'Broad-spectrum antibiotics',
    slug: 'cephalosporins',
    color: '#6f42c1',
    icon: 'FiShield',
    productCount: 8,
    isActive: true,
    createdAt: '2024-01-20',
    updatedAt: '2024-06-01',
    createdBy: 'Admin User',
    sortOrder: 2
  },
  { 
    id: 6, 
    parent: 2, 
    name: 'Opioids', 
    description: 'Strong pain medications',
    slug: 'opioids',
    color: '#fd7e14',
    icon: 'FiDroplet',
    productCount: 5,
    isActive: true,
    createdAt: '2024-01-25',
    updatedAt: '2024-06-01',
    createdBy: 'Admin User',
    sortOrder: 1
  },
  { 
    id: 7, 
    parent: 2, 
    name: 'NSAIDs', 
    description: 'Non-steroidal anti-inflammatory drugs',
    slug: 'nsaids',
    color: '#fd7e14',
    icon: 'FiDroplet',
    productCount: 15,
    isActive: true,
    createdAt: '2024-01-25',
    updatedAt: '2024-06-01',
    createdBy: 'Admin User',
    sortOrder: 2
  },
  { 
    id: 8, 
    parent: 3, 
    name: 'Vitamins', 
    description: 'Essential vitamins and minerals',
    slug: 'vitamins',
    color: '#20c997',
    icon: 'FiHeart',
    productCount: 45,
    isActive: true,
    createdAt: '2024-02-01',
    updatedAt: '2024-06-01',
    createdBy: 'Admin User',
    sortOrder: 1
  },
  { 
    id: 9, 
    parent: 3, 
    name: 'Minerals', 
    description: 'Essential minerals and trace elements',
    slug: 'minerals',
    color: '#20c997',
    icon: 'FiHeart',
    productCount: 23,
    isActive: true,
    createdAt: '2024-02-01',
    updatedAt: '2024-06-01',
    createdBy: 'Admin User',
    sortOrder: 2
  },
  { 
    id: 10, 
    parent: 0, 
    name: 'Gastrointestinal', 
    description: 'Medications for digestive system disorders',
    slug: 'gastrointestinal',
    color: '#17a2b8',
    icon: 'FiActivity',
    productCount: 28,
    isActive: true,
    createdAt: '2024-02-15',
    updatedAt: '2024-06-01',
    createdBy: 'Admin User',
    sortOrder: 4
  }
];

function buildTree(categories, parent = 0) {
  return categories
    .filter(c => c.parent === parent)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(c => ({ ...c, children: buildTree(categories, c.id) }));
}

const CategoryList = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [filteredCategories, setFilteredCategories] = useState(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    parent: 0,
    color: '#007bff',
    icon: 'FiFolder',
    isActive: true
  });
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState('tree'); // tree, grid, list
  const [expandedNodes, setExpandedNodes] = useState(new Set([1, 2, 3, 10])); // Default expanded
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dragSource, setDragSource] = useState(null);
  const [dragTarget, setDragTarget] = useState(null);

  const { refreshKey, isRemoved, isExpanded } = useCardTitleActions();

  // Filter categories based on search and filters
  useEffect(() => {
    let filtered = [...categories];

    if (search) {
      const searchTerm = search.toLowerCase();
      filtered = filtered.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm) ||
        cat.description.toLowerCase().includes(searchTerm) ||
        cat.slug.toLowerCase().includes(searchTerm)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(cat => cat.parent === parseInt(selectedCategory));
    }

    setFilteredCategories(filtered);
  }, [categories, search, selectedCategory]);

  if (isRemoved) return null;

  // Calculate statistics
  const totalCategories = categories.length;
  const activeCategories = categories.filter(cat => cat.isActive).length;
  const totalProducts = categories.reduce((sum, cat) => sum + cat.productCount, 0);
  const topLevelCategories = categories.filter(cat => cat.parent === 0).length;

  // Get unique parent categories for filter
  const parentCategories = categories.filter(cat => cat.parent === 0);

  // For parent selector, exclude self and descendants
  const getDescendantIds = (id, allCategories) => {
    let ids = [];
    allCategories.forEach(cat => {
      if (cat.parent === id) {
        ids.push(cat.id, ...getDescendantIds(cat.id, allCategories));
      }
    });
    return ids;
  };

  const parentOptions = categories.filter(cat =>
    cat.id !== editId && !getDescendantIds(editId, categories).includes(cat.id)
  );

  const openEdit = (category) => {
    setEditId(category.id);
    setForm({
      name: category.name,
      description: category.description,
      parent: category.parent,
      color: category.color,
      icon: category.icon,
      isActive: category.isActive
    });
    setErrors({});
    setShowForm(true);
  };

  const openAdd = () => {
    setEditId(null);
    setForm({
      name: '',
      description: '',
      parent: 0,
      color: '#007bff',
      icon: 'FiFolder',
      isActive: true
    });
    setErrors({});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm({
      name: '',
      description: '',
      parent: 0,
      color: '#007bff',
      icon: 'FiFolder',
      isActive: true
    });
    setEditId(null);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    
    if (categories.some(cat => 
      cat.name.toLowerCase() === form.name.trim().toLowerCase() && 
      cat.parent === form.parent && 
      cat.id !== editId
    )) {
      newErrors.name = 'Category already exists at this level';
    }
    
    if (!form.description.trim()) {
      newErrors.description = 'Description is required';
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
      setCategories(cats => cats.map(cat => 
        cat.id === editId 
          ? { 
              ...cat, 
              ...form, 
              updatedAt: new Date().toISOString().split('T')[0],
              slug: form.name.toLowerCase().replace(/\s+/g, '-')
            }
          : cat
      ));
      toast.success('Category updated successfully!');
    } else {
      const newCategory = {
        id: Date.now(),
        ...form,
        slug: form.name.toLowerCase().replace(/\s+/g, '-'),
        productCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: 'Current User',
        sortOrder: categories.filter(cat => cat.parent === form.parent).length + 1
      };
      setCategories(cats => [...cats, newCategory]);
      toast.success('Category added successfully!');
    }
    closeForm();
  };

  const handleDelete = (id) => {
    const category = categories.find(cat => cat.id === id);
    const hasChildren = categories.some(cat => cat.parent === id);
    const hasProducts = category.productCount > 0;

    let message = `Are you sure you want to delete "${category.name}"?`;
    if (hasChildren) message += ' This will also delete all subcategories.';
    if (hasProducts) message += ' This category contains products.';

    if (window.confirm(message)) {
      const removeIds = [id, ...getDescendantIds(id, categories)];
      setCategories(cats => cats.filter(cat => !removeIds.includes(cat.id)));
      setSelectedCategories(prev => prev.filter(catId => !removeIds.includes(catId)));
      toast.success('Category deleted successfully!');
    }
  };

  const handleBulkDelete = () => {
    if (selectedCategories.length === 0) {
      toast.warning('Please select categories to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedCategories.length} selected categories?`)) {
      const removeIds = [];
      selectedCategories.forEach(id => {
        removeIds.push(id, ...getDescendantIds(id, categories));
      });
      
      setCategories(cats => cats.filter(cat => !removeIds.includes(cat.id)));
      setSelectedCategories([]);
      toast.success(`${selectedCategories.length} categories deleted successfully!`);
    }
  };

  const handleBulkActivate = (activate) => {
    if (selectedCategories.length === 0) {
      toast.warning('Please select categories to update');
      return;
    }

    setCategories(cats => cats.map(cat => 
      selectedCategories.includes(cat.id) 
        ? { ...cat, isActive: activate, updatedAt: new Date().toISOString().split('T')[0] }
        : cat
    ));
    setSelectedCategories([]);
    toast.success(`${selectedCategories.length} categories ${activate ? 'activated' : 'deactivated'} successfully!`);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCategories(filteredCategories.map(cat => cat.id));
    } else {
      setSelectedCategories([]);
    }
  };

  const handleSelectCategory = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const toggleNodeExpansion = (nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleDragStart = (e, category) => {
    setDragSource(category);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, category) => {
    e.preventDefault();
    if (dragSource && dragSource.id !== category.id) {
      setDragTarget(category);
    }
  };

  const handleDrop = (e, targetCategory) => {
    e.preventDefault();
    if (dragSource && dragTarget && dragSource.id !== targetCategory.id) {
      // Check if target is not a descendant of source
      const descendants = getDescendantIds(dragSource.id, categories);
      if (!descendants.includes(targetCategory.id)) {
        setCategories(cats => cats.map(cat => 
          cat.id === dragSource.id 
            ? { ...cat, parent: targetCategory.id, updatedAt: new Date().toISOString().split('T')[0] }
            : cat
        ));
        toast.success(`Category "${dragSource.name}" moved to "${targetCategory.name}"`);
      } else {
        toast.error('Cannot move category into its own descendant');
      }
    }
    setDragSource(null);
    setDragTarget(null);
  };

  const handleExport = () => {
    const data = filteredCategories.map(cat => ({
      ID: cat.id,
      Name: cat.name,
      Description: cat.description,
      Parent: categories.find(p => p.id === cat.parent)?.name || 'None',
      Products: cat.productCount,
      Status: cat.isActive ? 'Active' : 'Inactive',
      Created: cat.createdAt,
      Updated: cat.updatedAt
    }));
    
    const headers = Object.keys(data[0]);
    const csv = headers.join(',') + '\n' + data.map(row => 
      headers.map(header => `"${row[header]}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `categories-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Categories exported successfully!');
  };

  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Categories refreshed successfully!');
    } catch {
      toast.error('Failed to refresh categories');
    } finally {
      setIsLoading(false);
    }
  };

  // Build tree for rendering
  const tree = buildTree(categories);

  // Search filter for tree view
  function filterTree(tree, search) {
    if (!search) return tree;
    return tree
      .map(node => {
        const match = node.name.toLowerCase().includes(search.toLowerCase()) ||
                     node.description.toLowerCase().includes(search.toLowerCase());
        const filteredChildren = filterTree(node.children, search);
        if (match || filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }
        return null;
      })
      .filter(Boolean);
  }
  const filteredTree = filterTree(tree, search);

  // Recursive render for tree view
  function renderTree(nodes, level = 0) {
    return (
      <ul style={{ listStyle: 'none', paddingLeft: level ? 24 : 0, marginBottom: 0 }}>
        {nodes.map(node => {
          const hasChildren = node.children && node.children.length > 0;
          const isExpanded = expandedNodes.has(node.id);
          const isSelected = selectedCategories.includes(node.id);
          const isDragTarget = dragTarget?.id === node.id;
          
          return (
            <li key={node.id}>
              <div 
                className={`d-flex align-items-center mb-1 p-2 rounded ${isSelected ? 'bg-primary text-white' : ''} ${isDragTarget ? 'bg-warning' : ''}`}
                style={{ 
                  paddingLeft: level * 20,
                  cursor: 'pointer',
                  border: isSelected ? '2px solid #007bff' : '1px solid transparent'
                }}
                draggable
                onDragStart={(e) => handleDragStart(e, node)}
                onDragOver={(e) => handleDragOver(e, node)}
                onDrop={(e) => handleDrop(e, node)}
                onClick={() => handleSelectCategory(node.id)}
              >
                <span className="me-2" style={{ minWidth: 24 }}>
                  {hasChildren ? (
                    <button
                      className="btn btn-sm btn-link p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNodeExpansion(node.id);
                      }}
                    >
                      {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                    </button>
                  ) : (
                    <span style={{ width: 24, display: 'inline-block' }}></span>
                  )}
                </span>
                <span className="me-2" style={{ color: node.color }}>
                  {hasChildren ? <FiFolder /> : <FiFile />}
                </span>
                <span className="flex-grow-1">
                  <strong>{node.name}</strong>
                  <br />
                  <small className="text-muted">{node.description}</small>
                </span>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-light text-dark">
                    {node.productCount} products
                  </span>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(node);
                    }}
                  >
                    <FiEdit2 />
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(node.id);
                    }}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              {hasChildren && isExpanded && renderTree(node.children, level + 1)}
            </li>
          );
        })}
      </ul>
    );
  }

  // Grid view render
  const renderGrid = () => (
    <div className="row">
      {filteredCategories.map(category => {
        const isSelected = selectedCategories.includes(category.id);
        const parent = categories.find(cat => cat.id === category.parent);
        
        return (
          <div key={category.id} className="col-md-4 col-lg-3 mb-3">
            <div 
              className={`card h-100 ${isSelected ? 'border-primary' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => handleSelectCategory(category.id)}
            >
              <div className="card-body text-center">
                <div 
                  className="mb-3 mx-auto d-flex align-items-center justify-content-center"
                  style={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    backgroundColor: category.color + '20',
                    color: category.color
                  }}
                >
                  {category.children && category.children.length > 0 ? <FiFolder size={24} /> : <FiFile size={24} />}
                </div>
                <h6 className="card-title mb-1">{category.name}</h6>
                <p className="card-text small text-muted mb-2">{category.description}</p>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small className="text-muted">
                    {parent ? `Parent: ${parent.name}` : 'Top Level'}
                  </small>
                  <span className={`badge ${category.isActive ? 'bg-success' : 'bg-secondary'}`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="badge bg-light text-dark">
                    {category.productCount} products
                  </span>
                  <div className="btn-group btn-group-sm">
                    <button 
                      className="btn btn-outline-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(category);
                      }}
                    >
                      <FiEdit2 />
                    </button>
                    <button 
                      className="btn btn-outline-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(category.id);
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
  );

  // List view render
  const renderList = () => (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead className="table-light">
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedCategories.length === filteredCategories.length && filteredCategories.length > 0}
                onChange={handleSelectAll}
              />
            </th>
            <th>Category</th>
            <th>Description</th>
            <th>Parent</th>
            <th>Products</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCategories.map(category => {
            const isSelected = selectedCategories.includes(category.id);
            const parent = categories.find(cat => cat.id === category.parent);
            
            return (
              <tr key={category.id} className={isSelected ? 'table-primary' : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectCategory(category.id)}
                  />
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <span 
                      className="me-2"
                      style={{ color: category.color }}
                    >
                      {category.children && category.children.length > 0 ? <FiFolder /> : <FiFile />}
                    </span>
                    <div>
                      <strong>{category.name}</strong>
                      <br />
                      <small className="text-muted">{category.slug}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <small className="text-muted">{category.description}</small>
                </td>
                <td>
                  <small className="text-muted">
                    {parent ? parent.name : 'Top Level'}
                  </small>
                </td>
                <td>
                  <span className="badge bg-light text-dark">
                    {category.productCount}
                  </span>
                </td>
                <td>
                  <span className={`badge ${category.isActive ? 'bg-success' : 'bg-secondary'}`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <small className="text-muted">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </small>
                </td>
                <td>
                  <div className="btn-group btn-group-sm">
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => openEdit(category)}
                    >
                      <FiEdit2 />
                    </button>
                    <button 
                      className="btn btn-outline-danger"
                      onClick={() => handleDelete(category.id)}
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
  );

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
  StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    icon: PropTypes.elementType.isRequired,
    color: PropTypes.string.isRequired,
    subtitle: PropTypes.string
  };

  return (
    <>
      <PageHeader />
      <div className="main-content">
        <div className="row">
          <div className="col-12">

              <div className="card-body">
                {/* Statistics Cards */}
                <div className="row mb-4">
                  <StatCard 
                    title="Total Categories" 
                    value={totalCategories} 
                    icon={FiFolder} 
                    color="#4e73df"
                    subtitle={`${topLevelCategories} top-level categories`}
                  />
                  <StatCard 
                    title="Active Categories" 
                    value={activeCategories} 
                    icon={FiCheck} 
                    color="#1cc88a"
                    subtitle={`${((activeCategories / totalCategories) * 100).toFixed(1)}% active`}
                  />
                  <StatCard 
                    title="Total Products" 
                    value={totalProducts} 
                    icon={FiPackage} 
                    color="#36b9cc"
                    subtitle="Across all categories"
                  />
                  <StatCard 
                    title="Average Products" 
                    value={Math.round(totalProducts / totalCategories)} 
                    icon={FiBarChart2} 
                    color="#f6c23e"
                    subtitle="Per category"
                  />
                </div>

                {/* Form Modal */}
                {showForm && (
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
                      minWidth: 500,
                      maxWidth: 600,
                      maxHeight: '90vh',
                      overflowY: 'auto'
                    }}>
                      <h4 className="mb-3">{editId ? 'Edit' : 'Add'} Category</h4>
                      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                        <div className="mb-3">
                          <label className="form-label">Category Name *</label>
                          <input
                            type="text"
                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                            value={form.name}
                            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter category name"
                            autoFocus
                          />
                          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                        </div>
                        
                        <div className="mb-3">
                          <label className="form-label">Description *</label>
                          <textarea
                            className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                            value={form.description}
                            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Enter category description"
                            rows="3"
                          />
                          {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                        </div>
                        
                        <div className="row">
                          <div className="col-md-6">
                            <label className="form-label">Parent Category</label>
                            <select
                              className="form-select"
                              value={form.parent}
                              onChange={e => setForm(prev => ({ ...prev, parent: parseInt(e.target.value) }))}
                            >
                              <option value={0}>No Parent (Top Level)</option>
                              {parentOptions.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Color</label>
                            <input
                              type="color"
                              className="form-control form-control-color"
                              value={form.color}
                              onChange={e => setForm(prev => ({ ...prev, color: e.target.value }))}
                              title="Choose category color"
                            />
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="isActive"
                              checked={form.isActive}
                              onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                            />
                            <label className="form-check-label" htmlFor="isActive">
                              Active Category
                            </label>
                          </div>
                        </div>
                        
                        <div className="d-flex justify-content-end gap-2">
                          <button type="button" className="btn btn-secondary" onClick={closeForm}>
                            Cancel
                          </button>
                          <button type="submit" className="btn btn-primary">
                            {editId ? 'Update' : 'Add'} Category
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Filters and Controls */}
                <div className="card mb-4">
                  <div className="card-header">
                    <h6 className="mb-0">
                      <FiFilter className="me-2" />
                      Filters & Controls
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
                            placeholder="Search categories..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Parent Category</label>
                        <select 
                          className="form-select" 
                          value={selectedCategory} 
                          onChange={e => setSelectedCategory(e.target.value)}
                        >
                          <option value="">All Categories</option>
                          {parentCategories.map(cat => <option value={cat.id} key={cat.id}>{cat.name}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">View Mode</label>
                        <div className="btn-group w-100">
                          <button 
                            className={`btn btn-sm ${viewMode === 'tree' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setViewMode('tree')}
                          >
                            <FiList className="me-1" />
                            Tree
                          </button>
                          <button 
                            className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setViewMode('grid')}
                          >
                            <FiGrid className="me-1" />
                            Grid
                          </button>
                          <button 
                            className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setViewMode('list')}
                          >
                            <FiList className="me-1" />
                            List
                          </button>
                        </div>
                      </div>
                      <div className="col-md-2 d-flex align-items-end">
                        <div className="w-100">
                          <small className="text-muted">
                            Showing {filteredCategories.length} of {categories.length} categories
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Display */}
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Categories</h6>
                    {selectedCategories.length > 0 && (
                      <small className="text-muted">
                        {selectedCategories.length} categories selected
                      </small>
                    )}
                  </div>
                  <div className="card-body">
                    {viewMode === 'tree' && renderTree(filteredTree)}
                    {viewMode === 'grid' && renderGrid()}
                    {viewMode === 'list' && renderList()}
                    
                    {filteredCategories.length === 0 && (
                      <div className="text-center py-5">
                        <div className="text-muted">
                          <FiFolder size={48} className="mb-3" />
                          <h5>No categories found</h5>
                          <p>Try adjusting your search criteria or create a new category</p>
                          <button className="btn btn-primary" onClick={openAdd}>
                            <FiPlus className="me-1" />
                            Create First Category
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <CardLoader refreshKey={refreshKey} />
            
          </div>
        </div>
      </div>

      <style>{`
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
        .form-control-color {
          width: 100%;
          height: 38px;
        }
      `}</style>
    </>
  );
};

export default CategoryList; 