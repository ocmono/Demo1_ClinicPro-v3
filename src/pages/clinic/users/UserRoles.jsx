import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiShield, FiUser, FiEdit3, FiTrash2, FiPlus, FiRefreshCw, FiUsers, FiCheck, FiX } from "react-icons/fi";
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import { toast } from "react-toastify";
import DeleteConfirmationModal from '../settings/DeleteConfirmationModal';

const UserRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [],
    color: 'primary'
  });
  const navigate = useNavigate();

  // Default roles for clinic system
  const defaultRoles = [
    {
      id: 1,
      name: 'super_admin',
      displayName: 'Super Admin',
      description: 'Full system access and control',
      color: 'danger',
      permissions: ['all'],
      userCount: 1,
      createdAt: '2024-01-01'
    },
    {
      id: 2,
      name: 'clinic_admin',
      displayName: 'Clinic Admin',
      description: 'Clinic-wide management and settings',
      color: 'warning',
      permissions: ['clinic_manage', 'users_manage', 'reports_view', 'settings_manage'],
      userCount: 2,
      createdAt: '2024-01-01'
    },
    {
      id: 3,
      name: 'admin',
      displayName: 'Admin',
      description: 'General administrative tasks',
      color: 'info',
      permissions: ['users_view', 'reports_view', 'basic_settings'],
      userCount: 3,
      createdAt: '2024-01-01'
    },
    {
      id: 4,
      name: 'doctor',
      displayName: 'Doctor',
      description: 'Medical staff with patient access',
      color: 'primary',
      permissions: ['patients_manage', 'appointments_manage', 'prescriptions_manage', 'reports_view'],
      userCount: 8,
      createdAt: '2024-01-01'
    },
    {
      id: 5,
      name: 'receptionist',
      displayName: 'Receptionist',
      description: 'Front desk and patient coordination',
      color: 'success',
      permissions: ['patients_view', 'appointments_manage', 'basic_reports'],
      userCount: 5,
      createdAt: '2024-01-01'
    },
    {
      id: 6,
      name: 'accountant',
      displayName: 'Accountant',
      description: 'Financial and billing management',
      color: 'secondary',
      permissions: ['billing_manage', 'payments_manage', 'financial_reports'],
      userCount: 3,
      createdAt: '2024-01-01'
    },
    {
      id: 7,
      name: 'pharmacist',
      displayName: 'Pharmacist',
      description: 'Pharmacy and medication management',
      color: 'info',
      permissions: ['pharmacy_manage', 'medications_manage', 'inventory_view'],
      userCount: 2,
      createdAt: '2024-01-01'
    },
    {
      id: 8,
      name: 'patient',
      displayName: 'Patient',
      description: 'Patient portal access',
      color: 'light',
      permissions: ['own_records', 'appointments_view', 'prescriptions_view'],
      userCount: 150,
      createdAt: '2024-01-01'
    }
  ];

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      // For now, use default roles
      // In production, this would fetch from API
      setRoles(defaultRoles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      // toast.error("Failed to fetch roles");
      // Fallback to default roles
      setRoles(defaultRoles);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = () => {
    setFormData({
      name: '',
      description: '',
      permissions: [],
      color: 'primary'
    });
    setShowAddModal(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      color: role.color
    });
    setShowEditModal(true);
  };

  const handleDeleteRole = (role) => {
    if (role.userCount > 0) {
      toast.warning(`Cannot delete role "${role.displayName}" - ${role.userCount} users are assigned to it`);
      return;
    }
    setRoleToDelete(role);
    setShowDeleteModal(true);
  };

  const handleSaveRole = () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (showEditModal && editingRole) {
      // Edit existing role
      setRoles(prevRoles =>
        prevRoles.map(role =>
          role.id === editingRole.id
            ? {
                ...role,
                name: formData.name,
                description: formData.description,
                permissions: formData.permissions,
                color: formData.color
              }
            : role
        )
      );
      toast.success("Role updated successfully!");
      setShowEditModal(false);
      setEditingRole(null);
    } else {
      // Add new role
      const newRole = {
        id: Date.now(),
        name: formData.name,
        displayName: formData.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: formData.description,
        color: formData.color,
        permissions: formData.permissions,
        userCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setRoles(prevRoles => [...prevRoles, newRole]);
      toast.success("Role created successfully!");
      setShowAddModal(false);
    }

    setFormData({
      name: '',
      description: '',
      permissions: [],
      color: 'primary'
    });
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: [],
      color: 'primary'
    });
  };

  const handleConfirmDelete = () => {
    if (roleToDelete) {
      setRoles(prevRoles => prevRoles.filter(role => role.id !== roleToDelete.id));
      toast.success(`Role "${roleToDelete.displayName}" deleted successfully!`);
      setShowDeleteModal(false);
      setRoleToDelete(null);
    }
  };

  const getPermissionLabel = (permission) => {
    const labels = {
      'all': 'All Permissions',
      'clinic_manage': 'Clinic Management',
      'users_manage': 'User Management',
      'reports_view': 'View Reports',
      'settings_manage': 'Settings Management',
      'users_view': 'View Users',
      'basic_settings': 'Basic Settings',
      'patients_manage': 'Patient Management',
      'appointments_manage': 'Appointment Management',
      'prescriptions_manage': 'Prescription Management',
      'patients_view': 'View Patients',
      'basic_reports': 'Basic Reports',
      'billing_manage': 'Billing Management',
      'payments_manage': 'Payment Management',
      'financial_reports': 'Financial Reports',
      'pharmacy_manage': 'Pharmacy Management',
      'medications_manage': 'Medication Management',
      'inventory_view': 'View Inventory',
      'own_records': 'Own Records',
      'appointments_view': 'View Appointments',
      'prescriptions_view': 'View Prescriptions'
    };
    return labels[permission] || permission;
  };

  const colorOptions = [
    { value: 'primary', label: 'Primary (Blue)' },
    { value: 'secondary', label: 'Secondary (Gray)' },
    { value: 'success', label: 'Success (Green)' },
    { value: 'warning', label: 'Warning (Yellow)' },
    { value: 'danger', label: 'Danger (Red)' },
    { value: 'info', label: 'Info (Cyan)' },
    { value: 'light', label: 'Light (Light Gray)' },
    { value: 'dark', label: 'Dark (Black)' }
  ];

  const permissionOptions = [
    { value: 'clinic_manage', label: 'Clinic Management' },
    { value: 'users_manage', label: 'User Management' },
    { value: 'reports_view', label: 'View Reports' },
    { value: 'settings_manage', label: 'Settings Management' },
    { value: 'users_view', label: 'View Users' },
    { value: 'basic_settings', label: 'Basic Settings' },
    { value: 'patients_manage', label: 'Patient Management' },
    { value: 'appointments_manage', label: 'Appointment Management' },
    { value: 'prescriptions_manage', label: 'Prescription Management' },
    { value: 'patients_view', label: 'View Patients' },
    { value: 'basic_reports', label: 'Basic Reports' },
    { value: 'billing_manage', label: 'Billing Management' },
    { value: 'payments_manage', label: 'Payment Management' },
    { value: 'financial_reports', label: 'Financial Reports' },
    { value: 'pharmacy_manage', label: 'Pharmacy Management' },
    { value: 'medications_manage', label: 'Medication Management' },
    { value: 'inventory_view', label: 'View Inventory' }
  ];

  return (
    <>
      <PageHeader>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            {/* Title and subtitle removed */}
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary gap-2" onClick={fetchRoles} disabled={loading}>
              <FiRefreshCw size={16} className={loading ? 'spinner-border spinner-border-sm' : ''} />
              Refresh
            </button>
            <button className="btn btn-primary gap-2" onClick={handleAddRole}>
              <FiPlus size={16} />
              Add Role
            </button>
          </div>
        </div>
        {/* Breadcrumb navigation removed */}
      </PageHeader>

      <div className="main-content">
        <div className="container-fluid">
          {/* Statistics */}
          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <div className="card bg-primary-subtle border-0">
                <div className="card-body text-center">
                  <FiShield className="text-primary mb-2" size={32} />
                  <h3 className="fw-bold text-primary mb-1">{roles.length}</h3>
                  <p className="text-muted mb-0">Total Roles</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success-subtle border-0">
                <div className="card-body text-center">
                  <FiUsers className="text-success mb-2" size={32} />
                  <h3 className="fw-bold text-success mb-1">
                    {roles.reduce((sum, role) => sum + role.userCount, 0)}
                  </h3>
                  <p className="text-muted mb-0">Total Users</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning-subtle border-0">
                <div className="card-body text-center">
                  <FiUser className="text-warning mb-2" size={32} />
                  <h3 className="fw-bold text-warning mb-1">
                    {roles.filter(role => role.userCount === 0).length}
                  </h3>
                  <p className="text-muted mb-0">Unassigned Roles</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-info-subtle border-0">
                <div className="card-body text-center">
                  <FiShield className="text-info mb-2" size={32} />
                  <h3 className="fw-bold text-info mb-1">
                    {roles.filter(role => role.permissions.includes('all')).length}
                  </h3>
                  <p className="text-muted mb-0">Admin Roles</p>
                </div>
              </div>
            </div>
          </div>

          {/* Roles Table */}
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">System Roles</h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Role</th>
                        <th>Description</th>
                        <th>Permissions</th>
                        <th>Users</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map((role) => (
                        <tr key={role.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <span className={`badge bg-${role.color}-subtle text-${role.color}`}>
                                {role.displayName}
                              </span>
                            </div>
                          </td>
                          <td>
                            <p className="mb-0 text-muted">{role.description}</p>
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {role.permissions.includes('all') ? (
                                <span className="badge bg-success-subtle text-success">All Permissions</span>
                              ) : (
                                role.permissions.slice(0, 3).map((permission, index) => (
                                  <span key={index} className="badge bg-light text-dark small">
                                    {getPermissionLabel(permission)}
                                  </span>
                                ))
                              )}
                              {role.permissions.length > 3 && !role.permissions.includes('all') && (
                                <span className="badge bg-secondary-subtle text-secondary">
                                  +{role.permissions.length - 3} more
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-primary-subtle text-primary">
                              {role.userCount} users
                            </span>
                          </td>
                          <td>
                            <small className="text-muted">{role.createdAt}</small>
                          </td>
                          <td>
                            <div className="hstack gap-2">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEditRole(role)}
                                title="Edit Role"
                              >
                                <FiEdit3 size={14} />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteRole(role)}
                                title="Delete Role"
                                disabled={role.userCount > 0}
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Role Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {showEditModal ? 'Edit Role' : 'Add New Role'}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Role Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., clinic_manager"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <small className="text-muted">Use lowercase with underscores (e.g., clinic_manager)</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Display Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Clinic Manager"
                    value={formData.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    disabled
                  />
                  <small className="text-muted">Auto-generated from role name</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Describe what this role can do..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Color</label>
                  <select
                    className="form-select"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  >
                    {colorOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Permissions</label>
                  <div className="row">
                    {permissionOptions.map(permission => (
                      <div key={permission.value} className="col-md-6">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={permission.value}
                            checked={formData.permissions.includes(permission.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  permissions: [...formData.permissions, permission.value]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  permissions: formData.permissions.filter(p => p !== permission.value)
                                });
                              }
                            }}
                          />
                          <label className="form-check-label" htmlFor={permission.value}>
                            {permission.label}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSaveRole}>
                  {showEditModal ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Role"
        message={
          roleToDelete
            ? `Are you sure you want to delete the role "${roleToDelete.displayName}"?\n\nThis action cannot be undone.`
            : "Are you sure you want to delete this role?"
        }
        confirmText="Delete Role"
        cancelText="Cancel"
      />

      <Footer />
    </>
  );
};

export default UserRoles;
