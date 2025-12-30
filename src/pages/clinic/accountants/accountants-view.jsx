import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import AccountantsHeader from '@/components/clinic/AccountantsHeader'
import AccountantsTable from '@/components/clinic/AccountantsTable'
import Footer from '@/components/shared/Footer'

const AccountantsView = () => {
    return (
        <>
            <PageHeader>
                <AccountantsHeader />
            </PageHeader>
            <div className='main-content'>
                <div className='card'>
                    <div className='card-body'>
                        <AccountantsTable />
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    )
}

export default AccountantsView 