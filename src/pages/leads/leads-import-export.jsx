import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import { FiArrowLeft, FiUpload, FiDownload, FiFile, FiFileText, FiGrid, FiCheckCircle, FiAlertTriangle, FiBarChart2, FiRefreshCw, FiX, FiSearch, FiCalendar, FiInfo } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useLeads } from '../../context/LeadsContext';
import CSVUploadArea from '@/components/leads/CSVUploadArea';
import { exportLeadsToCSV, exportLeadsToPDF, exportLeadsToExcel } from '@/utils/leadExport';
import { toast } from 'react-toastify';
import Table from '@/components/shared/table/Table';

const LeadsImportExport = () => {
    const { leads, campaigns, fetchLeads, bulkImportLeads } = useLeads();
    const [activeTab, setActiveTab] = useState('import');
    const [importing, setImporting] = useState(false);
    const [exporting, setExporting] = useState(false);
    
    // Import states
    const [importHistory, setImportHistory] = useState([]);
    const [importStats, setImportStats] = useState({
        totalImports: 0,
        totalRecords: 0,
        failedRecords: 0,
        successRate: 0
    });
    
    // Export states
    const [exportFilters, setExportFilters] = useState({
        format: 'CSV',
        dateFrom: '',
        dateTo: '',
        status: 'all',
        source: 'all',
        campaign: 'all'
    });
    const [exportHistory, setExportHistory] = useState([]);
    const [historyTab, setHistoryTab] = useState('import');

    useEffect(() => {
        loadImportHistory();
        loadExportHistory();
    }, []);

    const loadImportHistory = () => {
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
    };

    const loadExportHistory = () => {
        const history = localStorage.getItem('leadExportHistory');
        if (history) {
            try {
                const parsed = JSON.parse(history);
                setExportHistory(parsed);
            } catch (error) {
                console.error('Failed to load export history:', error);
            }
        }
    };

    const saveImportHistory = (importRecord) => {
        const history = JSON.parse(localStorage.getItem('leadImportHistory') || '[]');
        history.unshift({
            ...importRecord,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleString()
        });
        localStorage.setItem('leadImportHistory', JSON.stringify(history.slice(0, 50)));
        setImportHistory(history.slice(0, 50));
        loadImportHistory();
    };

    const saveExportHistory = (exportRecord) => {
        const history = JSON.parse(localStorage.getItem('leadExportHistory') || '[]');
        history.unshift({
            ...exportRecord,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleString()
        });
        localStorage.setItem('leadExportHistory', JSON.stringify(history.slice(0, 50)));
        setExportHistory(history.slice(0, 50));
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

            toast.success(`Imported ${result.successCount} leads successfully${result.errorCount > 0 ? `, ${result.errorCount} failed` : ''}`);
            await fetchLeads();
        } catch (error) {
            console.log(`Import failed: ${error.message}`);
            // toast.error(`Import failed: ${error.message}`);
        } finally {
            setImporting(false);
        }
    };

    const downloadTemplate = (format) => {
        const templateData = [
            ['Full Name', 'Mobile', 'Email', 'Company', 'Lead Date', 'Campaign ID', 'Lead Source', 'Lead Status', 'Priority', 'Value', 'Comments'],
            ['Rajesh Kumar', '9876543210', 'rajesh.kumar@gmail.com', 'Tech Solutions India', '2024-01-15', '1', 'Website', 'New', 'High', '5000', 'Interested in services'],
            ['Priya Sharma', '9876543211', 'priya.sharma@yahoo.in', 'Digital Marketing Pvt Ltd', '2024-01-16', '2', 'Referral', 'Contacted', 'Medium', '3000', 'Follow up needed']
        ];

        if (format === 'CSV') {
            const csvContent = templateData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'leads-import-template.csv';
            link.click();
            toast.success('CSV template downloaded successfully!');
        } else if (format === 'Excel') {
            // For Excel, we'll create a CSV that can be opened in Excel
            const csvContent = templateData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'leads-import-template.xls';
            link.click();
            toast.success('Excel template downloaded successfully!');
        }
    };

    const handleExport = async () => {
        if (!leads || leads.length === 0) {
            toast.error('No leads available to export');
            return;
        }

        // Filter leads based on export filters
        let leadsToExport = leads.filter(lead => {
            if (exportFilters.dateFrom && lead.leadDate && new Date(lead.leadDate) < new Date(exportFilters.dateFrom)) return false;
            if (exportFilters.dateTo && lead.leadDate && new Date(lead.leadDate) > new Date(exportFilters.dateTo)) return false;
            if (exportFilters.status !== 'all' && lead.leadStatus !== exportFilters.status) return false;
            if (exportFilters.source !== 'all' && lead.leadSource?.toLowerCase() !== exportFilters.source.toLowerCase()) return false;
            if (exportFilters.campaign !== 'all' && lead.campaignId?.toString() !== exportFilters.campaign) return false;
            return true;
        });

        if (leadsToExport.length === 0) {
            toast.error('No leads match your export filters');
            return;
        }

        setExporting(true);
        try {
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `leads-export-${timestamp}`;

            switch (exportFilters.format) {
                case 'CSV':
                    exportLeadsToCSV(leadsToExport, filename);
                    toast.success(`Exported ${leadsToExport.length} leads to CSV successfully!`);
                    break;
                case 'PDF':
                    await exportLeadsToPDF(leadsToExport, filename);
                    toast.success(`Exported ${leadsToExport.length} leads to PDF successfully!`);
                    break;
                case 'Excel':
                    exportLeadsToExcel(leadsToExport, filename);
                    toast.success(`Exported ${leadsToExport.length} leads to Excel successfully!`);
                    break;
                default:
                    toast.error('Unsupported export format');
            }

            saveExportHistory({
                format: exportFilters.format,
                recordCount: leadsToExport.length,
                filters: { ...exportFilters }
            });
        } catch (error) {
            console.log(`Export failed: ${error.message}`);
            // toast.error(`Export failed: ${error.message}`);
        } finally {
            setExporting(false);
        }
    };

    const importHistoryColumns = [
        {
            accessorKey: 'date',
            header: 'Date & Time',
            cell: (info) => {
                const value = info.getValue();
                return value ? new Date(value).toLocaleString() : 'N/A';
            }
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

    const exportHistoryColumns = [
        {
            accessorKey: 'date',
            header: 'Date & Time',
            cell: (info) => {
                const value = info.getValue();
                return value ? new Date(value).toLocaleString() : 'N/A';
            }
        },
        {
            accessorKey: 'format',
            header: 'Format',
            cell: (info) => {
                const format = info.getValue();
                const colors = { CSV: 'success', PDF: 'danger', Excel: 'primary' };
                return <span className={`badge bg-${colors[format] || 'secondary'}`}>{format}</span>;
            }
        },
        {
            accessorKey: 'recordCount',
            header: 'Records Exported',
            cell: (info) => <span className="badge bg-info">{info.getValue()}</span>
        },
        {
            accessorKey: 'filters',
            header: 'Filters Applied',
            cell: (info) => {
                const filters = info.getValue() || {};
                const activeFilters = Object.entries(filters).filter(([key, value]) => 
                    value && value !== 'all' && key !== 'format'
                );
                return activeFilters.length > 0 ? (
                    <div className="d-flex gap-1 flex-wrap">
                        {activeFilters.slice(0, 3).map(([key, value], idx) => (
                            <span key={idx} className="badge bg-light text-dark" style={{ fontSize: '10px' }}>
                                {key}: {value}
                            </span>
                        ))}
                        {activeFilters.length > 3 && (
                            <span className="badge bg-light text-dark" style={{ fontSize: '10px' }}>
                                +{activeFilters.length - 3} more
                            </span>
                        )}
                    </div>
                ) : <span className="text-muted">No filters</span>;
            }
        }
    ];

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center justify-content-between w-100 gap-2">
                    <Link to="/leads/all-leads" className="btn btn-light">
                        <FiArrowLeft size={16} className='me-2' />
                        <span>Back to Leads</span>
                    </Link>
                    <div className="d-flex gap-2">
                        {activeTab === 'import' && (
                            <button
                                className="btn btn-outline-primary"
                                onClick={() => downloadTemplate('CSV')}
                            >
                                <FiDownload className="me-1" />
                                Download Template
                            </button>
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
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${activeTab === 'import' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('import')}
                                        >
                                            <FiUpload className="me-2" />
                                            Import Leads
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${activeTab === 'export' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('export')}
                                        >
                                            <FiDownload className="me-2" />
                                            Export Leads
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('history')}
                                        >
                                            <FiCalendar className="me-2" />
                                            History
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <div className="card-body">
                                {/* Import Tab */}
                                {activeTab === 'import' && (
                                    <div>
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <div>
                                                <h5 className="mb-0">Import Leads</h5>
                                                <p className="text-muted mb-0">Upload CSV, Excel, JSON, or TSV files to import leads</p>
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

                                        {/* Import Statistics */}
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
                                                                <FiFile className="text-white" size={24} />
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
                                                                <FiCheckCircle className="text-white" size={24} />
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
                                                                <FiAlertTriangle className="text-white" size={24} />
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
                                                                <FiBarChart2 className="text-white" size={24} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Upload Area */}
                                        <div className="mb-4">
                                            <CSVUploadArea onImportComplete={handleImport} />
                                        </div>

                                        {/* Supported Formats */}
                                        <div className="alert alert-info">
                                            <div className="d-flex align-items-start">
                                                <FiInfo className="me-2 mt-1" size={20} />
                                                <div>
                                                    <strong>Supported Formats:</strong>
                                                    <ul className="mb-0 mt-2">
                                                        <li>CSV (Comma-separated values) - Max size: 10MB</li>
                                                        <li>Excel (.xlsx, .xls) - Max size: 10MB</li>
                                                        <li>JSON (JavaScript Object Notation) - Max size: 10MB</li>
                                                        <li>TSV (Tab-separated values) - Max size: 10MB</li>
                                                    </ul>
                                                    <div className="d-flex gap-2 mt-3">
                                                        <span className="badge bg-primary">CSV</span>
                                                        <span className="badge bg-success">Excel</span>
                                                        <span className="badge bg-warning">JSON</span>
                                                        <span className="badge bg-info">TSV</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Export Tab */}
                                {activeTab === 'export' && (
                                    <div>
                                        <div className="mb-4">
                                            <h5 className="mb-0">Export Leads</h5>
                                            <p className="text-muted mb-0">Export your leads in various formats with advanced filtering options</p>
                                        </div>

                                        {/* Export Statistics */}
                                        <div className="alert alert-primary mb-4">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>
                                                    <strong>{leads.length} lead(s)</strong> available for export
                                                </div>
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={handleExport}
                                                    disabled={exporting}
                                                >
                                                    {exporting ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" />
                                                            Exporting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiDownload className="me-1" />
                                                            Export Now
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Export Options */}
                                        <div className="row mb-4">
                                            <div className="col-lg-4 mb-3">
                                                <div className="card border h-100">
                                                    <div className="card-body text-center">
                                                        <FiFile size={48} className="text-success mb-3" />
                                                        <h5 className="card-title">CSV Format</h5>
                                                        <p className="text-muted small">Comma-separated values format, compatible with Excel and Google Sheets</p>
                                                        <div className="form-check form-check-inline">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                name="exportFormat"
                                                                id="formatCSV"
                                                                value="CSV"
                                                                checked={exportFilters.format === 'CSV'}
                                                                onChange={(e) => setExportFilters({ ...exportFilters, format: e.target.value })}
                                                            />
                                                            <label className="form-check-label" htmlFor="formatCSV">
                                                                Select CSV
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-4 mb-3">
                                                <div className="card border h-100">
                                                    <div className="card-body text-center">
                                                        <FiFileText size={48} className="text-danger mb-3" />
                                                        <h5 className="card-title">PDF Format</h5>
                                                        <p className="text-muted small">Portable Document Format, perfect for printing and sharing</p>
                                                        <div className="form-check form-check-inline">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                name="exportFormat"
                                                                id="formatPDF"
                                                                value="PDF"
                                                                checked={exportFilters.format === 'PDF'}
                                                                onChange={(e) => setExportFilters({ ...exportFilters, format: e.target.value })}
                                                            />
                                                            <label className="form-check-label" htmlFor="formatPDF">
                                                                Select PDF
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-4 mb-3">
                                                <div className="card border h-100">
                                                    <div className="card-body text-center">
                                                        <FiGrid size={48} className="text-primary mb-3" />
                                                        <h5 className="card-title">Excel Format</h5>
                                                        <p className="text-muted small">Microsoft Excel compatible format with formatting</p>
                                                        <div className="form-check form-check-inline">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                name="exportFormat"
                                                                id="formatExcel"
                                                                value="Excel"
                                                                checked={exportFilters.format === 'Excel'}
                                                                onChange={(e) => setExportFilters({ ...exportFilters, format: e.target.value })}
                                                            />
                                                            <label className="form-check-label" htmlFor="formatExcel">
                                                                Select Excel
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Export Filters */}
                                        <div className="card mb-4">
                                            <div className="card-header">
                                                <h6 className="mb-0">Export Filters (Optional)</h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="row g-3">
                                                    <div className="col-md-4">
                                                        <label className="form-label">Date From</label>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            value={exportFilters.dateFrom}
                                                            onChange={(e) => setExportFilters({ ...exportFilters, dateFrom: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label">Date To</label>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            value={exportFilters.dateTo}
                                                            onChange={(e) => setExportFilters({ ...exportFilters, dateTo: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label">Status</label>
                                                        <select
                                                            className="form-select"
                                                            value={exportFilters.status}
                                                            onChange={(e) => setExportFilters({ ...exportFilters, status: e.target.value })}
                                                        >
                                                            <option value="all">All Status</option>
                                                            <option value="New">New</option>
                                                            <option value="Contacted">Contacted</option>
                                                            <option value="Qualified">Qualified</option>
                                                            <option value="Converted">Converted</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label">Source</label>
                                                        <select
                                                            className="form-select"
                                                            value={exportFilters.source}
                                                            onChange={(e) => setExportFilters({ ...exportFilters, source: e.target.value })}
                                                        >
                                                            <option value="all">All Sources</option>
                                                            <option value="google">Google</option>
                                                            <option value="facebook">Facebook</option>
                                                            <option value="meta">Meta</option>
                                                            <option value="website">Website</option>
                                                            <option value="referral">Referral</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label">Campaign</label>
                                                        <select
                                                            className="form-select"
                                                            value={exportFilters.campaign}
                                                            onChange={(e) => setExportFilters({ ...exportFilters, campaign: e.target.value })}
                                                        >
                                                            <option value="all">All Campaigns</option>
                                                            {campaigns.map(campaign => (
                                                                <option key={campaign.id} value={campaign.id.toString()}>
                                                                    {campaign.displayName}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* History Tab */}
                                {activeTab === 'history' && (
                                    <div>
                                        <div className="mb-4">
                                            <h5 className="mb-0">Import/Export History</h5>
                                            <p className="text-muted mb-0">View your import and export activity</p>
                                        </div>

                                        <ul className="nav nav-tabs mb-4" role="tablist">
                                            <li className="nav-item">
                                                <button
                                                    className={`nav-link ${historyTab === 'import' ? 'active' : ''}`}
                                                    onClick={() => setHistoryTab('import')}
                                                >
                                                    Import History ({importHistory.length})
                                                </button>
                                            </li>
                                            <li className="nav-item">
                                                <button
                                                    className={`nav-link ${historyTab === 'export' ? 'active' : ''}`}
                                                    onClick={() => setHistoryTab('export')}
                                                >
                                                    Export History ({exportHistory.length})
                                                </button>
                                            </li>
                                        </ul>

                                        {historyTab === 'import' ? (
                                            <div>
                                                {importHistory.length > 0 ? (
                                                    <Table
                                                        data={importHistory}
                                                        columns={importHistoryColumns}
                                                        emptyMessage="No import history available"
                                                    />
                                                ) : (
                                                    <div className="text-center py-5 border rounded">
                                                        <FiFile size={48} className="text-muted mb-3" />
                                                        <p className="text-muted">No import history yet</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                {exportHistory.length > 0 ? (
                                                    <Table
                                                        data={exportHistory}
                                                        columns={exportHistoryColumns}
                                                        emptyMessage="No export history available"
                                                    />
                                                ) : (
                                                    <div className="text-center py-5 border rounded">
                                                        <FiDownload size={48} className="text-muted mb-3" />
                                                        <p className="text-muted">No export history yet</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default LeadsImportExport;

