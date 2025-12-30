// import React, { useState } from 'react'
// import SupportForm from '@/components/support/SupportForm'
// import SupportTable from '@/components/support/SupportTable'

// const SettingsSupport = () => {
//     const [activeTab, setActiveTab] = useState('overview');
//     return (
//         <div className='main-content'>
//             <div className='row justify-content-center'>
//                 <div className="col-lg-8">
//                     <div className="card border-top-0">
//                         {/* Tabs Header */}
//                         <div className="card-header p-0">
//                             <ul className="nav nav-tabs flex-wrap w-100 text-center customers-nav-tabs">
//                                 <li className="nav-item flex-fill border-top">
//                                     <a
//                                         className={`nav-link ${activeTab === "profile" ? "active" : ""} px-5`}
//                                         onClick={() => setActiveTab("profile")}
//                                     >
//                                         Support
//                                     </a>
//                                 </li>
//                                 <li className="nav-item flex-fill border-top">
//                                     <a
//                                         className={`nav-link ${activeTab === "vaccines" ? "active" : ""}`}
//                                         onClick={() => setActiveTab("vaccines")}
//                                     >
//                                         Tickets
//                                     </a>
//                                 </li>
//                             </ul>
//                         </div>

//                         {/* Tabs Content */}
//                         <div className="tab-content">
//                             {activeTab === "profile" && <SupportForm />}
//                             {activeTab === "vaccines" && <SupportTable />}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default SettingsSupport

import React, { useState } from 'react'
import SupportForm from '@/components/support/SupportForm'
import SupportTable from '@/components/support/SupportTable'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import PrescriptionHeader from '@/components/prescriptions/PrescriptionHeader'
import Footer from '@/components/shared/Footer'

const SettingsSupport = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const renderTabContent = () => {
        switch (activeTab) {
            case "overview":
                return <SupportForm />
            case "recent":
                return <SupportTable />
            default:
                return null;
        }
    }
    return (
        <>
            <PageHeader>
                <PrescriptionHeader />
            </PageHeader>
            <div className="bg-white py-3 border-bottom rounded-0 p-md-0 mb-0">
                <div className="d-md-none d-flex align-items-center justify-content-between">
                    <a href="#" className="page-content-left-open-toggle">
                        <i className="feather-align-left fs-20"></i>
                    </a>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                    <div className="nav-tabs-wrapper page-content-left-sidebar-wrapper">
                        <div className="d-flex d-md-none">
                            <a href="#" className="page-content-left-close-toggle">
                                <i className="feather-arrow-left me-2"></i>
                                <span>Back</span>
                            </a>
                        </div>
                        <ul className="nav nav-tabs flex-wrap w-100 text-center customers-nav-tabs" id="myTab" role="tablist">
                            <li className="nav-item flex-fill border-top" role="presentation">
                                <button className={`nav-link${activeTab === 'overview' ? ' active' : ''}`} onClick={() => setActiveTab('overview')}>Support Form</button>
                            </li>
                            <li className="nav-item flex-fill border-top" role="presentation">
                                <button className={`nav-link${activeTab === 'recent' ? ' active' : ''}`} onClick={() => setActiveTab('recent')}>All Tickets</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className='main-content'>
                <div className='tab-content'>
                    {renderTabContent()}
                </div>
            </div>
            <Footer />
        </>
    )
}

export default SettingsSupport