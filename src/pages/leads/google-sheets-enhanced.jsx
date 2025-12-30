import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import { FiArrowLeft, FiRefreshCw, FiLink, FiCheck, FiX, FiDownload, FiUpload, FiSettings, FiList, FiTrash2, FiExternalLink } from 'react-icons/fi';
import { SiGooglesheets } from 'react-icons/si';
import { Link } from 'react-router-dom';
import { useLeads } from '../../context/LeadsContext';
import { googleSheetsIntegration } from '@/utils/leadIntegrations';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import Loading from '@/components/shared/Loading';
import Table from '@/components/shared/table/Table';

const GoogleSheetsEnhanced = () => {
    const { leads, fetchLeads } = useLeads();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('connections');
    const [connections, setConnections] = useState([]);
    const [syncLogs, setSyncLogs] = useState([]);
    const [stats, setStats] = useState({
        activeConnections: 0,
        totalLeadsSynced: 0,
        todaysSyncs: 0,
        errors: 0
    });
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [newConnection, setNewConnection] = useState({
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
                toast.error(`Connection failed: ${error.message}`);
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            toast.error('Google authentication failed');
        }
    });

    const handleSync = async (connectionId) => {
        const connection = connections.find(c => c.id === connectionId);
        if (!connection) return;

        setLoading(true);
        try {
            await googleSheetsIntegration.syncToSheets(
                leads,
                connection.spreadsheetId,
                connection.sheetName,
                connection.accessToken
            );

            const updated = connections.map(c => {
                if (c.id === connectionId) {
                    return {
                        ...c,
                        leadsSynced: leads.length,
                        totalLeads: leads.length,
                        lastSync: new Date().toISOString(),
                        nextSync: new Date(Date.now() + c.syncFrequency * 60000).toISOString()
                    };
                }
                return c;
            });

            saveConnections(updated);
            addSyncLog({
                connectionName: connection.name,
                status: 'success',
                recordsSynced: leads.length
            });
            toast.success(`Synced ${leads.length} leads to ${connection.name}!`);
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
                error: error.message
            });
            toast.error(`Sync failed: ${error.message}`);
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
            toast.error(`Bulk sync failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (connectionId) => {
        if (window.confirm('Are you sure you want to delete this connection?')) {
            const updated = connections.filter(c => c.id !== connectionId);
            saveConnections(updated);
            toast.success('Connection deleted successfully');
        }
    };

    const handleSettings = (connection) => {
        toast.info(`Settings for ${connection.name} - Coming soon!`);
    };

    const handleViewLogs = (connection) => {
        const filtered = syncLogs.filter(log => log.connectionName === connection.name);
        if (filtered.length > 0) {
            toast.info(`Viewing ${filtered.length} log(s) for ${connection.name}`);
            setActiveTab('logs');
        } else {
            toast.warning(`No logs found for ${connection.name}`);
        }
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
            cell: (info) => (
                <span className={`badge ${info.getValue() === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                    {info.getValue() === 'active' ? 'Active' : 'Inactive'}
                </span>
            )
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
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleSync(row.original.id)}
                        title="Sync Now"
                    >
                        <FiRefreshCw size={14} />
                    </button>
                    <button
                        className="btn btn-sm btn-outline-success"
                        title="Settings"
                        onClick={() => handleSettings(row.original)}
                    >
                        <FiSettings size={14} />
                    </button>
                    <button
                        className="btn btn-sm btn-outline-info"
                        title="View Logs"
                        onClick={() => handleViewLogs(row.original)}
                    >
                        <FiList size={14} />
                    </button>
                    <button
                        className="btn btn-sm btn-outline-danger"
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

    if (loading) return <Loading />;

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center justify-content-between w-100">
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
                                                        <FiCheck size={24} />
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
                                                        <FiRefreshCw size={24} />
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
                                                        <FiX size={24} />
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
                                                className={`nav-link ${activeTab === 'connections' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('connections')}
                                            >
                                                Connections
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button
                                                className={`nav-link ${activeTab === 'logs' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('logs')}
                                            >
                                                Sync Logs
                                            </button>
                                        </li>
                                    </ul>
                                    {activeTab === 'connections' && (
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
                                {activeTab === 'connections' ? (
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
                                        placeholder="e.g., Google Ads Lead Sheet"
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

            <Footer />
        </>
    );
};

export default GoogleSheetsEnhanced;

