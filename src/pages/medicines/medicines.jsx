import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import ProposalHeaderContent from '@/components/proposal/ProposalHeaderContent'
import Footer from '@/components/shared/Footer'
import MedicineTable from '@/components/medicines/MedicineTable'
import MedicineHeadr from '@/components/medicines/MedicineHeadr'


const MedicinesView = () => {
    return (
        <>
            <PageHeader>
                <MedicineHeadr />
            </PageHeader>
            <ProposalHeaderContent />
            <div className='main-content'>
                <div className='row'>
                    <MedicineTable />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default MedicinesView