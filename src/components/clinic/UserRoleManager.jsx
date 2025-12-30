import React, { useState } from 'react';
import { FiUser, FiShield, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

const UserRoleManager = ({ user, onRoleUpdate, onClose }) => {
  const [selectedRole, setSelectedRole] = useState(user.role || '');
  const [loading, setLoading] = useState(false);

  const roles = [
    { value: 'super_admin', label: 'Super Admin', color: 'danger' },
    { value: 'clinic_admin', label: 'Clinic Admin', color: 'warning' },
    { value: 'admin', label: 'Admin', color: 'info' },
    { value: 'doctor', label: 'Doctor', color: 'primary' },
    { value: 'receptionist', label: 'Receptionist', color: 'success' },
    { value: 'accountant', label: 'Accountant', color: 'secondary' },
    { value: 'pharmacist', label: 'Pharmacist', color: 'info' },
    { value: 'patient', label: 'Patient', color: 'light' }
  ];

  const handleRoleChange = async () => {
    if (!selectedRole || selectedRole === user.role) {
      onClose();
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`https://bkdemo1.clinicpro.cc/users/assign-role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: parseInt(user.id),
          new_role: selectedRole
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Role updated to ${selectedRole.replace('_', ' ')}`);
        
        // Update local state
        if (onRoleUpdate) {
          onRoleUpdate({ ...user, role: selectedRole });
        }
        
        onClose();
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || errorData.detail || 'Failed to update role';
        console.log(errorMessage)
      }
    } catch (error) {
      console.error('Role update error:', error);
      if (user.role === "super_admin") {
        toast.error('Failed to update user role');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    const roleConfig = roles.find(r => r.value === role);
    return roleConfig ? roleConfig.color : 'secondary';
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <FiShield className="me-2" />
              Manage User Role
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              disabled={loading}
            />
          </div>
          
          <div className="modal-body">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="text-white avatar-text user-avatar-text avatar-lg bg-primary">
                <FiUser size={24} />
              </div>
              <div>
                <h6 className="mb-1 fw-bold">
                  {user.first_name} {user.last_name}
                </h6>
                <p className="text-muted mb-0">{user.email}</p>
                <span className={`badge bg-${getRoleBadgeColor(user.role)} small`}>
                  Current: {user.role?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label fw-medium">Select New Role</label>
              <select
                className="form-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={loading}
              >
                <option value="">Choose a role...</option>
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            {selectedRole && selectedRole !== user.role && (
              <div className="alert alert-info mt-3">
                <div className="d-flex align-items-center gap-2">
                  <FiShield size={16} />
                  <strong>Role Change:</strong> {user.role?.replace('_', ' ')} → {selectedRole.replace('_', ' ')}
                </div>
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-outline-secondary"
              onClick={onClose}
              disabled={loading}
            >
              <FiX size={16} className="me-2" />
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleRoleChange}
              disabled={loading || !selectedRole || selectedRole === user.role}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Updating...
                </>
              ) : (
                <>
                  <FiCheck size={16} className="me-2" />
                  Update Role
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRoleManager; 