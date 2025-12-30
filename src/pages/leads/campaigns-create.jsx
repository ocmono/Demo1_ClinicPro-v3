import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import CampaignsCreateHeader from '@/components/campaigns/CampaignsCreateHeader'
import CampaignsCreateContent from '@/components/campaigns/CampaignsCreateContent'
import Footer from '@/components/shared/Footer'

const CampaignsCreate = () => {
    return (
        <>
            <PageHeader>
                <CampaignsCreateHeader />
            </PageHeader>

            <div className='main-content'>
                <div className='row'>
                    <CampaignsCreateContent />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default CampaignsCreate