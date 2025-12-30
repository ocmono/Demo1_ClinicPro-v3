import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiRefreshCw, FiLink, FiSettings, FiDownload } from 'react-icons/fi';
import { FaFacebook, FaGoogle } from 'react-icons/fa';
import { SiGooglesheets } from 'react-icons/si';
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import { metaLeadIntegration, googleLeadIntegration, googleSheetsIntegration } from '@/utils/leadIntegrations';
import { useLeads } from '../../context/LeadsContext';
import Loading from '@/components/shared/Loading';

const IntegrationsContent = () => {
    const { campaigns, leads, fetchLeads } = useLeads();
    const [loading, setLoading] = useState(false);
    const [integrations, setIntegrations] = useState({
        meta: {
            connected: false,
            accessToken: '',
            adAccountId: '',
            autoSync: false
        },
        google: {
            connected: false,
            accessToken: '',
            customerId: '',
            autoSync: false
        },
        sheets: {
            connected: false,
            spreadsheetId: '',
            sheetName: 'Sheet1',
            autoSync: false,
            syncInterval: 15
        }
    });

    useEffect(() => {
        // Load saved integration settings
        const savedIntegrations = localStorage.getItem('leadIntegrations');
        if (savedIntegrations) {
            try {
                setIntegrations(JSON.parse(savedIntegrations));
            } catch (error) {
                console.error('Failed to load integration settings:', error);
            }
        }
    }, []);

    const saveIntegrations = (updatedIntegrations) => {
        localStorage.setItem('leadIntegrations', JSON.stringify(updatedIntegrations));
        setIntegrations(updatedIntegrations);
    };

    const handleMetaConnect = async () => {
        setLoading(true);
        try {
            const connected = await metaLeadIntegration.testConnection(integrations.meta.accessToken);
            if (connected) {
                saveIntegrations({
                    ...integrations,
                    meta: { ...integrations.meta, connected: true }
                });
                toast.success('Meta (Facebook) connected successfully!');
            } else {
                console.log('Failed to connect to Meta. Please check your access token.');
                // toast.error('Failed to connect to Meta. Please check your access token.');
            }
        } catch (error) {
            // toast.error(`Connection failed: ${error.message}`);
            console.log(`Connection failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleConnect = async () => {
        setLoading(true);
        try {
            const connected = await googleLeadIntegration.testConnection(integrations.google.accessToken);
            if (connected) {
                saveIntegrations({
                    ...integrations,
                    google: { ...integrations.google, connected: true }
                });
                toast.success('Google Ads connected successfully!');
            } else {
                console.log('Failed to connect to Google. Please check your access token.');
                // toast.error('Failed to connect to Google. Please check your access token.');
            }
        } catch (error) {
            console.log(`Connection failed: ${error.message}`);
            // toast.error(`Connection failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSheetsLogin = useGoogleLogin({
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly',
        onSuccess: async (tokenResponse) => {
            if (!integrations.sheets.spreadsheetId) {
                console.log('Please enter a Google Sheets spreadsheet ID first');
                // toast.error('Please enter a Google Sheets spreadsheet ID first');
                return;
            }

            setLoading(true);
            try {
                const result = await googleSheetsIntegration.connect(
                    tokenResponse.access_token,
                    integrations.sheets.spreadsheetId,
                    integrations.sheets.sheetName || 'Sheet1'
                );
                
                saveIntegrations({
                    ...integrations,
                    sheets: {
                        ...integrations.sheets,
                        connected: true,
                        accessToken: tokenResponse.access_token
                    }
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
            console.log('Google authentication failed');
            // toast.error('Google authentication failed');
        }
    });

    const handleSheetsConnect = () => {
        if (!integrations.sheets.spreadsheetId) {
            console.log('Please enter a Google Sheets spreadsheet ID first');
            // toast.error('Please enter a Google Sheets spreadsheet ID first');
            return;
        }
        handleGoogleSheetsLogin();
    };

    const handleMetaSync = async () => {
        if (!integrations.meta.connected) {
            console.log('Please connect to Meta first');
            // toast.error('Please connect to Meta first');
            return;
        }

        setLoading(true);
        try {
            const metaLeads = await metaLeadIntegration.fetchLeads(
                integrations.meta.accessToken,
                integrations.meta.adAccountId
            );
            
            if (metaLeads.length === 0) {
                toast.info('No new leads found from Meta');
                return;
            }

            // Show campaign selection modal or use default
            const defaultCampaign = campaigns[0];
            if (!defaultCampaign) {
                console.log('Please create a campaign first');
                // toast.error('Please create a campaign first');
                return;
            }

            await metaLeadIntegration.syncLeads(metaLeads, defaultCampaign.id);
            await fetchLeads();
            toast.success(`Synced ${metaLeads.length} leads from Meta!`);
        } catch (error) {
            console.log(`Sync failed: ${error.message}`);
            // toast.error(`Sync failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSync = async () => {
        if (!integrations.google.connected) {
            console.log('Please connect to Google first');
            // toast.error('Please connect to Google first');
            return;
        }

        setLoading(true);
        try {
            const googleLeads = await googleLeadIntegration.fetchLeads(
                integrations.google.accessToken,
                integrations.google.customerId
            );
            
            if (googleLeads.length === 0) {
                toast.info('No new leads found from Google');
                return;
            }

            const defaultCampaign = campaigns[0];
            if (!defaultCampaign) {
                console.log('Please create a campaign first');
                // toast.error('Please create a campaign first');
                return;
            }

            await googleLeadIntegration.syncLeads(googleLeads, defaultCampaign.id);
            await fetchLeads();
            toast.success(`Synced ${googleLeads.length} leads from Google!`);
        } catch (error) {
            console.log(`Sync failed: ${error.message}`);
            // toast.error(`Sync failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSheetsSync = async () => {
        if (!integrations.sheets.connected) {
            console.log('Please connect to Google Sheets first');
            // toast.error('Please connect to Google Sheets first');
            return;
        }

        if (!integrations.sheets.accessToken) {
            console.log('Please reconnect to Google Sheets');
            // toast.error('Please reconnect to Google Sheets');
            handleGoogleSheetsLogin();
            return;
        }

        setLoading(true);
        try {
            await googleSheetsIntegration.syncToSheets(
                leads,
                integrations.sheets.spreadsheetId,
                integrations.sheets.sheetName || 'Sheet1'
            );
            toast.success('Leads synced to Google Sheets successfully!');
        } catch (error) {
            console.log(`Sync failed: ${error.message}`);
            // toast.error(`Sync failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSheetsFetch = async () => {
        if (!integrations.sheets.connected) {
            console.log('Please connect to Google Sheets first');
            // toast.error('Please connect to Google Sheets first');
            return;
        }

        setLoading(true);
        try {
            const fetchedLeads = await googleSheetsIntegration.fetchFromSheets(
                integrations.sheets.spreadsheetId,
                integrations.sheets.sheetName || 'Sheet1'
            );
            toast.success(`Fetched ${fetchedLeads.length} leads from Google Sheets!`);
            // Optionally show a modal to import these leads
        } catch (error) {
            console.log(`Fetch failed: ${error.message}`);
            // toast.error(`Fetch failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSheetsAutoSync = async (enable) => {
        setLoading(true);
        try {
            if (enable) {
                await googleSheetsIntegration.enableAutoSync(
                    integrations.sheets.spreadsheetId,
                    integrations.sheets.sheetName,
                    integrations.sheets.syncInterval
                );
                saveIntegrations({
                    ...integrations,
                    sheets: { ...integrations.sheets, autoSync: true }
                });
                toast.success('Auto-sync enabled for Google Sheets!');
            } else {
                await googleSheetsIntegration.disableAutoSync();
                saveIntegrations({
                    ...integrations,
                    sheets: { ...integrations.sheets, autoSync: false }
                });
                toast.success('Auto-sync disabled for Google Sheets!');
            }
        } catch (error) {
            console.log(`Failed to ${enable ? 'enable' : 'disable'} auto-sync: ${error.message}`);
            // toast.error(`Failed to ${enable ? 'enable' : 'disable'} auto-sync: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const IntegrationCard = ({ title, icon, connected, children, onConnect, onDisconnect, onSync, onFetch }) => {
        return (
            <div className="col-lg-4 mb-4">
                <div className="card">
                    <div className="card-body">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="d-flex align-items-center gap-2">
                                {icon}
                                <h5 className="mb-0">{title}</h5>
                            </div>
                            <span className={`badge ${connected ? 'bg-success' : 'bg-secondary'}`}>
                                {connected ? (
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
                        {children}
                        <div className="d-flex gap-2 mt-3 flex-wrap">
                            {connected ? (
                                <>
                                    {onSync && (
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={onSync}
                                            disabled={loading}
                                        >
                                            <FiRefreshCw className="me-1" />
                                            Sync Now
                                        </button>
                                    )}
                                    {onFetch && (
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={onFetch}
                                            disabled={loading}
                                        >
                                            <FiDownload className="me-1" />
                                            Fetch from Sheets
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={onDisconnect}
                                        disabled={loading}
                                    >
                                        <FiX className="me-1" />
                                        Disconnect
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={onConnect}
                                    disabled={loading}
                                >
                                    <FiLink className="me-1" />
                                    Connect
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <Loading />;

    return (
        <div className="col-lg-12">
            <div className="card">
                <div className="card-header">
                    <h5 className="card-title mb-0">Lead Integrations</h5>
                    <p className="text-muted mb-0">Connect with Meta, Google Ads, and Google Sheets to automatically sync leads</p>
                </div>
                <div className="card-body">
                    <div className="row">
                        <IntegrationCard
                            title="Meta (Facebook) Leads"
                            icon={<FaFacebook size={24} className="text-primary" />}
                            connected={integrations.meta.connected}
                            onConnect={handleMetaConnect}
                            onDisconnect={() => {
                                saveIntegrations({
                                    ...integrations,
                                    meta: { ...integrations.meta, connected: false }
                                });
                                toast.success('Disconnected from Meta');
                            }}
                            onSync={handleMetaSync}
                        >
                            <div className="mb-2">
                                <label className="form-label small">Access Token</label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Enter Meta access token"
                                    value={integrations.meta.accessToken}
                                    onChange={(e) => {
                                        saveIntegrations({
                                            ...integrations,
                                            meta: { ...integrations.meta, accessToken: e.target.value }
                                        });
                                    }}
                                />
                            </div>
                            <div className="mb-2">
                                <label className="form-label small">Ad Account ID</label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Enter Ad Account ID"
                                    value={integrations.meta.adAccountId}
                                    onChange={(e) => {
                                        saveIntegrations({
                                            ...integrations,
                                            meta: { ...integrations.meta, adAccountId: e.target.value }
                                        });
                                    }}
                                />
                            </div>
                        </IntegrationCard>

                        <IntegrationCard
                            title="Google Ads Leads"
                            icon={<FaGoogle size={24} className="text-danger" />}
                            connected={integrations.google.connected}
                            onConnect={handleGoogleConnect}
                            onDisconnect={() => {
                                saveIntegrations({
                                    ...integrations,
                                    google: { ...integrations.google, connected: false }
                                });
                                toast.success('Disconnected from Google');
                            }}
                            onSync={handleGoogleSync}
                        >
                            <div className="mb-2">
                                <label className="form-label small">Access Token</label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Enter Google access token"
                                    value={integrations.google.accessToken}
                                    onChange={(e) => {
                                        saveIntegrations({
                                            ...integrations,
                                            google: { ...integrations.google, accessToken: e.target.value }
                                        });
                                    }}
                                />
                            </div>
                            <div className="mb-2">
                                <label className="form-label small">Customer ID</label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Enter Google Ads Customer ID"
                                    value={integrations.google.customerId}
                                    onChange={(e) => {
                                        saveIntegrations({
                                            ...integrations,
                                            google: { ...integrations.google, customerId: e.target.value }
                                        });
                                    }}
                                />
                            </div>
                        </IntegrationCard>

                        <IntegrationCard
                            title="Google Sheets"
                            icon={<SiGooglesheets size={24} className="text-success" />}
                            connected={integrations.sheets.connected}
                            onConnect={handleSheetsConnect}
                            onDisconnect={() => {
                                saveIntegrations({
                                    ...integrations,
                                    sheets: { ...integrations.sheets, connected: false, autoSync: false }
                                });
                                toast.success('Disconnected from Google Sheets');
                            }}
                            onSync={handleSheetsSync}
                            onFetch={handleSheetsFetch}
                        >
                            <div className="mb-2">
                                <label className="form-label small">Spreadsheet ID</label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Enter Google Sheets ID"
                                    value={integrations.sheets.spreadsheetId}
                                    onChange={(e) => {
                                        saveIntegrations({
                                            ...integrations,
                                            sheets: { ...integrations.sheets, spreadsheetId: e.target.value }
                                        });
                                    }}
                                />
                                <small className="text-muted">Found in the Google Sheets URL</small>
                            </div>
                            <div className="mb-2">
                                <label className="form-label small">Sheet Name</label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Sheet1"
                                    value={integrations.sheets.sheetName}
                                    onChange={(e) => {
                                        saveIntegrations({
                                            ...integrations,
                                            sheets: { ...integrations.sheets, sheetName: e.target.value }
                                        });
                                    }}
                                />
                            </div>
                            <div className="mb-2">
                                <label className="form-label small">Auto-Sync Interval (minutes)</label>
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    min="5"
                                    value={integrations.sheets.syncInterval}
                                    onChange={(e) => {
                                        saveIntegrations({
                                            ...integrations,
                                            sheets: { ...integrations.sheets, syncInterval: parseInt(e.target.value) || 15 }
                                        });
                                    }}
                                />
                            </div>
                            {integrations.sheets.connected && (
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={integrations.sheets.autoSync}
                                        onChange={(e) => handleSheetsAutoSync(e.target.checked)}
                                    />
                                    <label className="form-check-label small">
                                        Enable Auto-Sync
                                    </label>
                                </div>
                            )}
                        </IntegrationCard>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntegrationsContent;

