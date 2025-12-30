import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import PatientsCreateHeader from '@/components/patientsCreate/PatientsCreateHeader'
import PatientsCreateContent from '@/components/patientsCreate/PatientsCreateContent'
import Footer from '@/components/shared/Footer'

const PatientAdd = () => {
    return (
        <>
            <PageHeader>
                <PatientsCreateHeader />
            </PageHeader>
            <div className='main-content'>
                <div className='row justify-content-center'>
                    <PatientsCreateContent />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default PatientAdd