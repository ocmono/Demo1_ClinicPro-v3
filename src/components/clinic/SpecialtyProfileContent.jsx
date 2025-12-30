import React, { useState, useEffect } from 'react';
import { FiActivity, FiSettings, FiUsers, FiFileText, FiCalendar, FiTrendingUp, FiDroplet, FiUser, FiClock, FiList, FiPlusCircle, FiInfo } from 'react-icons/fi';
import { useClinicManagement } from '../../contentApi/ClinicMnanagementProvider';
import { Link } from 'react-router-dom';

const SpecialtyProfileContent = ({ specialty }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { fetchSymptoms, symptomsBySpeciality } = useClinicManagement();

  const specialtyName = specialty.speciality || 'Unknown Specialty';
  const diagnoses = symptomsBySpeciality[specialty.id] || [];

  useEffect(() => {
    if (specialty.id) {
      fetchSymptoms(specialty.id);
    }
  }, [specialty.id]);

  const totalSymptoms = diagnoses.reduce((total, diagnosis) => {
    return total + (Array.isArray(diagnosis.symptoms) ? diagnosis.symptoms.length : 0);
  }, 0);

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': { class: 'badge bg-success', text: 'Active' },
      'Inactive': { class: 'badge bg-secondary', text: 'Inactive' },
      'Pending': { class: 'badge bg-warning', text: 'Pending' },
    };
    
    const config = statusConfig[status] || statusConfig['Active'];
    return <span className={config.class}>{config.text}</span>;
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'doctors', label: 'Doctors' },
    { id: 'symptoms', label: 'Clinical' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'settings', label: 'Settings' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="p-4">
            <h6 className="fw-bold mb-4">Specialty Information</h6>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-3">
                    <FiFileText className="text-muted me-3" size={18} />
                    <div>
                      <small className="text-muted d-block">Specialty Name</small>
                      <span className="fw-medium">{specialtyName}</span>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '18px', height: '18px'}}>
                      <div className="rounded-circle bg-success" style={{width: '8px', height: '8px'}}></div>
                    </div>
                    <div>
                      <small className="text-muted d-block">Status</small>
                      <span className="fw-medium">{getStatusBadge(specialty.status)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-3">
                    <FiUsers className="text-muted me-3" size={18} />
                    <div>
                      <small className="text-muted d-block">Assigned Doctors</small>
                      <span className="fw-medium">{specialty.doctorCount || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-3">
                    <FiTrendingUp className="text-muted me-3" size={18} />
                    <div>
                      <small className="text-muted d-block">Category</small>
                      <span className="fw-medium">
                        {specialty.category || 'Medical'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-3">
                    <FiCalendar className="text-muted me-3" size={18} />
                    <div>
                      <small className="text-muted d-block">Default Appointment Duration</small>
                      <span className="fw-medium">
                        {specialty.appointmentDuration ? `${specialty.appointmentDuration} minutes` : '30 minutes'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-3">
                    <FiCalendar className="text-muted me-3" size={18} />
                    <div>
                      <small className="text-muted d-block">Created</small>
                      <span className="fw-medium">
                        {specialty.createdAt || 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="col-12">
                  <div className="d-flex align-items-start mb-3">
                    <FiFileText className="text-muted me-3 mt-1" size={18} />
                    <div>
                      <small className="text-muted d-block">Description</small>
                      <span className="fw-medium">
                        {specialty.description || 'No description available'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {specialty.requirements && (
                  <div className="col-12">
                    <div className="d-flex align-items-start mb-3">
                      <FiSettings className="text-muted me-3 mt-1" size={18} />
                      <div>
                        <small className="text-muted d-block">Prerequisites & Requirements</small>
                        <span className="fw-medium">
                          {specialty.requirements}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
          </div>
        );
        
      case 'doctors':
        return (
          <div className="p-4">
            <h6 className="fw-bold mb-4">Assigned Doctors</h6>
              <div className="text-center py-5">
                <FiUsers size={48} className="text-muted mb-3" />
                <p className="text-muted">Doctor list coming soon</p>
                <small className="text-muted">
                  Currently {specialty.doctorCount || 0} doctor{(specialty.doctorCount || 0) !== 1 ? 's' : ''} assigned
                </small>
              </div>
          </div>
        );
        
      case 'symptoms':
        return (
          <div className="p-4">
            <h6 className="fw-bold mb-4 d-flex align-items-center justify-content-between">
              <span>
                <FiActivity className="me-2" />
                Clinical Configuration
              </span>
            </h6>
              
            {diagnoses.length === 0 ? (
              <div className="text-center py-5">
                <div className="avatar-text avatar-xxl bg-light mx-auto mb-3">
                  <FiActivity size={40} className="text-muted" />
                </div>
                <h5 className="text-muted mb-2">No clinical data configured</h5>
                <p className="text-muted mb-4">Configure diagnoses and symptoms for this specialty</p>
                <div className='d-flex justify-content-center'>
                  <Link
                    to={`/clinic/specialities/configure/${specialty.id}`}
                    className="btn btn-primary"
                  >
                    <FiSettings className="me-2" size={16} />
                    Configure Clinical Settings
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center">
                        <div>
                          <div className="small text-muted">Configured Diagnoses</div>
                          <div className="h4 fw-bold">{diagnoses.length}</div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <div>
                          <div className="small text-muted">Total Symptoms</div>
                          <div className="h4 fw-bold">{totalSymptoms}</div>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/clinic/specialities/configure/${specialty.id}`}
                      className="btn btn-sm btn-outline-primary d-flex align-items-center"
                    >
                      <FiSettings className="me-1" size={14} />
                      Edit Configuration
                    </Link>
                  </div>

                  <div className="alert alert-info mb-4">
                    <div className="d-flex align-items-center">
                      <FiInfo className="me-2" size={18} />
                      <div>
                        <strong>Note:</strong> Each diagnosis contains associated symptoms.
                        Symptoms help in diagnosis and treatment planning.
                      </div>
                    </div>
                  </div>

                  <div className="row g-3">
                    {diagnoses.slice(0, 8).map((diagnosis, index) => (
                      <div key={index} className="col-md-6 col-lg-4">
                        <div className="card border h-100">
                          <div className="card-header bg-light d-flex align-items-center justify-content-between">
                            <h6 className="mb-0 fw-bold text-truncate" title={diagnosis.name}>
                              {diagnosis.name}
                            </h6>
                            <span className="badge bg-primary">
                              {index + 1}
                            </span>
                          </div>
                          <div className="card-body">
                            <div className="mb-3">
                              <div className="d-flex align-items-center mb-2">
                                <FiActivity size={14} className="text-primary me-2" />
                                <span className="small fw-medium">Symptoms ({diagnosis.symptoms?.length || 0})</span>
                              </div>

                              {diagnosis.symptoms && diagnosis.symptoms.length > 0 ? (
                                <div className="symptoms-list" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                                  {diagnosis.symptoms.slice(0, 5).map((symptom, idx) => (
                                    <div key={idx} className="d-flex align-items-center mb-1">
                                      <div className="bg-primary bg-opacity-10 rounded-circle p-1 me-2">
                                        <div className="rounded-circle bg-primary" style={{ width: '6px', height: '6px' }}></div>
                                      </div>
                                      <span className="small text-truncate" title={symptom}>
                                        {symptom}
                                      </span>
                                    </div>
                                  ))}
                                  {diagnosis.symptoms.length > 5 && (
                                    <div className="text-center mt-1">
                                      <span className="badge bg-light text-dark">
                                        +{diagnosis.symptoms.length - 5} more
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-2">
                                  <span className="text-muted small">No symptoms added</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="card-footer bg-white border-top-0">
                            <div className="row text-center small">
                              <div className="col-6 border-end">
                                <div className="text-primary fw-semibold">
                                  {diagnosis.symptoms?.length || 0}
                                </div>
                                <div className="text-muted">Symptoms</div>
                              </div>
                              <div className="col-6">
                                <div className="text-success fw-semibold">
                                  {diagnosis.treatments?.length || 0}
                                </div>
                                <div className="text-muted">Treatments</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {diagnoses.length > 8 && (
                    <div className="text-center mt-4">
                      <Link
                        to={`/clinic/specialities/configure/${specialty.id}`}
                        className="btn btn-outline-primary"
                      >
                        View All {diagnoses.length} Diagnoses
                      </Link>
                    </div>
                  )}

                  {/* Summary Card */}
                  <div className="card mt-4 border-primary">
                    <div className="card-header bg-primary bg-opacity-10">
                      <h6 className="mb-0 fw-bold text-white">Clinical Configuration Summary</h6>
                    </div>
                    <div className="card-body">
                      <div className="row text-center">
                        <div className="col-md-4 mb-3 mb-md-0">
                          <div className="p-3 bg-light rounded">
                            <div className="h2 fw-bold text-primary mb-1">
                              {diagnoses.length}
                            </div>
                            <div className="text-muted">Total Diagnoses</div>
                          </div>
                        </div>
                        <div className="col-md-4 mb-3 mb-md-0">
                          <div className="p-3 bg-light rounded">
                            <div className="h2 fw-bold text-success mb-1">
                              {totalSymptoms}
                            </div>
                            <div className="text-muted">Total Symptoms</div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="p-3 bg-light rounded">
                            <div className="h2 fw-bold text-info mb-1">
                              {diagnoses.reduce((total, d) => total + (d.treatments?.length || 0), 0)}
                            </div>
                            <div className="text-muted">Total Treatments</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            )}
          </div>
        );
        
      case 'analytics':
        return (
          <div className="p-4">
            <h6 className="fw-bold mb-4">Analytics & Statistics</h6>
              <div className="text-center py-5">
                <FiTrendingUp size={48} className="text-muted mb-3" />
                <p className="text-muted">Analytics dashboard coming soon</p>
            </div>
          </div>
        );
        
      case 'settings':
        return (
          <div className="p-4">
            <h6 className="fw-bold mb-4">Specialty Settings</h6>
              <div className="text-center py-5">
                <FiSettings size={48} className="text-muted mb-3" />
                <p className="text-muted">Settings configuration coming soon</p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="row">
      {/* Profile Card */}
      <div className="col-lg-4 mb-4">
        <div className="card">
          <div className="card-body text-center">
            <div className="avatar-text user-avatar-text avatar-xl mx-auto mb-3 bg-primary">
              <FiFileText size={32} className="text-white" />
            </div>
            
            <h5 className="mb-1 fw-bold">{specialtyName}</h5>
            <p className="text-muted mb-3">Medical Specialty</p>
            
            <div className="d-flex flex-column gap-2 text-start">
              <div className="d-flex align-items-center">
                <FiUsers size={16} className="text-muted me-2" />
                <small className="text-muted">{specialty.doctorCount || 0} Doctors</small>
              </div>
              
              <div className="d-flex align-items-center">
                <FiCalendar size={16} className="text-muted me-2" />
                <small className="text-muted">{specialty.createdAt || 'Date unknown'}</small>
              </div>
              
              <div className="d-flex align-items-center">
                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: '16px', height: '16px'}}>
                  <div className="rounded-circle bg-success" style={{width: '6px', height: '6px'}}></div>
                </div>
                <small className="text-muted">{getStatusBadge(specialty.status)}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="col-xxl-8 col-xl-6">
        <div className="card border-top-0">
          <div className="card-header p-0">
            <ul className="nav nav-tabs flex-wrap w-100 text-center customers-nav-tabs" id="specialtyTab" role="tablist">
              {tabs.map((tab) => (
                <li className="nav-item flex-fill border-top" role="presentation" key={tab.id}>
                  <a
                    className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                    type="button"
                  >
                    {tab.label === 'Clinical' ? (
                      <>
                        <FiActivity className="me-1" size={14} />
                        Clinical
                      </>
                    ) : (
                      tab.label
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="tab-content">
            <div className="tab-pane fade show active">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialtyProfileContent;