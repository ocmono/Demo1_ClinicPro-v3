import React, { useState } from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import AppointmentViewHeader from '@/components/appointmentsView/AppointmentViewHeader'
import AppointmentViewTabItems from '@/components/appointmentsView/AppointmentViewTabItems'
import TabAppointmentOverview from '@/components/appointmentsView/TabAppointmentOverview'
import Footer from '@/components/shared/Footer';
import AppointmentTodaysTable from '@/components/appointmentsView/AppointmentTodaysTable'
import AppointmentPendingTable from '@/components/appointmentsView/AppointmentPendingTable'
import AppointmentApprovedTable from '@/components/appointmentsView/AppointmentApprovedTable'
import AppointmentUpcommingsTable from '@/components/appointmentsView/AppointmentUpcommingsTable'
import AppointmentCompletedTable from '@/components/appointmentsView/AppointmentCompletedTable' 
import AppointmentDeclinedTable from '@/components/appointmentsView/AppointmentDeclinedTable'

const AppointmentsView = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <TabAppointmentOverview />;
            case 'todays':
                return  <AppointmentTodaysTable />;
            case 'pending':
                return <AppointmentPendingTable />;
            case 'approved':
                return <AppointmentApprovedTable />
            case 'upcommings':
                return <AppointmentUpcommingsTable />;
            case 'completed':
                return <AppointmentCompletedTable />;
            case 'canceled':
                return  <AppointmentDeclinedTable />;
            default:
                return null;
        }
    };

    return (
        <>
            <PageHeader>
                <AppointmentViewHeader />
            </PageHeader>
            <AppointmentViewTabItems activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className='main-content'>
                <div className='tab-content'>
                    {renderTabContent()}
                </div>
            </div>
            <Footer />
        </>
    )
}

export default AppointmentsView
