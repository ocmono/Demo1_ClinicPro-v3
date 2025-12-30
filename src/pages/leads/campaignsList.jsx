import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import CampaignViewHeader from '@/components/campaigns/CampaignViewHeader'
import Footer from '@/components/shared/Footer'
import CampaignTable from '@/components/leads/CampaignsTable'

const CampaignsList = () => {
    return (
        <>
            <PageHeader>
                <CampaignViewHeader />
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <CampaignTable />
                </div>
            </div>
            <Footer/>
        </>
    )
}

export default CampaignsList