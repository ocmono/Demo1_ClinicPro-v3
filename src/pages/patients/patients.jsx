import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import PatientTable from '@/components/patients/PatientsTable'
import PatientsHeader from '@/components/patients/PatientsHeader'


const PatientsView = () => {
    return (
        <>
            <PageHeader>
                <PatientsHeader />
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <PatientTable />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default PatientsView