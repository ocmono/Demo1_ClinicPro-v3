import React, { useState } from 'react';
import { FiDownload, FiFileText, FiFile, FiGrid } from 'react-icons/fi';
import { useLeads } from '../../../context/LeadsContext';
import { exportLeadsToCSV, exportLeadsToPDF, exportLeadsToExcel } from '@/utils/leadExport';
import { toast } from 'react-toastify';

const ExportTab = () => {
    const { leads } = useLeads();
    const [exporting, setExporting] = useState(false);

    const handleExport = async (format) => {
        if (!leads || leads.length === 0) {
            toast.error('No leads available to export');
            return;
        }

        setExporting(true);
        try {
            switch (format) {
                case 'CSV':
                    exportLeadsToCSV(leads, 'leads');
                    toast.success('Leads exported to CSV successfully!');
                    break;
                case 'PDF':
                    await exportLeadsToPDF(leads, 'leads');
                    toast.success('Leads exported to PDF successfully!');
                    break;
                case 'Excel':
                    exportLeadsToExcel(leads, 'leads');
                    toast.success('Leads exported to Excel successfully!');
                    break;
                default:
                    toast.error('Unsupported export format');
            }
        } catch (error) {
            toast.error(`Export failed: ${error.message}`);
        } finally {
            setExporting(false);
        }
    };

    const exportOptions = [
        {
            format: 'CSV',
            icon: <FiFile size={48} className="text-success" />,
            title: 'Export as CSV',
            description: 'Comma-separated values format, compatible with Excel and Google Sheets',
            color: 'success'
        },
        {
            format: 'PDF',
            icon: <FiFileText size={48} className="text-danger" />,
            title: 'Export as PDF',
            description: 'Portable Document Format, perfect for printing and sharing',
            color: 'danger'
        },
        {
            format: 'Excel',
            icon: <FiGrid size={48} className="text-primary" />,
            title: 'Export as Excel',
            description: 'Microsoft Excel compatible format',
            color: 'primary'
        }
    ];

    return (
        <div>
            <div className="alert alert-info mb-4">
                <strong>{leads.length} lead(s)</strong> available for export
            </div>
            <div className="row">
                {exportOptions.map((option) => (
                    <div key={option.format} className="col-lg-4 mb-4">
                        <div className="card h-100 border">
                            <div className="card-body text-center">
                                <div className="mb-3">
                                    {option.icon}
                                </div>
                                <h5 className="card-title">{option.title}</h5>
                                <p className="text-muted small">{option.description}</p>
                                <button
                                    className={`btn btn-${option.color} w-100`}
                                    onClick={() => handleExport(option.format)}
                                    disabled={exporting || leads.length === 0}
                                >
                                    {exporting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" />
                                            Exporting...
                                        </>
                                    ) : (
                                        <>
                                            <FiDownload className="me-2" />
                                            Export {option.format}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExportTab;


