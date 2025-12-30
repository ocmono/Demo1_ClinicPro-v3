import React from 'react'
import SectionHeader from '@/components/shared/SectionHeader';

const SpecialtiesHeader = () => {
    return (
        <SectionHeader
            title="Medical Specialties"
            createButtonText="Add Specialty"
            createButtonPath="/clinic/specialities/add"
        />
    )
}

export default SpecialtiesHeader 