import React, { useState } from 'react';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import { FiArrowLeft, FiDollarSign, FiUsers, FiTrendingUp, FiBarChart2, FiPlus, FiEdit3, FiTrash2, FiSearch, FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useLeads } from '../../context/LeadsContext';
import Table from '@/components/shared/table/Table';
import { toast } from 'react-toastify';
import CampaignsCreateContent from '@/components/campaigns/CampaignsCreateContent';
import ConfirmationModal from './ConfirmationModal';

const CampaignsPage = () => {
    const { campaigns, leads, addCampaign, updateCampaign, deleteCampaign } = useLeads();
    const [activeTab, setActiveTab] = useState('list');
    const [editingCampaign, setEditingCampaign] = useState(null);
    
    // Advanced filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [platformFilter, setPlatformFilter] = useState('all');
    const [budgetRange, setBudgetRange] = useState({ min: '', max: '' });
    const [roasRange, setRoasRange] = useState({ min: '', max: '' });
    const [conversionRateRange, setConversionRateRange] = useState({ min: '', max: '' });
    const [spentPercentRange, setSpentPercentRange] = useState({ min: '', max: '' });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    
    // Delete modal state
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        campaignId: null,
        campaignName: ''
    });

    // Calculate campaign statistics
    const campaignStats = {
        totalBudget: campaigns.reduce((sum, c) => sum + (parseFloat(c.budget) || 0), 0),
        totalLeads: leads.length,
        totalRevenue: campaigns.reduce((sum, c) => {
            const campaignLeads = leads.filter(l => l.campaignId?.toString() === c.id?.toString());
            const converted = campaignLeads.filter(l => l.leadStatus?.toLowerCase() === 'converted').length;
            return sum + (converted * 5000);
        }, 0),
        overallROAS: 0
    };

    // Calculate overall ROAS
    const totalSpent = campaigns.reduce((sum, c) => {
        const budget = parseFloat(c.budget) || 0;
        return sum + (budget * 0.65);
    }, 0);
    if (totalSpent > 0) {
        campaignStats.overallROAS = campaignStats.totalRevenue / totalSpent;
    }

    // Calculate campaign metrics
    const getCampaignMetrics = (campaign) => {
        const campaignLeads = leads.filter(l => l.campaignId?.toString() === campaign.id?.toString());
        const budget = parseFloat(campaign.budget) || 0;
        const spent = budget * 0.65;
        const converted = campaignLeads.filter(l => l.leadStatus?.toLowerCase() === 'converted').length;
        const conversionRate = campaignLeads.length > 0 ? (converted / campaignLeads.length * 100) : 0;
        const revenue = converted * 5000;
        const roas = spent > 0 ? (revenue / spent) : 0;
        const spentPercent = budget > 0 ? (spent / budget * 100) : 0;

        return {
            leads: campaignLeads.length,
            converted,
            conversionRate,
            budget,
            spent,
            spentPercent,
            revenue,
            roas
        };
    };

    // Filter campaigns based on all criteria
    const filteredCampaigns = campaigns.filter(campaign => {
        const metrics = getCampaignMetrics(campaign);
        
        // Search term filter
        const matchesSearch = !searchTerm || 
            campaign.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            campaign.campaign?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            campaign.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Status filter
        const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
        
        // Platform filter
        const matchesPlatform = platformFilter === 'all' || campaign.platform === platformFilter;
        
        // Budget range filter
        const matchesBudget = (!budgetRange.min || metrics.budget >= parseFloat(budgetRange.min)) &&
                            (!budgetRange.max || metrics.budget <= parseFloat(budgetRange.max));
        
        // ROAS range filter
        const matchesRoas = (!roasRange.min || metrics.roas >= parseFloat(roasRange.min)) &&
                          (!roasRange.max || metrics.roas <= parseFloat(roasRange.max));
        
        // Conversion rate filter
        const matchesConversionRate = (!conversionRateRange.min || metrics.conversionRate >= parseFloat(conversionRateRange.min)) &&
                                    (!conversionRateRange.max || metrics.conversionRate <= parseFloat(conversionRateRange.max));
        
        // Spent percentage filter
        const matchesSpentPercent = (!spentPercentRange.min || metrics.spentPercent >= parseFloat(spentPercentRange.min)) &&
                                  (!spentPercentRange.max || metrics.spentPercent <= parseFloat(spentPercentRange.max));
        
        return matchesSearch && matchesStatus && matchesPlatform && 
               matchesBudget && matchesRoas && matchesConversionRate && matchesSpentPercent;
    });

    // Reset all filters
    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setPlatformFilter('all');
        setBudgetRange({ min: '', max: '' });
        setRoasRange({ min: '', max: '' });
        setConversionRateRange({ min: '', max: '' });
        setSpentPercentRange({ min: '', max: '' });
        toast.info('All filters have been reset');
    };

    // Get active filter count
    const getActiveFilterCount = () => {
        let count = 0;
        if (searchTerm) count++;
        if (statusFilter !== 'all') count++;
        if (platformFilter !== 'all') count++;
        if (budgetRange.min || budgetRange.max) count++;
        if (roasRange.min || roasRange.max) count++;
        if (conversionRateRange.min || conversionRateRange.max) count++;
        if (spentPercentRange.min || spentPercentRange.max) count++;
        return count;
    };

    // Show delete confirmation modal
    const showDeleteConfirmation = (campaignId, campaignName) => {
        setDeleteModal({
            isOpen: true,
            campaignId,
            campaignName
        });
    };

    // Handle delete confirmation
    const handleDeleteConfirm = async () => {
        try {
            await deleteCampaign(deleteModal.campaignId);
            toast.success('Campaign deleted successfully');
            setDeleteModal({ isOpen: false, campaignId: null, campaignName: '' });
        } catch (error) {
            // toast.error(`Failed to delete campaign: ${error.message}`);
            setDeleteModal({ isOpen: false, campaignId: null, campaignName: '' });
        }
    };

    // Close delete confirmation modal
    const handleDeleteCancel = () => {
        setDeleteModal({ isOpen: false, campaignId: null, campaignName: '' });
    };

    const handleEdit = (campaign) => {
        setEditingCampaign(campaign);
        setActiveTab('add');
    };

    const handleSaveCampaign = async (campaignData) => {
        try {
            if (editingCampaign) {
                await updateCampaign(editingCampaign.id, campaignData);
                toast.success('Campaign updated successfully');
            } else {
                await addCampaign(campaignData);
                toast.success('Campaign created successfully');
            }
            setEditingCampaign(null);
            setActiveTab('list');
        } catch (error) {
            toast.error(`Failed to save campaign: ${error.message}`);
        }
    };

    const columns = [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: (info) => <span className="badge bg-light text-dark">#{info.getValue()}</span>
        },
        {
            accessorKey: 'displayName',
            header: 'Campaign Name',
            cell: (info) => {
                const campaign = info.row.original;
                return (
                    <div>
                        <div className="fw-bold">{info.getValue()}</div>
                        <small className="text-muted">{campaign.description || campaign.campaign}</small>
                    </div>
                );
            }
        },
        {
            accessorKey: 'platform',
            header: 'Platform',
            cell: (info) => {
                const platform = info.getValue() || 'meta';
                const labels = { meta: 'Meta', google: 'Google', both: 'Both', other: 'Other' };
                const colors = { meta: 'primary', google: 'danger', both: 'info', other: 'secondary' };
                return <span className={`badge bg-${colors[platform] || 'secondary'}`}>{labels[platform] || platform}</span>;
            }
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: (info) => {
                const status = info.getValue() || 'active';
                const colors = { active: 'success', paused: 'warning', scheduled: 'info' };
                return <span className={`badge bg-${colors[status] || 'secondary'}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
            }
        },
        {
            accessorKey: 'budget',
            header: 'Budget / Spent',
            cell: (info) => {
                const campaign = info.row.original;
                const metrics = getCampaignMetrics(campaign);
                return (
                    <div>
                        <div>${metrics.budget.toLocaleString()} / ${metrics.spent.toLocaleString()}</div>
                        <div className="progress" style={{ height: '6px', marginTop: '4px' }}>
                            <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${metrics.spentPercent}%` }}
                            ></div>
                        </div>
                        <small className="text-muted">{metrics.spentPercent.toFixed(1)}%</small>
                    </div>
                );
            }
        },
        {
            accessorKey: 'leads',
            header: 'Leads / Converted',
            cell: (info) => {
                const campaign = info.row.original;
                const metrics = getCampaignMetrics(campaign);
                return (
                    <div>
                        <div>{metrics.leads} / {metrics.converted}</div>
                        <small className="text-muted">{metrics.conversionRate.toFixed(1)}% CVR</small>
                    </div>
                );
            }
        },
        {
            accessorKey: 'revenue',
            header: 'Revenue / ROAS',
            cell: (info) => {
                const campaign = info.row.original;
                const metrics = getCampaignMetrics(campaign);
                return (
                    <div>
                        <div>${metrics.revenue.toLocaleString()}</div>
                        <small className="text-muted">{metrics.roas.toFixed(1)}x ROAS</small>
                    </div>
                );
            }
        },
        {
            accessorKey: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const campaign = row.original;
                return (
                    <div className="d-flex gap-2">
                        <button
                            className="avatar-text avatar-md"
                            onClick={() => handleEdit(campaign)}
                            title="Edit Campaign"
                        >
                            <FiEdit3 size={14} />
                        </button>
                        <button
                            className="avatar-text avatar-md"
                            onClick={() => showDeleteConfirmation(campaign.id, campaign.displayName || campaign.campaign)}
                            title="Delete Campaign"
                        >
                            <FiTrash2 size={14} />
                        </button>
                    </div>
                );
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
                    {activeTab === 'list' && (
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setEditingCampaign(null);
                                setActiveTab('add');
                            }}
                        >
                            <FiPlus size={16} className='me-2' />
                            Create Campaign
                        </button>
                    )}
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
                                            className={`nav-link ${activeTab === 'list' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('list')}
                                        >
                                            <FiBarChart2 className="me-2" />
                                            Campaigns List
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${activeTab === 'add' ? 'active' : ''}`}
                                            onClick={() => {
                                                setEditingCampaign(null);
                                                setActiveTab('add');
                                            }}
                                        >
                                            <FiPlus className="me-2" />
                                            {editingCampaign ? 'Edit Campaign' : 'Add Campaign'}
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <div className="card-body">
                                {activeTab === 'list' ? (
                                    <div>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                                <h5 className="mb-0">Campaign Management</h5>
                                                <p className="text-muted mb-0">
                                                    {filteredCampaigns.length} of {campaigns.length} campaigns
                                                    {getActiveFilterCount() > 0 && (
                                                        <span className="text-primary ms-2">
                                                            ({getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} active)
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Summary Statistics */}
                                        <div className="row mb-4">
                                            <div className="col-lg-3 col-md-6 ">
                                                <div className="card border mb-0">
                                                    <div className="card-body">
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <div>
                                                                <h6 className="text-muted mb-1">Total Budget</h6>
                                                                <h3 className="mb-0">${campaignStats.totalBudget.toLocaleString()}</h3>
                                                            </div>
                                                            <div className="avatar-text avatar-lg bg-primary">
                                                                <FiDollarSign className='text-white' size={24} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-3 col-md-6 ">
                                                <div className="card border mb-0">
                                                    <div className="card-body">
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <div>
                                                                <h6 className="text-muted mb-1">Total Leads</h6>
                                                                <h3 className="mb-0">{campaignStats.totalLeads}</h3>
                                                            </div>
                                                            <div className="avatar-text avatar-lg bg-success">
                                                                <FiUsers className='text-white' size={24} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-3 col-md-6 ">
                                                <div className="card border mb-0">
                                                    <div className="card-body">
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <div>
                                                                <h6 className="text-muted mb-1">Total Revenue</h6>
                                                                <h3 className="mb-0">${campaignStats.totalRevenue.toLocaleString()}</h3>
                                                            </div>
                                                            <div className="avatar-text avatar-lg bg-info">
                                                                <FiTrendingUp className='text-white' size={24} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-3 col-md-6 ">
                                                <div className="card border mb-0">
                                                    <div className="card-body">
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <div>
                                                                <h6 className="text-muted mb-1">Overall ROAS</h6>
                                                                <h3 className="mb-0">{campaignStats.overallROAS.toFixed(2)}x</h3>
                                                            </div>
                                                            <div className="avatar-text avatar-lg bg-warning">
                                                                <FiBarChart2 className='text-white' size={24} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Basic Filters */}
                                        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                                            <div className="input-group" style={{ width: '300px' }}>
                                                <span className="input-group-text"><FiSearch /></span>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Search campaigns..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                                {searchTerm && (
                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        type="button"
                                                        onClick={() => setSearchTerm('')}
                                                    >
                                                        <FiX />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="d-flex gap-2">
                                                <select
                                                    className="form-select"
                                                    style={{ width: '150px' }}
                                                    value={statusFilter}
                                                    onChange={(e) => setStatusFilter(e.target.value)}
                                                >
                                                    <option value="all">All Status</option>
                                                    <option value="active">Active</option>
                                                    <option value="paused">Paused</option>
                                                    <option value="scheduled">Scheduled</option>
                                                </select>
                                                <select
                                                    className="form-select"
                                                    style={{ width: '150px' }}
                                                    value={platformFilter}
                                                    onChange={(e) => setPlatformFilter(e.target.value)}
                                                >
                                                    <option value="all">All Platforms</option>
                                                    <option value="meta">Meta</option>
                                                    <option value="google">Google</option>
                                                    <option value="both">Both</option>
                                                    <option value="other">Other</option>
                                                </select>
                                                <button 
                                                    className="btn btn-outline-primary"
                                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                                >
                                                    <FiFilter className="me-1" />
                                                    Advanced Filters
                                                </button>
                                                {getActiveFilterCount() > 0 && (
                                                    <button 
                                                        className="btn btn-outline-danger"
                                                        onClick={resetFilters}
                                                    >
                                                        <FiX className="me-1" />
                                                        Clear Filters
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Advanced Filters */}
                                        {showAdvancedFilters && (
                                            <div className="card border mb-3">
                                                <div className="card-body p-3">
                                                    <div className="row g-2">
                                                        {/* Budget Range */}
                                                        <div className="col-md-3">
                                                            <label className="form-label">Budget Range ($)</label>
                                                            <div className="d-flex gap-2">
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    placeholder="Min"
                                                                    value={budgetRange.min}
                                                                    onChange={(e) => setBudgetRange({...budgetRange, min: e.target.value})}
                                                                />
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    placeholder="Max"
                                                                    value={budgetRange.max}
                                                                    onChange={(e) => setBudgetRange({...budgetRange, max: e.target.value})}
                                                                />
                                                            </div>
                                                        </div>
                                                        
                                                        {/* ROAS Range */}
                                                        <div className="col-md-3">
                                                            <label className="form-label">ROAS Range (x)</label>
                                                            <div className="d-flex gap-2">
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    placeholder="Min"
                                                                    value={roasRange.min}
                                                                    onChange={(e) => setRoasRange({...roasRange, min: e.target.value})}
                                                                    step="0.1"
                                                                />
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    placeholder="Max"
                                                                    value={roasRange.max}
                                                                    onChange={(e) => setRoasRange({...roasRange, max: e.target.value})}
                                                                    step="0.1"
                                                                />
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Conversion Rate Range */}
                                                        <div className="col-md-3">
                                                            <label className="form-label">Conversion Rate (%)</label>
                                                            <div className="d-flex gap-2">
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    placeholder="Min"
                                                                    value={conversionRateRange.min}
                                                                    onChange={(e) => setConversionRateRange({...conversionRateRange, min: e.target.value})}
                                                                    step="0.1"
                                                                    min="0"
                                                                    max="100"
                                                                />
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    placeholder="Max"
                                                                    value={conversionRateRange.max}
                                                                    onChange={(e) => setConversionRateRange({...conversionRateRange, max: e.target.value})}
                                                                    step="0.1"
                                                                    min="0"
                                                                    max="100"
                                                                />
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Spent Percentage Range */}
                                                        <div className="col-md-3">
                                                            <label className="form-label">Spent (%)</label>
                                                            <div className="d-flex gap-2">
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    placeholder="Min"
                                                                    value={spentPercentRange.min}
                                                                    onChange={(e) => setSpentPercentRange({...spentPercentRange, min: e.target.value})}
                                                                    step="0.1"
                                                                    min="0"
                                                                    max="100"
                                                                />
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    placeholder="Max"
                                                                    value={spentPercentRange.max}
                                                                    onChange={(e) => setSpentPercentRange({...spentPercentRange, max: e.target.value})}
                                                                    step="0.1"
                                                                    min="0"
                                                                    max="100"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Campaigns Table */}
                                        <Table
                                            data={filteredCampaigns}
                                            columns={columns}
                                            emptyMessage="No campaigns found matching your filters"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <div className="mb-4">
                                            <h5 className="mb-0">{editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}</h5>
                                            <p className="text-muted mb-0">{editingCampaign ? 'Update campaign details' : 'Add a new marketing campaign'}</p>
                                        </div>
                                        <CampaignsCreateContent
                                            campaign={editingCampaign}
                                            onSave={handleSaveCampaign}
                                            onCancel={() => {
                                                setEditingCampaign(null);
                                                setActiveTab('list');
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            
            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Campaign"
                message={`Are you sure you want to delete "${deleteModal.campaignName}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                confirmButtonVariant="danger"
            />
        </>
    );
};

export default CampaignsPage;