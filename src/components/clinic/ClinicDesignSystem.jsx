import React from 'react';
import { FiArrowLeft, FiSave, FiX, FiPlus, FiEdit3, FiTrash2, FiEye, FiShield, FiRefreshCw, FiPrinter, FiDownload } from 'react-icons/fi';

// Standard color scheme for clinic modules
export const clinicColors = {
  primary: 'primary',
  secondary: 'secondary', 
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
  light: 'light',
  dark: 'dark'
};

// Standard badge colors for different roles/statuses
export const getRoleBadgeColor = (role) => {
  const roleColors = {
    'super_admin': 'danger',
    'clinic_admin': 'warning',
    'admin': 'info',
    'doctor': 'primary',
    'receptionist': 'success',
    'accountant': 'secondary',
    'pharmacist': 'info',
    'patient': 'dark'
  };
  return roleColors[role] || 'secondary';
};

export const getStatusBadgeColor = (status) => {
  // Normalize to string
  const normalized = typeof status === "string" ? status.toLowerCase() : "";

  switch (normalized) {
    case "active":
      return "success";
    case "inactive":
      return "secondary";
    case "pending":
      return "warning";
    case "suspended":
      return "danger";
    default:
      return "secondary"; // fallback
  }
};

// Standard page header component
export const ClinicPageHeader = ({ 
  title, 
  subtitle, 
  stats = [], 
  backButton = false, 
  onBack,
  children 
}) => {
  return (
    <div className="d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center gap-3">
        {backButton && (
          <button 
            className="btn btn-icon btn-light"
            onClick={onBack}
            title="Go Back"
          >
            <FiArrowLeft size={16} />
          </button>
        )}
        <div>
          <h4 className="mb-1 fw-bold">{title}</h4>
          <p className="text-muted mb-0">{subtitle}</p>
        </div>
      </div>
      <div className="d-flex align-items-center gap-2">
        {stats.map((stat, index) => (
          <span key={index} className={`badge bg-${stat.color}-subtle text-${stat.color}`}>
            {stat.value} {stat.label}
          </span>
        ))}
        {children}
      </div>
    </div>
  );
};

