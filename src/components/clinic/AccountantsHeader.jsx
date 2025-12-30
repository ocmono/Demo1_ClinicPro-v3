import React from 'react'
import SectionHeader from '@/components/shared/SectionHeader';

const AccountantsHeader = () => {
    return (
        <SectionHeader
            title="Accountants"
            createButtonText="Add Accountant"
            createButtonPath="/users/add"
        />
    )
}

export default AccountantsHeader 