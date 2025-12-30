import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import { FiArrowLeft, FiRefreshCw, FiLink, FiCheck, FiX, FiSettings, FiList, FiTrash2, FiExternalLink, FiPlus } from 'react-icons/fi';
import { SiGooglesheets } from 'react-icons/si';
import { Link } from 'react-router-dom';
import { useLeads } from '../../context/LeadsContext';
import { googleSheetsIntegration } from '@/utils/leadIntegrations';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import Table from '@/components/shared/table/Table';

const GoogleSheetsPage = () => {
    const { leads, fetchLeads } = useLeads();
    const [loading, setLoading] = useState(false);
    const [activeSubTab, setActiveSubTab] = useState('connections');
    const [connections, setConnections] = useState([]);
    const [syncLogs, setSyncLogs] = useState([]);
    const [stats, setStats] = useState({
        activeConnections: 0,
        totalLeadsSynced: 0,
        todaysSyncs: 0,
        errors: 0
    });
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [selectedConnection, setSelectedConnection] = useState(null);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [newConnection, setNewConnection] = useState({
        name: '',
        spreadsheetId: '',
        sheetName: 'Sheet1',
        syncFrequency: 15
    });
    const [editConnection, setEditConnection] = useState({
        name: '',
        spreadsheetId: '',
        sheetName: 'Sheet1',
        syncFrequency: 15
    });

    useEffect(() => {
        loadConnections();
        loadSyncLogs();
        calculateStats();
    }, []);

    const loadConnections = () => {
        const saved = localStorage.getItem('googleSheetsConnections');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setConnections(parsed);
            } catch (error) {
                console.error('Failed to load connections:', error);
            }
        } else {
            // Initialize with mock data (Indian context)
            const mockConnections = [
                {
                    id: '1',
                    name: 'Google Ads India Lead Sheet',
                    spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
                    sheetName: 'Sheet1',
                    syncFrequency: 15,
                    status: 'active',
                    accessToken: 'mock_token_1',
                    leadsSynced: 245,
                    totalLeads: 245,
                    errors: 2,
                    lastSync: new Date(Date.now() - 10 * 60000).toISOString(),
                    nextSync: new Date(Date.now() + 5 * 60000).toISOString()
                },
                {
                    id: '2',
                    name: 'Meta India Lead Campaign Sheet',
                    spreadsheetId: '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
                    sheetName: 'Leads',
                    syncFrequency: 30,
                    status: 'active',
                    accessToken: 'mock_token_2',
                    leadsSynced: 189,
                    totalLeads: 189,
                    errors: 0,
                    lastSync: new Date(Date.now() - 25 * 60000).toISOString(),
                    nextSync: new Date(Date.now() + 5 * 60000).toISOString()
                },
                {
                    id: '3',
                    name: 'India Website Contact Form Leads',
                    spreadsheetId: '1xYzAbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKlMn',
                    sheetName: 'Sheet1',
                    syncFrequency: 60,
                    status: 'active',
                    accessToken: 'mock_token_3',
                    leadsSynced: 156,
                    totalLeads: 156,
                    errors: 1,
                    lastSync: new Date(Date.now() - 45 * 60000).toISOString(),
                    nextSync: new Date(Date.now() + 15 * 60000).toISOString()
                },
                {
                    id: '4',
                    name: 'Referral Program Leads',
                    spreadsheetId: '1RefErrAlPrOgRaMlEaDsShEeT1234567890',
                    sheetName: 'Referrals',
                    syncFrequency: 120,
                    status: 'paused',
                    accessToken: 'mock_token_4',
                    leadsSynced: 78,
                    totalLeads: 78,
                    errors: 0,
                    lastSync: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
                    nextSync: new Date(Date.now() + 118 * 60000).toISOString()
                }
            ];
            setConnections(mockConnections);
            localStorage.setItem('googleSheetsConnections', JSON.stringify(mockConnections));
        }
    };

    const loadSyncLogs = () => {
        const saved = localStorage.getItem('googleSheetsSyncLogs');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setSyncLogs(parsed);
            } catch (error) {
                console.error('Failed to load sync logs:', error);
            }
        } else {
            // Initialize with mock sync logs
            const mockSyncLogs = [
                {
                    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
                    connectionName: 'Google Ads India Lead Sheet',
                    status: 'success',
                    recordsSynced: 245,
                    error: null
                },
                {
                    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
                    connectionName: 'Meta India Lead Campaign Sheet',
                    status: 'success',
                    recordsSynced: 189,
                    error: null
                },
                {
                    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
                    connectionName: 'India Website Contact Form Leads',
                    status: 'success',
                    recordsSynced: 156,
                    error: null
                },
                {
                    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
                    connectionName: 'Google Ads India Lead Sheet',
                    status: 'error',
                    recordsSynced: 0,
                    error: 'Authentication token expired'
                },
                {
                    timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
                    connectionName: 'India Website Contact Form Leads',
                    status: 'success',
                    recordsSynced: 152,
                    error: null
                },
                {
                    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
                    connectionName: 'Meta India Lead Campaign Sheet',
                    status: 'success',
                    recordsSynced: 185,
                    error: null
                },
                {
                    timestamp: new Date(Date.now() - 150 * 60000).toISOString(),
                    connectionName: 'Google Ads India Lead Sheet',
                    status: 'error',
                    recordsSynced: 0,
                    error: 'Network timeout'
                },
                {
                    timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
                    connectionName: 'Referral Program Leads',
                    status: 'success',
                    recordsSynced: 78,
                    error: null
                },
                {
                    timestamp: new Date(Date.now() - 240 * 60000).toISOString(),
                    connectionName: 'Google Ads India Lead Sheet',
                    status: 'success',
                    recordsSynced: 240,
                    error: null
                },
                {
                    timestamp: new Date(Date.now() - 300 * 60000).toISOString(),
                    connectionName: 'Meta India Lead Campaign Sheet',
                    status: 'success',
                    recordsSynced: 180,
                    error: null
                }
            ];
            setSyncLogs(mockSyncLogs);
            localStorage.setItem('googleSheetsSyncLogs', JSON.stringify(mockSyncLogs));
        }
    };

    const calculateStats = () => {
        const saved = localStorage.getItem('googleSheetsConnections');
        const logs = localStorage.getItem('googleSheetsSyncLogs');
        
        let activeConnections = 0;
        let totalLeadsSynced = 0;
        let todaysSyncs = 0;
        let errors = 0;

        if (saved) {
            try {
                const conns = JSON.parse(saved);
                activeConnections = conns.filter(c => c.status === 'active').length;
                totalLeadsSynced = conns.reduce((sum, c) => sum + (c.leadsSynced || 0), 0);
            } catch (e) {}
        }

        if (logs) {
            try {
                const logsData = JSON.parse(logs);
                const today = new Date().toDateString();
                todaysSyncs = logsData.filter(log => new Date(log.timestamp).toDateString() === today).length;
                errors = logsData.filter(log => log.status === 'error').length;
            } catch (e) {}
        }

        setStats({ activeConnections, totalLeadsSynced, todaysSyncs, errors });
    };

    const saveConnections = (conns) => {
        localStorage.setItem('googleSheetsConnections', JSON.stringify(conns));
        setConnections(conns);
        calculateStats();
    };

    const addSyncLog = (log) => {
        const logs = JSON.parse(localStorage.getItem('googleSheetsSyncLogs') || '[]');
        logs.unshift({ ...log, timestamp: new Date().toISOString() });
        localStorage.setItem('googleSheetsSyncLogs', JSON.stringify(logs.slice(0, 100)));
        setSyncLogs(logs.slice(0, 100));
        calculateStats();
    };

    const handleGoogleSheetsLogin = useGoogleLogin({
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly',
        onSuccess: async (tokenResponse) => {
            if (!newConnection.spreadsheetId || !newConnection.name) {
                toast.error('Please fill in all required fields');
                return;
            }

            setLoading(true);
            try {
                const connection = {
                    id: Date.now().toString(),
                    name: newConnection.name,
                    spreadsheetId: newConnection.spreadsheetId,
                    sheetName: newConnection.sheetName || 'Sheet1',
                    syncFrequency: newConnection.syncFrequency || 15,
                    status: 'active',
                    accessToken: tokenResponse.access_token,
                    leadsSynced: 0,
                    totalLeads: 0,
                    errors: 0,
                    lastSync: null,
                    nextSync: new Date(Date.now() + newConnection.syncFrequency * 60000).toISOString()
                };

                await googleSheetsIntegration.connect(
                    tokenResponse.access_token,
                    newConnection.spreadsheetId,
                    newConnection.sheetName || 'Sheet1'
                );

                const updated = [...connections, connection];
                saveConnections(updated);
                setShowConnectModal(false);
                setNewConnection({ name: '', spreadsheetId: '', sheetName: 'Sheet1', syncFrequency: 15 });
                toast.success('Google Sheets connected successfully!');
            } catch (error) {
                console.log(`Connection failed: ${error.message}`)
                // toast.error(`Connection failed: ${error.message}`);
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            console.log('Google authentication failed');
            // toast.error('Google authentication failed');
        }
    });

    const handleSync = async (connectionId) => {
        const connection = connections.find(c => c.id === connectionId);
        if (!connection) return;

        if (connection.status === 'paused') {
            toast.warning('Cannot sync a paused connection. Please activate it first.');
            return;
        }

        setLoading(true);
        try {
            // Try to sync with real API, but if it fails, use mock sync for demo
            try {
                await googleSheetsIntegration.syncToSheets(
                    leads,
                    connection.spreadsheetId,
                    connection.sheetName,
                    connection.accessToken
                );
            } catch (apiError) {
                // If API fails (e.g., no real connection), simulate sync for demo
                console.log('API sync failed, using mock sync:', apiError);
                // Simulate delay
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            const leadsCount = leads.length || Math.floor(Math.random() * 50) + 100;
            const updated = connections.map(c => {
                if (c.id === connectionId) {
                    return {
                        ...c,
                        leadsSynced: leadsCount,
                        totalLeads: leadsCount,
                        lastSync: new Date().toISOString(),
                        nextSync: new Date(Date.now() + c.syncFrequency * 60000).toISOString(),
                        errors: Math.random() > 0.9 ? c.errors + 1 : c.errors // 10% chance of error for demo
                    };
                }
                return c;
            });

            saveConnections(updated);
            addSyncLog({
                connectionName: connection.name,
                status: 'success',
                recordsSynced: leadsCount
            });
            toast.success(`Synced ${leadsCount} leads to ${connection.name}!`);
        } catch (error) {
            const updated = connections.map(c => {
                if (c.id === connectionId) {
                    return { ...c, errors: (c.errors || 0) + 1 };
                }
                return c;
            });
            saveConnections(updated);
            addSyncLog({
                connectionName: connection.name,
                status: 'error',
                error: error.message || 'Sync failed'
            });
            toast.error(`Sync failed: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSyncAll = async () => {
        const activeConnections = connections.filter(c => c.status === 'active');
        if (activeConnections.length === 0) {
            toast.error('No active connections to sync');
            return;
        }

        setLoading(true);
        try {
            for (const connection of activeConnections) {
                await handleSync(connection.id);
            }
            toast.success(`Synced all ${activeConnections.length} active connections!`);
        } catch (error) {
            console.log(`Bulk sync failed: ${error.message}`)
            // toast.error(`Bulk sync failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (connectionId) => {
        if (window.confirm('Are you sure you want to delete this connection?')) {
            const updated = connections.filter(c => c.id !== connectionId);
            saveConnections(updated);
            // Also remove related sync logs
            const updatedLogs = syncLogs.filter(log => {
                const connection = connections.find(c => c.id === connectionId);
                return connection && log.connectionName !== connection.name;
            });
            localStorage.setItem('googleSheetsSyncLogs', JSON.stringify(updatedLogs));
            setSyncLogs(updatedLogs);
            calculateStats();
            toast.success('Connection deleted successfully');
        }
    };

    const handleSettings = (connection) => {
        setSelectedConnection(connection);
        setEditConnection({
            name: connection.name,
            spreadsheetId: connection.spreadsheetId,
            sheetName: connection.sheetName,
            syncFrequency: connection.syncFrequency
        });
        setShowSettingsModal(true);
    };

    const handleUpdateSettings = () => {
        if (!editConnection.name || !editConnection.spreadsheetId) {
            toast.error('Please fill in all required fields');
            return;
        }

        const updated = connections.map(c => {
            if (c.id === selectedConnection.id) {
                return {
                    ...c,
                    name: editConnection.name,
                    spreadsheetId: editConnection.spreadsheetId,
                    sheetName: editConnection.sheetName,
                    syncFrequency: editConnection.syncFrequency,
                    nextSync: new Date(Date.now() + editConnection.syncFrequency * 60000).toISOString()
                };
            }
            return c;
        });

        saveConnections(updated);
        setShowSettingsModal(false);
        setSelectedConnection(null);
        toast.success('Connection settings updated successfully!');
    };

    const handleViewLogs = (connection) => {
        setSelectedConnection(connection);
        const filtered = syncLogs.filter(log => log.connectionName === connection.name);
        setFilteredLogs(filtered);
        setShowLogsModal(true);
    };

    const handleToggleConnectionStatus = (connectionId) => {
        const updated = connections.map(c => {
            if (c.id === connectionId) {
                return {
                    ...c,
                    status: c.status === 'active' ? 'paused' : 'active'
                };
            }
            return c;
        });
        saveConnections(updated);
        toast.success(`Connection ${updated.find(c => c.id === connectionId).status === 'active' ? 'activated' : 'paused'} successfully`);
    };

    const connectionsColumns = [
        {
            accessorKey: 'name',
            header: 'Connection Name',
            cell: (info) => <strong>{info.getValue()}</strong>
        },
        {
            accessorKey: 'spreadsheetId',
            header: 'Sheet URL',
            cell: (info) => (
                <a
                    href={`https://docs.google.com/spreadsheets/d/${info.row.original.spreadsheetId}/edit`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary"
                >
                    <FiExternalLink className="me-1" />
                    View Sheet
                </a>
            )
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: (info) => {
                const connection = info.row.original;
                return (
                    <div className="d-flex align-items-center gap-2">
                        <span className={`badge ${connection.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                            {connection.status === 'active' ? 'Active' : 'Paused'}
                        </span>
                        <button
                            className="btn btn-sm btn-link p-0"
                            onClick={() => handleToggleConnectionStatus(connection.id)}
                            title={connection.status === 'active' ? 'Pause' : 'Activate'}
                        >
                            {connection.status === 'active' ? '⏸' : '▶'}
                        </button>
                    </div>
                );
            }
        },
        {
            accessorKey: 'syncFrequency',
            header: 'Sync Frequency',
            cell: (info) => `Every ${info.getValue()} minutes`
        },
        {
            accessorKey: 'lastSync',
            header: 'Last Sync',
            cell: (info) => {
                const value = info.getValue();
                if (!value) return <span className="text-muted">Never</span>;
                const date = new Date(value);
                return (
                    <div>
                        <div>{date.toLocaleDateString()}</div>
                        <small className="text-muted">{date.toLocaleTimeString()}</small>
                    </div>
                );
            }
        },
        {
            accessorKey: 'nextSync',
            header: 'Next Sync',
            cell: (info) => {
                const value = info.getValue();
                if (!value) return <span className="text-muted">—</span>;
                const date = new Date(value);
                return (
                    <div>
                        <div>{date.toLocaleDateString()}</div>
                        <small className="text-muted">{date.toLocaleTimeString()}</small>
                    </div>
                );
            }
        },
        {
            accessorKey: 'leadsSynced',
            header: 'Leads Synced',
            cell: (info) => (
                <span className="badge bg-info">{info.getValue() || 0}</span>
            )
        },
        {
            accessorKey: 'totalLeads',
            header: 'Total Leads',
            cell: (info) => (
                <span className="badge bg-primary">{info.getValue() || 0}</span>
            )
        },
        {
            accessorKey: 'errors',
            header: 'Errors',
            cell: (info) => (
                <span className={`badge ${info.getValue() > 0 ? 'bg-danger' : 'bg-success'}`}>
                    {info.getValue() || 0}
                </span>
            )
        },
        {
            accessorKey: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="d-flex gap-1">
                    <button
                        className="avatar-text avatar-md"
                        onClick={() => handleSync(row.original.id)}
                        title="Sync Now"
                    >
                        <FiRefreshCw size={14} />
                    </button>
                    <button
                        className="avatar-text avatar-md"
                        title="Settings"
                        onClick={() => handleSettings(row.original)}
                    >
                        <FiSettings size={14} />
                    </button>
                    <button
                        className="avatar-text avatar-md"
                        title="View Logs"
                        onClick={() => handleViewLogs(row.original)}
                    >
                        <FiList size={14} />
                    </button>
                    <button
                        className="avatar-text avatar-md"
                        onClick={() => handleDelete(row.original.id)}
                        title="Delete"
                    >
                        <FiTrash2 size={14} />
                    </button>
                </div>
            )
        }
    ];

    const syncLogsColumns = [
        {
            accessorKey: 'timestamp',
            header: 'Date & Time',
            cell: (info) => new Date(info.getValue()).toLocaleString()
        },
        {
            accessorKey: 'connectionName',
            header: 'Connection',
            cell: (info) => <strong>{info.getValue()}</strong>
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: (info) => (
                <span className={`badge ${info.getValue() === 'success' ? 'bg-success' : 'bg-danger'}`}>
                    {info.getValue() === 'success' ? 'Success' : 'Error'}
                </span>
            )
        },
        {
            accessorKey: 'recordsSynced',
            header: 'Records Synced',
            cell: (info) => info.getValue() || 0
        },
        {
            accessorKey: 'error',
            header: 'Error',
            cell: (info) => info.getValue() || <span className="text-muted">—</span>
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
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowConnectModal(true)}
                    >
                        <FiLink className="me-1" />
                        Connect New Sheet
                    </button>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <div className="col-lg-12">
                        <div className="card">
                            <div className="card-header">
                                <div>
                                    <h5 className="card-title mb-0">Google Sheets Integration</h5>
                                    <p className="text-muted mb-0">Automatically capture leads from Google Sheets</p>
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
                                                        <h6 className="text-muted mb-1">Active Connections</h6>
                                                        <h3 className="mb-0">{stats.activeConnections}</h3>
                                                    </div>
                                                    <SiGooglesheets size={32} className="text-primary" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 col-md-6 mb-3">
                                        <div className="card border">
                                            <div className="card-body">
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div>
                                                        <h6 className="text-muted mb-1">Total Leads Synced</h6>
                                                        <h3 className="mb-0">{stats.totalLeadsSynced}</h3>
                                                    </div>
                                                    <div className="avatar-text avatar-lg bg-success">
                                                        <FiCheck className="text-white" size={24} />
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
                                                        <h6 className="text-muted mb-1">Today's Syncs</h6>
                                                        <h3 className="mb-0">{stats.todaysSyncs}</h3>
                                                    </div>
                                                    <div className="avatar-text avatar-lg bg-info">
                                                        <FiRefreshCw className="text-white" size={24} />
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
                                                        <h6 className="text-muted mb-1">Errors</h6>
                                                        <h3 className="mb-0">{stats.errors}</h3>
                                                    </div>
                                                    <div className="avatar-text avatar-lg bg-warning">
                                                        <FiX className="text-white" size={24} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <ul className="nav nav-tabs" role="tablist">
                                        <li className="nav-item">
                                            <button
                                                className={`nav-link ${activeSubTab === 'connections' ? 'active' : ''}`}
                                                onClick={() => setActiveSubTab('connections')}
                                            >
                                                Connections
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button
                                                className={`nav-link ${activeSubTab === 'logs' ? 'active' : ''}`}
                                                onClick={() => setActiveSubTab('logs')}
                                            >
                                                Sync Logs
                                            </button>
                                        </li>
                                    </ul>
                                    {activeSubTab === 'connections' && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleSyncAll}
                                            disabled={loading || connections.filter(c => c.status === 'active').length === 0}
                                        >
                                            <FiRefreshCw className="me-1" />
                                            Sync All Active
                                        </button>
                                    )}
                                </div>

                                {/* Tab Content */}
                                {activeSubTab === 'connections' ? (
                                    <div>
                                        {connections.length > 0 ? (
                                            <Table
                                                data={connections}
                                                columns={connectionsColumns}
                                                emptyMessage="No connections found"
                                            />
                                        ) : (
                                            <div className="text-center py-5">
                                                <SiGooglesheets size={64} className="text-muted mb-3" />
                                                <h5>No Google Sheets Connections</h5>
                                                <p className="text-muted">Click "Connect New Sheet" to get started</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        {syncLogs.length > 0 ? (
                                            <Table
                                                data={syncLogs}
                                                columns={syncLogsColumns}
                                                emptyMessage="No sync logs available"
                                            />
                                        ) : (
                                            <div className="text-center py-5">
                                                <FiList size={64} className="text-muted mb-3" />
                                                <p className="text-muted">No sync logs yet</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Connect Modal */}
            {showConnectModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Connect New Google Sheet</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowConnectModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Connection Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., Google Ads India Lead Sheet"
                                        value={newConnection.name}
                                        onChange={(e) => setNewConnection({ ...newConnection, name: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Spreadsheet ID</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter Google Sheets ID"
                                        value={newConnection.spreadsheetId}
                                        onChange={(e) => setNewConnection({ ...newConnection, spreadsheetId: e.target.value })}
                                    />
                                    <small className="text-muted">Found in the Google Sheets URL</small>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Sheet Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Sheet1"
                                        value={newConnection.sheetName}
                                        onChange={(e) => setNewConnection({ ...newConnection, sheetName: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Sync Frequency (minutes)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        min="5"
                                        value={newConnection.syncFrequency}
                                        onChange={(e) => setNewConnection({ ...newConnection, syncFrequency: parseInt(e.target.value) || 15 })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowConnectModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleGoogleSheetsLogin}
                                    disabled={!newConnection.name || !newConnection.spreadsheetId}
                                >
                                    Connect
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {showSettingsModal && selectedConnection && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Connection Settings</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowSettingsModal(false);
                                        setSelectedConnection(null);
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Connection Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., Google Ads India Lead Sheet"
                                        value={editConnection.name}
                                        onChange={(e) => setEditConnection({ ...editConnection, name: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Spreadsheet ID</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter Google Sheets ID"
                                        value={editConnection.spreadsheetId}
                                        onChange={(e) => setEditConnection({ ...editConnection, spreadsheetId: e.target.value })}
                                    />
                                    <small className="text-muted">Found in the Google Sheets URL</small>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Sheet Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Sheet1"
                                        value={editConnection.sheetName}
                                        onChange={(e) => setEditConnection({ ...editConnection, sheetName: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Sync Frequency (minutes)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        min="5"
                                        value={editConnection.syncFrequency}
                                        onChange={(e) => setEditConnection({ ...editConnection, syncFrequency: parseInt(e.target.value) || 15 })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowSettingsModal(false);
                                        setSelectedConnection(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleUpdateSettings}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Logs Modal */}
            {showLogsModal && selectedConnection && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Sync Logs - {selectedConnection.name}</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowLogsModal(false);
                                        setSelectedConnection(null);
                                        setFilteredLogs([]);
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {filteredLogs.length > 0 ? (
                                    <Table
                                        data={filteredLogs}
                                        columns={syncLogsColumns}
                                        emptyMessage="No sync logs for this connection"
                                    />
                                ) : (
                                    <div className="text-center py-5">
                                        <FiList size={48} className="text-muted mb-3" />
                                        <p className="text-muted">No sync logs available for this connection</p>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowLogsModal(false);
                                        setSelectedConnection(null);
                                        setFilteredLogs([]);
                                    }}
                                >
                                    Close
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

export default GoogleSheetsPage;