// Standard tab navigation component
export const ClinicTabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <ul className="nav nav-tabs nav-tabs-custom-style card-header-tabs">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        return (
          <li className="nav-item" key={tab.id}>
            <button
              className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <IconComponent size={16} className="me-2" />
              {tab.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
};

// Standard statistics cards component
export const ClinicStatsCards = ({ stats }) => {
  return (
    <div className="row g-4">
      {stats.map((stat, index) => (
        <div key={index} className="col-md-3">
          <div className={`card bg-${stat.color}-subtle border-0`}>
            <div className="card-body text-center">
              <h3 className={`fw-bold text-${stat.color} mb-1`}>{stat.value}</h3>
              <p className="text-muted mb-0">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Standard action buttons component
export const ClinicActionButtons = ({ 
  onSave, 
  onCancel, 
  onDelete, 
  onEdit, 
  onView, 
  onRoleChange,
  loading = false,
  saveText = 'Save',
  cancelText = 'Cancel',
  deleteText = 'Delete',
  editText = 'Edit',
  viewText = 'View',
  roleText = 'Change Role',
  showSave = true,
  showCancel = true,
  showDelete = false,
  showEdit = false,
  showView = false,
  showRoleChange = false,
  disabled = false
}) => {
  return (
    <div className="d-flex justify-content-end gap-2">
      {showCancel && (
        <button 
          type="button" 
          className="btn btn-outline-secondary"
          onClick={onCancel}
          disabled={loading || disabled}
        >
          <FiX size={16} className='me-2' />
          {cancelText}
        </button>
      )}
      
      {showView && (
        <button 
          type="button" 
          className="btn btn-outline-info"
          onClick={onView}
          disabled={loading || disabled}
        >
          <FiEye size={16} className='me-2' />
          {viewText}
        </button>
      )}
      
      {showEdit && (
        <button 
          type="button" 
          className="btn btn-outline-primary"
          onClick={onEdit}
          disabled={loading || disabled}
        >
          <FiEdit3 size={16} className='me-2' />
          {editText}
        </button>
      )}
      
      {showRoleChange && (
        <button 
          type="button" 
          className="btn btn-outline-warning"
          onClick={onRoleChange}
          disabled={loading || disabled}
        >
          <FiShield size={16} className='me-2' />
          {roleText}
        </button>
      )}
      
      {showDelete && (
        <button 
          type="button" 
          className="btn btn-outline-danger"
          onClick={onDelete}
          disabled={loading || disabled}
        >
          <FiTrash2 size={16} className='me-2' />
          {deleteText}
        </button>
      )}
      
      {showSave && (
        <button 
          type="submit" 
          className="btn btn-primary"
          onClick={onSave}
          disabled={loading || disabled}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Saving...
            </>
          ) : (
            <>
              <FiSave size={16} className='me-2' />
              {saveText}
            </>
          )}
        </button>
      )}
    </div>
  );
};

// Standard form actions component
export const ClinicFormActions = ({ 
  onSave, 
  onCancel, 
  loading = false, 
  saveText = 'Save',
  cancelText = 'Cancel',
  disabled = false 
}) => {
  return (
    <div className="form-actions d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
      <button 
        type="button" 
        className="btn btn-outline-secondary"
        onClick={onCancel}
        disabled={loading || disabled}
      >
        <FiX size={16} className='me-2' />
        {cancelText}
      </button>
      <button 
        type="submit" 
        className="btn btn-primary"
        onClick={onSave}
        disabled={loading || disabled}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" />
            Saving...
          </>
        ) : (
          <>
            <FiSave size={16} className='me-2' />
            {saveText}
          </>
        )}
      </button>
    </div>
  );
};

// Standard filter component
export const ClinicFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  showClearButton = false 
}) => {
  return (
    <div className="row g-3 mb-4">
      {filters.map((filter, index) => (
        <div key={index} className={`col-md-6 col-lg-${filter.size || 4}`}>
          <label className="form-label fw-medium">
            {filter.icon && <filter.icon size={14} className="me-1" />}
            {filter.label}
          </label>
          <select 
            className="form-select"
            value={filter.value}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
          >
            {filter.options.map((option, optIndex) => (
              <option key={optIndex} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
      
      {showClearButton && (
        <div className="col-md-12 col-lg-4">
          <label className="form-label fw-medium text-muted">Actions</label>
          <div className="d-flex align-items-center gap-2">
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={onClearFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Standard empty state component
export const ClinicEmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionText, 
  onAction,
  showAction = true 
}) => {
  return (
    <div className="text-center py-4">
      <div className="text-muted mb-2">
        <Icon size={32} className="opacity-50" />
      </div>
      <h6 className="text-muted">{title}</h6>
      <p className="text-muted small mb-3">{description}</p>
      {showAction && (
        <div className='d-flex align-items-center justify-content-center'>
        <button
          className="btn btn-primary btn-sm"
          onClick={onAction}
        >
          <FiPlus size={14} className="me-1" />
          {actionText}
          </button>
        </div>
      )}
    </div>
  );
};

// Standard loading state component
export const ClinicLoadingState = ({ message = 'Loading...' }) => {
  return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2 text-muted">{message}</p>
    </div>
  );
};

// Standard card wrapper component
export const ClinicCard = ({ 
  children, 
  title, 
  subtitle, 
  icon: Icon, 
  color = 'primary',
  className = '',
  headerClassName = '',
  bodyClassName = 'p-4'
}) => {
  return (
    <div className={`card shadow-sm ${className}`}>
      {(title || subtitle || Icon) && (
        <div className={`card-header bg-light border-bottom ${headerClassName}`}>
          <div className="d-flex align-items-center">
            {Icon && (
              <div className={`avatar-text user-avatar-text avatar-lg me-3 bg-${color}`}>
                <Icon size={24} className="text-white" />
              </div>
            )}
            <div>
              {title && <h5 className="mb-1 fw-bold">{title}</h5>}
              {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}
      <div className={`card-body ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

// Standard form field component
export const ClinicFormField = ({ 
  label, 
  required = false, 
  children, 
  className = '',
  labelClassName = 'fw-medium'
}) => {
  return (
    <div className={className}>
      <label className={`form-label ${labelClassName}`}>
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
    </div>
  );
};

// Standard table action icons component
export const ClinicTableActions = ({ 
  onView, 
  onEdit, 
  onDelete, 
  onPrint, 
  onDownload,
  onRoleChange,
  item,
  loading = false,
  showView = true,
  showEdit = true,
  showDelete = false,
  showPrint = false,
  showDownload = false,
  showRoleChange = false,
  disabled = false
}) => {
  return (
    <div className="hstack gap-1 justify-content-end">
      {showView && onView && (
        <button
          className="btn btn-sm btn-icon btn-light"
          title="View Details"
          onClick={() => onView(item)}
          disabled={loading || disabled}
        >
          <FiEye size={14} />
        </button>
      )}
      
      {showEdit && onEdit && (
        <button
          className="btn btn-sm btn-icon btn-light"
          title="Edit"
          onClick={() => onEdit(item)}
          disabled={loading || disabled}
        >
          <FiEdit3 size={14} />
        </button>
      )}
      
      {showRoleChange && onRoleChange && (
        <button
          className="btn btn-sm btn-icon btn-light"
          title="Change Role"
          onClick={() => onRoleChange(item)}
          disabled={loading || disabled}
        >
          <FiShield size={14} />
        </button>
      )}
      
      {showPrint && onPrint && (
        <button
          className="btn btn-sm btn-icon btn-light"
          title="Print"
          onClick={() => onPrint(item)}
          disabled={loading || disabled}
        >
          <FiPrinter size={14} />
        </button>
      )}
      
      {showDownload && onDownload && (
        <button
          className="btn btn-sm btn-icon btn-light"
          title="Download"
          onClick={() => onDownload(item)}
          disabled={loading || disabled}
        >
          <FiDownload size={14} />
        </button>
      )}
      
      {showDelete && onDelete && (
        <button
          className="btn btn-sm btn-icon btn-light"
          title="Delete"
          onClick={() => onDelete(item)}
          disabled={loading || disabled}
        >
          <FiTrash2 size={14} />
        </button>
      )}
    </div>
  );
};

// Export all components
export default {
  clinicColors,
  getRoleBadgeColor,
  getStatusBadgeColor,
  ClinicPageHeader,
  ClinicTabNavigation,
  ClinicStatsCards,
  ClinicActionButtons,
  ClinicFormActions,
  ClinicFilters,
  ClinicEmptyState,
  ClinicLoadingState,
  ClinicCard,
  ClinicFormField,
  ClinicTableActions
}; 