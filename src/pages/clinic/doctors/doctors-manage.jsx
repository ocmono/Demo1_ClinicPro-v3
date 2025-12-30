import { useState, useMemo } from 'react';
import ListDoctors from "./ListDoctors";
import DoctorsAdd from "./doctors-add";
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import { FiUsers, FiUserPlus, FiBarChart, FiFilter } from 'react-icons/fi';
import { useClinicManagement } from '../../../contentApi/ClinicMnanagementProvider';

const DoctorsManage = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { clinicSpecialities } = useClinicManagement();

  // Get unique specialties for filter
  const specialties = useMemo(() => {
    return [...new Set(clinicSpecialities.map(s => s.speciality).filter(Boolean))];
  }, [clinicSpecialities]);

  const tabs = [
    { id: 'list', label: 'All Doctors', icon: FiUsers },
    { id: 'overview', label: 'Overview', icon: FiBarChart },
    { id: 'add', label: 'Add Doctor', icon: FiUserPlus }
  ];

  return (
    <>
      <PageHeader>
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h4 className="mb-1 fw-bold">Manage Doctors</h4>
            <p className="text-muted mb-0">Add, edit, and manage clinic doctors</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary-subtle text-primary">
              <FiUsers size={12} className="me-1" />
              Doctors
            </span>
            <span className="badge bg-success-subtle text-success">
              <FiUsers size={12} className="me-1" />
              Active
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
                    Doctor Statistics
                  </h5>
                </div>
                
                {/* Summary Cards */}
                <div className="col-md-3">
                  <div className="card bg-primary-subtle border-0">
                    <div className="card-body text-center">
                      <h3 className="fw-bold text-primary mb-1">0</h3>
                      <p className="text-muted mb-0">Total Doctors</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-success-subtle border-0">
                    <div className="card-body text-center">
                      <h3 className="fw-bold text-success mb-1">0</h3>
                      <p className="text-muted mb-0">Active Doctors</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-info-subtle border-0">
                    <div className="card-body text-center">
                      <h3 className="fw-bold text-info mb-1">0</h3>
                      <p className="text-muted mb-0">Specialties</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-warning-subtle border-0">
                    <div className="card-body text-center">
                      <h3 className="fw-bold text-warning mb-1">0</h3>
                      <p className="text-muted mb-0">Appointments</p>
                    </div>
                  </div>
                </div>
                
                {/* Specialty Breakdown */}
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="fw-bold mb-0">Doctors by Specialty</h6>
                    </div>
                    <div className="card-body">
                      <div className="text-center py-4">
                        <FiUsers size={48} className="text-muted mb-3" />
                        <h5 className="text-muted">No doctors data available</h5>
                        <p className="text-muted">Add doctors to see statistics</p>
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
                      Filter by Specialty
                    </label>
                    <select 
                      className="form-select"
                      value={filterSpecialty}
                      onChange={(e) => setFilterSpecialty(e.target.value)}
                    >
                      <option value="all">All Specialties</option>
                      {specialties.map(specialty => (
                        <option key={specialty} value={specialty}>{specialty}</option>
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
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                  <div className="col-md-12 col-lg-4">
                    <label className="form-label fw-medium text-muted">Filtered Results</label>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-primary-subtle text-primary">
                        0 doctors
                      </span>
                      {(filterSpecialty !== 'all' || filterStatus !== 'all') && (
                        <button 
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => {
                            setFilterSpecialty('all');
                            setFilterStatus('all');
                          }}
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <ListDoctors />
              </div>
            )}
            
            {activeTab === 'add' && <DoctorsAdd />}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DoctorsManage;
