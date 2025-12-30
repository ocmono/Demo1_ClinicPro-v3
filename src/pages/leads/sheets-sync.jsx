import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import { FiArrowLeft, FiRefreshCw, FiLink, FiX, FiCheck, FiDownload, FiUpload } from 'react-icons/fi';
import { SiGooglesheets } from 'react-icons/si';
import { Link } from 'react-router-dom';
import { useLeads } from '../../context/LeadsContext';
import { googleSheetsIntegration } from '@/utils/leadIntegrations';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import Loading from '@/components/shared/Loading';

const SheetsSync = () => {
    const { leads, fetchLeads } = useLeads();
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [sheetsConfig, setSheetsConfig] = useState({
        connected: false,
        spreadsheetId: '',
        sheetName: 'Sheet1',
        autoSync: false,
        syncInterval: 15,
        accessToken: ''
    });

    useEffect(() => {
        // Load saved Google Sheets configuration
        const savedIntegrations = localStorage.getItem('leadIntegrations');
        if (savedIntegrations) {
            try {
                const integrations = JSON.parse(savedIntegrations);
                if (integrations.sheets) {
                    setSheetsConfig(integrations.sheets);
                }
            } catch (error) {
                console.error('Failed to load Google Sheets configuration:', error);
            }
        }
    }, []);

    const saveConfig = (updatedConfig) => {
        const savedIntegrations = localStorage.getItem('leadIntegrations');
        let integrations = savedIntegrations ? JSON.parse(savedIntegrations) : {};
        integrations.sheets = updatedConfig;
        localStorage.setItem('leadIntegrations', JSON.stringify(integrations));
        setSheetsConfig(updatedConfig);
    };

    const handleGoogleSheetsLogin = useGoogleLogin({
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly',
        onSuccess: async (tokenResponse) => {
            if (!sheetsConfig.spreadsheetId) {
                toast.error('Please enter a Google Sheets spreadsheet ID first');
                return;
            }

            setLoading(true);
            try {
                const result = await googleSheetsIntegration.connect(
                    tokenResponse.access_token,
                    sheetsConfig.spreadsheetId,
                    sheetsConfig.sheetName || 'Sheet1'
                );
                
                saveConfig({
                    ...sheetsConfig,
                    connected: true,
                    accessToken: tokenResponse.access_token
                });
                toast.success('Google Sheets connected successfully!');
            } catch (error) {
                console.log(`Connection failed: ${error.message}`);
                // toast.error(`Connection failed: ${error.message}`);
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            toast.error('Google authentication failed');
        }
    });

    const handleConnect = () => {
        if (!sheetsConfig.spreadsheetId) {
            toast.error('Please enter a Google Sheets spreadsheet ID first');
            return;
        }
        handleGoogleSheetsLogin();
    };

    const handleDisconnect = () => {
        saveConfig({
            ...sheetsConfig,
            connected: false,
            accessToken: ''
        });
        toast.success('Disconnected from Google Sheets');
    };

    const handleSyncToSheets = async () => {
        if (!sheetsConfig.connected) {
            toast.error('Please connect to Google Sheets first');
            return;
        }

        if (!sheetsConfig.accessToken) {
            toast.error('Please reconnect to Google Sheets');
            handleGoogleSheetsLogin();
            return;
        }

        setSyncing(true);
        try {
            await googleSheetsIntegration.syncToSheets(
                leads,
                sheetsConfig.spreadsheetId,
                sheetsConfig.sheetName || 'Sheet1',
                sheetsConfig.accessToken
            );
            toast.success('Leads synced to Google Sheets successfully!');
        } catch (error) {
            toast.error(`Sync failed: ${error.message}`);
        } finally {
            setSyncing(false);
        }
    };

    const handleFetchFromSheets = async () => {
        if (!sheetsConfig.connected) {
            toast.error('Please connect to Google Sheets first');
            return;
        }

        setLoading(true);
        try {
            const fetchedLeads = await googleSheetsIntegration.fetchFromSheets(
                sheetsConfig.spreadsheetId,
                sheetsConfig.sheetName || 'Sheet1'
            );
            toast.success(`Fetched ${fetchedLeads.length} leads from Google Sheets!`);
            // You can add logic here to import these leads if needed
        } catch (error) {
            console.log(`Fetch failed: ${error.message}`);
            // toast.error(`Fetch failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAutoSync = async (enable) => {
        setLoading(true);
        try {
            if (enable) {
                await googleSheetsIntegration.enableAutoSync(
                    sheetsConfig.spreadsheetId,
                    sheetsConfig.sheetName,
                    sheetsConfig.syncInterval
                );
                saveConfig({ ...sheetsConfig, autoSync: true });
                toast.success('Auto-sync enabled for Google Sheets!');
            } else {
                await googleSheetsIntegration.disableAutoSync();
                saveConfig({ ...sheetsConfig, autoSync: false });
                toast.success('Auto-sync disabled for Google Sheets!');
            }
        } catch (error) {
            toast.error(`Failed to ${enable ? 'enable' : 'disable'} auto-sync: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <Link to="/leads/all-leads" className="btn btn-light">
                        <FiArrowLeft size={16} className='me-2' />
                        <span>Back to Leads</span>
                    </Link>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <div className="col-lg-12">
                        <div className="card">
                            <div className="card-header">
                                <div className="d-flex align-items-center gap-2">
                                    <SiGooglesheets size={24} className="text-success" />
                                    <div>
                                        <h5 className="card-title mb-0">Google Sheets Synchronization</h5>
                                        <p className="text-muted mb-0">Sync your leads with Google Sheets</p>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div className="d-flex align-items-center gap-2">
                                        <span className={`badge ${sheetsConfig.connected ? 'bg-success' : 'bg-secondary'}`}>
                                            {sheetsConfig.connected ? (
                                                <>
                                                    <FiCheck className="me-1" />
                                                    Connected
                                                </>
                                            ) : (
                                                <>
                                                    <FiX className="me-1" />
                                                    Disconnected
                                                </>
                                            )}
                                        </span>
                                    </div>
                                    <div className="d-flex gap-2">
                                        {sheetsConfig.connected ? (
                                            <>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={handleSyncToSheets}
                                                    disabled={syncing || leads.length === 0}
                                                >
                                                    {syncing ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" />
                                                            Syncing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiUpload className="me-1" />
                                                            Sync to Sheets
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={handleFetchFromSheets}
                                                    disabled={loading}
                                                >
                                                    <FiDownload className="me-1" />
                                                    Fetch from Sheets
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={handleDisconnect}
                                                    disabled={loading}
                                                >
                                                    <FiX className="me-1" />
                                                    Disconnect
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={handleConnect}
                                                disabled={loading || !sheetsConfig.spreadsheetId}
                                            >
                                                <FiLink className="me-1" />
                                                Connect to Google Sheets
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-lg-6 mb-3">
                                        <label className="form-label">Google Sheets Spreadsheet ID</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter Google Sheets ID"
                                            value={sheetsConfig.spreadsheetId}
                                            onChange={(e) => saveConfig({ ...sheetsConfig, spreadsheetId: e.target.value })}
                                        />
                                        <small className="text-muted">
                                            Found in the Google Sheets URL (e.g., https://docs.google.com/spreadsheets/d/<strong>SPREADSHEET_ID</strong>/edit)
                                        </small>
                                    </div>
                                    <div className="col-lg-6 mb-3">
                                        <label className="form-label">Sheet Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Sheet1"
                                            value={sheetsConfig.sheetName}
                                            onChange={(e) => saveConfig({ ...sheetsConfig, sheetName: e.target.value })}
                                        />
                                        <small className="text-muted">Name of the sheet tab (default: Sheet1)</small>
                                    </div>
                                </div>

                                {sheetsConfig.connected && (
                                    <div className="row">
                                        <div className="col-lg-6 mb-3">
                                            <label className="form-label">Auto-Sync Interval (minutes)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                min="5"
                                                value={sheetsConfig.syncInterval}
                                                onChange={(e) => saveConfig({ ...sheetsConfig, syncInterval: parseInt(e.target.value) || 15 })}
                                            />
                                            <small className="text-muted">How often to automatically sync (minimum: 5 minutes)</small>
                                        </div>
                                        <div className="col-lg-6 mb-3 d-flex align-items-end">
                                            <div className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={sheetsConfig.autoSync}
                                                    onChange={(e) => handleAutoSync(e.target.checked)}
                                                />
                                                <label className="form-check-label">
                                                    Enable Auto-Sync
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="alert alert-info mt-4">
                                    <strong>Sync Information:</strong>
                                    <ul className="mb-0 mt-2">
                                        <li><strong>{leads.length} lead(s)</strong> available to sync</li>
                                        <li>Sync will update your Google Sheets with current lead data</li>
                                        <li>Fetch will retrieve leads from your Google Sheets</li>
                                        {sheetsConfig.autoSync && (
                                            <li>Auto-sync is enabled and will run every {sheetsConfig.syncInterval} minutes</li>
                                        )}
                                    </ul>
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

export default SheetsSync;

