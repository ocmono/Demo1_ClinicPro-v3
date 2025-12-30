import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiHeart, FiEdit3, FiTrash2 } from 'react-icons/fi';
import { toast } from "react-toastify";
import EditUserModal from './EditUserModal';
import DeleteConfirmationModal from '../../pages/clinic/settings/DeleteConfirmationModal';

const UserProfileHeader = ({ user, onUserUpdate, onUserDelete }) => {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleBack = () => {
    navigate('/users');
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveUser = (updatedUser) => {
    try {
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
      toast.success('User updated successfully!');
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error in handleSaveUser:', error);
      // toast.error('Failed to update user');
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    try {
      if (onUserDelete) {
        await onUserDelete(user.id);
      }
      toast.success("User deleted successfully!");
      handleCloseDeleteModal();
      navigate('/users');
    } catch (error) {
      console.log("Failed to delete user");
    }
  };

  const userName = `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim() || 'Unknown User';

  return (
    <>
    <div className="d-flex align-items-center justify-content-between gap-2">
      <div className="d-flex align-items-center gap-3">
        <button 
          className="btn btn-icon btn-light"
          onClick={handleBack}
        >
            <FiArrowLeft size={16} />
        </button>
        {/* <div>
          <h4 className="mb-1 fw-bold">{userName}</h4>
          <p className="text-muted mb-0">User Profile</p>
        </div> */}
      </div>
      
      <div className="d-flex align-items-center gap-2">
        {/* <button className="btn btn-icon btn-light">
          <FiHeart />
        </button> */}
        
          <button
            className="btn btn-primary"
            onClick={handleEdit}
          >
            <FiEdit3 size={14} className='me-2' />
            <span>Edit User</span>
          </button>
        
        <button 
            className="btn btn-danger"
          onClick={handleDelete}
        >
          <FiTrash2 size={14} className="me-2" />
          Delete User
        </button>
      </div>
    </div>
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        user={user}
        onSave={handleSaveUser}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        requirePassword={true}
        message={
          user
            ? `Are you sure you want to delete ${userName} (${(user.role || 'user').replace('_', ' ').toUpperCase()})?\n\nThis action cannot be undone and will permanently remove the user from the system.`
            : "Are you sure you want to delete this user?"
        }
        confirmText="Delete User"
        cancelText="Cancel"
      />
    </>
  );
};

export default UserProfileHeader;