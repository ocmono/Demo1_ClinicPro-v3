import React from 'react'

const PrescriptionViewTabItems = ({ activeTab, setActiveTab }) => {
    return (
        <div className="bg-white py-3 border-bottom rounded-0 p-md-0 mb-0">
            <div className="d-md-none d-flex align-items-center justify-content-between">
                <a href="#" className="page-content-left-open-toggle">
                    <i className="feather-align-left fs-20"></i>
                </a>
            </div>
            <div className="d-flex align-items-center justify-content-between" style={{ borderTop: "1px solid #e5e7eb" }}>
                <div className="nav-tabs-wrapper page-content-left-sidebar-wrapper">
                    <div className="d-flex d-md-none">
                        <a href="#" className="page-content-left-close-toggle">
                            <i className="feather-arrow-left me-2"></i>
                            <span>Back</span>
                        </a>
                    </div>
                    <ul className="nav nav-tabs flex-wrap w-100 text-center customers-nav-tabs" id="myTab" role="tablist">
                        <li className="nav-item flex-fill" role="presentation">
                            <button className={`nav-link${activeTab === 'overview' ? ' active' : ''}`} onClick={() => setActiveTab('overview')}>All Prescriptions</button>
                        </li>
                        <li className="nav-item flex-fill" role="presentation">
                            <button className={`nav-link${activeTab === 'recent' ? ' active' : ''}`} onClick={() => setActiveTab('recent')}>Recent Prescriptions</button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default PrescriptionViewTabItems