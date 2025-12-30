import React, { useState } from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import ReceptionistsHeader from '@/components/clinic/ReceptionistsHeader'
import ReceptionistsTable from '@/components/clinic/ReceptionistsTable'
import EditReceptionistModal from '@/components/clinic/EditReceptionistModal'
import DeleteConfirmationModal from '../settings/DeleteConfirmationModal'
import Footer from '@/components/shared/Footer'
import { useReceptionist } from '../../../context/ReceptionistContext'
import { toast } from 'react-toastify'

const RceptionistsView = () => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedReceptionist, setSelectedReceptionist] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [receptionistToDelete, setReceptionistToDelete] = useState(null);
    const { fetchReceptionists, deleteReceptionist } = useReceptionist();

    const handleEditClick = (receptionist) => {
        setSelectedReceptionist(receptionist);
        setIsEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedReceptionist(null);
    };

    const handleSaveReceptionist = async (updatedReceptionist) => {
        console.log('Receptionist updated:', updatedReceptionist);
        // Refresh the receptionists list
        await fetchReceptionists();
        handleCloseModal();
    };

    const handleDeleteClick = (receptionist) => {
        console.log("Delete clicked for receptionist:", receptionist);
        setReceptionistToDelete(receptionist);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!receptionistToDelete) return;

        try {
            await deleteReceptionist(receptionistToDelete.id);
            toast.success("Receptionist deleted successfully!");
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Failed to delete receptionist");
        } finally {
            setIsDeleteModalOpen(false);
            setReceptionistToDelete(null);
        }
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setReceptionistToDelete(null);
    };

    return (
        <>
            <PageHeader>
                <ReceptionistsHeader />
            </PageHeader>
            <div className='main-content'>
                <ReceptionistsTable
                    onEditClick={handleEditClick}
                    onDeleteClick={handleDeleteClick}
                />
            </div>
            <Footer/>

            {/* Edit Receptionist Modal */}
            <EditReceptionistModal
                isOpen={isEditModalOpen}
                onClose={handleCloseModal}
                receptionist={selectedReceptionist}
                onSave={handleSaveReceptionist}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                title="Delete Receptionist"
                message={
                    receptionistToDelete
                        ? `Are you sure you want to delete ${receptionistToDelete.name}?\n\nThis action cannot be undone and will permanently remove the receptionist from the system.`
                        : "Are you sure you want to delete this receptionist?"
                }
                confirmText="Delete Receptionist"
                cancelText="Cancel"
            />
        </>
    )
}

export default RceptionistsView