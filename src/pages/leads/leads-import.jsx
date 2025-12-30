import React, { useState } from 'react';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import { FiArrowLeft, FiUpload } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import CSVUploadArea from '@/components/leads/CSVUploadArea';
import { useLeads } from '../../context/LeadsContext';
import { toast } from 'react-toastify';

const LeadsImport = () => {
    const { bulkImportLeads, fetchLeads } = useLeads();
    const [importing, setImporting] = useState(false);

    const handleImport = async (selectedLeads) => {
        if (selectedLeads.length === 0) {
            toast.error('Please select at least one lead to import');
            return;
        }

        setImporting(true);
        try {
            const result = await bulkImportLeads(selectedLeads);
            toast.success(`Imported ${result.successCount} leads successfully${result.errorCount > 0 ? `, ${result.errorCount} failed` : ''}`);
            await fetchLeads();
        } catch (error) {
            console.log(`Import failed: ${error.message}`);
            // toast.error(`Import failed: ${error.message}`);
        } finally {
            setImporting(false);
        }
    };

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <Link to="/leads/all-leads" className="btn btn-light">
                        <FiArrowLeft size={16} className='me-2' />
                        <span>Back to Leads</span>
                    </Link>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <div className="col-lg-12">
                        <div className="card">
                            <div className="card-header">
                                <div className="d-flex align-items-center gap-2">
                                    <FiUpload size={24} className="text-primary" />
                                    <div>
                                        <h5 className="card-title mb-0">Import Leads from CSV</h5>
                                        <p className="text-muted mb-0">Upload a CSV file to import leads into the system</p>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="alert alert-info">
                                    <strong>CSV Format Requirements:</strong>
                                    <ul className="mb-0 mt-2">
                                        <li>Required columns: <code>Full Name</code>, <code>Mobile</code>, <code>Lead Date</code></li>
                                        <li>Optional columns: <code>Campaign ID</code>, <code>Lead Source</code>, <code>Lead Status</code>, <code>Comments</code></li>
                                        <li>First row should contain column headers</li>
                                        <li>Date format: YYYY-MM-DD (e.g., 2024-01-15)</li>
                                    </ul>
                                </div>
                                <CSVUploadArea
                                    onImportComplete={handleImport}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default LeadsImport;


