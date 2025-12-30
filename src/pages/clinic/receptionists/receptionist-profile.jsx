import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import ReceptionistProfileHeader from '@/components/clinic/ReceptionistProfileHeader'
import ReceptionistProfileContent from '@/components/clinic/ReceptionistProfileContent'

const ReceptionistProfile = () => {
    return (
        <>
            <PageHeader>
                <ReceptionistProfileHeader />
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <ReceptionistProfileContent />
                </div>
            </div>
        </>
    )
}

export default ReceptionistProfile