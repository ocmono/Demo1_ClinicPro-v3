import React from 'react'
import SectionHeader from '@/components/shared/SectionHeader';

const SuppliersHeader = () => {
    return (
        <SectionHeader
            title="Suppliers"
            createButtonText="Add Supplier"
            createButtonPath="/inventory/suppliers/suppliers-create"
        />
    )
}

export default SuppliersHeader;