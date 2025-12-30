import React, { useState } from 'react';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import CampaignViewHeader from '@/components/campaigns/CampaignViewHeader';
import { useLeads } from '../../context/LeadsContext';
import { FiDollarSign, FiUsers, FiTrendingUp, FiBarChart2, FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Table from '@/components/shared/table/Table';
import { useAuth } from '../../contentApi/AuthContext';

const CampaignsEnhanced = () => {
    const { campaigns, leads } = useLeads();
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [platformFilter, setPlatformFilter] = useState('all');

    // Calculate campaign statistics
    const campaignStats = {
        totalBudget: campaigns.reduce((sum, c) => sum + (parseFloat(c.budget) || 0), 0),
        totalLeads: leads.length,
        totalRevenue: 0, // This would come from actual revenue data
        overallROAS: 0 // This would be calculated from revenue/budget
    };

    // Filter campaigns
    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesSearch = !searchTerm || 
            campaign.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            campaign.campaign?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
        const matchesPlatform = platformFilter === 'all' || campaign.platform === platformFilter;
        return matchesSearch && matchesStatus && matchesPlatform;
    });

    // Calculate campaign metrics
    const getCampaignMetrics = (campaign) => {
        const campaignLeads = leads.filter(l => l.campaignId?.toString() === campaign.id?.toString());
        const budget = parseFloat(campaign.budget) || 0;
        const spent = budget * 0.65; // Mock data - would come from actual spending
        const converted = campaignLeads.filter(l => l.leadStatus?.toLowerCase() === 'converted').length;
        const conversionRate = campaignLeads.length > 0 ? (converted / campaignLeads.length * 100).toFixed(1) : 0;
        const revenue = converted * 5000; // Mock data
        const roas = spent > 0 ? (revenue / spent).toFixed(1) : 0;

        return {
            leads: campaignLeads.length,
            converted,
            conversionRate,
            budget,
            spent,
            spentPercent: budget > 0 ? (spent / budget * 100).toFixed(1) : 0,
            revenue,
            roas
        };
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
                        <small className="text-muted">{metrics.spentPercent}%</small>
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
                        <small className="text-muted">{metrics.conversionRate}% CVR</small>
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
                        <small className="text-muted">{metrics.roas}x ROAS</small>
                    </div>
                );
            }
        },
        {
            accessorKey: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-outline-primary" title="View">
                        <FiBarChart2 size={14} />
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" title="Edit">
                        <FiPlus size={14} />
                    </button>
                    <button className="btn btn-sm btn-outline-danger" title="Delete">
                        <FiPlus size={14} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center justify-content-between w-100">
                    <div></div>
                    <Link to="/leads/add-campaigns" className="btn btn-primary">
                        <FiPlus size={16} className='me-2' />
                        Create Campaign
                    </Link>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <div className="col-lg-12">
                        <div className="card">
                            <div className="card-header">
                                <div>
                                    <h5 className="card-title mb-0">Campaign Management</h5>
                                    <p className="text-muted mb-0">Manage and track your marketing campaigns</p>
                                </div>
                            </div>
                            <div className="card-body">
                                {/* Summary Statistics */}
                                <div className="row mb-4">
                                    <div className="col-lg-3 col-md-6 mb-3">
                                        <div className="card border">
                                            <div className="card-body">
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div>
                                                        <h6 className="text-muted mb-1">Total Budget</h6>
                                                        <h3 className="mb-0">${campaignStats.totalBudget.toLocaleString()}</h3>
                                                    </div>
                                                    <div className="avatar-text avatar-lg bg-primary">
                                                        <FiDollarSign size={24} />
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
                                                        <h6 className="text-muted mb-1">Total Leads</h6>
                                                        <h3 className="mb-0">{campaignStats.totalLeads}</h3>
                                                    </div>
                                                    <div className="avatar-text avatar-lg bg-success">
                                                        <FiUsers size={24} />
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
                                                        <h6 className="text-muted mb-1">Total Revenue</h6>
                                                        <h3 className="mb-0">${campaignStats.totalRevenue.toLocaleString()}</h3>
                                                    </div>
                                                    <div className="avatar-text avatar-lg bg-info">
                                                        <FiTrendingUp size={24} />
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
                                                        <h6 className="text-muted mb-1">Overall ROAS</h6>
                                                        <h3 className="mb-0">{campaignStats.overallROAS.toFixed(2)}x</h3>
                                                    </div>
                                                    <div className="avatar-text avatar-lg bg-warning">
                                                        <FiBarChart2 size={24} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs and Filters */}
                                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                                    <ul className="nav nav-tabs" role="tablist">
                                        <li className="nav-item">
                                            <button
                                                className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('all')}
                                            >
                                                All Campaigns
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button
                                                className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('analytics')}
                                            >
                                                Analytics
                                            </button>
                                        </li>
                                    </ul>
                                    <div className="d-flex gap-2 flex-wrap">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search campaigns..."
                                            style={{ width: '200px' }}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
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
                                        </select>
                                    </div>
                                </div>

                                {/* Campaigns Table */}
                                {activeTab === 'all' ? (
                                    <Table
                                        data={filteredCampaigns}
                                        columns={columns}
                                        emptyMessage="No campaigns found"
                                    />
                                ) : (
                                    <div className="text-center py-5">
                                        <FiBarChart2 size={64} className="text-muted mb-3" />
                                        <h5>Campaign Analytics</h5>
                                        <p className="text-muted">Analytics dashboard coming soon</p>
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

export default CampaignsEnhanced;

