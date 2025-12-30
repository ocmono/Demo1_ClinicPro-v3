import React, { useState } from 'react';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import { FiUsers, FiPlus, FiFileText, FiBarChart2, FiDownload, FiUpload } from 'react-icons/fi';
import { SiGooglesheets } from 'react-icons/si';
import { Link } from 'react-router-dom';
import { useLeads } from '../../context/LeadsContext';

// Import tab components
import LeadsListTab from '@/components/leads/tabs/LeadsListTab';
import BulkImportTab from '@/components/leads/tabs/BulkImportTab';
import ExportTab from '@/components/leads/tabs/ExportTab';
import GoogleSheetsTab from '@/components/leads/tabs/GoogleSheetsTab';
import CampaignsTab from '@/components/leads/tabs/CampaignsTab';
import TemplatesTab from '@/components/leads/tabs/TemplatesTab';

const LeadsDashboard = () => {
    const { leads, campaigns } = useLeads();
    const [activeTab, setActiveTab] = useState('leads');

    const tabs = [
        { id: 'leads', label: 'All Leads', icon: <FiUsers /> },
        { id: 'campaigns', label: 'Campaigns', icon: <FiBarChart2 /> },
        { id: 'import', label: 'Bulk Import', icon: <FiUpload /> },
        { id: 'export', label: 'Export', icon: <FiDownload /> },
        { id: 'sheets', label: 'Google Sheets', icon: <SiGooglesheets /> },
        { id: 'templates', label: 'Templates', icon: <FiFileText /> }
    ];

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center justify-content-between w-100">
                    <div></div>
                    <div className="d-flex gap-2">
                        {activeTab === 'leads' && (
                            <Link to="/leads/add-lead" className="btn btn-primary">
                                <FiPlus size={16} className='me-2' />
                                Add Lead
                            </Link>
                        )}
                        {activeTab === 'campaigns' && (
                            <Link to="/leads/add-campaigns" className="btn btn-primary">
                                <FiPlus size={16} className='me-2' />
                                Create Campaign
                            </Link>
                        )}
                        {activeTab === 'templates' && (
                            <Link to="/leads/templates" className="btn btn-primary">
                                <FiPlus size={16} className='me-2' />
                                Create Template
                            </Link>
                        )}
                    </div>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <div className="col-lg-12">
                        <div className="card">
                            <div className="card-header">
                                <ul className="nav nav-tabs card-header-tabs" role="tablist">
                                    {tabs.map(tab => (
                                        <li key={tab.id} className="nav-item" role="presentation">
                                            <button
                                                className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                                                onClick={() => setActiveTab(tab.id)}
                                                type="button"
                                            >
                                                {tab.icon}
                                                <span className="ms-2">{tab.label}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="card-body">
                                {activeTab === 'leads' && <LeadsListTab />}
                                {activeTab === 'campaigns' && <CampaignsTab />}
                                {activeTab === 'import' && <BulkImportTab />}
                                {activeTab === 'export' && <ExportTab />}
                                {activeTab === 'sheets' && <GoogleSheetsTab />}
                                {activeTab === 'templates' && <TemplatesTab />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default LeadsDashboard;

