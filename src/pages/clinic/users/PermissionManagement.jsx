import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiShield, FiUser, FiEdit3, FiSave, FiX, FiRefreshCw, FiUsers, FiCheck, FiLock, FiUnlock, FiEye, FiEyeOff } from "react-icons/fi";
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import { toast } from "react-toastify";
import DeleteConfirmationModal from '../settings/DeleteConfirmationModal';

const PermissionManagement = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [permissionChanges, setPermissionChanges] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const navigate = useNavigate();

  // Comprehensive permission categories for clinic system
  const permissionCategories = [
    {
      name: 'System Management',
      icon: FiShield,
      permissions: [
        { key: 'system_access', label: 'System Access', description: 'Access to the main system' },
        { key: 'system_settings', label: 'System Settings', description: 'Modify system-wide settings' },
        { key: 'backup_restore', label: 'Backup & Restore', description: 'System backup and restoration' },
        { key: 'system_logs', label: 'System Logs', description: 'View system activity logs' }
      ]
    },
    {
      name: 'User Management',
      icon: FiUsers,
      permissions: [
        { key: 'users_view', label: 'View Users', description: 'See list of all users' },
        { key: 'users_create', label: 'Create Users', description: 'Add new users to the system' },
        { key: 'users_edit', label: 'Edit Users', description: 'Modify existing user information' },
        { key: 'users_delete', label: 'Delete Users', description: 'Remove users from the system' },
        { key: 'users_roles', label: 'Manage Roles', description: 'Assign and modify user roles' },
        { key: 'users_permissions', label: 'Manage Permissions', description: 'Control user access rights' }
      ]
    },
    {
      name: 'Clinic Management',
      icon: FiShield,
      permissions: [
        { key: 'clinic_info', label: 'Clinic Information', description: 'View clinic details' },
        { key: 'clinic_edit', label: 'Edit Clinic', description: 'Modify clinic information' },
        { key: 'clinic_settings', label: 'Clinic Settings', description: 'Configure clinic preferences' },
        { key: 'clinic_branches', label: 'Manage Branches', description: 'Handle multiple clinic locations' }
      ]
    },
    {
      name: 'Patient Management',
      icon: FiUser,
      permissions: [
        { key: 'patients_view', label: 'View Patients', description: 'See patient information' },
        { key: 'patients_create', label: 'Create Patients', description: 'Add new patients' },
        { key: 'patients_edit', label: 'Edit Patients', description: 'Modify patient records' },
        { key: 'patients_delete', label: 'Delete Patients', description: 'Remove patient records' },
        { key: 'patients_medical_history', label: 'Medical History', description: 'Access patient medical history' },
        { key: 'patients_files', label: 'Patient Files', description: 'Manage patient documents' }
      ]
    },
    {
      name: 'Appointment Management',
      icon: FiUsers,
      permissions: [
        { key: 'appointments_view', label: 'View Appointments', description: 'See appointment schedule' },
        { key: 'appointments_create', label: 'Create Appointments', description: 'Schedule new appointments' },
        { key: 'appointments_edit', label: 'Edit Appointments', description: 'Modify appointment details' },
        { key: 'appointments_cancel', label: 'Cancel Appointments', description: 'Cancel scheduled appointments' },
        { key: 'appointments_reschedule', label: 'Reschedule Appointments', description: 'Change appointment times' },
        { key: 'appointments_reminders', label: 'Appointment Reminders', description: 'Manage appointment notifications' }
      ]
    },
    {
      name: 'Medical Records',
      icon: FiShield,
      permissions: [
        { key: 'prescriptions_view', label: 'View Prescriptions', description: 'See prescription information' },
        { key: 'prescriptions_create', label: 'Create Prescriptions', description: 'Write new prescriptions' },
        { key: 'prescriptions_edit', label: 'Edit Prescriptions', description: 'Modify existing prescriptions' },
        { key: 'prescriptions_delete', label: 'Delete Prescriptions', description: 'Remove prescriptions' },
        { key: 'medical_notes', label: 'Medical Notes', description: 'Create and view medical notes' },
        { key: 'lab_results', label: 'Lab Results', description: 'Access laboratory test results' }
      ]
    },
    {
      name: 'Financial Management',
      icon: FiUsers,
      permissions: [
        { key: 'billing_view', label: 'View Billing', description: 'See billing information' },
        { key: 'billing_create', label: 'Create Bills', description: 'Generate new bills' },
        { key: 'billing_edit', label: 'Edit Bills', description: 'Modify billing details' },
        { key: 'billing_delete', label: 'Delete Bills', description: 'Remove billing records' },
        { key: 'payments_view', label: 'View Payments', description: 'See payment records' },
        { key: 'payments_process', label: 'Process Payments', description: 'Handle payment transactions' },
        { key: 'financial_reports', label: 'Financial Reports', description: 'Generate financial reports' }
      ]
    },
    {
      name: 'Inventory Management',
      icon: FiShield,
      permissions: [
        { key: 'inventory_view', label: 'View Inventory', description: 'See inventory items' },
        { key: 'inventory_create', label: 'Create Items', description: 'Add new inventory items' },
        { key: 'inventory_edit', label: 'Edit Items', description: 'Modify inventory details' },
        { key: 'inventory_delete', label: 'Delete Items', description: 'Remove inventory items' },
        { key: 'inventory_stock', label: 'Stock Management', description: 'Manage stock levels' },
        { key: 'inventory_reports', label: 'Inventory Reports', description: 'Generate inventory reports' }
      ]
    },
    {
      name: 'Pharmacy Management',
      icon: FiShield,
      permissions: [
        { key: 'pharmacy_view', label: 'View Pharmacy', description: 'Access pharmacy information' },
        { key: 'pharmacy_medications', label: 'Manage Medications', description: 'Handle medication inventory' },
        { key: 'pharmacy_prescriptions', label: 'Pharmacy Prescriptions', description: 'Process pharmacy prescriptions' },
        { key: 'pharmacy_sales', label: 'Pharmacy Sales', description: 'Handle pharmacy transactions' },
        { key: 'pharmacy_reports', label: 'Pharmacy Reports', description: 'Generate pharmacy reports' }
      ]
    },
    {
      name: 'Reporting & Analytics',
      icon: FiUsers,
      permissions: [
        { key: 'reports_view', label: 'View Reports', description: 'Access available reports' },
        { key: 'reports_generate', label: 'Generate Reports', description: 'Create new reports' },
        { key: 'reports_export', label: 'Export Reports', description: 'Download reports in various formats' },
        { key: 'analytics_view', label: 'View Analytics', description: 'Access analytics dashboard' },
        { key: 'analytics_export', label: 'Export Analytics', description: 'Download analytics data' }
      ]
    },
    {
      name: 'Communication',
      icon: FiUsers,
      permissions: [
        { key: 'notifications_view', label: 'View Notifications', description: 'See system notifications' },
        { key: 'notifications_send', label: 'Send Notifications', description: 'Send notifications to users' },
        { key: 'emails_view', label: 'View Emails', description: 'Access email communications' },
        { key: 'emails_send', label: 'Send Emails', description: 'Send emails to patients/users' },
        { key: 'sms_view', label: 'View SMS', description: 'Access SMS communications' },
        { key: 'sms_send', label: 'Send SMS', description: 'Send SMS messages' }
      ]
    }
  ];

  // Default roles with comprehensive permissions
  const defaultRoles = [
    {
      id: 1,
      name: 'super_admin',
      displayName: 'Super Admin',
      description: 'Full system access and control',
      color: 'danger',
      permissions: permissionCategories.flatMap(cat => cat.permissions.map(p => p.key)),
      userCount: 1,
      createdAt: '2024-01-01'
    },
    {
      id: 2,
      name: 'clinic_admin',
      displayName: 'Clinic Admin',
      description: 'Clinic-wide management and settings',
      color: 'warning',
      permissions: [
        'system_access', 'clinic_info', 'clinic_edit', 'clinic_settings',
        'users_view', 'users_create', 'users_edit', 'users_roles',
        'patients_view', 'patients_create', 'patients_edit', 'patients_medical_history',
        'appointments_view', 'appointments_create', 'appointments_edit', 'appointments_cancel',
        'prescriptions_view', 'prescriptions_create', 'prescriptions_edit',
        'billing_view', 'billing_create', 'billing_edit', 'payments_view', 'payments_process',
        'inventory_view', 'inventory_create', 'inventory_edit', 'inventory_stock',
        'pharmacy_view', 'pharmacy_medications', 'pharmacy_prescriptions',
        'reports_view', 'reports_generate', 'analytics_view',
        'notifications_view', 'notifications_send', 'emails_view', 'emails_send'
      ],
      userCount: 2,
      createdAt: '2024-01-01'
    },
    {
      id: 3,
      name: 'admin',
      displayName: 'Admin',
      description: 'General administrative tasks',
      color: 'info',
      permissions: [
        'system_access', 'clinic_info',
        'users_view', 'users_create', 'users_edit',
        'patients_view', 'patients_create', 'patients_edit',
        'appointments_view', 'appointments_create', 'appointments_edit',
        'prescriptions_view', 'prescriptions_create', 'prescriptions_edit',
        'billing_view', 'billing_create', 'payments_view',
        'inventory_view', 'inventory_create', 'inventory_edit',
        'reports_view', 'reports_generate',
        'notifications_view', 'emails_view'
      ],
      userCount: 3,
      createdAt: '2024-01-01'
    },
    {
      id: 4,
      name: 'doctor',
      displayName: 'Doctor',
      description: 'Medical staff with patient access',
      color: 'primary',
      permissions: [
        'system_access', 'clinic_info',
        'patients_view', 'patients_create', 'patients_edit', 'patients_medical_history',
        'appointments_view', 'appointments_create', 'appointments_edit', 'appointments_cancel',
        'prescriptions_view', 'prescriptions_create', 'prescriptions_edit',
        'medical_notes', 'lab_results',
        'reports_view',
        'notifications_view', 'emails_view'
      ],
      userCount: 8,
      createdAt: '2024-01-01'
    },
    {
      id: 5,
      name: 'receptionist',
      displayName: 'Receptionist',
      description: 'Front desk and patient coordination',
      color: 'success',
      permissions: [
        'system_access', 'clinic_info',
        'patients_view', 'patients_create', 'patients_edit',
        'appointments_view', 'appointments_create', 'appointments_edit', 'appointments_cancel',
        'appointments_reschedule', 'appointments_reminders',
        'billing_view', 'billing_create',
        'reports_view',
        'notifications_view', 'emails_view', 'sms_view', 'sms_send'
      ],
      userCount: 5,
      createdAt: '2024-01-01'
    },
    {
      id: 6,
      name: 'accountant',
      displayName: 'Accountant',
      description: 'Financial and billing management',
      color: 'secondary',
      permissions: [
        'system_access', 'clinic_info',
        'billing_view', 'billing_create', 'billing_edit', 'billing_delete',
        'payments_view', 'payments_process',
        'financial_reports',
        'reports_view', 'reports_generate', 'reports_export',
        'notifications_view'
      ],
      userCount: 3,
      createdAt: '2024-01-01'
    },
    {
      id: 7,
      name: 'pharmacist',
      displayName: 'Pharmacist',
      description: 'Pharmacy and medication management',
      color: 'info',
      permissions: [
        'system_access', 'clinic_info',
        'pharmacy_view', 'pharmacy_medications', 'pharmacy_prescriptions',
        'pharmacy_sales', 'pharmacy_reports',
        'inventory_view', 'inventory_stock',
        'reports_view', 'reports_generate',
        'notifications_view'
      ],
      userCount: 2,
      createdAt: '2024-01-01'
    },
    {
      id: 8,
      name: 'patient',
      displayName: 'Patient',
      description: 'Patient portal access',
      color: 'light',
      permissions: [
        'system_access',
        'own_records', 'appointments_view', 'prescriptions_view',
        'notifications_view', 'emails_view'
      ],
      userCount: 150,
      createdAt: '2024-01-01'
    }
  ];

  useEffect(() => {
    fetchRoles();
    initializePermissions();
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
      setRoles(defaultRoles);
    } finally {
      setLoading(false);
    }
  };

  const initializePermissions = () => {
    const allPermissions = permissionCategories.flatMap(cat => cat.permissions);
    setPermissions(allPermissions);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setPermissionChanges({});
    setHasUnsavedChanges(false);
  };

  const handlePermissionChange = (permissionKey, isChecked) => {
    if (!editingRole) return;

    const currentPermissions = editingRole.permissions || [];
    let newPermissions;

    if (isChecked) {
      newPermissions = [...currentPermissions, permissionKey];
    } else {
      newPermissions = currentPermissions.filter(p => p !== permissionKey);
    }

    const updatedRole = { ...editingRole, permissions: newPermissions };
    setEditingRole(updatedRole);
    
    // Track changes
    setPermissionChanges(prev => ({
      ...prev,
      [permissionKey]: isChecked
    }));
    setHasUnsavedChanges(true);
  };

  const handleSavePermissions = async () => {
    if (!editingRole) return;

    try {
      // Here you would make an API call to update the role permissions
      console.log('Updating role permissions:', editingRole);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setRoles(prevRoles =>
        prevRoles.map(role =>
          role.id === editingRole.id ? editingRole : role
        )
      );
      
      toast.success(`Permissions updated for ${editingRole.displayName}`);
      setEditingRole(null);
      setPermissionChanges({});
      setHasUnsavedChanges(false);
    } catch (error) {
      console.log('Failed to update permissions');
      // toast.error('Failed to update permissions');
    }
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        setEditingRole(null);
        setPermissionChanges({});
        setHasUnsavedChanges(false);
      }
    } else {
      setEditingRole(null);
      setPermissionChanges({});
      setHasUnsavedChanges(false);
    }
  };

  const handleDeleteRole = (role) => {
    if (role.userCount > 0) {
      toast.warning(`Cannot delete role "${role.displayName}" - ${role.userCount} users are assigned to it`);
      return;
    }
    setRoleToDelete(role);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (roleToDelete) {
      setRoles(prevRoles => prevRoles.filter(role => role.id !== roleToDelete.id));
      toast.success(`Role "${roleToDelete.displayName}" deleted successfully!`);
      setShowDeleteModal(false);
      setRoleToDelete(null);
    }
  };

  const getPermissionStatus = (role, permissionKey) => {
    if (!role || !role.permissions) return false;
    return role.permissions.includes(permissionKey);
  };

  const getPermissionCount = (role) => {
    if (!role || !role.permissions) return 0;
    return role.permissions.length;
  };

  const getTotalPermissions = () => {
    return permissions.length;
  };

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
              <div className="card bg-info-subtle border-0">
                <div className="card-body text-center">
                  <FiLock className="text-info mb-2" size={32} />
                  <h3 className="fw-bold text-info mb-1">{getTotalPermissions()}</h3>
                  <p className="text-muted mb-0">Total Permissions</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning-subtle border-0">
                <div className="card-body text-center">
                  <FiShield className="text-warning mb-2" size={32} />
                  <h3 className="fw-bold text-warning mb-1">
                    {roles.filter(role => role.permissions.includes('system_access')).length}
                  </h3>
                  <p className="text-muted mb-0">Active Roles</p>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Roles List */}
            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">System Roles</h5>
                </div>
                <div className="card-body p-0">
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {roles.map((role) => (
                        <div
                          key={role.id}
                          className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                            editingRole?.id === role.id ? 'active' : ''
                          }`}
                          onClick={() => handleEditRole(role)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <span className={`badge bg-${role.color}-subtle text-${role.color}`}>
                              {role.displayName}
                            </span>
                            <small className="text-muted">({role.userCount} users)</small>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-light text-dark">
                              {getPermissionCount(role)}/{getTotalPermissions()}
                            </span>
                            {editingRole?.id === role.id && (
                              <FiEdit3 size={14} className="text-primary" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Permission Management */}
            <div className="col-md-8">
              {editingRole ? (
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="card-title mb-0">
                        Managing Permissions: {editingRole.displayName}
                      </h5>
                      <small className="text-muted">
                        {getPermissionCount(editingRole)}/{getTotalPermissions()} permissions assigned
                      </small>
                    </div>
                    <div className="d-flex gap-2">
                      {hasUnsavedChanges && (
                        <span className="badge bg-warning">Unsaved Changes</span>
                      )}
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={handleCancelEdit}
                      >
                        <FiX size={14} />
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={handleSavePermissions}
                        disabled={!hasUnsavedChanges}
                      >
                        <FiSave size={14} />
                        Save Changes
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      {permissionCategories.map((category) => (
                        <div key={category.name} className="col-md-6 mb-4">
                          <div className="card border">
                            <div className="card-header bg-light">
                              <h6 className="mb-0 d-flex align-items-center gap-2">
                                <category.icon size={16} />
                                {category.name}
                              </h6>
                            </div>
                            <div className="card-body">
                              {category.permissions.map((permission) => (
                                <div key={permission.key} className="mb-3">
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id={`${editingRole.id}-${permission.key}`}
                                      checked={getPermissionStatus(editingRole, permission.key)}
                                      onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor={`${editingRole.id}-${permission.key}`}
                                    >
                                      <div className="fw-semibold">{permission.label}</div>
                                      <small className="text-muted">{permission.description}</small>
                                    </label>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card">
                  <div className="card-body text-center py-5">
                    <FiShield size={48} className="text-muted mb-3" />
                    <h5 className="text-muted">Select a Role to Manage Permissions</h5>
                    <p className="text-muted mb-0">
                      Click on any role from the left panel to start managing its permissions
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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

export default PermissionManagement;
