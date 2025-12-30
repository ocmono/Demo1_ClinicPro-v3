import React, { useState, useEffect } from 'react'
import Table from '@/components/shared/table/Table';
import { FiEdit3, FiTrash2, FiRefreshCw } from 'react-icons/fi'
import { useAuth } from "../../contentApi/AuthContext";
import { toast } from "react-toastify";

const UsersTable = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  // Define roles that can manage users (edit/delete)
  const canManageUserRoles = ["super_admin"];
  
  // Check if current user can manage users
  const canManageUser = user && canManageUserRoles.includes(user.role);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API endpoint
      // For now, simulate API call and show empty state
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      // Since the API endpoint doesn't exist yet, we'll show empty state
      setUsers([]);
      
      // Uncomment when API is ready:
      // const response = await fetch('/api/users');
      // if (response.ok) {
      //   const data = await response.json();
      //   setUsers(data);
      // } else {
      //   throw new Error('Failed to fetch users');
      // }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Don't show error toast for now since API doesn't exist
      // toast.error('Failed to fetch users');
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-danger';
      case 'clinic_admin':
        return 'bg-warning';
      case 'doctor':
        return 'bg-primary';
      case 'receptionist':
        return 'bg-info';
      case 'pharmacist':
        return 'bg-success';
      case 'accountant':
        return 'bg-secondary';
      default:
        return 'bg-dark';
    }
  };

  // Transform users data to match table structure
  const transformedUsers = users.map((user, index) => ({
    id: user.id || index + 1,
    name: user.name || 'Not specified',
    email: user.email || 'Not specified',
    phone: user.phone || 'Not specified',
    role: user.role || 'user',
    department: user.department || 'General',
    status: user.status || 'Active',
    lastLogin: user.lastLogin || 'Never',
    originalUser: user // Keep original data for actions
  }));

  const handleRefresh = async () => {
    await fetchUsers();
    toast.success("Users list refreshed successfully!");
  };

  const handleEdit = (user) => {
    // TODO: Implement edit functionality
    console.log("Edit user:", user);
    toast.info("Edit functionality coming soon!");
  };

  const handleDelete = (user) => {
    // TODO: Implement delete functionality
    console.log("Delete user:", user);
    toast.info("Delete functionality coming soon!");
  };

  const columns = [
    {
      accessorKey: 'id',
      header: () => 'ID',
      cell: (info) => info.getValue()
    },
    {
      accessorKey: 'name',
      header: () => 'Name',
      cell: (info) => (
        <div className="hstack gap-3">
          <div className="text-white avatar-text user-avatar-text avatar-md">
            {info.getValue().substring(0, 1)}
          </div>
          <div>
            <span className="text-truncate-1-line">{info.getValue()}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'email',
      header: () => 'Email',
      cell: (info) => <a href={`mailto:${info.getValue()}`}>{info.getValue()}</a>
    },
    {
      accessorKey: 'phone',
      header: () => 'Phone',
      cell: (info) => <a href={`tel:${info.getValue()}`}>{info.getValue()}</a>
    },
    {
      accessorKey: 'role',
      header: () => 'Role',
      cell: (info) => (
        <span className={`badge ${getRoleBadgeColor(info.getValue())}`}>
          {info.getValue().replace('_', ' ').toUpperCase()}
        </span>
      )
    },
    {
      accessorKey: 'department',
      header: () => 'Department',
      cell: (info) => <span>{info.getValue()}</span>
    },
    {
      accessorKey: 'status',
      header: () => 'Status',
      cell: (info) => (
        <span className={`badge ${info.getValue() === 'Active' ? 'bg-success' : 'bg-danger'}`}>
          {info.getValue()}
        </span>
      )
    },
    {
      accessorKey: 'lastLogin',
      header: () => 'Last Login',
      cell: (info) => <span className="text-muted">{info.getValue()}</span>
    },
    ...(canManageUser ? [{
      accessorKey: 'actions',
      header: () => (
        <div className="d-flex align-items-center justify-content-between">
          <span>Actions</span>
          <button
            onClick={handleRefresh}
            className="btn btn-sm btn-outline-secondary"
            disabled={loading}
            title="Refresh List"
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <FiRefreshCw />
            )}
          </button>
        </div>
      ),
      cell: (info) => (
        <div className="hstack gap-2 justify-content-end">
          <button
            className="avatar-text avatar-md"
            title="Edit"
            onClick={() => handleEdit(info.row.original.originalUser)}
          >
            <FiEdit3 />
          </button>
          <button
            className="avatar-text avatar-md"
            title="Delete"
            onClick={() => handleDelete(info.row.original.originalUser)}
          >
            <FiTrash2 />
          </button>
        </div>
      ),
      meta: {
        headerClassName: 'text-end'
      }
    }] : [])
  ];

  return (
    <>
      <Table data={transformedUsers} columns={columns} />
    </>
  )
}

export default UsersTable 