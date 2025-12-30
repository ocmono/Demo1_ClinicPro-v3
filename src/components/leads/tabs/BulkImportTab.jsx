import React, { useState, useEffect } from 'react';
import { FiUpload, FiDownload, FiFile, FiCheckCircle, FiAlertTriangle, FiBarChart2 } from 'react-icons/fi';
import CSVUploadArea from '@/components/leads/CSVUploadArea';
import { useLeads } from '../../../context/LeadsContext';
import { toast } from 'react-toastify';
import Table from '@/components/shared/table/Table';

const BulkImportTab = () => {
    const { bulkImportLeads, fetchLeads } = useLeads();
    const [importing, setImporting] = useState(false);
    const [activeSubTab, setActiveSubTab] = useState('upload');
    const [importHistory, setImportHistory] = useState([]);
    const [importStats, setImportStats] = useState({
        totalImports: 0,
        totalRecords: 0,
        failedRecords: 0,
        successRate: 0
    });

    useEffect(() => {
        const history = localStorage.getItem('leadImportHistory');
        if (history) {
            try {
                const parsed = JSON.parse(history);
                setImportHistory(parsed);
                
                const totalImports = parsed.length;
                const totalRecords = parsed.reduce((sum, item) => sum + (item.totalRecords || 0), 0);
                const failedRecords = parsed.reduce((sum, item) => sum + (item.failedRecords || 0), 0);
                const successRate = totalRecords > 0 ? ((totalRecords - failedRecords) / totalRecords * 100).toFixed(1) : 0;
                
                setImportStats({
                    totalImports,
                    totalRecords,
                    failedRecords,
                    successRate: parseFloat(successRate)
                });
            } catch (error) {
                console.error('Failed to load import history:', error);
            }
        }
    }, []);

    const saveImportHistory = (importRecord) => {
        const history = JSON.parse(localStorage.getItem('leadImportHistory') || '[]');
        history.unshift({
            ...importRecord,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleString()
        });
        localStorage.setItem('leadImportHistory', JSON.stringify(history.slice(0, 50)));
        setImportHistory(history.slice(0, 50));
    };

    const handleImport = async (selectedLeads) => {
        if (selectedLeads.length === 0) {
            toast.error('Please select at least one lead to import');
            return;
        }

        setImporting(true);
        try {
            const result = await bulkImportLeads(selectedLeads);
            
            saveImportHistory({
                totalRecords: selectedLeads.length,
                successCount: result.successCount,
                failedRecords: result.errorCount,
                successRate: ((result.successCount / selectedLeads.length) * 100).toFixed(1)
            });

            setImportStats(prev => ({
                totalImports: prev.totalImports + 1,
                totalRecords: prev.totalRecords + selectedLeads.length,
                failedRecords: prev.failedRecords + result.errorCount,
                successRate: ((prev.totalRecords + result.successCount) / (prev.totalRecords + selectedLeads.length) * 100).toFixed(1)
            }));

            toast.success(`Imported ${result.successCount} leads successfully${result.errorCount > 0 ? `, ${result.errorCount} failed` : ''}`);
            await fetchLeads();
        } catch (error) {
            toast.error(`Import failed: ${error.message}`);
        } finally {
            setImporting(false);
        }
    };

    const downloadTemplate = (format) => {
        const templateData = [
            ['Full Name', 'Mobile', 'Lead Date', 'Campaign ID', 'Lead Source', 'Lead Status', 'Comments'],
            ['John Doe', '+1234567890', '2024-01-15', '1', 'Website', 'New', 'Interested in services'],
            ['Jane Smith', '+1234567891', '2024-01-16', '2', 'Referral', 'Contacted', 'Follow up needed']
        ];

        if (format === 'CSV') {
            const csvContent = templateData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'leads-import-template.csv';
            link.click();
        }
        toast.success(`${format} template downloaded successfully!`);
    };

    const historyColumns = [
        {
            accessorKey: 'date',
            header: 'Date',
            cell: (info) => <span>{new Date(info.getValue()).toLocaleString()}</span>
        },
        {
            accessorKey: 'totalRecords',
            header: 'Total Records',
            cell: (info) => <span className="badge bg-info">{info.getValue()}</span>
        },
        {
            accessorKey: 'successCount',
            header: 'Success',
            cell: (info) => <span className="badge bg-success">{info.getValue()}</span>
        },
        {
            accessorKey: 'failedRecords',
            header: 'Failed',
            cell: (info) => <span className="badge bg-danger">{info.getValue()}</span>
        },
        {
            accessorKey: 'successRate',
            header: 'Success Rate',
            cell: (info) => <span className="badge bg-primary">{info.getValue()}%</span>
        }
    ];

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h5 className="mb-0">Lead File Upload</h5>
                    <p className="text-muted mb-0">Import leads from CSV, Excel, JSON, or TSV files with field mapping</p>
                </div>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => downloadTemplate('CSV')}
                    >
                        <FiDownload className="me-1" />
                        CSV Template
                    </button>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => downloadTemplate('Excel')}
                    >
                        <FiDownload className="me-1" />
                        Excel Template
                    </button>
                </div>
            </div>

            {/* Summary Statistics */}
            <div className="row mb-4">
                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border">
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-1">Total Imports</h6>
                                    <h3 className="mb-0">{importStats.totalImports}</h3>
                                </div>
                                <div className="avatar-text avatar-lg bg-primary">
                                    <FiFile size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border">
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-1">Total Records</h6>
                                    <h3 className="mb-0">{importStats.totalRecords}</h3>
                                </div>
                                <div className="avatar-text avatar-lg bg-success">
                                    <FiCheckCircle size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border">
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-1">Failed Records</h6>
                                    <h3 className="mb-0">{importStats.failedRecords}</h3>
                                </div>
                                <div className="avatar-text avatar-lg bg-warning">
                                    <FiAlertTriangle size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border">
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-1">Success Rate</h6>
                                    <h3 className="mb-0">{importStats.successRate}%</h3>
                                </div>
                                <div className="avatar-text avatar-lg bg-info">
                                    <FiBarChart2 size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub Tabs */}
            <ul className="nav nav-tabs mb-4" role="tablist">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeSubTab === 'upload' ? 'active' : ''}`}
                        onClick={() => setActiveSubTab('upload')}
                    >
                        Upload & Import
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeSubTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveSubTab('history')}
                    >
                        Import History
                    </button>
                </li>
            </ul>

            {/* Tab Content */}
            {activeSubTab === 'upload' ? (
                <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6>Step 1: Upload File</h6>
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => downloadTemplate('CSV')}
                            >
                                <FiDownload className="me-1" />
                                Download CSV Template
                            </button>
                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => downloadTemplate('Excel')}
                            >
                                <FiDownload className="me-1" />
                                Download Excel Template
                            </button>
                        </div>
                    </div>
                    <CSVUploadArea onImportComplete={handleImport} />
                    <div className="mt-3">
                        <small className="text-muted">
                            <strong>Supported formats:</strong> CSV, Excel (.xlsx, .xls), JSON, TSV (Max size: 10MB)
                        </small>
                        <div className="d-flex gap-2 mt-2">
                            <span className="badge bg-primary">CSV</span>
                            <span className="badge bg-success">Excel</span>
                            <span className="badge bg-warning">JSON</span>
                            <span className="badge bg-info">TSV</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    {importHistory.length > 0 ? (
                        <Table
                            data={importHistory}
                            columns={historyColumns}
                            emptyMessage="No import history available"
                        />
                    ) : (
                        <div className="text-center py-5">
                            <FiFile size={48} className="text-muted mb-3" />
                            <p className="text-muted">No import history yet</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BulkImportTab;


