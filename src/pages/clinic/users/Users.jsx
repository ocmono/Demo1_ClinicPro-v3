import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from '@/components/shared/table/Table';
import { FiUser, FiPhone, FiMail, FiBarChart, FiFilter, FiUserPlus, FiRefreshCw, FiEye, FiEdit3, FiTrash2, FiUserCheck, FiShield, FiUsers } from "react-icons/fi";
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import { toast } from "react-toastify";
import UserRoleManager from '@/components/clinic/UserRoleManager';
import EditUserModal from '@/components/clinic/EditUserModal';
import DeleteConfirmationModal from '../settings/DeleteConfirmationModal';
import AddUser from '../manage-users/AddUser';
import {
  ClinicPageHeader,
  ClinicTabNavigation,
  ClinicStatsCards,
  ClinicFilters,
  ClinicEmptyState,
  getRoleBadgeColor,
  getStatusBadgeColor
} from '@/components/clinic/ClinicDesignSystem';
import { useUsers } from '../../../context/UserContext';

const Users = () => {
  const { users, loading, fetchUsers, deleteUser, updateUser } = useUsers();
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showRoleManager, setShowRoleManager] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);


  const handleView = (user) => {
    navigate(`/users/view/${user.id}`);
  };

  const handleEdit = (user) => {
    console.log("Edit clicked for user:", user);
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleRoleChange = (user) => {
    setSelectedUser(user);
    setShowRoleManager(true);
  };

  const handleRoleUpdate = (updatedUser) => {
    updateUser(updatedUser.id, updatedUser); // ✅ use context
    toast.success("User role updated successfully!");
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = (updatedUser) => {
    try {
      // Add validation
      console.log('User updated successfully:', updatedUser);
      toast.success('User updated successfully!');
    } catch (error) {
      console.error('Error in handleSaveUser:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id); // ✅ use context
      toast.success("User deleted successfully!");
      handleCloseDeleteModal();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  // Filter and process users data
  const tableData = useMemo(() => {
    return users
      .filter(user => {
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        // here normalize status for filter too
        const normalizedStatus =
          user.status === true ? "Active" :
            user.status === false ? "Inactive" :
              (typeof user.status === "string" ? user.status : "Unknown");

        const matchesStatus = filterStatus === 'all' || normalizedStatus === filterStatus;
        return matchesRole && matchesStatus;
      })
      .map(user => {
        const normalizedStatus =
          user.status === true ? "Active" :
            user.status === false ? "Inactive" :
              (typeof user.status === "string" ? user.status : "Unknown");

        return {
          ...user,
          displayName: user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : (user.firstName || user.first_name || user.lastName || user.last_name) || 'Unknown User',
          displayRole: user.role ? user.role.replace('_', ' ').toUpperCase() : 'USER',
          displayStatus: normalizedStatus
        };
      });
  }, [users, filterRole, filterStatus]);
  // Calculate statistics
  const statistics = [
    { label: 'Total', value: users.length, color: 'primary' },
    { label: 'Active', value: users.filter(u => u.status === 'Active').length, color: 'success' },
    { label: 'Inactive', value: users.filter(u => u.status === 'Inactive').length, color: 'secondary' },
    { label: 'Pending', value: users.filter(u => u.status === 'Pending').length, color: 'warning' }
  ];

  // Define table columns
  const columns = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: (info) => (
        <span className="badge bg-light text-dark">#{info.getValue()}</span>
      )
    },
    {
      accessorKey: 'displayName',
      header: 'User',
      cell: (info) => {
        const user = info.row.original;
        const avatarImg = user?.profileImage || user?.avatar || null; // adjust key depending on API

        return (
          <div className="d-flex align-items-center gap-2">
            {avatarImg ? (
              <div className="avatar-image avatar-md rounded-circle overflow-hidden">
                <img
                  src={avatarImg}
                  alt={info.getValue()}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            ) : (
              // <div className="avatar avatar-md bg-primary text-white rounded-circle d-flex align-items-center justify-content-center">
              //   {info.getValue().substring(0, 1).toUpperCase()}
              //   </div>
              <div className="text-white avatar-text user-avatar-text avatar-md">{info.getValue().substring(0, 1).toUpperCase()}</div>
            )}
            <div>
              <div className="fw-semibold">{info.getValue()}</div>
              <small className="text-muted">{user.username || 'No username'}</small>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'email',
      header: 'Contact',
      cell: (info) => (
        <div>
          <div className="d-flex align-items-center gap-1 mb-1">
            <FiMail size={12} className="text-muted" />
            <a href={`mailto:${info.getValue()}`} className="text-decoration-none">
              {info.getValue() || 'No email'}
            </a>
          </div>
          {info.row.original.phone && (
            <div className="d-flex align-items-center gap-1">
              <FiPhone size={12} className="text-muted" />
              <a href={`tel:${info.row.original.phone}`} className="text-decoration-none">
                {info.row.original.phone}
              </a>
            </div>
          )}
        </div>
      )
    },
    {
      accessorKey: 'displayRole',
      header: 'Role',
      cell: (info) => (
        <span className={`badge bg-${getRoleBadgeColor(info.row.original.role)}-subtle text-${getRoleBadgeColor(info.row.original.role)}`}>
          {info.getValue()}
        </span>
      )
    },
    {
      accessorKey: 'displayStatus',
      header: 'Status',
      cell: (info) => (
        <span className={`badge bg-${getStatusBadgeColor(info.getValue())}-subtle text-${getStatusBadgeColor(info.getValue())}`}>
          {info.getValue()}
        </span>
      )
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="hstack gap-2">
          <button
            className="avatar-text avatar-md"
            title="View"
            onClick={() => handleView(info.row.original)}
          >
            <FiEye />
          </button>
          <button
            className="avatar-text avatar-md"
            title="Edit"
            onClick={() => handleEdit(info.row.original)}
          >
            <FiEdit3 />
          </button>
          <button
            className="avatar-text avatar-md"
            title="Manage Role"
            onClick={() => handleRoleChange(info.row.original)}
          >
            <FiUserCheck />
          </button>
          <button
            className="avatar-text avatar-md"
            title="Delete"
            onClick={() => handleDelete(info.row.original)}
          >
            <FiTrash2 />
          </button>
        </div>
      ),
      meta: { headerClassName: 'text-end' }
    }
  ];

  return (
    <>
      <PageHeader>
        <div className="d-flex justify-content-between align-items-center">
          {/* <div>
            <h4 className="mb-1 fw-bold">Users</h4>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/clinic">Clinic</a>
                </li>
                <li className="breadcrumb-item active">Users</li>
              </ol>
            </nav>
          </div> */}
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary gap-2" onClick={fetchUsers} disabled={loading}>
              <FiRefreshCw size={16} className={loading ? 'spinner-border spinner-border-sm' : ''} />
              Refresh
            </button>
            <button className="btn btn-primary gap-2" onClick={() => navigate('/users/add')}>
              <FiUserPlus size={16} />
              Add User
            </button>
            <button className="btn btn-outline-info gap-2" onClick={() => navigate('/users/permission-management')}>
              <FiShield size={16} />
              Permissions
            </button>
            <button className="btn btn-outline-warning gap-2" onClick={() => navigate('/users/roles')}>
              <FiUsers size={16} />
              Roles
            </button>
          </div>
        </div>
      </PageHeader>

      <div className="main-content">
        <div>
          {/* Statistics Cards */}
          <ClinicStatsCards stats={statistics} />

          {/* Main Content */}
          <div className="card">
            <div className="card-body">
              {/* Filters */}
              <ClinicFilters
                filters={[
                  {
                    key: 'role',
                    label: 'Role',
                    type: 'select',
                    options: [
                      { value: 'all', label: 'All Roles' },
                      { value: 'doctor', label: 'Doctor' },
                      { value: 'receptionist', label: 'Receptionist' },
                      { value: 'accountant', label: 'Accountant' },
                      { value: 'admin', label: 'Admin' },
                      { value: 'patient', label: 'Patient' },
                    ],
                    value: filterRole
                  },
                  {
                    key: 'status',
                    label: 'Status',
                    type: 'select',
                    options: [
                      { value: 'all', label: 'All Status' },
                      { value: 'Active', label: 'Active' },
                      { value: 'Inactive', label: 'Inactive' },
                      { value: 'Pending', label: 'Pending' }
                    ],
                    value: filterStatus
                  }
                ]}
                onFilterChange={(key, value) => {
                  if (key === 'role') setFilterRole(value);
                  if (key === 'status') setFilterStatus(value);
                }}
                onClearFilters={() => {
                  setFilterRole('all');
                  setFilterStatus('all');
                }}
                showClearButton={(filterRole !== 'all' || filterStatus !== 'all')}
              />

              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="badge bg-primary-subtle text-primary">
                  {tableData.length} users
                </span>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={fetchUsers}
                  disabled={loading}
                  title="Refresh user list"
                >
                  <FiRefreshCw size={14} className={loading ? 'spinner-border spinner-border-sm' : ''} />
                </button>
              </div>

              <Table
                data={tableData}
                columns={columns}
                showPrint={false}
                emptyMessage={
                  <ClinicEmptyState
                    icon={FiUser}
                    title="No users found"
                    description="Get started by adding your first user"
                    actionText="Add First User"
                    onAction={() => navigate('/users/add')}
                  />
                }
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>

      {showRoleManager && selectedUser && (
        <UserRoleManager
          user={selectedUser}
          onRoleUpdate={handleRoleUpdate}
          onClose={() => {
            setShowRoleManager(false);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        user={editingUser}
        onSave={handleSaveUser}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        requirePassword={true}
        message={
          userToDelete
            ? `Are you sure you want to delete ${userToDelete.first_name || userToDelete.name?.name || 'this user'} (${(userToDelete.role || 'user').replace('_', ' ').toUpperCase()})?\n\nThis action cannot be undone and will permanently remove the user from the system.`
            : "Are you sure you want to delete this user?"
        }
        confirmText="Delete User"
        cancelText="Cancel"
      />

      <Footer />
    </>
  );
};

export default Users;
