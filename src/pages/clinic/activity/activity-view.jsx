import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import AccountantsHeader from '@/components/clinic/AccountantsHeader'
import ActivityLogsTable from '@/components/activity/ActivityLogsTable'
import Footer from '@/components/shared/Footer'

const ActivityView = () => {
    return (
        <>
            <PageHeader>
                <AccountantsHeader />
            </PageHeader>
            <div className='main-content'>
                <div className='card'>
                    <div className='card-body'>
                        <ActivityLogsTable />
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default ActivityView