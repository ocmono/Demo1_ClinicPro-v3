import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiHeart, FiEdit3, FiTrash2 } from 'react-icons/fi';
import { useAuth } from "../../contentApi/AuthContext";
import { useAccountant } from "../../context/AccountantContext";
import { toast } from "react-toastify";
import EditAccountantModal from './EditAccountantModal';

const AccountantProfileHeader = ({ accountant }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { deleteAccountant } = useAccountant();

  // Define roles that can manage accountants
  const [showEditModal, setShowEditModal] = useState(false);
  const canManageAccountantRoles = ["super_admin", "clinic_admin"];
  const canManageAccountant = user && canManageAccountantRoles.includes(user.role);

  const handleBack = () => {
    navigate('/clinic/accountants');
  };

  // Edit handler - opens modal
  const handleEdit = () => {
    setShowEditModal(true);
  };

  // Close modal handler
  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleSaveSuccess = () => {
    setShowEditModal(false);
  // Optionally refresh the page or update data
  // You might want to add a callback prop to refresh the parent component
  };

  const handleDelete = async () => {
    if (!canManageAccountant) {
      toast.error("You don't have permission to delete accountants");
      return;
    }

    const accountantName = `${accountant.first_name || ''} ${accountant.last_name || ''}`.trim();
    
    if (window.confirm(`Are you sure you want to delete ${accountantName}? This action cannot be undone.`)) {
      try {
        await deleteAccountant(accountant.id);
        toast.success(`${accountantName} has been deleted successfully`);
        navigate('/clinic/accountants');
      } catch (error) {
        toast.error(`Failed to delete ${accountantName}`);
      }
    }
  };

  const accountantName = `${accountant.first_name || ''} ${accountant.last_name || ''}`.trim() || 'Unknown Accountant';

  return (
    <>
    <div className="d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center gap-2">
        <button 
          className="btn btn-icon btn-light"
          onClick={handleBack}
        >
          <FiArrowLeft />
        </button>
          {/* <button className="btn btn-icon btn-light">
          <FiHeart />
        </button> */}
        
        {canManageAccountant && (
          <>
            <button 
                className="btn btn-primary p-2"
              onClick={handleEdit}
            >
                <FiEdit3 size={16} className="me-2" />
              Edit Accountant
            </button>
            
              {/* <button
                className="btn btn-danger p-2"
              onClick={handleDelete}
            >
              <FiTrash2 size={14} className="me-2" />
              Delete Accountant
            </button> */}
          </>
        )}
      </div>
      </div>
      {showEditModal && accountant && (
        <EditAccountantModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          accountant={accountant}
          onSave={handleSaveSuccess} // You can add this prop to the modal if needed
        />
      )}
    </>
  );
};

export default AccountantProfileHeader;