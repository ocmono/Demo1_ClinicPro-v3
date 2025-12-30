import React, { useState } from 'react';
import { FiUsers, FiCheckCircle, FiPlus, FiStar, FiFilter, FiDownload } from 'react-icons/fi';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useLeads } from '../../../context/LeadsContext';
import { calculateLeadScore } from '@/utils/leadIntegrations';
import { leadsStatusOptions } from '@/utils/options';
import Table from '@/components/shared/table/Table';

const LeadsListTab = () => {
    const { leads, campaigns } = useLeads();
    const [activeLeadType, setActiveLeadType] = useState('google');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [campaignFilter, setCampaignFilter] = useState('all');

    const getLeadsByType = (type) => {
        if (type === 'google') {
            return leads.filter(l => l.leadSource?.toLowerCase().includes('google'));
        } else if (type === 'meta') {
            return leads.filter(l => l.leadSource?.toLowerCase().includes('facebook') || l.leadSource?.toLowerCase().includes('meta'));
        } else {
            return leads.filter(l => {
                const source = l.leadSource?.toLowerCase() || '';
                return !source.includes('google') && !source.includes('facebook') && !source.includes('meta');
            });
        }
    };

    const currentLeads = getLeadsByType(activeLeadType);

    const stats = {
        totalLeads: currentLeads.length,
        totalValue: currentLeads.reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0),
        qualifiedLeads: currentLeads.filter(l => l.leadStatus?.toLowerCase() === 'qualified').length,
        avgScore: currentLeads.length > 0
            ? (currentLeads.reduce((sum, l) => sum + calculateLeadScore(l), 0) / currentLeads.length).toFixed(1)
            : 0,
        newLeads: currentLeads.filter(l => l.leadStatus?.toLowerCase() === 'new').length,
        unassigned: currentLeads.filter(l => !l.assignedTo).length,
        highPriority: currentLeads.filter(l => l.priority === 'high' || l.priority === 'High').length,
        contacted: currentLeads.filter(l => l.leadStatus?.toLowerCase() === 'contacted').length
    };

    const filteredLeads = currentLeads.filter(lead => {
        const matchesSearch = !searchTerm ||
            lead.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.mobile?.includes(searchTerm) ||
            lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || lead.leadStatus === statusFilter;
        const matchesCampaign = campaignFilter === 'all' || lead.campaignId?.toString() === campaignFilter;
        return matchesSearch && matchesStatus && matchesCampaign;
    });

    const getCampaignName = (id) => {
        const campaign = campaigns.find((c) => c.id.toString() === id.toString());
        return campaign ? campaign.displayName : 'Unknown Campaign';
    };

    const columns = [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: (info) => <span className="badge bg-light text-dark">#{info.getValue()}</span>
        },
        {
            accessorKey: 'fullName',
            header: 'Name',
            cell: (info) => {
                const lead = info.row.original;
                const isHighPriority = lead.priority === 'high' || lead.priority === 'High';
                return (
                    <div className="d-flex align-items-center gap-2">
                        {isHighPriority && <FiStar size={16} className="text-danger" />}
                        <div>
                            <div className="fw-bold">{info.getValue()}</div>
                            {lead.email && <div className="text-muted small">{lead.email}</div>}
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: 'mobile',
            header: 'Phone',
            cell: (info) => <a href={`tel:${info.getValue()}`}>{info.getValue()}</a>
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
            header: 'Score',
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
            accessorKey: 'leadDate',
            header: 'Date',
            cell: (info) => {
                const date = info.getValue();
                return date ? new Date(date).toLocaleDateString() : <span className="text-muted">—</span>;
            }
        }
    ];

    return (
        <div>
            {/* Lead Type Tabs */}
            <ul className="nav nav-pills mb-4" role="tablist">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeLeadType === 'google' ? 'active' : ''}`}
                        onClick={() => setActiveLeadType('google')}
                    >
                        <FaGoogle className="me-1" />
                        Google Leads
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeLeadType === 'meta' ? 'active' : ''}`}
                        onClick={() => setActiveLeadType('meta')}
                    >
                        <FaFacebook className="me-1" />
                        Meta Leads
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeLeadType === 'other' ? 'active' : ''}`}
                        onClick={() => setActiveLeadType('other')}
                    >
                        Other Leads
                    </button>
                </li>
            </ul>

            {/* Summary Statistics */}
            <div className="row mb-4">
                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border border-success">
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-1">Total Leads</h6>
                                    <h3 className="mb-0">{stats.totalLeads}</h3>
                                    <small className="text-muted">Value: ${stats.totalValue.toLocaleString()}</small>
                                </div>
                                <div className="avatar-text avatar-lg bg-success">
                                    <FiUsers size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border border-success">
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-1">Qualified Leads</h6>
                                    <h3 className="mb-0">{stats.qualifiedLeads}</h3>
                                    <small className="text-muted">Avg Score: {stats.avgScore}</small>
                                </div>
                                <div className="avatar-text avatar-lg bg-success">
                                    <FiCheckCircle size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border border-warning">
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-1">New Leads</h6>
                                    <h3 className="mb-0">{stats.newLeads}</h3>
                                    <small className="text-muted">{stats.unassigned} unassigned</small>
                                </div>
                                <div className="avatar-text avatar-lg bg-warning">
                                    <FiPlus size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border border-danger">
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-1">High Priority</h6>
                                    <h3 className="mb-0">{stats.highPriority}</h3>
                                    <small className="text-muted">{stats.contacted} contacted</small>
                                </div>
                                <div className="avatar-text avatar-lg bg-danger">
                                    <FiStar size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search leads by name, email, company, or phone..."
                    style={{ width: '350px' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="d-flex gap-2">
                    <select
                        className="form-select"
                        style={{ width: '150px' }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        {leadsStatusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <select
                        className="form-select"
                        style={{ width: '150px' }}
                        value={campaignFilter}
                        onChange={(e) => setCampaignFilter(e.target.value)}
                    >
                        <option value="all">All Campaigns</option>
                        {campaigns.map(campaign => (
                            <option key={campaign.id} value={campaign.id.toString()}>
                                {campaign.displayName}
                            </option>
                        ))}
                    </select>
                    <button className="btn btn-outline-secondary">
                        <FiFilter className="me-1" />
                        Advanced
                    </button>
                </div>
            </div>

            {/* Leads Table */}
            <Table
                data={filteredLeads}
                columns={columns}
                emptyMessage="No leads found"
            />
        </div>
    );
};

export default LeadsListTab;


