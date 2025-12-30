import React from 'react'
import SectionHeader from '@/components/shared/SectionHeader';

const UsersHeader = () => {
    return (
        <SectionHeader
            title="Manage Users"
            createButtonText="Add User"
            createButtonPath="/users/add"
        />
    )
}

export default UsersHeader 