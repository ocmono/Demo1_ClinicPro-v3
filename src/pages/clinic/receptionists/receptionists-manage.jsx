import { useState, useMemo } from 'react';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import ReceptionistsTable from '@/components/clinic/ReceptionistsTable';
import ReceptionistsAdd from './receptionists-add';
import { FiUsers, FiUserPlus, FiBarChart, FiFilter } from 'react-icons/fi';
import { useReceptionist } from '../../../context/ReceptionistContext';

const ReceptionistsManage = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [filterStatus, setFilterStatus] = useState('all');
  const { receptionists } = useReceptionist();

  // Statistics
  const stats = useMemo(() => {
    const total = receptionists.length;
    const active = receptionists.filter(r => r.status === 'Active').length;
    const onLeave = receptionists.filter(r => r.status === 'On Leave').length;
    const inactive = receptionists.filter(r => r.status === 'Inactive').length;
    
    return { total, active, onLeave, inactive };
  }, [receptionists]);

  const tabs = [
    { id: 'list', label: 'All Receptionists', icon: FiUsers },
    { id: 'overview', label: 'Overview', icon: FiBarChart },
    { id: 'add', label: 'Add Receptionist', icon: FiUserPlus }
  ];

  return (
    <>
      <PageHeader>
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h4 className="mb-1 fw-bold">Manage Receptionists</h4>
            <p className="text-muted mb-0">Add, edit, and manage receptionist profiles</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary-subtle text-primary">
              {stats.total} Total
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
                    Receptionist Statistics
                  </h5>
                </div>
                
                {/* Summary Cards */}
                <div className="col-md-3">
                  <div className="card bg-primary-subtle border-0">
                    <div className="card-body text-center">
                      <h3 className="fw-bold text-primary mb-1">{stats.total}</h3>
                      <p className="text-muted mb-0">Total Receptionists</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-success-subtle border-0">
                    <div className="card-body text-center">
                      <h3 className="fw-bold text-success mb-1">{stats.active}</h3>
                      <p className="text-muted mb-0">Active Receptionists</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-warning-subtle border-0">
                    <div className="card-body text-center">
                      <h3 className="fw-bold text-warning mb-1">{stats.onLeave}</h3>
                      <p className="text-muted mb-0">On Leave</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-secondary-subtle border-0">
                    <div className="card-body text-center">
                      <h3 className="fw-bold text-secondary mb-1">{stats.inactive}</h3>
                      <p className="text-muted mb-0">Inactive</p>
                    </div>
                  </div>
                </div>
                
                {/* Status Breakdown */}
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="fw-bold mb-0">Receptionists by Status</h6>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-4">
                          <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
                            <div>
                              <div className="fw-medium">Active</div>
                              <small className="text-muted">Currently working</small>
                            </div>
                            <div className="text-end">
                              <div className="fw-bold text-success">{stats.active}</div>
                              <small className="text-muted">receptionists</small>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
                            <div>
                              <div className="fw-medium">On Leave</div>
                              <small className="text-muted">Temporarily away</small>
                            </div>
                            <div className="text-end">
                              <div className="fw-bold text-warning">{stats.onLeave}</div>
                              <small className="text-muted">receptionists</small>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
                            <div>
                              <div className="fw-medium">Inactive</div>
                              <small className="text-muted">Not available</small>
                            </div>
                            <div className="text-end">
                              <div className="fw-bold text-secondary">{stats.inactive}</div>
                              <small className="text-muted">receptionists</small>
                            </div>
                          </div>
                        </div>
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
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                  <div className="col-md-12 col-lg-8">
                    <label className="form-label fw-medium text-muted">Filtered Results</label>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-primary-subtle text-primary">
                        {receptionists.length} receptionists
                      </span>
                      {filterStatus !== 'all' && (
                        <button 
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setFilterStatus('all')}
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <ReceptionistsTable />
              </div>
            )}
            
            {activeTab === 'add' && <ReceptionistsAdd />}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ReceptionistsManage;
