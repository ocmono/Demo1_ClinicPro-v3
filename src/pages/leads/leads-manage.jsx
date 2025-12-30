import React, { useState, useMemo, useEffect } from 'react';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import { FiUsers, FiFilter, FiDownload, FiUpload, FiSearch, FiX, FiCheck, FiEdit3, FiTrash2, FiMoreHorizontal, FiStar, FiCalendar, FiTag, FiUser, FiMail, FiPhone, FiMapPin, FiDollarSign, FiBarChart2, FiRefreshCw, FiSettings, FiSave, FiEye, FiEyeOff, FiClock, FiBell, FiTrendingUp, FiTrendingDown, FiCopy, FiShare2, FiArchive, FiLayers, FiGrid, FiList, FiColumns, FiUserPlus } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useLeads } from '../../context/LeadsContext';
import { calculateLeadScore } from '@/utils/leadIntegrations';
import { leadsStatusOptions } from '@/utils/options';
import Table from '@/components/shared/table/Table';
import BulkOperationsModal from '@/components/leads/BulkOperationsModal';
import { toast } from 'react-toastify';
import Dropdown from '@/components/shared/Dropdown';
import { exportLeadsToCSV, exportLeadsToPDF, exportLeadsToExcel } from '@/utils/leadExport';
import { convertLeadToPatient, canConvertLeadToPatient } from '@/utils/leadToPatient';

