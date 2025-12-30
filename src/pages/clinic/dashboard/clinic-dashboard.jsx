import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, FiUserPlus, FiActivity, FiSettings, FiBarChart, 
  FiCalendar, FiFileText, FiDollarSign, FiShield, FiGrid,
  FiArrowRight, FiTrendingUp, FiTrendingDown, FiClock
} from 'react-icons/fi';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import { useClinicManagement } from '../../../contentApi/ClinicMnanagementProvider';
import { useReceptionist } from '../../../context/ReceptionistContext';
import { useAccountant } from '../../../context/AccountantContext';

const ClinicDashboard = () => {
  const navigate = useNavigate();
  const { clinicSpecialities } = useClinicManagement();
  const { receptionists } = useReceptionist();
  const { accountants } = useAccountant();

  // Statistics
  const stats = useMemo(() => {
    return {
      specialties: clinicSpecialities.length,
      activeSpecialties: clinicSpecialities.filter(s => s.status === 'Active').length,
      receptionists: receptionists.length,
      activeReceptionists: receptionists.filter(r => r.status === 'Active').length,
      accountants: accountants.length,
      activeAccountants: accountants.filter(a => a.status === 'Active').length,
      totalStaff: receptionists.length + accountants.length,
      activeStaff: receptionists.filter(r => r.status === 'Active').length + 
                   accountants.filter(a => a.status === 'Active').length
    };
  }, [clinicSpecialities, receptionists, accountants]);

  const quickActions = [
    {
      title: 'Manage Specialties',
      description: 'Configure medical specialties and clinical settings',
      icon: FiActivity,
      color: 'primary',
      path: '/clinic/specialities/manage',
      stats: `${stats.specialties} specialties`
    },
    {
      title: 'Manage Doctors',
      description: 'Add, edit, and manage clinic doctors',
      icon: FiUsers,
      color: 'success',
      path: '/clinic/doctors/manage',
      stats: '0 doctors'
    },
    {
      title: 'Manage Receptionists',
      description: 'Manage front desk and administrative staff',
      icon: FiUserPlus,
      color: 'info',
      path: '/clinic/receptionists/manage',
      stats: `${stats.receptionists} receptionists`
    },
    {
      title: 'Manage Accountants',
      description: 'Manage financial and accounting staff',
      icon: FiDollarSign,
      color: 'warning',
      path: '/clinic/accountants/manage',
      stats: `${stats.accountants} accountants`
    },
    {
      title: 'Manage Users',
      description: 'System-wide user management and permissions',
      icon: FiShield,
      color: 'secondary',
      path: '/users',
      stats: 'All users'
    },
    {
      title: 'Clinic Settings',
      description: 'Configure clinic-wide settings and preferences',
      icon: FiSettings,
      color: 'dark',
      path: '/clinic/settings',
      stats: 'Settings'
    }
  ];

  const recentActivities = [
    {
      type: 'specialty',
      action: 'Added new specialty',
      item: 'Cardiology',
      time: '2 hours ago',
      icon: FiActivity,
      color: 'primary'
    },
    {
      type: 'receptionist',
      action: 'Updated receptionist',
      item: 'Sarah Johnson',
      time: '4 hours ago',
      icon: FiUserPlus,
      color: 'info'
    },
    {
      type: 'accountant',
      action: 'Added new accountant',
      item: 'Michael Chen',
      time: '1 day ago',
      icon: FiDollarSign,
      color: 'warning'
    }
  ];

  return (
    <>
      <PageHeader>
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h4 className="mb-1 fw-bold">Clinic Management Dashboard</h4>
            <p className="text-muted mb-0">Centralized management for all clinic operations</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary-subtle text-primary">
              <FiGrid size={12} className="me-1" />
              Management Hub
            </span>
          </div>
        </div>
      </PageHeader>

      <div className="main-content">
        {/* Overview Statistics */}
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="card bg-primary-subtle border-0">
              <div className="card-body text-center">
                <FiActivity className="text-primary mb-2" size={32} />
                <h3 className="fw-bold text-primary mb-1">{stats.specialties}</h3>
                <p className="text-muted mb-0">Medical Specialties</p>
                <small className="text-primary">{stats.activeSpecialties} active</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-success-subtle border-0">
              <div className="card-body text-center">
                <FiUsers className="text-success mb-2" size={32} />
                <h3 className="fw-bold text-success mb-1">0</h3>
                <p className="text-muted mb-0">Doctors</p>
                <small className="text-success">0 active</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-info-subtle border-0">
              <div className="card-body text-center">
                <FiUserPlus className="text-info mb-2" size={32} />
                <h3 className="fw-bold text-info mb-1">{stats.receptionists}</h3>
                <p className="text-muted mb-0">Receptionists</p>
                <small className="text-info">{stats.activeReceptionists} active</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-warning-subtle border-0">
              <div className="card-body text-center">
                <FiDollarSign className="text-warning mb-2" size={32} />
                <h3 className="fw-bold text-warning mb-1">{stats.accountants}</h3>
                <p className="text-muted mb-0">Accountants</p>
                <small className="text-warning">{stats.activeAccountants} active</small>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Quick Actions */}
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h5 className="fw-bold mb-0">
                  <FiGrid className="me-2" />
                  Quick Actions
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {quickActions.map((action, index) => {
                    const IconComponent = action.icon;
                    return (
                      <div key={index} className="col-md-6">
                        <div 
                          className="card border h-100 cursor-pointer hover-shadow"
                          onClick={() => navigate(action.path)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="card-body">
                            <div className="d-flex align-items-start justify-content-between mb-3">
                              <div className={`bg-${action.color}-subtle p-2 rounded`}>
                                <IconComponent className={`text-${action.color}`} size={24} />
                              </div>
                              <FiArrowRight className="text-muted" size={16} />
                            </div>
                            <h6 className="fw-bold mb-2">{action.title}</h6>
                            <p className="text-muted small mb-2">{action.description}</p>
                            <span className={`badge bg-${action.color}-subtle text-${action.color}`}>
                              {action.stats}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities & Quick Stats */}
          <div className="col-lg-4">
            <div className="row g-4">
              {/* Staff Overview */}
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h6 className="fw-bold mb-0">
                      <FiUsers className="me-2" />
                      Staff Overview
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <div className="fw-medium">Total Staff</div>
                        <small className="text-muted">All employees</small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-primary">{stats.totalStaff}</div>
                        <small className="text-muted">members</small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <div className="fw-medium">Active Staff</div>
                        <small className="text-muted">Currently working</small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-success">{stats.activeStaff}</div>
                        <small className="text-muted">active</small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div className="fw-medium">Availability</div>
                        <small className="text-muted">Staff coverage</small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-info">
                          {stats.totalStaff > 0 ? Math.round((stats.activeStaff / stats.totalStaff) * 100) : 0}%
                        </div>
                        <small className="text-muted">coverage</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h6 className="fw-bold mb-0">
                      <FiClock className="me-2" />
                      Recent Activities
                    </h6>
                  </div>
                  <div className="card-body">
                    {recentActivities.map((activity, index) => {
                      const IconComponent = activity.icon;
                      return (
                        <div key={index} className="d-flex align-items-start mb-3">
                          <div className={`bg-${activity.color}-subtle p-2 rounded me-3`}>
                            <IconComponent className={`text-${activity.color}`} size={16} />
                          </div>
                          <div className="flex-grow-1">
                            <div className="fw-medium small">{activity.action}</div>
                            <div className="text-muted small">{activity.item}</div>
                            <small className="text-muted">{activity.time}</small>
                          </div>
                        </div>
                      );
                    })}
                    <div className="text-center mt-3">
                      <button className="btn btn-sm btn-outline-primary">
                        View All Activities
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="row g-4 mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="fw-bold mb-0">
                  <FiBarChart className="me-2" />
                  System Health & Performance
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-4">
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className="bg-success-subtle p-3 rounded mb-2">
                        <FiTrendingUp className="text-success" size={24} />
                      </div>
                      <h6 className="fw-bold">System Status</h6>
                      <span className="badge bg-success">Healthy</span>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className="bg-info-subtle p-3 rounded mb-2">
                        <FiUsers className="text-info" size={24} />
                      </div>
                      <h6 className="fw-bold">User Activity</h6>
                      <span className="badge bg-info">Active</span>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className="bg-warning-subtle p-3 rounded mb-2">
                        <FiCalendar className="text-warning" size={24} />
                      </div>
                      <h6 className="fw-bold">Data Sync</h6>
                      <span className="badge bg-warning">Pending</span>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className="bg-primary-subtle p-3 rounded mb-2">
                        <FiFileText className="text-primary" size={24} />
                      </div>
                      <h6 className="fw-bold">Reports</h6>
                      <span className="badge bg-primary">Available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ClinicDashboard; 