import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import LeadsTable from '@/components/leads/LeadsTable'
import LeadsHeader from '@/components/leads/LeadsHeader'

const LeadsList = () => {
    return (
        <>
            <PageHeader>
                <LeadsHeader />
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <LeadsTable />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default LeadsList
