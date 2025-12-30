import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiHeart, FiEdit3, FiTrash2, FiSettings } from 'react-icons/fi';
import { useAuth } from "../../contentApi/AuthContext";
import { useClinicManagement } from "../../contentApi/ClinicMnanagementProvider";
import { toast } from "react-toastify";
import EditSpecialtyModal from './EditSpecialtyModal';

const SpecialtyProfileHeader = ({ specialty }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { removeSpeciality } = useClinicManagement();

  // Define roles that can manage specialties
  const canManageSpecialtyRoles = ["super_admin", "clinic_admin"];
  const canManageSpecialty = user && canManageSpecialtyRoles.includes(user.role);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleBack = () => {
    navigate('/clinic/specialities');
  };

  // Edit handler - opens modal
  const handleEdit = () => {
    setShowEditModal(true);
  };

  // Close modal handler
  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  // Handle successful save
  const handleSaveSuccess = () => {
    setShowEditModal(false);
  // Optionally refresh the page or update data
  // You might want to add a callback prop to refresh the parent component
  };

  const handleManage = () => {
    navigate('/clinic/specialities/manage');
  };

  const handleDelete = async () => {
    const specialtyName = specialty.speciality || 'Unknown Specialty';
    
    if (window.confirm(`Are you sure you want to delete ${specialtyName}? This action cannot be undone.`)) {
      try {
        await removeSpeciality(specialty.id);
        toast.success(`${specialtyName} has been deleted successfully`);
        navigate('/clinic/specialities');
      } catch (error) {
        if (user.role === "super_admin") {
          toast.error(`Failed to delete ${specialtyName}`);
        }
      }
    }
  };

  const specialtyName = specialty.speciality || 'Unknown Specialty';

  return (
    <>
    <div className="d-flex align-items-center justify-content-between gap-2">
      <div className="d-flex align-items-center gap-3">
        <button 
            className="btn btn-icon btn-light"
          onClick={handleBack}
        >
          <FiArrowLeft />
        </button>
        {/* <div>
          <h4 className="mb-1 fw-bold">{specialtyName}</h4>
          <p className="text-muted mb-0">Medical Specialty Profile</p>
        </div> */}
      </div>
      
      <div className="d-flex align-items-center gap-2">
          {/* <button className="btn btn-icon btn-light">
          <FiHeart />
        </button> */}
        
        {canManageSpecialty && (
          <>
            <button 
                className="btn btn-primary btn-md"
              onClick={handleEdit}
            >
                <FiEdit3 size={14} className="me-2" />
              Edit Specialty
            </button>
            
              {/* <button
                className="btn btn-info btn-md"
              onClick={handleManage}
            >
              <FiSettings size={14} className="me-2" />
              Manage
            </button>

            <button
                className="btn btn-danger btn-md"
              onClick={handleDelete}
            >
              <FiTrash2 size={14} className="me-2" />
              Delete Specialty
            </button> */}
          </>
        )}
      </div>
      </div>
      {showEditModal && specialty && (
        <EditSpecialtyModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          specialty={specialty}
          onSave={handleSaveSuccess} // You can add this prop to the modal if needed
        />
      )}
    </>
  );
};

export default SpecialtyProfileHeader;