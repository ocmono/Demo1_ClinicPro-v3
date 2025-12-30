import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import ReceptionistsHeader from '@/components/clinic/ReceptionistsHeader'
import ReceptionistsTable from '@/components/clinic/ReceptionistsTable'
import Footer from '@/components/shared/Footer'

const ReceptionistsView = () => {
    return (
        <>
            <PageHeader>
                <ReceptionistsHeader />
            </PageHeader>
            <div className='main-content'>
                <div className='card'>
                    <div className='card-body'>
                        <ReceptionistsTable />
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    )
}

export default ReceptionistsView 