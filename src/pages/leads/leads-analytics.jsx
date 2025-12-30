import React, { useState, useEffect, useMemo } from 'react';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import { FiArrowLeft, FiBarChart2, FiTrendingUp, FiTrendingDown, FiUsers, FiDollarSign, FiTarget, FiClock, FiActivity, FiFilter, FiDownload, FiRefreshCw, FiCalendar, FiPieChart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useLeads } from '../../context/LeadsContext';
import { calculateLeadScore } from '@/utils/leadIntegrations';
import { toast } from 'react-toastify';

const LeadsAnalytics = () => {
    const { leads, campaigns } = useLeads();
    const [dateRange, setDateRange] = useState('30'); // days
    const [selectedCampaign, setSelectedCampaign] = useState('all');
    const [selectedSource, setSelectedSource] = useState('all');
    const [refreshKey, setRefreshKey] = useState(0);

    // Filter leads based on date range and filters
    const filteredLeads = useMemo(() => {
        let filtered = [...leads];
        
        // Date range filter
        if (dateRange !== 'all') {
            const days = parseInt(dateRange);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            filtered = filtered.filter(lead => {
                if (!lead.leadDate) return false;
                return new Date(lead.leadDate) >= cutoffDate;
            });
        }

        // Campaign filter
        if (selectedCampaign !== 'all') {
            filtered = filtered.filter(lead => 
                lead.campaignId?.toString() === selectedCampaign
            );
        }

        // Source filter
        if (selectedSource !== 'all') {
            filtered = filtered.filter(lead => 
                lead.leadSource?.toLowerCase() === selectedSource.toLowerCase()
            );
        }

        return filtered;
    }, [leads, dateRange, selectedCampaign, selectedSource, refreshKey]);

    // Calculate comprehensive statistics
    const stats = useMemo(() => {
        const total = filteredLeads.length;
        const newLeads = filteredLeads.filter(l => l.leadStatus?.toLowerCase() === 'new').length;
        const contacted = filteredLeads.filter(l => l.leadStatus?.toLowerCase() === 'contacted').length;
        const qualified = filteredLeads.filter(l => l.leadStatus?.toLowerCase() === 'qualified').length;
        const converted = filteredLeads.filter(l => l.leadStatus?.toLowerCase() === 'converted').length;
        const lost = filteredLeads.filter(l => l.leadStatus?.toLowerCase() === 'lost').length;

        const totalValue = filteredLeads.reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);
        const avgValue = total > 0 ? totalValue / total : 0;
        const avgScore = total > 0 
            ? filteredLeads.reduce((sum, l) => sum + calculateLeadScore(l), 0) / total 
            : 0;

        const conversionRate = total > 0 ? (converted / total * 100) : 0;
        const qualificationRate = total > 0 ? (qualified / total * 100) : 0;
        const contactRate = total > 0 ? (contacted / total * 100) : 0;

        // Calculate trends (comparing with previous period)
        const previousPeriodDays = parseInt(dateRange) || 30;
        const previousCutoff = new Date();
        previousCutoff.setDate(previousCutoff.getDate() - (previousPeriodDays * 2));
        const previousStart = new Date();
        previousStart.setDate(previousStart.getDate() - previousPeriodDays);
        
        const previousLeads = leads.filter(lead => {
            if (!lead.leadDate) return false;
            const date = new Date(lead.leadDate);
            return date >= previousCutoff && date < previousStart;
        });

        const previousTotal = previousLeads.length;
        const previousConverted = previousLeads.filter(l => l.leadStatus?.toLowerCase() === 'converted').length;
        const previousValue = previousLeads.reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);

        const totalTrend = previousTotal > 0 
            ? ((total - previousTotal) / previousTotal * 100) 
            : (total > 0 ? 100 : 0);
        const conversionTrend = previousConverted > 0
            ? ((converted - previousConverted) / previousConverted * 100)
            : (converted > 0 ? 100 : 0);
        const valueTrend = previousValue > 0
            ? ((totalValue - previousValue) / previousValue * 100)
            : (totalValue > 0 ? 100 : 0);

        return {
            total,
            newLeads,
            contacted,
            qualified,
            converted,
            lost,
            totalValue,
            avgValue,
            avgScore,
            conversionRate,
            qualificationRate,
            contactRate,
            trends: {
                total: totalTrend,
                conversion: conversionTrend,
                value: valueTrend
            }
        };
    }, [filteredLeads, leads, dateRange]);

    // Lead source breakdown
    const sourceBreakdown = useMemo(() => {
        const breakdown = {};
        filteredLeads.forEach(lead => {
            const source = lead.leadSource || 'Unknown';
            if (!breakdown[source]) {
                breakdown[source] = { count: 0, converted: 0, value: 0 };
            }
            breakdown[source].count++;
            if (lead.leadStatus?.toLowerCase() === 'converted') {
                breakdown[source].converted++;
            }
            breakdown[source].value += parseFloat(lead.value) || 0;
        });

        return Object.entries(breakdown).map(([source, data]) => ({
            source,
            count: data.count,
            converted: data.converted,
            conversionRate: data.count > 0 ? (data.converted / data.count * 100) : 0,
            value: data.value,
            percentage: filteredLeads.length > 0 ? (data.count / filteredLeads.length * 100) : 0
        })).sort((a, b) => b.count - a.count);
    }, [filteredLeads]);

    // Campaign performance
    const campaignPerformance = useMemo(() => {
        const performance = {};
        
        filteredLeads.forEach(lead => {
            const campaignId = lead.campaignId?.toString() || 'Unassigned';
            const campaign = campaigns.find(c => c.id?.toString() === campaignId);
            const campaignName = campaign?.displayName || campaign?.campaign || 'Unassigned';
            
            if (!performance[campaignName]) {
                performance[campaignName] = {
                    name: campaignName,
                    leads: 0,
                    converted: 0,
                    value: 0,
                    avgScore: 0,
                    scores: []
                };
            }
            
            performance[campaignName].leads++;
            if (lead.leadStatus?.toLowerCase() === 'converted') {
                performance[campaignName].converted++;
            }
            performance[campaignName].value += parseFloat(lead.value) || 0;
            performance[campaignName].scores.push(calculateLeadScore(lead));
        });

        return Object.values(performance).map(camp => ({
            ...camp,
            conversionRate: camp.leads > 0 ? (camp.converted / camp.leads * 100) : 0,
            avgScore: camp.scores.length > 0 
                ? (camp.scores.reduce((a, b) => a + b, 0) / camp.scores.length).toFixed(1)
                : 0
        })).sort((a, b) => b.leads - a.leads);
    }, [filteredLeads, campaigns]);

    // Daily lead generation chart data
    const dailyLeads = useMemo(() => {
        const days = parseInt(dateRange) || 30;
        const data = {};
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            data[dateStr] = 0;
        }

        filteredLeads.forEach(lead => {
            if (lead.leadDate) {
                const dateStr = lead.leadDate.split('T')[0];
                if (data[dateStr] !== undefined) {
                    data[dateStr]++;
                }
            }
        });

        return Object.entries(data).map(([date, count]) => ({
            date,
            count,
            label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }));
    }, [filteredLeads, dateRange]);

    // Status distribution
    const statusDistribution = useMemo(() => {
        const distribution = {};
        filteredLeads.forEach(lead => {
            const status = lead.leadStatus || 'Unknown';
            distribution[status] = (distribution[status] || 0) + 1;
        });
        return Object.entries(distribution).map(([status, count]) => ({
            status,
            count,
            percentage: filteredLeads.length > 0 ? (count / filteredLeads.length * 100) : 0
        })).sort((a, b) => b.count - a.count);
    }, [filteredLeads]);

    const handleExport = () => {
        toast.info('Exporting analytics report...');
        // Export functionality would go here
    };

    const TrendIndicator = ({ value }) => {
        const isPositive = value >= 0;
        return (
            <div className={`d-flex align-items-center ${isPositive ? 'text-success' : 'text-danger'}`}>
                {isPositive ? <FiTrendingUp size={16} /> : <FiTrendingDown size={16} />}
                <span className="ms-1">{Math.abs(value).toFixed(1)}%</span>
            </div>
        );
    };

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center justify-content-between w-100 gap-2">
                    <Link to="/leads/all-leads" className="btn btn-light">
                        <FiArrowLeft size={16} className='me-2' />
                        <span>Back to Leads</span>
                    </Link>
                    <div className="d-flex gap-2">
                        <button className="btn btn-outline-primary" onClick={handleExport}>
                            <FiDownload className="me-1" />
                            Export Report
                        </button>
                        <button 
                            className="btn btn-outline-secondary" 
                            onClick={() => setRefreshKey(prev => prev + 1)}
                        >
                            <FiRefreshCw className="me-1" />
                            Refresh
                        </button>
                    </div>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <div className="col-lg-12">
                        <div className="card">
                            <div className="card-header">
                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                    <div>
                                        <h5 className="card-title mb-0">Lead Analytics & Insights</h5>
                                        <p className="text-muted mb-0">Comprehensive analytics and performance metrics</p>
                                    </div>
                                    <div className="d-flex gap-2 flex-wrap">
                                        <select
                                            className="form-select"
                                            style={{ width: '150px' }}
                                            value={dateRange}
                                            onChange={(e) => setDateRange(e.target.value)}
                                        >
                                            <option value="7">Last 7 days</option>
                                            <option value="30">Last 30 days</option>
                                            <option value="90">Last 90 days</option>
                                            <option value="180">Last 6 months</option>
                                            <option value="365">Last year</option>
                                            <option value="all">All time</option>
                                        </select>
                                        <select
                                            className="form-select"
                                            style={{ width: '180px' }}
                                            value={selectedCampaign}
                                            onChange={(e) => setSelectedCampaign(e.target.value)}
                                        >
                                            <option value="all">All Campaigns</option>
                                            {campaigns.map(campaign => (
                                                <option key={campaign.id} value={campaign.id}>
                                                    {campaign.displayName || campaign.campaign}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            className="form-select"
                                            style={{ width: '150px' }}
                                            value={selectedSource}
                                            onChange={(e) => setSelectedSource(e.target.value)}
                                        >
                                            <option value="all">All Sources</option>
                                            <option value="Website">Website</option>
                                            <option value="Google">Google</option>
                                            <option value="Facebook">Facebook</option>
                                            <option value="Referral">Referral</option>
                                            <option value="Email">Email</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                {/* Key Metrics */}
                                <div className="row mb-4">
                                    <div className="col-lg-3 col-md-6 mb-3">
                                        <div className="card border h-100">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <h6 className="text-muted mb-1">Total Leads</h6>
                                                        <h3 className="mb-0">{stats.total.toLocaleString()}</h3>
                                                    </div>
                                                    <div className="avatar-text avatar-lg bg-primary">
                                                        <FiUsers className="text-white" size={24} />
                                                    </div>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <TrendIndicator value={stats.trends.total} />
                                                    <span className="text-muted ms-2">vs previous period</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 col-md-6 mb-3">
                                        <div className="card border h-100">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <h6 className="text-muted mb-1">Conversion Rate</h6>
                                                        <h3 className="mb-0">{stats.conversionRate.toFixed(1)}%</h3>
                                                    </div>
                                                    <div className="avatar-text avatar-lg bg-success">
                                                        <FiTarget className="text-white" size={24} />
                                                    </div>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <TrendIndicator value={stats.trends.conversion} />
                                                    <span className="text-muted ms-2">vs previous period</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 col-md-6 mb-3">
                                        <div className="card border h-100">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <h6 className="text-muted mb-1">Total Value</h6>
                                                        <h3 className="mb-0">${stats.totalValue.toLocaleString()}</h3>
                                                    </div>
                                                    <div className="avatar-text avatar-lg bg-info">
                                                        <FiDollarSign className="text-white" size={24} />
                                                    </div>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <TrendIndicator value={stats.trends.value} />
                                                    <span className="text-muted ms-2">vs previous period</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 col-md-6 mb-3">
                                        <div className="card border h-100">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <h6 className="text-muted mb-1">Avg Lead Score</h6>
                                                        <h3 className="mb-0">{stats.avgScore.toFixed(1)}</h3>
                                                    </div>
                                                    <div className="avatar-text avatar-lg bg-warning">
                                                        <FiBarChart2 className="text-white" size={24} />
                                                    </div>
                                                </div>
                                                <div className="text-muted small">
                                                    Avg Value: ${stats.avgValue.toFixed(0)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Breakdown */}
                                <div className="row mb-4">
                                    <div className="col-lg-6 mb-3">
                                        <div className="card border h-100">
                                            <div className="card-header bg-light">
                                                <h6 className="mb-0"><FiPieChart className="me-2" />Status Distribution</h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="row">
                                                    {statusDistribution.map((item, idx) => (
                                                        <div key={idx} className="col-6 mb-3">
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <span className="fw-semibold">{item.status}</span>
                                                                <span className="badge bg-primary">{item.count}</span>
                                                            </div>
                                                            <div className="progress mt-1" style={{ height: '8px' }}>
                                                                <div
                                                                    className="progress-bar"
                                                                    role="progressbar"
                                                                    style={{ width: `${item.percentage}%` }}
                                                                ></div>
                                                            </div>
                                                            <small className="text-muted">{item.percentage.toFixed(1)}%</small>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 mb-3">
                                        <div className="card border h-100">
                                            <div className="card-header bg-light">
                                                <h6 className="mb-0"><FiBarChart2 className="me-2" />Daily Lead Generation</h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="d-flex align-items-end" style={{ height: '200px', gap: '4px' }}>
                                                    {dailyLeads.map((day, idx) => (
                                                        <div key={idx} className="flex-fill d-flex flex-column align-items-center">
                                                            <div
                                                                className="bg-primary rounded-top"
                                                                style={{
                                                                    width: '100%',
                                                                    height: `${(day.count / Math.max(...dailyLeads.map(d => d.count), 1)) * 180}px`,
                                                                    minHeight: day.count > 0 ? '4px' : '0px'
                                                                }}
                                                                title={`${day.label}: ${day.count} leads`}
                                                            ></div>
                                                            <small className="text-muted mt-1" style={{ fontSize: '9px', writingMode: 'vertical-rl' }}>
                                                                {day.label.split(' ')[0]}
                                                            </small>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Source Performance */}
                                <div className="row mb-4">
                                    <div className="col-lg-12">
                                        <div className="card border">
                                            <div className="card-header bg-light">
                                                <h6 className="mb-0"><FiBarChart2 className="me-2" />Lead Source Performance</h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="table-responsive">
                                                    <table className="table table-hover">
                                                        <thead>
                                                            <tr>
                                                                <th>Source</th>
                                                                <th>Leads</th>
                                                                <th>Converted</th>
                                                                <th>Conversion Rate</th>
                                                                <th>Total Value</th>
                                                                <th>Avg Value</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {sourceBreakdown.map((item, idx) => (
                                                                <tr key={idx}>
                                                                    <td><strong>{item.source}</strong></td>
                                                                    <td>{item.count}</td>
                                                                    <td>{item.converted}</td>
                                                                    <td>
                                                                        <span className={`badge ${item.conversionRate >= 20 ? 'bg-success' : item.conversionRate >= 10 ? 'bg-warning' : 'bg-secondary'}`}>
                                                                            {item.conversionRate.toFixed(1)}%
                                                                        </span>
                                                                    </td>
                                                                    <td>${item.value.toLocaleString()}</td>
                                                                    <td>${item.count > 0 ? (item.value / item.count).toFixed(0) : 0}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Campaign Performance */}
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="card border">
                                            <div className="card-header bg-light">
                                                <h6 className="mb-0"><FiTarget className="me-2" />Campaign Performance</h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="table-responsive">
                                                    <table className="table table-hover">
                                                        <thead>
                                                            <tr>
                                                                <th>Campaign</th>
                                                                <th>Leads</th>
                                                                <th>Converted</th>
                                                                <th>Conversion Rate</th>
                                                                <th>Total Value</th>
                                                                <th>Avg Score</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {campaignPerformance.map((camp, idx) => (
                                                                <tr key={idx}>
                                                                    <td><strong>{camp.name}</strong></td>
                                                                    <td>{camp.leads}</td>
                                                                    <td>{camp.converted}</td>
                                                                    <td>
                                                                        <span className={`badge ${camp.conversionRate >= 20 ? 'bg-success' : camp.conversionRate >= 10 ? 'bg-warning' : 'bg-secondary'}`}>
                                                                            {camp.conversionRate.toFixed(1)}%
                                                                        </span>
                                                                    </td>
                                                                    <td>${camp.value.toLocaleString()}</td>
                                                                    <td>{camp.avgScore}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default LeadsAnalytics;

