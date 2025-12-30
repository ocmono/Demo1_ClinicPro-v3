import React, { useState } from 'react';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import IntegrationsHeader from '@/components/leads/IntegrationsHeader';
import IntegrationsContent from '@/components/leads/IntegrationsContent';

const Integrations = () => {
    return (
        <>
            <PageHeader>
                <IntegrationsHeader />
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <IntegrationsContent />
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Integrations;


