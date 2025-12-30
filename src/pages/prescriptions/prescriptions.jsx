import React, { useState } from 'react'
import ProposalTable from '@/components/proposal/ProposalTable'
import ProposalHeadr from '@/components/proposal/ProposalHeadr'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import ProposalHeaderContent from '@/components/proposal/ProposalHeaderContent'
import Footer from '@/components/shared/Footer'
import PrescriptionTable from '@/components/prescriptions/PrescriptionTable'
import PrescriptionHeader from '@/components/prescriptions/PrescriptionHeader'
import PrescriptionViewTabItems from '@/components/prescriptions/PrescriptionViewTabItems'
import RecentPrescriptionsTable from '@/components/prescriptions/RecentPrescriptonsTable'
import { useSearchParams } from "react-router-dom"

const PrescriptionsView = () => {
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('overview');
    const patientId = searchParams.get('patient_id');

    const renderTabContent = () => {
        switch (activeTab) {
            case "overview":
                return <PrescriptionTable patientIdFromUrl={patientId} />
            case "recent":
                return <RecentPrescriptionsTable />
            default:
                return null;
        }
    }
    return (
        <>
            <PageHeader>
                <PrescriptionHeader />
            </PageHeader>
            <ProposalHeaderContent />
            <PrescriptionViewTabItems activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className='main-content'>
                <div className='tab-content'>
                    {renderTabContent()}
                </div>
            </div>
            <Footer />
        </>
    )
}

export default PrescriptionsView