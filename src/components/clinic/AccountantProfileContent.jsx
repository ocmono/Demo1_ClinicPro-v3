import React, { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiAward, FiActivity, FiSettings } from 'react-icons/fi';
import { BsPatchCheckFill } from 'react-icons/bs'

const AccountantProfileContent = ({ accountant }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const accountantName = `${accountant.firstName || ''} ${accountant.lastName || ''}`.trim() || 'Unknown Accountant';

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': { class: 'badge bg-success', text: 'Active' },
      'Inactive': { class: 'badge bg-secondary', text: 'Inactive' },
      'Suspended': { class: 'badge bg-warning', text: 'Suspended' },
    };

    const config = statusConfig[status] || statusConfig['Active'];
    return <span className={config.class}>{config.text}</span>;
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'activity', label: 'Activity' },
    { id: 'settings', label: 'Settings' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
            <div className="card-body">
              <h6 className="card-title fw-bold mb-4">Personal Information</h6>

              <div className="row g-4">
                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-3">
                    <FiUser className="text-muted me-3" size={18} />
                    <div>
                      <small className="text-muted d-block">Full Name</small>
                      <span className="fw-medium">{accountantName}</span>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-3">
                    <FiMail className="text-muted me-3" size={18} />
                    <div>
                      <small className="text-muted d-block">Email</small>
                      <span className="fw-medium">{accountant.email || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-3">
                    <FiPhone className="text-muted me-3" size={18} />
                    <div>
                      <small className="text-muted d-block">Phone</small>
                      <span className="fw-medium">{accountant.phone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-3">
                    <FiAward className="text-muted me-3" size={18} />
                    <div>
                      <small className="text-muted d-block">Qualification</small>
                      <span className="fw-medium">{accountant.accountant_profile?.qualification || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-3">
                    <FiBriefcase className="text-muted me-3" size={18} />
                    <div>
                      <small className="text-muted d-block">Experience</small>
                      <span className="fw-medium">
                        {accountant.accountant_profile?.experience || 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-3">
                  <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '18px', height: '18px' }}>
                    <div className="rounded-circle bg-success" style={{ width: '8px', height: '8px' }}></div>
                    </div>
                    <div>
                      <small className="text-muted d-block">Status</small>
                      <span className="fw-medium">{getStatusBadge(accountant.status)}</span>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        );

      case 'activity':
        return (
          <div className="p-4">
            <h6 className="fw-bold mb-4">Recent Activity</h6>
              <div className="text-center py-5">
                <FiActivity size={48} className="text-muted mb-3" />
                <p className="text-muted">No activity to display</p>
              </div>
          </div>
        );

      case 'settings':
        return (
          <div className="p-4">
            <h6 className="fw-bold mb-4">Settings</h6>
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
    <>
      <div className="col-xxl-4 col-xl-6">
        <div className="card stretch stretch-full">
          <div className="card-body">
            <div className="mb-4 text-center">
              <div className="wd-150 ht-150 mx-auto mb-3 position-relative">
                <div className="avatar-image wd-150 ht-150 border border-5 border-gray-3">
                  <div className="avatar-title bg-primary rounded-circle w-100 h-100 d-flex align-items-center justify-content-center text-white" style={{ fontSize: '3rem' }}>
                    {accountantName.substring(0, 1).toUpperCase()}
                  </div>
                </div>
                <div className="wd-10 ht-10 text-success rounded-circle position-absolute translate-middle" style={{ top: "76%", right: "10px" }}>
                  <BsPatchCheckFill size={16} />
                </div>
              </div>
              <div className="mb-4">
                <h6 className="fs-16 fw-bold d-block">{accountantName}</h6>
                <p className="fs-12 fw-normal text-muted d-block">Accountant</p>
                <div>
                  {getStatusBadge(accountantName.status)}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h6 className="fw-bold mb-3">Contact Information</h6>
              <div className="hstack gap-3 mb-3">
                <div className="avatar-text avatar-md bg-soft-primary text-primary">
                  <FiMail size={16} />
                </div>
                <div className="flex-fill">
                  <span className="d-block fw-medium">Email</span>
                  <a href={`mailto:${accountant.email}`} className="fs-12 text-muted text-decoration-none">
                    {accountant.email || 'Not specified'}
                  </a>
                </div>
              </div>
              <div className="hstack gap-3 mb-3">
                <div className="avatar-text avatar-md bg-soft-success text-success">
                  <FiPhone size={16} />
                </div>
                <div className="flex-fill">
                  <span className="d-block fw-medium">Phone</span>
                  <a href={`tel:${accountant.phone}`} className="fs-12 text-muted text-decoration-none">
                    {accountant.phone || 'Not specified'}
                  </a>
                </div>
              </div>
              <div className="hstack gap-3 mb-3">
                <div className="avatar-text avatar-md bg-soft-success text-success">
                  <FiAward size={16} />
                </div>
                <div className="flex-fill">
                  <span className="d-block fw-medium">Education</span>
                  <small className="text-muted">{accountant.accountant_profile?.qualification || 'Not specified'}</small>
                </div>
              </div>
              <div className="hstack gap-3 mb-3">
                <div className="avatar-text avatar-md bg-soft-success text-success">
                  <FiAward size={16} />
                </div>
                <div className="flex-fill">
                  <span className="d-block fw-medium">Status</span>
                  <small className="text-muted">{getStatusBadge(accountant.status)}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-xxl-8 col-xl-6">
        <div className="card border-top-0">
          <div className="card-header p-0">
            <ul className="nav nav-tabs flex-wrap w-100 text-center customers-nav-tabs" id="accountantTab" role="tablist">
              {tabs.map((tab) => (
                <li className="nav-item flex-fill border-top" role="presentation" key={tab.id}>
                  <a
                    className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                    type="button"
                  >
                    {tab.label}
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
    </>
  );
};

export default AccountantProfileContent;