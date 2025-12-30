import React from 'react'
import CalenderContent from '@/components/calender/CalenderContent'
import DoctorCalender from '@/components/calender/DoctorCalendar'
import { useAuth } from '../../contentApi/AuthContext'

const AppsCalender = () => {
    const { user, role } = useAuth();
    if (role?.toLowerCase() === "doctor") {
        return (
            <>
                <DoctorCalender />
            </>
        )
    }
    return <CalenderContent />;
}

export default AppsCalender