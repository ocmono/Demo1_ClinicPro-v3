import React from 'react'
import SectionHeader from '@/components/shared/SectionHeader';

const ReceptionistsHeader = () => {
    return (
        <SectionHeader
            title="Receptionists"
            createButtonText="Add Receptionist"
            createButtonPath="/users/add"
        />
    )
}

export default ReceptionistsHeader 