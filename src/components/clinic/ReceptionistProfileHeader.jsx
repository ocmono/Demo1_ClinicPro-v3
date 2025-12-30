import React, { useState } from 'react'
import { FiEdit3, FiTrash2, FiArrowLeft, FiStar } from 'react-icons/fi'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useReceptionist } from "../../context/ReceptionistContext"
import { toast } from 'react-toastify'
import { useAuth } from "../../contentApi/AuthContext"
import EditReceptionistModal from './EditReceptionistModal'

const ReceptionistProfileHeader = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { receptionists, deleteReceptionist } = useReceptionist();
    const { user } = useAuth();

    const [showEditModal, setShowEditModal] = useState(false);
    // Find the receptionist by ID
    const receptionist = receptionists.find(r => r.id == id);

    // Define roles that can manage receptionists
    const canManageReceptionistRoles = ["super_admin", "clinic_admin", "receptionist"];
    const canManageReceptionist = user && canManageReceptionistRoles.includes(user.role);

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

    const handleDelete = async () => {
        if (!canManageReceptionist) {
            toast.error("You don't have permission to delete receptionists");
            return;
        }

        if (window.confirm(`Are you sure you want to delete ${receptionist?.name}? This action cannot be undone.`)) {
            try {
                await deleteReceptionist(receptionist.id);
                toast.success("Receptionist deleted successfully!");
                navigate('/clinic/receptionists');
            } catch (error) {
                console.error("Delete failed:", error);
                toast.error("Failed to delete receptionist");
            }
        }
    };

    return (
        <>
            <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                <button
                    className="btn btn-icon btn-light-secondary"
                    onClick={() => navigate('/clinic/receptionists')}
                    title="Back to Receptionists"
                >
                    <FiArrowLeft size={16} />
                </button>
                {/* <button className="btn btn-icon btn-light-brand">
                    <FiStar size={16} />
                </button> */}
                {canManageReceptionist && (
                    <>
                        <button
                            className="btn btn-primary"
                            onClick={handleEdit}
                        >
                            <FiEdit3 size={14} className='me-2' />
                            <span>Edit Receptionist</span>
                        </button>
                        {/* <button
                            className="btn btn-danger"
                            onClick={handleDelete}
                        >
                            <FiTrash2 size={16} className='me-2' />
                            <span>Delete Receptionist</span>
                        </button> */}
                    </>
                )}
            </div>
            {showEditModal && receptionist && (
                <EditReceptionistModal
                    isOpen={showEditModal}
                    onClose={handleCloseEditModal}
                    receptionist={receptionist}
                    onSave={handleSaveSuccess} // You can add this prop to the modal if needed
                />
            )}
        </>
    )
}

export default ReceptionistProfileHeader