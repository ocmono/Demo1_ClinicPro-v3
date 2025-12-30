import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUsers } from '../../context/UserContext';
import { BsPatchCheckFill } from 'react-icons/bs';
import { FiEdit, FiMail, FiMapPin, FiPhone, FiUser, FiCalendar, FiShield, FiActivity, FiSettings } from 'react-icons/fi';
import { useBooking } from '@/contentApi/BookingProvider';

const UserProfileContent = () => {
  const { id } = useParams();
  const { users } = useUsers();
  // console.log(`users ====================`, users);
  const [activeTab, setActiveTab] = useState('overview');
  const { doctors } = useBooking();

  // Find the user by ID
  const user = users.find(u => u.id == id);
const doctor = doctors.find(d => d.id == id);
console.log(`doctor ====================`, doctor);
  if (!user) {
    return (
      <div className="col-12">
        <div className="card stretch stretch-full">
          <div className="card-body">
            <div className="text-center py-5">
              <h6 className="text-muted">User not found</h6>
              <p className="text-muted small">The user you're looking for doesn't exist or has been removed.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const fullName = `${user.firstName || user.first_name || ''} ${user.lastName || user.last_name || ''}`.trim() || 'Not specified';

  const getRoleBadge = (role) => {
    const roleConfig = {
      'super_admin': { class: 'bg-danger', text: 'Super Admin' },
      'clinic_admin': { class: 'bg-warning', text: 'Clinic Admin' },
      'admin': { class: 'bg-primary', text: 'Admin' },
      'doctor': { class: 'bg-success', text: 'Doctor' },
      'patient': { class: 'bg-info', text: 'Patient' },
      'receptionist': { class: 'bg-secondary', text: 'Receptionist' },
      'pharmacist': { class: 'bg-dark', text: 'Pharmacist' },
      'accountant': { class: 'bg-dark', text: 'Accountant' },
    };

    const config = roleConfig[role] || { class: 'bg-light text-dark', text: role || 'User' };
    return <span className={`badge ${config.class} small`}>{config.text}</span>;
  };

  const getStatusBadge = (status) => {
    let normalized = "";

    if (status == true) normalized = "active";
    else if (status === false) normalized = "inactive";
    else if (typeof status === "string") normalized = status.toLowerCase();
    else normalized = "unknown";

    const statusConfig = {
      'active': { class: 'bg-success', text: 'Active' },
      'inactive': { class: 'bg-secondary', text: 'Inactive' },
      'pending': { class: 'bg-warning', text: 'Pending' },
      'suspended': { class: 'bg-danger', text: 'Suspended' },
    };

    const config = statusConfig[normalized] || statusConfig['active'];
    return <span className={`badge ${config.class} small`}>{config.text}</span>;
  };

  const getGenderBadge = (gender) => {
    const genderConfig = {
      'male': { class: 'bg-info-subtle text-info', text: 'Male' },
      'female': { class: 'bg-warning-subtle text-warning', text: 'Female' },
      'other': { class: 'bg-secondary-subtle text-secondary', text: 'Other' },
      'prefer_not_to_say': { class: 'bg-light-subtle text-muted', text: 'Prefer not to say' }
    };
    const config = genderConfig[gender] || genderConfig['other'];
    return <span className={`badge ${config.class} small`}>{config.text}</span>;
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
          <div className="p-4">
            <h6 className="fw-bold mb-3">Personal Information</h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-muted small">Full Name</label>
                <p className="fw-medium">{fullName || 'Not specified'}</p>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small">Username</label>
                <p className="fw-medium">{user.username || 'Not specified'}</p>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small">Email</label>
                <p>
                  <a href={`mailto:${user.email}`} className="text-decoration-none">
                    {user.email || 'Not specified'}
                  </a>
                </p>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small">Phone</label>
                <p>
                  <a href={`tel:${user.phone}`} className="text-decoration-none">
                    {user.phone || 'Not specified'}
                  </a>
                </p>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small">Role</label>
                <p>{getRoleBadge(user.role)}</p>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small">Status</label>
                <p>{getStatusBadge(user.status)}</p>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small">Gender</label>
                <p>{getGenderBadge(user.gender)}</p>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small">Age</label>
                <p className="fw-medium">{user.age || 'Not specified'}</p>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small">Date of Birth</label>
                <p className="fw-medium">
                {(user?.dob || doctor?.dob) ? new Date(user?.dob ?? doctor?.dob).toLocaleDateString(): 'Not specified'}</p>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small">Created Date</label>
                <p className="fw-medium">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Not specified'}
                </p>
              </div>
            </div>

            {/* Additional Information based on role */}
            {user.role === 'doctor' && (
              <>
                <hr className="my-4" />
                <h6 className="fw-bold mb-3">Doctor Information</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted small">Specialization</label>
                    <p className="fw-medium">{doctor?.drSpeciality.join(', ') || 'Not specified'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small">Registration Number</label>
                    <p className="fw-medium">{doctor?.reg_no || 'Not specified'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small">Qualification</label>
                    <p className="fw-medium">{doctor?.qualification || 'Not specified'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small">Experience</label>
                    <p className="fw-medium">{doctor?.experience ? `${doctor?.experience} years` : 'Not specified'}</p>
                  </div>
                </div>
              </>
            )}

            {user.role === 'receptionist' && (
              <>
                <hr className="my-4" />
                <h6 className="fw-bold mb-3">Receptionist Information</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted small">Qualification</label>
                    <p className="fw-medium">{user.rec_qualification || 'Not specified'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small">Address</label>
                    <p className="fw-medium">{user.rec_address || 'Not specified'}</p>
                  </div>
                </div>
              </>
            )}

            {user.role === 'accountant' && (
              <>
                <hr className="my-4" />
                <h6 className="fw-bold mb-3">Accountant Information</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted small">Qualification</label>
                    <p className="fw-medium">{user.acc_qualification || 'Not specified'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small">Experience</label>
                    <p className="fw-medium">{user.acc_experience ? `${user.acc_experience} years` : 'Not specified'}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      case 'activity':
        return (
          <div className="p-4">
            <h6 className="fw-bold mb-3">Recent Activity</h6>
            <div className="text-center py-4">
              <FiActivity size={48} className="text-muted mb-3" />
              <p className="text-muted">No activity data available</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-4">
            <h6 className="fw-bold mb-3">Account Settings</h6>
            <div className="text-center py-4">
              <FiSettings size={48} className="text-muted mb-3" />
              <p className="text-muted">Settings functionality coming soon</p>
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
                {user.img ? (
                  <div className="avatar-image wd-150 ht-150 border border-5 border-gray-3">
                    <img
                      src={typeof user.img === 'string' ? user.img : URL.createObjectURL(user.img)}
                      alt="avatar"
                      className="img-fluid rounded-circle w-100 h-100 text-center"
                    />
                  </div>
                ) : (
                  <div className="avatar-image wd-150 ht-150 border border-5 border-gray-3">
                    <div className="avatar-title bg-primary rounded-circle w-100 h-100 d-flex align-items-center justify-content-center text-white" style={{ fontSize: '3rem' }}>
                      {fullName.substring(0, 1).toUpperCase()}
                    </div>
                  </div>
                )}
                <div className="wd-10 ht-10 text-success rounded-circle position-absolute translate-middle" style={{ top: "76%", right: "10px" }}>
                  <BsPatchCheckFill size={16} />
                </div>
              </div>
              <div className="mb-4">
                <h6 className="fs-16 fw-bold d-block">{fullName}</h6>
                <p className="fs-12 fw-normal text-muted d-block">
                  {user.role ? user.role.replace('_', ' ').toUpperCase() : 'User'}
                </p>
                <div className="mt-2">
                  {getStatusBadge(user.status)}
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
                  <a href={`mailto:${user.email}`} className="fs-12 text-muted text-decoration-none">
                    {user.email || 'Not specified'}
                  </a>
                </div>
              </div>
              <div className="hstack gap-3 mb-3">
                <div className="avatar-text avatar-md bg-soft-success text-success">
                  <FiPhone size={16} />
                </div>
                <div className="flex-fill">
                  <span className="d-block fw-medium">Phone</span>
                  <a href={`tel:${user.phone}`} className="fs-12 text-muted text-decoration-none">
                    {user.phone || 'Not specified'}
                  </a>
                </div>
              </div>
              <div className="hstack gap-3 mb-3">
                <div className="avatar-text avatar-md bg-soft-info text-info">
                  <FiUser size={16} />
                </div>
                <div className="flex-fill">
                  <span className="d-block fw-medium">Username</span>
                  <span className="fs-12 text-muted">
                    {user.username || 'Not specified'}
                  </span>
                </div>
              </div>
              <div className="hstack gap-3">
                <div className="avatar-text avatar-md bg-soft-warning text-warning">
                  <FiShield size={16} />
                </div>
                <div className="flex-fill">
                  <span className="d-block fw-medium">Role</span>
                  <span className="fs-12 text-muted">
                    {getRoleBadge(user.role)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h6 className="fw-bold mb-3">Profile Information</h6>
              <div className="hstack gap-3 mb-3">
                <div className="avatar-text avatar-md bg-soft-secondary text-secondary">
                  <FiUser size={16} />
                </div>
                <div className="flex-fill">
                  <span className="d-block fw-medium">Gender</span>
                  <span className="fs-12 text-muted">
                    {getGenderBadge(user.gender)}
                  </span>
                </div>
              </div>
              <div className="hstack gap-3 mb-3">
                <div className="avatar-text avatar-md bg-soft-dark text-dark">
                  <FiCalendar size={16} />
                </div>
                <div className="flex-fill">
                  <span className="d-block fw-medium">Age</span>
                  <span className="fs-12 text-muted">
                    {user.age || 'Not specified'}
                  </span>
                </div>
              </div>
              <div className="hstack gap-3">
                <div className="avatar-text avatar-md bg-soft-dark text-dark">
                  <FiCalendar size={16} />
                </div>
                <div className="flex-fill">
                  <span className="d-block fw-medium">Member Since</span>
                  <span className="fs-12 text-muted">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Not specified'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-xxl-8 col-xl-6">
        <div className="card border-top-0">
          <div className="card-header p-0">
            <ul className="nav nav-tabs flex-wrap w-100 text-center customers-nav-tabs" id="userTab" role="tablist">
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

export default UserProfileContent;