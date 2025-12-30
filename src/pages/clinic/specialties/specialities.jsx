import React, { useState } from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import SpecialtiesHeader from '@/components/clinic/SpecialtiesHeader'
import SpecialtiesTable from '@/components/clinic/SpecialtiesTable'
import EditSpecialtyModal from '@/components/clinic/EditSpecialtyModal'
import DeleteConfirmationModal from '../settings/DeleteConfirmationModal'
import Footer from '@/components/shared/Footer'
import { useClinicManagement } from '../../../contentApi/ClinicMnanagementProvider'
import { toast } from 'react-toastify'

const SpecialitiesView = () => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSpecialty, setSelectedSpecialty] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [specialtyToDelete, setSpecialtyToDelete] = useState(null);
    const { fetchSpecialities, removeSpeciality } = useClinicManagement();

    const handleEditClick = (specialty) => {
        console.log("Edit clicked for specialty:", specialty);
        setSelectedSpecialty(specialty);
        setIsEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedSpecialty(null);
    };

    const handleSaveSpecialty = async (updatedSpecialty) => {
        console.log('Specialty updated:', updatedSpecialty);
        // Refresh the specialties list
        if (fetchSpecialities) {
            await fetchSpecialities();
        }
        handleCloseModal();
    };

    const handleDeleteClick = (specialty) => {
        console.log("Delete clicked for specialty:", specialty);
        setSpecialtyToDelete(specialty);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!specialtyToDelete) return;

        try {
            await removeSpeciality(specialtyToDelete.id);
            toast.success(`${specialtyToDelete.speciality} deleted successfully!`);
        } catch (error) {
            toast.error(`Failed to delete ${specialtyToDelete.speciality}`);
        } finally {
            setIsDeleteModalOpen(false);
            setSpecialtyToDelete(null);
        }
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSpecialtyToDelete(null);
    };

    return (
        <>
            <PageHeader>
                <SpecialtiesHeader />
            </PageHeader>
            <div className='main-content'>
                <SpecialtiesTable
                    onEditClick={handleEditClick}
                    onDeleteClick={handleDeleteClick}
                />
            </div>
            <Footer/>

            {/* Edit Specialty Modal */}
            <EditSpecialtyModal
                isOpen={isEditModalOpen}
                onClose={handleCloseModal}
                specialty={selectedSpecialty}
                onSave={handleSaveSpecialty}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                title="Delete Specialty"
                message={
                    specialtyToDelete
                        ? `Are you sure you want to delete "${specialtyToDelete.speciality}"?\n\nThis action cannot be undone and will permanently remove the specialty from the system.`
                        : "Are you sure you want to delete this specialty?"
                }
                confirmText="Delete Specialty"
                cancelText="Cancel"
            />
        </>
    )
}

export default SpecialitiesView