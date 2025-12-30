import { useState, useMemo } from 'react';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import SpecialtiesTable from '@/components/clinic/SpecialtiesTable';
import SpecialitiesAdd from './specialities-add';
import { FiUsers, FiUserPlus, FiBarChart, FiFilter } from 'react-icons/fi';
import { useClinicManagement } from '../../../contentApi/ClinicMnanagementProvider';

const SpecialitiesManage = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { clinicSpecialities } = useClinicManagement();

  // Filter specialties based on category and status
  const filteredSpecialities = useMemo(() => {
    return clinicSpecialities.filter(specialty => {
      const categoryMatch = filterCategory === 'all' || specialty.category === filterCategory;
      const statusMatch = filterStatus === 'all' || specialty.status === filterStatus;
      return categoryMatch && statusMatch;
    });
  }, [clinicSpecialities, filterCategory, filterStatus]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    return [...new Set(clinicSpecialities.map(s => s.category).filter(Boolean))];
  }, [clinicSpecialities]);

  // Statistics
  const stats = useMemo(() => {
    const total = clinicSpecialities.length;
    const active = clinicSpecialities.filter(s => s.status === 'Active').length;
    const byCategory = categories.reduce((acc, cat) => {
      acc[cat] = clinicSpecialities.filter(s => s.category === cat).length;
      return acc;
    }, {});
    const totalDoctors = clinicSpecialities.reduce((sum, s) => sum + (s.doctorCount || 0), 0);
    
    return { total, active, byCategory, totalDoctors };
  }, [clinicSpecialities, categories]);

  const tabs = [
    { id: 'list', label: 'All Specialties', icon: FiUsers },
    { id: 'overview', label: 'Overview', icon: FiBarChart },
    { id: 'add', label: 'Add Specialty', icon: FiUserPlus }
  ];

  return (
    <>
      <PageHeader>
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h4 className="mb-1 fw-bold">Manage Specialties</h4>
            <p className="text-muted mb-0">Add, edit, and manage medical specialties</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary-subtle text-primary">
              {stats.total} Total Specialties
            </span>
            <span className="badge bg-success-subtle text-success">
              {stats.active} Active
            </span>
          </div>
        </div>
      </PageHeader>
      
      <div className="main-content">
        <div className="card">
          <div className="card-header">
            <ul className="nav nav-tabs nav-tabs-custom-style card-header-tabs">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <li className="nav-item" key={tab.id}>
                    <button
                      className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <IconComponent size={16} className="me-2" />
                      {tab.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          
          <div className="card-body">
            {activeTab === 'overview' && (
              <div className="row g-4">
                <div className="col-12">
                  <h5 className="fw-bold mb-3">
                    <FiBarChart className="me-2" />
                    Specialty Statistics
                  </h5>
                </div>
                
                {/* Summary Cards */}
                <div className="col-md-3">
                  <div className="card bg-primary-subtle border-0">
                    <div className="card-body text-center">
                      <h3 className="fw-bold text-primary mb-1">{stats.total}</h3>
                      <p className="text-muted mb-0">Total Specialties</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-success-subtle border-0">
                    <div className="card-body text-center">
                      <h3 className="fw-bold text-success mb-1">{stats.active}</h3>
                      <p className="text-muted mb-0">Active Specialties</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-info-subtle border-0">
                    <div className="card-body text-center">
                      <h3 className="fw-bold text-info mb-1">{stats.totalDoctors}</h3>
                      <p className="text-muted mb-0">Total Doctors</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-warning-subtle border-0">
                    <div className="card-body text-center">
                      <h3 className="fw-bold text-warning mb-1">{categories.length}</h3>
                      <p className="text-muted mb-0">Categories</p>
                    </div>
                  </div>
                </div>
                
                {/* Category Breakdown */}
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="fw-bold mb-0">Specialties by Category</h6>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        {Object.entries(stats.byCategory).map(([category, count]) => (
                          <div key={category} className="col-md-6 col-lg-4">
                            <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
                              <div>
                                <div className="fw-medium">{category}</div>
                                <small className="text-muted">Category</small>
                              </div>
                              <div className="text-end">
                                <div className="fw-bold text-primary">{count}</div>
                                <small className="text-muted">specialties</small>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'list' && (
              <div>
                {/* Filters */}
                <div className="row g-3 mb-4">
                  <div className="col-md-6 col-lg-4">
                    <label className="form-label fw-medium">
                      <FiFilter size={14} className="me-1" />
                      Filter by Category
                    </label>
                    <select 
                      className="form-select"
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <label className="form-label fw-medium">
                      <FiFilter size={14} className="me-1" />
                      Filter by Status
                    </label>
                    <select 
                      className="form-select"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                  <div className="col-md-12 col-lg-4">
                    <label className="form-label fw-medium text-muted">Filtered Results</label>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-primary-subtle text-primary">
                        {filteredSpecialities.length} specialties
                      </span>
                      {(filterCategory !== 'all' || filterStatus !== 'all') && (
                        <button 
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => {
                            setFilterCategory('all');
                            setFilterStatus('all');
                          }}
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <SpecialtiesTable />
              </div>
            )}
            
            {activeTab === 'add' && <SpecialitiesAdd />}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SpecialitiesManage; 