const LeadsManage = () => {
    const { leads, campaigns, fetchLeads, bulkDeleteLeads, bulkUpdateLeads, updateLead } = useLeads();
    const [selectedLeads, setSelectedLeads] = useState(new Set());
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [leadToConvert, setLeadToConvert] = useState(null);
    
    // Advanced Filters
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        source: 'all',
        campaign: 'all',
        priority: 'all',
        assignedTo: 'all',
        scoreMin: '',
        scoreMax: '',
        dateFrom: '',
        dateTo: '',
        valueMin: '',
        valueMax: '',
        tags: [],
        hasEmail: 'all',
        hasPhone: 'all',
        duplicates: 'all'
    });

    // Sorting
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    
    // Column visibility
    const [visibleColumns, setVisibleColumns] = useState({
        id: true,
        name: true,
        company: true,
        phone: true,
        email: true,
        campaign: true,
        status: true,
        score: true,
        priority: true,
        value: true,
        date: true,
        assignedTo: true,
        source: true,
        tags: true
    });

    // View mode (table/list/grid)
    const [viewMode, setViewMode] = useState('table');
    
    // Saved filter presets
    const [savedFilters, setSavedFilters] = useState([]);
    const [showSaveFilterModal, setShowSaveFilterModal] = useState(false);
    const [filterPresetName, setFilterPresetName] = useState('');
    
    // Duplicate detection
    const [showDuplicates, setShowDuplicates] = useState(false);
    const [duplicateGroups, setDuplicateGroups] = useState([]);
    
    // Quick actions
    const [showQuickActions, setShowQuickActions] = useState(false);
    
    // Export options
    const [showExportModal, setShowExportModal] = useState(false);
    
    // Load saved filters from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('leadFilterPresets');
        if (saved) {
            try {
                setSavedFilters(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load saved filters:', e);
            }
        }
        
        // Detect duplicates
        detectDuplicates();
    }, [leads]);

    const detectDuplicates = () => {
        const duplicates = new Map();
        leads.forEach(lead => {
            const key = `${lead.mobile || ''}-${lead.email || ''}`.toLowerCase();
            if (key && key !== '-') {
                if (!duplicates.has(key)) {
                    duplicates.set(key, []);
                }
                duplicates.get(key).push(lead);
            }
        });
        
        const groups = Array.from(duplicates.values()).filter(group => group.length > 1);
        setDuplicateGroups(groups);
    };

    const saveFilterPreset = () => {
        if (!filterPresetName.trim()) {
            toast.error('Please enter a name for the filter preset');
            return;
        }
        
        const preset = {
            id: Date.now(),
            name: filterPresetName,
            filters: { ...filters },
            createdAt: new Date().toISOString()
        };
        
        const updated = [...savedFilters, preset];
        setSavedFilters(updated);
        localStorage.setItem('leadFilterPresets', JSON.stringify(updated));
        setShowSaveFilterModal(false);
        setFilterPresetName('');
        toast.success('Filter preset saved successfully!');
    };

    const loadFilterPreset = (preset) => {
        setFilters(preset.filters);
        setCurrentPage(1);
        toast.success(`Loaded filter preset: ${preset.name}`);
    };

    const deleteFilterPreset = (id) => {
        const updated = savedFilters.filter(p => p.id !== id);
        setSavedFilters(updated);
        localStorage.setItem('leadFilterPresets', JSON.stringify(updated));
        toast.success('Filter preset deleted');
    };

    const handleExport = async (format) => {
        const leadsToExport = filteredAndSortedLeads;
        if (leadsToExport.length === 0) {
            toast.error('No leads to export');
            return;
        }

        try {
            switch (format) {
                case 'CSV':
                    exportLeadsToCSV(leadsToExport, `leads-export-${new Date().toISOString().split('T')[0]}`);
                    toast.success('Leads exported to CSV successfully!');
                    break;
                case 'PDF':
                    await exportLeadsToPDF(leadsToExport, `leads-export-${new Date().toISOString().split('T')[0]}`);
                    toast.success('Leads exported to PDF successfully!');
                    break;
                case 'Excel':
                    exportLeadsToExcel(leadsToExport, `leads-export-${new Date().toISOString().split('T')[0]}`);
                    toast.success('Leads exported to Excel successfully!');
                    break;
            }
            setShowExportModal(false);
        } catch (error) {
            toast.error(`Export failed: ${error.message}`);
        }
    };

    const getCampaignName = (id) => {
        const campaign = campaigns.find((c) => c.id?.toString() === id?.toString());
        return campaign ? campaign.displayName : 'Unknown Campaign';
    };

    // Filter and sort leads
    const filteredAndSortedLeads = useMemo(() => {
        let filtered = leads.filter(lead => {
            // Search filter
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const matchesSearch = 
                    lead.fullName?.toLowerCase().includes(searchLower) ||
                    lead.mobile?.includes(filters.search) ||
                    lead.email?.toLowerCase().includes(searchLower) ||
                    lead.company?.toLowerCase().includes(searchLower) ||
                    lead.comments?.toLowerCase().includes(searchLower);
                if (!matchesSearch) return false;
            }

            // Status filter
            if (filters.status !== 'all' && lead.leadStatus !== filters.status) return false;

            // Source filter
            if (filters.source !== 'all' && lead.leadSource?.toLowerCase() !== filters.source.toLowerCase()) return false;

            // Campaign filter
            if (filters.campaign !== 'all' && lead.campaignId?.toString() !== filters.campaign) return false;

            // Priority filter
            if (filters.priority !== 'all') {
                const leadPriority = lead.priority?.toLowerCase() || 'low';
                if (leadPriority !== filters.priority.toLowerCase()) return false;
            }

            // Assigned to filter
            if (filters.assignedTo !== 'all') {
                if (filters.assignedTo === 'unassigned' && lead.assignedTo) return false;
                if (filters.assignedTo !== 'unassigned' && lead.assignedTo !== filters.assignedTo) return false;
            }

            // Score range filter
            const score = calculateLeadScore(lead);
            if (filters.scoreMin && score < parseInt(filters.scoreMin)) return false;
            if (filters.scoreMax && score > parseInt(filters.scoreMax)) return false;

            // Date range filter
            if (filters.dateFrom && lead.leadDate && new Date(lead.leadDate) < new Date(filters.dateFrom)) return false;
            if (filters.dateTo && lead.leadDate && new Date(lead.leadDate) > new Date(filters.dateTo)) return false;

            // Value range filter
            const value = parseFloat(lead.value) || 0;
            if (filters.valueMin && value < parseFloat(filters.valueMin)) return false;
            if (filters.valueMax && value > parseFloat(filters.valueMax)) return false;

            // Email filter
            if (filters.hasEmail === 'yes' && !lead.email) return false;
            if (filters.hasEmail === 'no' && lead.email) return false;

            // Phone filter
            if (filters.hasPhone === 'yes' && !lead.mobile) return false;
            if (filters.hasPhone === 'no' && lead.mobile) return false;

            return true;
        });

        // Sorting
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                if (sortConfig.key === 'score') {
                    aVal = calculateLeadScore(a);
                    bVal = calculateLeadScore(b);
                } else if (sortConfig.key === 'value') {
                    aVal = parseFloat(a.value) || 0;
                    bVal = parseFloat(b.value) || 0;
                } else if (sortConfig.key === 'leadDate') {
                    aVal = new Date(a.leadDate || 0);
                    bVal = new Date(b.leadDate || 0);
                }

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [leads, filters, sortConfig, campaigns]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedLeads.length / itemsPerPage);
    const paginatedLeads = filteredAndSortedLeads.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Statistics
    const stats = useMemo(() => {
        const filtered = filteredAndSortedLeads;
        return {
            total: filtered.length,
            new: filtered.filter(l => l.leadStatus?.toLowerCase() === 'new').length,
            contacted: filtered.filter(l => l.leadStatus?.toLowerCase() === 'contacted').length,
            qualified: filtered.filter(l => l.leadStatus?.toLowerCase() === 'qualified').length,
            converted: filtered.filter(l => l.leadStatus?.toLowerCase() === 'converted').length,
            totalValue: filtered.reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0),
            avgScore: filtered.length > 0
                ? (filtered.reduce((sum, l) => sum + calculateLeadScore(l), 0) / filtered.length).toFixed(1)
                : 0,
            highPriority: filtered.filter(l => l.priority?.toLowerCase() === 'high').length
        };
    }, [filteredAndSortedLeads]);

    const handleSelectLead = (leadId) => {
        const newSelected = new Set(selectedLeads);
        if (newSelected.has(leadId)) {
            newSelected.delete(leadId);
        } else {
            newSelected.add(leadId);
        }
        setSelectedLeads(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedLeads.size === paginatedLeads.length) {
            setSelectedLeads(new Set());
        } else {
            setSelectedLeads(new Set(paginatedLeads.map(lead => lead.id || lead._id)));
        }
    };

    const handleBulkAction = async (action, data) => {
        const leadIds = Array.from(selectedLeads);
        if (leadIds.length === 0) {
            toast.error('Please select at least one lead');
            return;
        }

        try {
            if (action === 'delete') {
                await bulkDeleteLeads(leadIds);
                toast.success(`Deleted ${leadIds.length} lead(s) successfully`);
            } else if (action === 'update') {
                await bulkUpdateLeads(leadIds, data);
                toast.success(`Updated ${leadIds.length} lead(s) successfully`);
            }
            setSelectedLeads(new Set());
            setShowBulkModal(false);
            await fetchLeads();
        } catch (error) {
            toast.error(`Failed to ${action} leads: ${error.message}`);
        }
    };

    const handleConvertToPatient = (lead) => {
        const validation = canConvertLeadToPatient(lead);
        if (!validation.canConvert) {
            toast.error(validation.reason);
            return;
        }

        setLeadToConvert(lead);
        setShowConvertModal(true);
    };

    const confirmConvertToPatient = async () => {
        if (!leadToConvert) return;

        try {
            // Convert lead data to patient format
            const patientData = convertLeadToPatient(leadToConvert);

            // Save patient to localStorage (or send to API in production)
            const existingPatients = JSON.parse(localStorage.getItem('patients') || '[]');
            const newPatient = {
                id: Date.now().toString(),
                ...patientData,
                patientId: Date.now().toString()
            };
            existingPatients.push(newPatient);
            localStorage.setItem('patients', JSON.stringify(existingPatients));

            // Update lead status to 'converted' and add patient reference
            const updatedLead = {
                ...leadToConvert,
                leadStatus: 'converted',
                patientId: newPatient.id,
                convertedAt: new Date().toISOString()
            };

            if (updateLead) {
                await updateLead(leadToConvert.id || leadToConvert._id, updatedLead);
            } else {
                // Fallback: update in localStorage
                const allLeads = JSON.parse(localStorage.getItem('leads') || '[]');
                const updatedLeads = allLeads.map(l => 
                    (l.id || l._id) === (leadToConvert.id || leadToConvert._id) 
                        ? updatedLead 
                        : l
                );
                localStorage.setItem('leads', JSON.stringify(updatedLeads));
            }

            toast.success(`Lead "${leadToConvert.fullName}" converted to patient successfully!`);
            setShowConvertModal(false);
            setLeadToConvert(null);
            await fetchLeads();

            // Optionally navigate to patient page
            setTimeout(() => {
                if (window.confirm('Would you like to view the patient record?')) {
                    navigate(`/patients/view/${newPatient.id}`);
                }
            }, 1000);
        } catch (error) {
            toast.error(`Failed to convert lead: ${error.message}`);
        }
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            status: 'all',
            source: 'all',
            campaign: 'all',
            priority: 'all',
            assignedTo: 'all',
            scoreMin: '',
            scoreMax: '',
            dateFrom: '',
            dateTo: '',
            valueMin: '',
            valueMax: '',
            tags: [],
            hasEmail: 'all',
            hasPhone: 'all',
            duplicates: 'all'
        });
        setCurrentPage(1);
    };

    const activeFiltersCount = Object.values(filters).filter(v => 
        v !== 'all' && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
    ).length;

    const columns = [
        {
            accessorKey: 'id',
            header: ({ table }) => (
                <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedLeads.size === paginatedLeads.length && paginatedLeads.length > 0}
                    onChange={handleSelectAll}
                />
            ),
            cell: ({ row }) => (
                <div className="d-flex align-items-center gap-2">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedLeads.has(row.original.id || row.original._id)}
                        onChange={() => handleSelectLead(row.original.id || row.original._id)}
                    />
                    <span className="badge bg-light text-dark">#{row.original.id || row.original._id}</span>
                </div>
            ),
            enableHiding: false
        },
        {
            accessorKey: 'fullName',
            header: () => (
                <div className="d-flex align-items-center gap-1" style={{ cursor: 'pointer' }} onClick={() => handleSort('fullName')}>
                    Name <FiBarChart2 size={12} />
                </div>
            ),
            cell: (info) => {
                const lead = info.row.original;
                const isHighPriority = lead.priority?.toLowerCase() === 'high';
                return (
                    <div className="d-flex align-items-center gap-2">
                        {isHighPriority && <FiStar size={16} className="text-danger" />}
                        <div>
                            <div className="fw-bold">{info.getValue() || 'N/A'}</div>
                            {lead.company && <small className="text-muted">{lead.company}</small>}
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: 'mobile',
            header: 'Phone',
            cell: (info) => (
                <a href={`tel:${info.getValue()}`} className="text-decoration-none">
                    <FiPhone size={14} className="me-1" />
                    {info.getValue() || '—'}
                </a>
            )
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: (info) => (
                info.getValue() ? (
                    <a href={`mailto:${info.getValue()}`} className="text-decoration-none">
                        <FiMail size={14} className="me-1" />
                        {info.getValue()}
                    </a>
                ) : <span className="text-muted">—</span>
            )
        },
        {
            accessorKey: 'campaignId',
            header: 'Campaign',
            cell: (info) => {
                const campaignName = getCampaignName(info.getValue());
                return <span className="badge bg-primary">{campaignName}</span>;
            }
        },
        {
            accessorKey: 'leadSource',
            header: 'Source',
            cell: (info) => {
                const source = info.getValue() || 'Unknown';
                const colors = {
                    'google': 'danger',
                    'facebook': 'primary',
                    'meta': 'primary',
                    'website': 'success',
                    'referral': 'info'
                };
                const color = colors[source.toLowerCase()] || 'secondary';
                return <span className={`badge bg-${color}`}>{source}</span>;
            }
        },
        {
            accessorKey: 'leadStatus',
            header: 'Status',
            cell: (info) => {
                const status = info.getValue();
                const statusOption = leadsStatusOptions.find(
                    opt => opt.value.toLowerCase() === status?.toLowerCase()
                );
                const color = statusOption?.color || '#6c757d';
                return (
                    <span className="badge text-white" style={{ backgroundColor: color }}>
                        {status || 'N/A'}
                    </span>
                );
            }
        },
        {
            accessorKey: 'score',
            header: () => (
                <div className="d-flex align-items-center gap-1" style={{ cursor: 'pointer' }} onClick={() => handleSort('score')}>
                    Score <FiBarChart2 size={12} />
                </div>
            ),
            cell: (info) => {
                const lead = info.row.original;
                const score = calculateLeadScore(lead);
                const scoreColor = score >= 70 ? 'success' : score >= 40 ? 'warning' : 'danger';
                return (
                    <div>
                        <span className={`badge bg-${scoreColor}`}>{score}</span>
                        <div className="progress mt-1" style={{ height: '4px', width: '60px' }}>
                            <div
                                className={`progress-bar bg-${scoreColor}`}
                                role="progressbar"
                                style={{ width: `${score}%` }}
                            ></div>
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: 'priority',
            header: 'Priority',
            cell: (info) => {
                const priority = info.getValue()?.toLowerCase() || 'low';
                const colors = { high: 'danger', medium: 'warning', low: 'secondary' };
                return (
                    <span className={`badge bg-${colors[priority] || 'secondary'}`}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </span>
                );
            }
        },
        {
            accessorKey: 'value',
            header: () => (
                <div className="d-flex align-items-center gap-1" style={{ cursor: 'pointer' }} onClick={() => handleSort('value')}>
                    Value <FiBarChart2 size={12} />
                </div>
            ),
            cell: (info) => {
                const value = parseFloat(info.getValue()) || 0;
                return value > 0 ? (
                    <span className="text-success fw-bold">
                        <FiDollarSign size={14} />
                        {value.toLocaleString()}
                    </span>
                ) : <span className="text-muted">—</span>;
            }
        },
        {
            accessorKey: 'leadDate',
            header: () => (
                <div className="d-flex align-items-center gap-1" style={{ cursor: 'pointer' }} onClick={() => handleSort('leadDate')}>
                    Date <FiBarChart2 size={12} />
                </div>
            ),
            cell: (info) => {
                const date = info.getValue();
                return date ? (
                    <div>
                        <div>{new Date(date).toLocaleDateString()}</div>
                        <small className="text-muted">{new Date(date).toLocaleTimeString()}</small>
                    </div>
                ) : <span className="text-muted">—</span>;
            }
        },
        {
            accessorKey: 'assignedTo',
            header: 'Assigned To',
            cell: (info) => {
                const assigned = info.getValue();
                return assigned ? (
                    <span className="badge bg-primary">
                        <FiUser size={12} className="me-1" />
                        {assigned}
                    </span>
                ) : (
                    <span className="badge bg-light text-dark">Unassigned</span>
                );
            }
        },
        {
            accessorKey: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const lead = row.original;
                const isConverted = lead.leadStatus?.toLowerCase() === 'converted' && lead.patientId;
                const actions = [
                    { 
                        label: 'View', 
                        icon: <FiUser />, 
                        onClick: () => {
                            toast.info(`Viewing lead: ${lead.fullName}`);
                            // Navigate to view page if needed
                        }
                    },
                    { 
                        label: 'Edit', 
                        icon: <FiEdit3 />, 
                        onClick: () => {
                            toast.info(`Editing lead: ${lead.fullName}`);
                            // Navigate to edit page if needed
                        }
                    },
                    ...(isConverted ? [
                        {
                            label: 'View Patient',
                            icon: <FiUser />,
                            onClick: () => {
                                navigate(`/patients/view/${lead.patientId}`);
                            }
                        }
                    ] : [
                        {
                            label: 'Convert to Patient',
                            icon: <FiUserPlus />,
                            onClick: () => handleConvertToPatient(lead)
                        }
                    ]),
                    { 
                        label: 'Delete', 
                        icon: <FiTrash2 />, 
                        onClick: async () => {
                            if (window.confirm(`Are you sure you want to delete lead: ${lead.fullName}?`)) {
                                try {
                                    await bulkDeleteLeads([lead.id]);
                                    toast.success('Lead deleted successfully');
                                    await fetchLeads();
                                } catch (error) {
                                    toast.error(`Failed to delete lead: ${error.message}`);
                                }
                            }
                        }
                    }
                ];
                return (
                    <Dropdown
                        dropdownItems={actions}
                        triggerClass="btn btn-sm btn-outline-secondary"
                        triggerIcon={<FiMoreHorizontal />}
                    />
                );
            },
            enableHiding: false
        }
    ].filter(col => visibleColumns[col.accessorKey] !== false);

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center justify-content-between w-100">
                    <div className="d-flex align-items-center gap-2">
                        <h5 className="mb-0">Manage Leads</h5>
                        {activeFiltersCount > 0 && (
                            <span className="badge bg-primary">{activeFiltersCount} active filters</span>
                        )}
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                        <button
                            className="btn btn-outline-primary"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <FiFilter className="me-1" />
                            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                        </button>
                        
                        {/* Saved Filter Presets */}
                        {savedFilters.length > 0 && (
                            <Dropdown
                                dropdownItems={savedFilters.map(preset => ({
                                    label: preset.name,
                                    onClick: () => loadFilterPreset(preset)
                                })).concat([
                                    { label: '---', divider: true },
                                    { label: 'Save Current Filters', icon: <FiSave />, onClick: () => setShowSaveFilterModal(true) }
                                ])}
                                triggerClass="btn btn-outline-secondary"
                                triggerText="Saved Filters"
                            />
                        )}
                        
                        {savedFilters.length === 0 && (
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => setShowSaveFilterModal(true)}
                                title="Save current filters as preset"
                            >
                                <FiSave className="me-1" />
                                Save Filters
                            </button>
                        )}
                        
                        {/* Duplicate Detection */}
                        {duplicateGroups.length > 0 && (
                            <button
                                className="btn btn-outline-warning"
                                onClick={() => setShowDuplicates(!showDuplicates)}
                            >
                                <FiCopy className="me-1" />
                                Duplicates ({duplicateGroups.length})
                            </button>
                        )}
                        
                        {/* View Mode Toggle */}
                        <div className="btn-group" role="group">
                            <button
                                className={`btn btn-outline-secondary ${viewMode === 'table' ? 'active' : ''}`}
                                onClick={() => setViewMode('table')}
                                title="Table View"
                            >
                                <FiList />
                            </button>
                            <button
                                className={`btn btn-outline-secondary ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                title="Grid View"
                            >
                                <FiGrid />
                            </button>
                        </div>
                        
                        {selectedLeads.size > 0 && (
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowBulkModal(true)}
                            >
                                Bulk Actions ({selectedLeads.size})
                            </button>
                        )}
                        
                        
                        <Link to="/leads/add-lead" className="btn btn-primary">
                            <FiUsers className="me-1" />
                            Add Lead
                        </Link>
                    </div>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <div className="col-lg-12">

                        {/* Duplicate Detection Panel */}
                        {showDuplicates && duplicateGroups.length > 0 && (
                            <div className="card mb-4 border-warning">
                                <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0">
                                        <FiCopy className="me-2" />
                                        Duplicate Leads Detected ({duplicateGroups.length} groups)
                                    </h6>
                                    <button className="btn btn-sm btn-outline-dark" onClick={() => setShowDuplicates(false)}>
                                        <FiX />
                                    </button>
                                </div>
                                <div className="card-body">
                                    {duplicateGroups.map((group, idx) => (
                                        <div key={idx} className="mb-3 p-3 border rounded">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <strong>Group {idx + 1} - {group.length} duplicates</strong>
                                                <button className="btn btn-sm btn-outline-danger">
                                                    <FiTrash2 className="me-1" />
                                                    Merge
                                                </button>
                                            </div>
                                            <div className="row">
                                                {group.map((lead, leadIdx) => (
                                                    <div key={leadIdx} className="col-md-6 mb-2">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <input type="checkbox" className="form-check-input" />
                                                            <div>
                                                                <strong>{lead.fullName}</strong>
                                                                <div className="small text-muted">
                                                                    {lead.mobile && <span><FiPhone size={12} /> {lead.mobile}</span>}
                                                                    {lead.email && <span className="ms-2"><FiMail size={12} /> {lead.email}</span>}
                                                                </div>
                                                                <div className="small">
                                                                    <span className="badge bg-secondary">{lead.leadStatus}</span>
                                                                    <span className="badge bg-info ms-1">{lead.leadSource}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Advanced Filters Panel */}
                        {showFilters && (
                            <div className="card mb-4">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0">Advanced Filters</h6>
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-sm btn-outline-secondary" onClick={clearFilters}>
                                            <FiX className="me-1" />
                                            Clear All
                                        </button>
                                        <button className="btn btn-sm btn-secondary" onClick={() => setShowFilters(false)}>
                            <FiX />
                        </button>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-3">
                                            <label className="form-label">Search</label>
                                            <div className="input-group">
                                                <span className="input-group-text"><FiSearch /></span>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Search leads..."
                                                    value={filters.search}
                                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Status</label>
                                            <select
                                                className="form-select"
                                                value={filters.status}
                                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                            >
                                                <option value="all">All Status</option>
                                                {leadsStatusOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Source</label>
                                            <select
                                                className="form-select"
                                                value={filters.source}
                                                onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                                            >
                                                <option value="all">All Sources</option>
                                                <option value="google">Google</option>
                                                <option value="facebook">Facebook</option>
                                                <option value="meta">Meta</option>
                                                <option value="website">Website</option>
                                                <option value="referral">Referral</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Campaign</label>
                                            <select
                                                className="form-select"
                                                value={filters.campaign}
                                                onChange={(e) => setFilters({ ...filters, campaign: e.target.value })}
                                            >
                                                <option value="all">All Campaigns</option>
                                                {campaigns.map(campaign => (
                                                    <option key={campaign.id} value={campaign.id.toString()}>
                                                        {campaign.displayName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Priority</label>
                                            <select
                                                className="form-select"
                                                value={filters.priority}
                                                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                                            >
                                                <option value="all">All Priorities</option>
                                                <option value="high">High</option>
                                                <option value="medium">Medium</option>
                                                <option value="low">Low</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Score Range</label>
                                            <div className="d-flex gap-2">
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Min"
                                                    min="0"
                                                    max="100"
                                                    value={filters.scoreMin}
                                                    onChange={(e) => setFilters({ ...filters, scoreMin: e.target.value })}
                                                />
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Max"
                                                    min="0"
                                                    max="100"
                                                    value={filters.scoreMax}
                                                    onChange={(e) => setFilters({ ...filters, scoreMax: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Date Range</label>
                                            <div className="d-flex gap-2">
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={filters.dateFrom}
                                                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                                />
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={filters.dateTo}
                                                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Value Range</label>
                                            <div className="d-flex gap-2">
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Min $"
                                                    value={filters.valueMin}
                                                    onChange={(e) => setFilters({ ...filters, valueMin: e.target.value })}
                                                />
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Max $"
                                                    value={filters.valueMax}
                                                    onChange={(e) => setFilters({ ...filters, valueMax: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Has Email</label>
                                            <select
                                                className="form-select"
                                                value={filters.hasEmail}
                                                onChange={(e) => setFilters({ ...filters, hasEmail: e.target.value })}
                                            >
                                                <option value="all">All</option>
                                                <option value="yes">Yes</option>
                                                <option value="no">No</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Has Phone</label>
                                            <select
                                                className="form-select"
                                                value={filters.hasPhone}
                                                onChange={(e) => setFilters({ ...filters, hasPhone: e.target.value })}
                                            >
                                                <option value="all">All</option>
                                                <option value="yes">Yes</option>
                                                <option value="no">No</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Leads Table */}
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0">Leads ({filteredAndSortedLeads.length})</h6>
                                    {selectedLeads.size > 0 && (
                                        <small className="text-muted">{selectedLeads.size} selected</small>
                                    )}
                                </div>
                                <div className="d-flex gap-2">
                                    <select
                                        className="form-select form-select-sm"
                                        style={{ width: 'auto' }}
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(parseInt(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <option value="10">10 per page</option>
                                        <option value="25">25 per page</option>
                                        <option value="50">50 per page</option>
                                        <option value="100">100 per page</option>
                                    </select>
                                    <button 
                                        className="btn btn-sm btn-outline-secondary" 
                                        title="Column Settings"
                                        data-bs-toggle="modal"
                                        data-bs-target="#columnSettingsModal"
                                    >
                                        <FiColumns />
                                    </button>
                                    <button 
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => setShowExportModal(true)}
                                    >
                                        <FiDownload className="me-1" />
                                        Export
                                    </button>
                                </div>
                            </div>
                            <div className="card-body">
                                <Table
                                    data={paginatedLeads}
                                    columns={columns}
                                    emptyMessage="No leads found matching your filters"
                                />
                                
                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <div>
                                            <small className="text-muted">
                                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedLeads.length)} of {filteredAndSortedLeads.length} leads
                                            </small>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                            >
                                                Previous
                                            </button>
                                            <span className="d-flex align-items-center">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk Operations Modal */}
            {showBulkModal && (
                <BulkOperationsModal
                    selectedLeads={Array.from(selectedLeads)}
                    onClose={() => setShowBulkModal(false)}
                    onComplete={handleBulkAction}
                />
            )}

            {/* Save Filter Preset Modal */}
            {showSaveFilterModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Save Filter Preset</h5>
                                <button type="button" className="btn-close" onClick={() => setShowSaveFilterModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Preset Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., High Priority Leads"
                                        value={filterPresetName}
                                        onChange={(e) => setFilterPresetName(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && saveFilterPreset()}
                                    />
                                </div>
                                <div className="alert alert-info">
                                    <small>This will save your current filter settings for quick access later.</small>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowSaveFilterModal(false)}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-primary" onClick={saveFilterPreset}>
                                    <FiSave className="me-1" />
                                    Save Preset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Modal */}
            {showExportModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Export Leads</h5>
                                <button type="button" className="btn-close" onClick={() => setShowExportModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p className="mb-3">
                                    Export <strong>{filteredAndSortedLeads.length} lead(s)</strong> matching your current filters.
                                </p>
                                <div className="d-grid gap-2">
                                    <button className="btn btn-success" onClick={() => handleExport('CSV')}>
                                        <FiDownload className="me-2" />
                                        Export as CSV
                                    </button>
                                    <button className="btn btn-danger" onClick={() => handleExport('PDF')}>
                                        <FiDownload className="me-2" />
                                        Export as PDF
                                    </button>
                                    <button className="btn btn-primary" onClick={() => handleExport('Excel')}>
                                        <FiDownload className="me-2" />
                                        Export as Excel
                                    </button>
                                </div>
                                {selectedLeads.size > 0 && (
                                    <div className="alert alert-info mt-3">
                                        <small>Note: Only selected leads ({selectedLeads.size}) will be exported if you have selections.</small>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowExportModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Column Visibility Settings */}
            <div className="modal fade" id="columnSettingsModal" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Column Visibility</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <div className="list-group">
                                {Object.entries(visibleColumns).map(([key, visible]) => (
                                    <div key={key} className="list-group-item d-flex justify-content-between align-items-center">
                                        <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={visible}
                                                onChange={(e) => setVisibleColumns({ ...visibleColumns, [key]: e.target.checked })}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal">Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Convert to Patient Modal */}
            {showConvertModal && leadToConvert && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Convert Lead to Patient</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => {
                                        setShowConvertModal(false);
                                        setLeadToConvert(null);
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="alert alert-info">
                                    <strong>Converting Lead:</strong> {leadToConvert.fullName}
                                </div>
                                
                                <div className="mb-3">
                                    <h6 className="mb-3">Lead Information to Convert:</h6>
                                    <div className="row">
                                        <div className="col-md-6 mb-2">
                                            <strong>Name:</strong> {leadToConvert.fullName || 'N/A'}
                                        </div>
                                        <div className="col-md-6 mb-2">
                                            <strong>Mobile:</strong> {leadToConvert.mobile || 'N/A'}
                                        </div>
                                        <div className="col-md-6 mb-2">
                                            <strong>Email:</strong> {leadToConvert.email || 'N/A'}
                                        </div>
                                        <div className="col-md-6 mb-2">
                                            <strong>Source:</strong> {leadToConvert.leadSource || 'N/A'}
                                        </div>
                                        {leadToConvert.age && (
                                            <div className="col-md-6 mb-2">
                                                <strong>Age:</strong> {leadToConvert.age}
                                            </div>
                                        )}
                                        {leadToConvert.gender && (
                                            <div className="col-md-6 mb-2">
                                                <strong>Gender:</strong> {leadToConvert.gender}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="alert alert-warning">
                                    <strong>Note:</strong> This will:
                                    <ul className="mb-0 mt-2">
                                        <li>Create a new patient record with all lead information</li>
                                        <li>Update the lead status to "Converted"</li>
                                        <li>Link the patient record to this lead</li>
                                        <li>Preserve all lead history and data</li>
                                    </ul>
                                </div>

                                <div className="form-check mb-3">
                                    <input 
                                        className="form-check-input" 
                                        type="checkbox" 
                                        id="confirmConvert"
                                        defaultChecked
                                    />
                                    <label className="form-check-label" htmlFor="confirmConvert">
                                        I confirm that I want to convert this lead to a patient
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => {
                                        setShowConvertModal(false);
                                        setLeadToConvert(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary"
                                    onClick={confirmConvertToPatient}
                                >
                                    <FiUserPlus className="me-2" />
                                    Convert to Patient
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};

export default LeadsManage;

