import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Table from '@/components/shared/table/Table';
import { FiPhone, FiMail, FiEye, FiEdit3, FiTrash2, FiBriefcase, FiPlus } from 'react-icons/fi'
import { useAuth } from "../../contentApi/AuthContext";
import { useReceptionist } from "../../context/ReceptionistContext";
import { toast } from "react-toastify";
import EditReceptionistModal from './EditReceptionistModal';

const ReceptionistsTable = ({ onEditClick, onDeleteClick }) => {
  const { user } = useAuth();
  const { receptionists, deleteReceptionist, fetchReceptionistsFromBackend } = useReceptionist();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingReceptionist, setEditingReceptionist] = useState(null);
  const pageSize = 10;

  // Define roles that can manage receptionists (edit/delete)
  const canManageReceptionistRoles = ["super_admin", "clinic_admin", "receptionist"];

  // Check if current user can manage receptionists
  const canManageReceptionist = user && canManageReceptionistRoles.includes(user.role);

  // Transform receptionists data to match table structure
  const transformedReceptionists = receptionists.map((r, index) => ({
    ...r,
    tableId: r.id ?? `row-${index}`, // stable ID for pagination
    displayName: `${r.firstName || ""} ${r.lastName || ""}`.trim() || "Not specified",
    displayEmail: r.email || "Not specified",
    displayMobile: r.phone || "Not specified",
    displayGender: r.gender || "Not specified",
    displayStatus: r.status ? "Active" : "Inactive",
    displayAddress: r.receptionist_profile?.address || "Not specified",
    displayQualification: r.receptionist_profile?.qualification || "Not specified",
  }));

  const handleView = (receptionist) => {
    console.log("View clicked for receptionist:", receptionist);
    navigate(`/clinic/receptionists/view/${receptionist.id}`);
  };

  const handleEdit = (receptionist) => {
    console.log("Edit clicked for receptionist:", receptionist);
    if (onEditClick) {
      onEditClick(receptionist);
      return;
    }
    setEditingReceptionist(receptionist);
    setIsEditOpen(true);
  };

  const handleDelete = (receptionist) => {
    console.log("Delete clicked for receptionist:", receptionist);
    if (!canManageReceptionist) {
      toast.error("You don't have permission to delete receptionists");
      return;
    }

    if (onDeleteClick) {
      onDeleteClick(receptionist);
    } else {
    // Fallback to window.confirm if no onDeleteClick prop
      if (window.confirm(`Are you sure you want to delete ${receptionist.name}? This action cannot be undone.`)) {
        deleteReceptionistDirectly(receptionist);
      }
    }
  };

  const deleteReceptionistDirectly = async (receptionist) => {
    try {
      await deleteReceptionist(String(receptionist.id));
      toast.success("Receptionist deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      if (user.role === "super_admin") {
        toast.error("Failed to delete receptionist");
      }
    }
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

  const getGenderBadge = (gender) => {
    const genderConfig = {
      'Male': { class: 'bg-info', text: 'Male' },
      'Female': { class: 'bg-warning', text: 'Female' },
      'Other': { class: 'bg-secondary', text: 'Other' }
    };
    const config = genderConfig[gender] || genderConfig['Other'];
    return <span className={`badge ${config.class} small`}>{config.text}</span>;
  };

  const columns = [
    {
      accessorKey: 'tableId',
      header: () => 'ID',
      cell: (info) => (
        <span className="badge bg-light text-dark">#{info.getValue()}</span>
      )
    },
    {
      accessorKey: "displayName",
      header: () => 'Name',
      cell: (info) => (
        <div className="hstack gap-3">
          <div className="text-white avatar-text user-avatar-text avatar-md bg-primary">
            {info.getValue().substring(0, 1).toUpperCase()}
          </div>
          <div>
            <div className="fw-medium">{info.getValue()}</div>
            <small className="text-muted">Receptionist</small>
          </div>
        </div>
      )
    },
    {
      accessorKey: "displayEmail",
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
            <a href={`tel:${info.row.original.displayMobile}`} className="text-decoration-none">
              {info.row.original.displayMobile}
            </a>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'displayGender',
      header: () => 'Gender',
      cell: (info) => getGenderBadge(info.getValue())
    },
    {
      accessorKey: 'displayStatus',
      header: () => 'Status',
      cell: (info) => getStatusBadge(info.getValue())
    },
    {
      accessorKey: 'actions',
      header: () => 'Actions',
      cell: (info) => {
        const receptionist = info.row.original;
        return (
          <div className="hstack gap-2">
            <button
              className="avatar-text avatar-md"
              title="View"
              onClick={() => handleView(receptionist)}
            >
              <FiEye />
            </button>
            <button
              className="avatar-text avatar-md"
              title="Edit"
              onClick={() => handleEdit(receptionist)}
            >
              <FiEdit3 />
            </button>
            {/* {canManageReceptionist && (
              <button
                className="avatar-text avatar-md"
                title="Delete"
                onClick={() => handleDelete(receptionist)}
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

  return (
    <div className="receptionists-table">
      <Table
        data={transformedReceptionists}
        columns={columns}
        showPrint={false}
        cardHeader={<h5 class="card-title mb-0">Receptionists List</h5>}
        emptyMessage={
          <div className="text-center py-4">
            <div className="text-muted mb-2">
              <FiBriefcase size={32} className="opacity-50" />
            </div>
            <h6 className="text-muted">No receptionist found</h6>
            <p className="text-muted small mb-3">Get started by adding your first receptionist</p>
            <div className='d-flex align-items-center justify-content-center'>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/users/add')}
              >
                <FiPlus size={14} className="me-1" />
                Add First Receptionist
              </button>
            </div>
          </div>
        }
        forcePageSize={pageSize}
      />
      {isEditOpen && editingReceptionist && (
        <EditReceptionistModal
          isOpen={isEditOpen}
          receptionist={editingReceptionist}
          onClose={() => {
            setIsEditOpen(false);
            setEditingReceptionist(null);
          }}
          onSave={async () => {
            // If your ReceptionistContext exposes a refetch, call it:
            try {
              await fetchReceptionistsFromBackend();
            } catch { }
            setIsEditOpen(false);
            setEditingReceptionist(null);
          }}
        />
      )}
    </div>
  );
};

export default ReceptionistsTable; 