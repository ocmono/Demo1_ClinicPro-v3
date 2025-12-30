import React from 'react'
import { FiEye, FiUsers, FiUserCheck, FiUserMinus, FiUserPlus, FiShield, FiSettings, FiActivity } from 'react-icons/fi'
import SectionHeader from '@/components/shared/SectionHeader';

const DoctorsHeader = () => {
    const filterActions = [
        { label: "All Doctors", icon: <FiEye /> },
        { label: "Active", icon: <FiUserCheck /> },
        { label: "Inactive", icon: <FiUserMinus /> },
        { label: "New", icon: <FiUserPlus /> },
        { label: "Specialists", icon: <FiShield /> },
        { label: "General", icon: <FiUsers /> },
        { label: "Available", icon: <FiActivity /> },
    ];

    return (
        <SectionHeader
            title="Doctors"
            createButtonText="Add Doctor"
            createButtonPath="/clinic/doctors/add"
            filterActions={filterActions}
        />
    )
}

export default DoctorsHeader 