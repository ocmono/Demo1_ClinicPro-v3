import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import Table from '@/components/shared/table/Table';
import { FiPhone, FiMail, FiBriefcase, FiEye, FiEdit3, FiTrash2, FiPlus } from 'react-icons/fi'
import { ClinicTableActions } from './ClinicDesignSystem';
import { useAuth } from "../../contentApi/AuthContext";
import { useAccountant } from "../../context/AccountantContext";
import { toast } from "react-toastify";
import EditAccountantModal from './EditAccountantModal';
import DeleteConfirmationModal from '../../pages/clinic/settings/DeleteConfirmationModal';

const AccountantsTable = () => {
  const { user } = useAuth();
  const { accountants, deleteAccountant, fetchAccountantsFromBackend } = useAccountant();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAccountant, setSelectedAccountant] = useState(null);
  const [accountantToDelete, setAccountantToDelete] = useState(null);
  const navigate = useNavigate();

  // Define roles that can manage accountants (edit/delete)
  const canManageAccountantRoles = ["super_admin", "clinic_admin"];

  useEffect(() => {
    fetchAccountantsFromBackend();
  }, []);
  
  // Check if current user can manage accountants
  const canManageAccountant = user && canManageAccountantRoles.includes(user.role);

  // Transform accountants data to match table structure
  const transformedAccountants = (accountants || []).map((accountant, index) => ({
    id: accountant.id || index + 1,
    name: `${accountant.firstName || ''} ${accountant.lastName || ''}`.trim() || 'Not specified',
    email: accountant.email || 'Not specified',
    phone: accountant.phone || 'Not specified',
    qualification: accountant.accountant_profile?.qualification || 'Not specified',
    experience: accountant.accountant_profile?.experience || '0',
    status: accountant.status ? 'Active' : 'Inactive',
    originalAccountant: accountant // Keep original data for actions
  }));

  const handleEdit = (accountant) => {
    setSelectedAccountant(accountant);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedAccountant(null);
  };

  const handleView = (accountant) => {
    navigate(`/clinic/accountants/view/${accountant.id}`);
  };

  const handleDelete = (accountant) => {
    if (!canManageAccountant) {
      toast.error("You don't have permission to delete accountants");
      return;
    }

    setAccountantToDelete(accountant);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!accountantToDelete) return;

    try {
      await deleteAccountant(accountantToDelete.id);
      toast.success(`${accountantToDelete.name} has been deleted successfully`);
      setIsDeleteModalOpen(false);
      setAccountantToDelete(null);
    } catch (error) {
      toast.error(`Failed to delete ${accountantToDelete.name}`);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setAccountantToDelete(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': { class: 'bg-success', text: 'Active' },
      'Inactive': { class: 'bg-secondary', text: 'Inactive' },
      'On Leave': { class: 'bg-warning', text: 'On Leave' }
    };
    const config = statusConfig[status] || statusConfig['Active'];
    return <span className={`badge ${config.class} small`}>{config.text}</span>;
  };

  const getQualificationBadge = (qualification) => {
    const qualConfig = {
      'CA': { class: 'bg-primary', text: 'CA' },
      'CPA': { class: 'bg-info', text: 'CPA' },
      'ACCA': { class: 'bg-warning', text: 'ACCA' },
      'B.Com': { class: 'bg-success', text: 'B.Com' },
      'M.Com': { class: 'bg-danger', text: 'M.Com' },
      'MBA': { class: 'bg-dark', text: 'MBA' }
    };
    const config = qualConfig[qualification] || { class: 'bg-secondary', text: qualification };
    return <span className={`badge ${config.class} small`}>{config.text}</span>;
  };

  const columns = [
    {
      accessorKey: 'id',
      header: () => 'ID',
      cell: (info) => (
        <span className="badge bg-light text-dark">#{info.getValue()}</span>
      )
    },
    {
      accessorKey: 'name',
      header: () => 'Name',
      cell: (info) => (
        <div className="hstack gap-3">
          <div className="text-white avatar-text user-avatar-text avatar-md bg-primary">
            {info.getValue().substring(0, 1).toUpperCase()}
          </div>
          <div>
            <div className="fw-medium">{info.getValue()}</div>
            <small className="text-muted">Accountant</small>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'email',
      header: () => 'Contact',
      cell: (info) => (
        <div>
          <div className="d-flex align-items-center gap-1 mb-1">
            <FiMail size={12} className="text-muted" />
            <a href={`mailto:${info.getValue()}`} className="text-decoration-none">
              {info.getValue()}
            </a>
          </div>
          <div className="d-flex align-items-center gap-1">
            <FiPhone size={12} className="text-muted" />
            <a href={`tel:${info.row.original.phone}`} className="text-decoration-none">
              {info.row.original.phone}
            </a>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'qualification',
      header: () => 'Qualification',
      cell: (info) => getQualificationBadge(info.getValue())
    },
    {
      accessorKey: 'experience',
      header: () => 'Experience',
      cell: (info) => (
        <div className="text-start">
          <span className="fw-medium">{info.getValue()}</span>
          <div className="small text-muted">years</div>
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: () => 'Status',
      cell: (info) => getStatusBadge(info.getValue())
    },
    {
      accessorKey: 'actions',
      header: () => 'Actions',
      cell: (info) => {
        const accountant = info.row.original.originalAccountant;
        return (
          <div className="hstack gap-2 justify-content-start">
            <button
              className="avatar-text avatar-md"
              title="View"
              onClick={() => handleView(accountant)}
            >
              <FiEye />
            </button>
            <button
              className="avatar-text avatar-md"
              title="Edit"
              onClick={() => handleEdit(accountant)}
            >
              <FiEdit3 />
            </button>
            {/* {canManageAccountant && (
              <button
                className="avatar-text avatar-md"
                title="Delete"
                onClick={() => handleDelete(accountant)}
              >
                <FiTrash2 />
              </button>
            )} */}
          </div>
        );
      },
      meta: { headerClassName: 'text-end' },
    },
  ];

  // Add loading state if accountants data is not yet available
  if (!accountants) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Loading accountants...</p>
      </div>
    );
  }

  return (
    <div className="accountants-table">
      <Table
        data={transformedAccountants}
        columns={columns}
        showPrint={false}
        cardHeader={<h5 class="card-title mb-0">Accountants List</h5>}
        emptyMessage={
          <div className="text-center py-4">
            <div className="text-muted mb-2">
              <FiBriefcase size={32} className="opacity-50" />
            </div>
            <h6 className="text-muted">No accountants found</h6>
            <p className="text-muted small mb-3">Get started by adding your first accountant</p>
            <div className='d-flex align-items-center justify-content-center'>
            <button
              className="btn btn-primary btn-sm"
                onClick={() => navigate('/users/add')}
            >
                <FiPlus size={14} className="me-1" />
              Add First Accountant
              </button>
            </div>
          </div>
        }
        loading={false}
      />
      <EditAccountantModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        accountant={selectedAccountant}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Accountant"
        message={accountantToDelete ? `Are you sure you want to delete ${accountantToDelete.first_name} ${accountantToDelete.last_name}? This action cannot be undone.` : ''}
      />
    </div>
  );
};

export default AccountantsTable; 