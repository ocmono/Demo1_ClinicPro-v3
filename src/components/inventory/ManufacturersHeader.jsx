import React from 'react'
import SectionHeader from '@/components/shared/SectionHeader';

const ManufacturersHeader = () => {
    return (
        <SectionHeader
            title="Manufacturers"
            createButtonText="Add Manufacturer"
            createButtonPath="/inventory/manufacturers/manufacturers-create"
        />
    )
}

export default ManufacturersHeader;