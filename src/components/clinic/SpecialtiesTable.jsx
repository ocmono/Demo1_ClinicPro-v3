import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Table from '@/components/shared/table/Table';
import { FiActivity, FiEye, FiEdit3, FiTrash2 } from 'react-icons/fi'
import { useAuth } from "../../contentApi/AuthContext";
import { useClinicManagement } from "../../contentApi/ClinicMnanagementProvider";
import { toast } from "react-toastify";
import { ClinicEmptyState } from './ClinicDesignSystem';

const SpecialtiesTable = ({ onEditClick, onDeleteClick }) => {
  const { user } = useAuth();
  const { clinicSpecialities, removeSpeciality } = useClinicManagement();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Define roles that can see actions
  const canSeeActionsRoles = ["super_admin", "clinic_admin", "doctor", "receptionist"];

  // Define roles that can manage specialties (edit/delete)
  const canManageSpecialtyRoles = ["super_admin", "clinic_admin"];

  // Check permissions
  const canSeeActions = user && canSeeActionsRoles.includes(user.role);
  const canManageSpecialty = user && canManageSpecialtyRoles.includes(user.role);

  // Transform specialties data to match table structure
  const transformedSpecialties = clinicSpecialities.map((specialty, index) => ({
    id: specialty.id || index + 1,
    name: specialty.speciality || 'Not specified',
    category: specialty.category || 'Medical',
    description: specialty.description || 'No description available',
    appointmentDuration: specialty.appointmentDuration || '30',
    doctorCount: specialty.doctorCount || 0,
    status: specialty.status || 'Active',
    createdAt: specialty.createdAt || 'Unknown',
    originalSpecialty: specialty // Keep original data for actions
  }));

  const handleEdit = (specialty) => {
    console.log("Edit clicked for specialty:", specialty);
    if (onEditClick) {
      onEditClick(specialty);
    } else {
      navigate(`/clinic/specialities/edit/${specialty.id}`);
    }
  };

  const handleView = (specialty) => {
    console.log("View clicked for specialty:", specialty);
    navigate(`/clinic/specialities/view/${specialty.id}`);
  };

  const handleDelete = (specialty) => {
    console.log("Delete clicked for specialty:", specialty);
    if (onDeleteClick) {
      onDeleteClick(specialty);
    } else {
    // Fallback to window.confirm if no modal handler provided
      if (window.confirm(`Are you sure you want to delete ${specialty.speciality}? This action cannot be undone.`)) {
        deleteSpecialty(specialty);
      }
    }
  };

  const deleteSpecialty = async (specialty) => {
    try {
      await removeSpeciality(specialty);
      toast.success(`${specialty.speciality} deleted successfully!`);
    } catch (error) {
      if (user.role === "super_admin") {
        toast.error(`Failed to delete ${specialty.speciality}`);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': { class: 'bg-success', text: 'Active' },
      'Inactive': { class: 'bg-secondary', text: 'Inactive' },
      'Pending': { class: 'bg-warning', text: 'Pending' }
    };
    const config = statusConfig[status] || statusConfig['Active'];
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
      header: () => 'Specialty Name',
      cell: (info) => {
        const name = String(info.getValue() || 'N');
        return (
          <div className="hstack gap-3">
            <div className="text-white avatar-text user-avatar-text avatar-md bg-primary">
              {name.substring(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="fw-medium">{name}</div>
              <small className="text-muted">{info.row.original.category} Specialty</small>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'category',
      header: () => 'Category',
      cell: (info) => (
        <div>
          <span className="badge bg-light text-dark fw-medium">
            {info.getValue()}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'appointmentDuration',
      header: () => 'Duration',
      cell: (info) => (
        <div className="text-start">
          <span className="fw-medium">{info.getValue()}</span>
          <div className="small text-muted">minutes</div>
        </div>
      )
    },
    {
      accessorKey: 'doctorCount',
      header: () => 'Doctors',
      cell: (info) => (
        <div className="text-start">
          <span className="fw-medium">{info.getValue()}</span>
          <div className="small text-muted">Assigned</div>
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: () => 'Status',
      cell: (info) => getStatusBadge(info.getValue())
    },
    {
      accessorKey: 'createdAt',
      header: () => 'Created',
      cell: (info) => (
        <div className="text-muted small">
          {info.getValue()}
        </div>
      )
    },
    {
      accessorKey: 'actions',
      header: () => 'Actions',
      cell: (info) => {
        const specialty = info.row.original.originalSpecialty;
        return (
          <div className="hstack gap-2">
              <button
                className="avatar-text avatar-md"
                title="View"
                onClick={() => handleView(specialty)}
              >
                <FiEye />
            </button>
            {canManageSpecialty && (
              <button
                className="avatar-text avatar-md"
                title="Edit"
                onClick={() => handleEdit(specialty)}
              >
                <FiEdit3 />
              </button>
            )}
            {canManageSpecialty && (
              <button
                className="avatar-text avatar-md"
                title="Delete"
                onClick={() => handleDelete(specialty)}
              >
                <FiTrash2 />
              </button>
            )}
          </div>
        );
      },
      meta: { headerClassName: 'text-end' },
    },
  ];

  return (
    <div className="specialties-table">


      <Table
        data={transformedSpecialties}
        columns={columns}
        showPrint={false}
        cardHeader={<h5 class="card-title mb-0">Specialities List</h5>}
        emptyMessage={
          <ClinicEmptyState
            icon={FiActivity}
            title="No specialties found"
            description="Get started by adding your first medical specialty"
            actionText="Add First Specialty"
            onAction={() => navigate('/clinic/specialities/add')}
          />
        }
        loading={loading}
      />
    </div>
  );
};

export default SpecialtiesTable; 