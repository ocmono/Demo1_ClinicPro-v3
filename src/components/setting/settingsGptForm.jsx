import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FiSave, 
  FiRefreshCw, 
  FiSettings, 
  FiKey, 
  FiZap, 
  FiMessageSquare, 
  FiMail, 
  FiSmartphone,
  FiActivity,
  FiDollarSign,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiCpu,
  FiGlobe,
  FiShield,
  FiBarChart2,
  FiClock,
  FiEdit3,
  FiHelpCircle,
  FiChevronDown,
  FiChevronUp,
  FiExternalLink,
  FiBook,
  FiPlay,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertTriangle,
  FiTarget,
  FiCode,
  FiCopy,
  FiDownload,
  FiUpload,
  FiFilter,
  FiSearch
} from 'react-icons/fi';
import Footer from '@/components/shared/Footer';
import PageHeaderSetting from '@/components/shared/pageHeader/PageHeaderSetting';
import InputTopLabel from '@/components/shared/InputTopLabel';
import TextAreaTopLabel from '@/components/shared/TextAreaTopLabel';
import SelectDropdown from '@/components/shared/SelectDropdown';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { gptApi } from '@/utils/gptApi';

// AI Providers
const AI_PROVIDERS = [
  { value: 'openai', label: 'OpenAI (GPT)', icon: '🤖', description: 'Most popular, best for general use' },
  { value: 'google', label: 'Google (Gemini)', icon: '🔷', description: 'Great for multimodal tasks' },
  { value: 'anthropic', label: 'Anthropic (Claude)', icon: '🧠', description: 'Best for long context and safety' },
  { value: 'cohere', label: 'Cohere', icon: '⚡', description: 'Fast and cost-effective' },
  { value: 'azure', label: 'Azure OpenAI', icon: '☁️', description: 'Enterprise-grade with compliance' },
];

// OpenAI Models
const OPENAI_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o (Latest)' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Recommended)' },
  { value: 'gpt-3.5-turbo-16k', label: 'GPT-3.5 Turbo 16k' },
];

// Google Gemini Models
const GOOGLE_MODELS = [
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Latest)' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Fast)' },
  { value: 'gemini-pro', label: 'Gemini Pro' },
  { value: 'gemini-pro-vision', label: 'Gemini Pro Vision (Multimodal)' },
];

// Anthropic Claude Models
const ANTHROPIC_MODELS = [
  { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Latest)' },
  { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
  { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
  { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (Fast)' },
];

// Cohere Models
const COHERE_MODELS = [
  { value: 'command-r-plus', label: 'Command R+ (Latest)' },
  { value: 'command-r', label: 'Command R' },
  { value: 'command', label: 'Command' },
  { value: 'command-light', label: 'Command Light (Fast)' },
];

// Azure OpenAI Models (same as OpenAI)
const AZURE_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o (Latest)' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
];

const getModelsForProvider = (provider) => {
  switch (provider) {
    case 'openai':
      return OPENAI_MODELS;
    case 'google':
      return GOOGLE_MODELS;
    case 'anthropic':
      return ANTHROPIC_MODELS;
    case 'cohere':
      return COHERE_MODELS;
    case 'azure':
      return AZURE_MODELS;
    default:
      return OPENAI_MODELS;
  }
};

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'empathetic', label: 'Empathetic' },
];

const SettingsGptForm = () => {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [activeTab, setActiveTab] = useState('configuration');
  const [testPrompt, setTestPrompt] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [testingPrompt, setTestingPrompt] = useState(false);
  const [costEstimate, setCostEstimate] = useState({ tokens: 0, cost: 0 });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  // Configuration State
  const [config, setConfig] = useState({
    provider: 'openai', // AI provider: openai, google, anthropic, cohere, azure
    api_key: '',
    api_endpoint: '', // For Azure OpenAI
    api_version: '', // For Azure OpenAI
    deployment_name: '', // For Azure OpenAI
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    system_prompt: 'You are a helpful medical assistant for a clinic management system. Provide clear, professional, and empathetic responses.',
    enabled: false,
  });

  // Provider-specific configurations
  const [providerConfigs, setProviderConfigs] = useState({
    openai: {
      api_key: '',
      model: 'gpt-3.5-turbo',
    },
    google: {
      api_key: '',
      model: 'gemini-1.5-flash',
    },
    anthropic: {
      api_key: '',
      model: 'claude-3-haiku-20240307',
    },
    cohere: {
      api_key: '',
      model: 'command',
    },
    azure: {
      api_key: '',
      api_endpoint: '',
      api_version: '2024-02-15-preview',
      deployment_name: '',
      model: 'gpt-3.5-turbo',
    },
  });

  // Features State
  const [features, setFeatures] = useState({
    auto_generate_messages: false,
    auto_generate_emails: false,
    auto_generate_summaries: false,
    smart_suggestions: false,
    content_enhancement: false,
    translation: false,
    appointment_reminders: false,
    prescription_summaries: false,
    report_summaries: false,
    medical_notes: false,
  });

  // Integrations State
  const [integrations, setIntegrations] = useState({
    whatsapp_enabled: false,
    email_enabled: false,
    sms_enabled: false,
    appointments_enabled: false,
    prescriptions_enabled: false,
    reports_enabled: false,
  });

  // Usage Stats
  const [usageStats, setUsageStats] = useState({
    total_requests: 0,
    total_tokens: 0,
    total_cost: 0,
    requests_today: 0,
    tokens_today: 0,
    cost_today: 0,
  });

  const [connectionStatus, setConnectionStatus] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showHelp, setShowHelp] = useState({
    apiKey: false,
    model: false,
    parameters: false,
    features: false,
    integrations: false,
    usage: false,
  });

  useEffect(() => {
    fetchConfig();
    fetchFeatures();
    fetchIntegrations();
    fetchUsageStats();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await gptApi.getConfig();
      if (data) {
        setConfig(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeatures = async () => {
    try {
      const data = await gptApi.getFeatures();
      if (data) {
        setFeatures(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Failed to fetch features:', error);
    }
  };

  const fetchIntegrations = async () => {
    try {
      const data = await gptApi.getIntegrations();
      if (data) {
        setIntegrations(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
    }
  };

  const fetchUsageStats = async () => {
    try {
      const usage = await gptApi.getUsage();
      const costs = await gptApi.getCosts();
      if (usage && costs) {
        setUsageStats({
          total_requests: usage.total_requests || 0,
          total_tokens: usage.total_tokens || 0,
          total_cost: costs.total_cost || 0,
          requests_today: usage.requests_today || 0,
          tokens_today: usage.tokens_today || 0,
          cost_today: costs.cost_today || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
    }
  };

  const handleConfigChange = (key, value) => {
    setConfig(prev => {
      const updated = { ...prev, [key]: value };
      
      // Save provider-specific config when switching providers or updating settings
      if (key === 'provider' || key === 'api_key' || key === 'model' || key === 'api_endpoint' || key === 'api_version' || key === 'deployment_name') {
        setProviderConfigs(prevConfigs => ({
          ...prevConfigs,
          [updated.provider]: {
            ...prevConfigs[updated.provider],
            api_key: updated.api_key,
            model: updated.model,
            ...(updated.provider === 'azure' && {
              api_endpoint: updated.api_endpoint,
              api_version: updated.api_version,
              deployment_name: updated.deployment_name,
            }),
          },
        }));
      }
      
      return updated;
    });
  };

  const handleFeatureToggle = (key) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleIntegrationToggle = (key) => {
    setIntegrations(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setConnectionStatus(null);
    try {
      const result = await gptApi.testConnection(config.api_key || null);
      if (result.connected) {
        setConnectionStatus('success');
        toast.success('GPT connection successful!');
      } else {
        setConnectionStatus('error');
        console.log('GPT connection failed. Please check your API key.');
        // toast.error('GPT connection failed. Please check your API key.');
      }
    } catch (error) {
      setConnectionStatus('error');
      console.log('Failed to test connection. Please check your API key.');
      // toast.error('Failed to test connection. Please check your API key.');
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setLoading(true);
      await gptApi.updateConfig(config);
      toast.success('GPT configuration saved successfully!');
    } catch (error) {
      console.log('Failed to save configuration');
      // toast.error('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFeatures = async () => {
    try {
      setLoading(true);
      await gptApi.updateFeatures(features);
      toast.success('Feature settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save feature settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIntegrations = async () => {
    try {
      setLoading(true);
      await gptApi.updateIntegrations(integrations);
      toast.success('Integration settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save integration settings');
    } finally {
      setLoading(false);
    }
  };

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="d-flex justify-content-between align-items-center py-3 border-bottom">
      <div className="flex-grow-1">
        <label className="form-label fw-semibold mb-1">{label}</label>
        {description && <small className="text-muted d-block">{description}</small>}
      </div>
      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          checked={checked}
          onChange={onChange}
        />
      </div>
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, subValue, color = 'primary' }) => (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className={`text-${color} me-3`}>
            <Icon size={24} />
          </div>
          <div className="flex-grow-1">
            <div className="text-muted small mb-1">{label}</div>
            <div className="h5 mb-0 fw-bold">{value}</div>
            {subValue && <div className="text-muted small mt-1">{subValue}</div>}
          </div>
        </div>
      </div>
    </div>
  );

  const HelpSection = ({ id, title, children }) => {
    const isOpen = showHelp[id];
    return (
      <div className="card mb-3">
        <div 
          className="card-header bg-light"
          onClick={() => setShowHelp(prev => ({ ...prev, [id]: !prev[id] }))}
          style={{ cursor: 'pointer' }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <FiHelpCircle className="me-2 text-primary" />
              <h6 className="mb-0 fw-semibold">{title}</h6>
            </div>
            {isOpen ? <FiChevronUp /> : <FiChevronDown />}
          </div>
        </div>
        {isOpen && (
          <div className="card-body">
            {children}
          </div>
        )}
      </div>
    );
  };

  const InfoBox = ({ icon: Icon = FiInfo, title, children, type = 'info' }) => {
    const alertClass = type === 'warning' ? 'alert-warning' : 
                      type === 'success' ? 'alert-success' : 
                      'alert-info';
    
    return (
      <div className={`alert ${alertClass} mb-3`}>
        <div className="d-flex align-items-start">
          <Icon className="me-2 mt-1" size={20} />
          <div className="flex-grow-1">
            {title && <h6 className="fw-semibold mb-2">{title}</h6>}
            <div className="small">{children}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="content-area setting-form">
      <PerfectScrollbar>
        <PageHeaderSetting />
        <div className="content-area-body">
          {/* Tabs */}
          <div className="card mb-4">
            <div className="card-body">
              <ul className="nav nav-tabs nav-tabs-bordered" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'configuration' ? 'active' : ''}`}
                    onClick={() => setActiveTab('configuration')}
                  >
                    <FiSettings className="me-2" />
                    Configuration
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'features' ? 'active' : ''}`}
                    onClick={() => setActiveTab('features')}
                  >
                    <FiZap className="me-2" />
                    Features
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'integrations' ? 'active' : ''}`}
                    onClick={() => setActiveTab('integrations')}
                  >
                    <FiMessageSquare className="me-2" />
                    Integrations
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'usage' ? 'active' : ''}`}
                    onClick={() => setActiveTab('usage')}
                  >
                    <FiBarChart2 className="me-2" />
                    Usage & Costs
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Configuration Tab */}
          {activeTab === 'configuration' && (
            <>
              {/* Help Section */}
              <HelpSection id="apiKey" title="How to Get Your AI Provider API Key">
                <div className="mb-3">
                  <h6 className="fw-semibold mb-2">Select Your Provider:</h6>
                  
                  {/* OpenAI */}
                  <div className="mb-3 p-3 border rounded">
                    <h6 className="fw-semibold mb-2">🤖 OpenAI (GPT)</h6>
                    <ol className="mb-0">
                      <li className="mb-2">
                        Visit{' '}
                        <a href="https://platform.openai.com/signup" target="_blank" rel="noopener noreferrer" className="text-primary">
                          platform.openai.com/signup <FiExternalLink size={14} className="ms-1" />
                        </a>
                        {' '}and create an account
                      </li>
                      <li className="mb-2">Add payment method in Billing → Payment methods</li>
                      <li className="mb-2">
                        Go to{' '}
                        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary">
                          API Keys <FiExternalLink size={14} className="ms-1" />
                        </a>
                        {' '}and create a new secret key
                      </li>
                      <li className="mb-0">Set usage limits in Billing → Limits</li>
                    </ol>
                  </div>

                  {/* Google */}
                  <div className="mb-3 p-3 border rounded">
                    <h6 className="fw-semibold mb-2">🔷 Google (Gemini)</h6>
                    <ol className="mb-0">
                      <li className="mb-2">
                        Visit{' '}
                        <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary">
                          Google AI Studio <FiExternalLink size={14} className="ms-1" />
                        </a>
                      </li>
                      <li className="mb-2">Sign in with your Google account</li>
                      <li className="mb-2">Click "Get API Key" and create a new key</li>
                      <li className="mb-0">Copy and paste the API key above</li>
                    </ol>
                  </div>

                  {/* Anthropic */}
                  <div className="mb-3 p-3 border rounded">
                    <h6 className="fw-semibold mb-2">🧠 Anthropic (Claude)</h6>
                    <ol className="mb-0">
                      <li className="mb-2">
                        Visit{' '}
                        <a href="https://console.anthropic.com/signup" target="_blank" rel="noopener noreferrer" className="text-primary">
                          Anthropic Console <FiExternalLink size={14} className="ms-1" />
                        </a>
                        {' '}and sign up
                      </li>
                      <li className="mb-2">Add payment method</li>
                      <li className="mb-2">
                        Go to Settings → API Keys and create a new key
                      </li>
                      <li className="mb-0">Copy and paste the API key above</li>
                    </ol>
                  </div>

                  {/* Cohere */}
                  <div className="mb-3 p-3 border rounded">
                    <h6 className="fw-semibold mb-2">⚡ Cohere</h6>
                    <ol className="mb-0">
                      <li className="mb-2">
                        Visit{' '}
                        <a href="https://dashboard.cohere.com/signup" target="_blank" rel="noopener noreferrer" className="text-primary">
                          Cohere Dashboard <FiExternalLink size={14} className="ms-1" />
                        </a>
                        {' '}and create an account
                      </li>
                      <li className="mb-2">Go to API Keys section</li>
                      <li className="mb-2">Create a new API key</li>
                      <li className="mb-0">Copy and paste the API key above</li>
                    </ol>
                  </div>

                  {/* Azure */}
                  <div className="mb-3 p-3 border rounded">
                    <h6 className="fw-semibold mb-2">☁️ Azure OpenAI</h6>
                    <ol className="mb-0">
                      <li className="mb-2">
                        Requires Azure subscription and OpenAI Service deployment
                      </li>
                      <li className="mb-2">
                        Visit{' '}
                        <a href="https://portal.azure.com" target="_blank" rel="noopener noreferrer" className="text-primary">
                          Azure Portal <FiExternalLink size={14} className="ms-1" />
                        </a>
                      </li>
                      <li className="mb-2">Create Azure OpenAI resource</li>
                      <li className="mb-2">Deploy a model (e.g., GPT-3.5-turbo)</li>
                      <li className="mb-2">Get API key and endpoint from Keys & Endpoint section</li>
                      <li className="mb-0">Enter API key, endpoint, and deployment name above</li>
                    </ol>
                  </div>
                  
                  <InfoBox type="warning" title="Security Best Practices">
                    <ul className="mb-0">
                      <li>Never share your API key publicly or commit it to version control</li>
                      <li>Rotate your API keys regularly for security</li>
                      <li>Use separate API keys for different environments (development/production)</li>
                      <li>Monitor your usage regularly to avoid unexpected charges</li>
                    </ul>
                  </InfoBox>

                  <InfoBox type="info" title="Pricing Information">
                    <p className="mb-2">OpenAI charges based on token usage:</p>
                    <ul className="mb-0">
                      <li><strong>GPT-3.5 Turbo:</strong> ~$0.0015 per 1K tokens (input), ~$0.002 per 1K tokens (output)</li>
                      <li><strong>GPT-4:</strong> ~$0.03 per 1K tokens (input), ~$0.06 per 1K tokens (output)</li>
                      <li><strong>GPT-4 Turbo:</strong> ~$0.01 per 1K tokens (input), ~$0.03 per 1K tokens (output)</li>
                    </ul>
                    <p className="mt-2 mb-0">
                      <strong>Tip:</strong> Start with GPT-3.5 Turbo for most tasks to keep costs low. 
                      Use GPT-4 only when you need higher quality responses.
                    </p>
                  </InfoBox>
                </div>
              </HelpSection>

              <div className="card mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0 fw-bold">
                    <FiSettings className="me-2" />
                    GPT Configuration
                  </h5>
                </div>
                <div className="card-body">
                {/* AI Provider Selection */}
                <div className="mb-4">
                  <label className="form-label fw-semibold mb-2">
                    <FiCpu className="me-2" />
                    Select AI Provider
                  </label>
                  <div className="row g-3">
                    {AI_PROVIDERS.map((provider) => (
                      <div key={provider.value} className="col-md-6 col-lg-4">
                        <div
                          className={`card border h-100 ${
                            config.provider === provider.value
                              ? 'border-primary'
                              : ''
                          }`}
                          onClick={() => {
                            const providerConfig = providerConfigs[provider.value];
                            const defaultModel = getModelsForProvider(provider.value)[0]?.value || '';
                            
                            setConfig(prev => ({
                              ...prev,
                              provider: provider.value,
                              api_key: providerConfig?.api_key || '',
                              model: providerConfig?.model || defaultModel,
                              api_endpoint: provider.value === 'azure' ? (providerConfig?.api_endpoint || '') : '',
                              api_version: provider.value === 'azure' ? (providerConfig?.api_version || '2024-02-15-preview') : '',
                              deployment_name: provider.value === 'azure' ? (providerConfig?.deployment_name || '') : '',
                            }));
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="card-body text-center">
                            <div className="fs-2 mb-2">{provider.icon}</div>
                            <h6 className="fw-semibold mb-1">{provider.label}</h6>
                            <small className="text-muted">{provider.description}</small>
                            {config.provider === provider.value && (
                              <div className="mt-2">
                                <span className="badge bg-primary">Active</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* API Key */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label fw-semibold mb-0">
                      <FiKey className="me-2" />
                      {config.provider === 'azure' ? 'Azure OpenAI API Key' :
                       config.provider === 'google' ? 'Google API Key' :
                       config.provider === 'anthropic' ? 'Anthropic API Key' :
                       config.provider === 'cohere' ? 'Cohere API Key' :
                       'OpenAI API Key'}
                    </label>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? 'Hide' : 'Show'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={handleTestConnection}
                        disabled={testing}
                      >
                        {testing ? (
                          <>
                            <FiRefreshCw className="me-1 spinner-border spinner-border-sm" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <FiCheckCircle className="me-1" />
                            Test Connection
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    className="form-control"
                    value={config.api_key}
                    onChange={(e) => handleConfigChange('api_key', e.target.value)}
                    placeholder="sk-..."
                  />
                  {connectionStatus === 'success' && (
                    <div className="alert alert-success mt-2 mb-0">
                      <FiCheckCircle className="me-2" />
                      Connection successful!
                    </div>
                  )}
                  {connectionStatus === 'error' && (
                    <div className="alert alert-danger mt-2 mb-0">
                      <FiXCircle className="me-2" />
                      Connection failed. Please check your API key.
                    </div>
                  )}
                  <div className="d-flex align-items-start mt-2">
                    <FiInfo className="text-info me-2 mt-1" size={16} />
                    <small className="text-muted">
                      {config.provider === 'openai' && (
                        <>Get your API key from{' '}
                          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary">
                            OpenAI Platform <FiExternalLink size={12} className="ms-1" />
                          </a>
                        </>
                      )}
                      {config.provider === 'google' && (
                        <>Get your API key from{' '}
                          <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary">
                            Google AI Studio <FiExternalLink size={12} className="ms-1" />
                          </a>
                        </>
                      )}
                      {config.provider === 'anthropic' && (
                        <>Get your API key from{' '}
                          <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-primary">
                            Anthropic Console <FiExternalLink size={12} className="ms-1" />
                          </a>
                        </>
                      )}
                      {config.provider === 'cohere' && (
                        <>Get your API key from{' '}
                          <a href="https://dashboard.cohere.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary">
                            Cohere Dashboard <FiExternalLink size={12} className="ms-1" />
                          </a>
                        </>
                      )}
                      {config.provider === 'azure' && (
                        <>Get your API key from{' '}
                          <a href="https://portal.azure.com" target="_blank" rel="noopener noreferrer" className="text-primary">
                            Azure Portal <FiExternalLink size={12} className="ms-1" />
                          </a>
                          {' '}(Requires Azure OpenAI Service deployment)
                        </>
                      )}
                      . Click "How to Get Your OpenAI API Key" above for detailed instructions.
                    </small>
                  </div>
                </div>

                {/* Azure OpenAI Specific Fields */}
                {config.provider === 'azure' && (
                  <>
                    <div className="mb-4">
                      <InputTopLabel
                        label="Azure OpenAI Endpoint"
                        type="text"
                        value={config.api_endpoint}
                        onChange={(e) => handleConfigChange('api_endpoint', e.target.value)}
                        placeholder="https://your-resource.openai.azure.com"
                      />
                      <small className="text-muted">
                        Your Azure OpenAI resource endpoint URL
                      </small>
                    </div>
                    <div className="mb-4">
                      <InputTopLabel
                        label="API Version"
                        type="text"
                        value={config.api_version}
                        onChange={(e) => handleConfigChange('api_version', e.target.value)}
                        placeholder="2024-02-15-preview"
                      />
                      <small className="text-muted">
                        Azure OpenAI API version (e.g., 2024-02-15-preview)
                      </small>
                    </div>
                    <div className="mb-4">
                      <InputTopLabel
                        label="Deployment Name"
                        type="text"
                        value={config.deployment_name || ''}
                        onChange={(e) => handleConfigChange('deployment_name', e.target.value)}
                        placeholder="gpt-35-turbo"
                      />
                      <small className="text-muted">
                        The deployment name of your model in Azure
                      </small>
                    </div>
                  </>
                )}

                {/* Enable/Disable */}
                <div className="mb-4">
                  <ToggleSwitch
                    checked={config.enabled}
                    onChange={() => handleConfigChange('enabled', !config.enabled)}
                    label="Enable GPT Integration"
                    description="Turn on GPT features across the system"
                  />
                </div>

                {/* Model Selection */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label fw-semibold mb-0">
                      <FiCpu className="me-2" />
                      Model Selection
                    </label>
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-primary p-0"
                      onClick={() => setShowHelp(prev => ({ ...prev, model: !prev.model }))}
                    >
                      <FiHelpCircle className="me-1" size={14} />
                      Help
                    </button>
                  </div>
                  <SelectDropdown
                    options={getModelsForProvider(config.provider)}
                    defaultSelect={config.model}
                    selectedOption={config.model}
                    onSelectOption={(option) => handleConfigChange('model', option.value)}
                  />
                  {showHelp.model && (
                    <InfoBox type="info" title="Which Model Should I Choose?">
                      {config.provider === 'openai' && (
                        <>
                          <div className="mb-2">
                            <strong>GPT-3.5 Turbo (Recommended):</strong>
                            <ul className="mb-2">
                              <li>Best balance of cost and performance</li>
                              <li>Fast response times</li>
                              <li>Ideal for: Messages, emails, summaries, general content</li>
                              <li>Cost: ~$0.0015-0.002 per 1K tokens</li>
                            </ul>
                          </div>
                          <div className="mb-2">
                            <strong>GPT-4 / GPT-4 Turbo:</strong>
                            <ul className="mb-2">
                              <li>Higher quality and more accurate responses</li>
                              <li>Better at complex reasoning and medical terminology</li>
                              <li>Ideal for: Medical notes, complex reports, critical communications</li>
                              <li>Cost: ~$0.01-0.06 per 1K tokens (more expensive)</li>
                            </ul>
                          </div>
                        </>
                      )}
                      {config.provider === 'google' && (
                        <>
                          <div className="mb-2">
                            <strong>Gemini 1.5 Flash (Recommended):</strong>
                            <ul className="mb-2">
                              <li>Fast and cost-effective</li>
                              <li>Great for general tasks</li>
                              <li>Supports multimodal (text, images)</li>
                            </ul>
                          </div>
                          <div className="mb-2">
                            <strong>Gemini 1.5 Pro:</strong>
                            <ul className="mb-2">
                              <li>Higher quality responses</li>
                              <li>Long context window (up to 1M tokens)</li>
                              <li>Best for complex medical documentation</li>
                            </ul>
                          </div>
                        </>
                      )}
                      {config.provider === 'anthropic' && (
                        <>
                          <div className="mb-2">
                            <strong>Claude 3 Haiku (Recommended):</strong>
                            <ul className="mb-2">
                              <li>Fastest and most cost-effective</li>
                              <li>Great for simple tasks</li>
                              <li>Fast response times</li>
                            </ul>
                          </div>
                          <div className="mb-2">
                            <strong>Claude 3.5 Sonnet:</strong>
                            <ul className="mb-2">
                              <li>Best balance of speed and quality</li>
                              <li>Excellent for medical content</li>
                              <li>Long context window</li>
                            </ul>
                          </div>
                          <div className="mb-2">
                            <strong>Claude 3 Opus:</strong>
                            <ul className="mb-2">
                              <li>Highest quality</li>
                              <li>Best for complex reasoning</li>
                              <li>Most expensive option</li>
                            </ul>
                          </div>
                        </>
                      )}
                      {config.provider === 'cohere' && (
                        <>
                          <div className="mb-2">
                            <strong>Command (Recommended):</strong>
                            <ul className="mb-2">
                              <li>Balanced performance and cost</li>
                              <li>Good for general tasks</li>
                            </ul>
                          </div>
                          <div className="mb-2">
                            <strong>Command R+:</strong>
                            <ul className="mb-2">
                              <li>Latest and most capable</li>
                              <li>Best for complex tasks</li>
                            </ul>
                          </div>
                        </>
                      )}
                      {config.provider === 'azure' && (
                        <>
                          <div className="mb-2">
                            <strong>Azure OpenAI Models:</strong>
                            <ul className="mb-2">
                              <li>Same models as OpenAI but hosted on Azure</li>
                              <li>Enterprise-grade security and compliance</li>
                              <li>Better for organizations with Azure infrastructure</li>
                              <li>Requires Azure OpenAI Service deployment</li>
                            </ul>
                          </div>
                        </>
                      )}
                      <p className="mb-0 mt-2">
                        <strong>Tip:</strong> Start with the recommended model for your provider and upgrade only when needed.
                      </p>
                    </InfoBox>
                  )}
                  <small className="text-muted">
                    Choose the GPT model. GPT-3.5 Turbo is recommended for most use cases.
                  </small>
                </div>

                {/* Advanced Settings */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-semibold mb-0">
                      <FiSettings className="me-2" />
                      Advanced Parameters
                    </h6>
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-primary p-0"
                      onClick={() => setShowHelp(prev => ({ ...prev, parameters: !prev.parameters }))}
                    >
                      <FiHelpCircle className="me-1" size={14} />
                      Help
                    </button>
                  </div>
                  
                  {showHelp.parameters && (
                    <InfoBox type="info" title="Understanding Advanced Parameters">
                      <p className="mb-2">These parameters control how GPT generates responses:</p>
                      <ul className="mb-0">
                        <li><strong>Temperature (0-2):</strong> Controls randomness. Lower = more focused/consistent, Higher = more creative/varied. Default: 0.7</li>
                        <li><strong>Max Tokens:</strong> Maximum length of the response. Higher = longer responses but more cost. Default: 1000</li>
                        <li><strong>Top P (0-1):</strong> Nucleus sampling. Controls diversity. Default: 1 (use all tokens)</li>
                        <li><strong>Frequency Penalty (-2 to 2):</strong> Reduces repetition. Positive values discourage repeated phrases. Default: 0</li>
                        <li><strong>Presence Penalty (-2 to 2):</strong> Encourages new topics. Positive values encourage talking about new subjects. Default: 0</li>
                      </ul>
                      <p className="mt-2 mb-0">
                        <strong>Recommendation:</strong> Start with default values. Only adjust if you need specific behavior 
                        (e.g., lower temperature for consistent medical terminology, higher for creative patient communications).
                      </p>
                    </InfoBox>
                  )}
                  
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label mb-0">Temperature</label>
                        <span className="badge bg-info">{config.temperature}</span>
                      </div>
                      <input
                        type="range"
                        className="form-range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={config.temperature}
                        onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
                      />
                      <div className="d-flex justify-content-between">
                        <small className="text-muted">Focused (0)</small>
                        <small className="text-muted">Balanced (1)</small>
                        <small className="text-muted">Creative (2)</small>
                      </div>
                      <small className="text-muted d-block mt-1">
                        Controls randomness. Lower = more consistent, Higher = more varied. 
                        <strong> Recommended: 0.7</strong> for medical content.
                      </small>
                    </div>
                    <div className="col-md-6">
                      <InputTopLabel
                        label="Max Tokens"
                        type="number"
                        min="1"
                        max="4000"
                        value={config.max_tokens}
                        onChange={(e) => handleConfigChange('max_tokens', parseInt(e.target.value))}
                      />
                      <div className="progress mb-2" style={{ height: '8px' }}>
                        <div 
                          className="progress-bar" 
                          role="progressbar" 
                          style={{ width: `${(config.max_tokens / 4000) * 100}%` }}
                        ></div>
                      </div>
                      <small className="text-muted">
                        Maximum response length. 
                        <strong> Recommended:</strong> 200-500 for messages, 1000+ for reports.
                        <br />
                        <strong>Cost Impact:</strong> Higher tokens = higher costs. Use only what you need.
                      </small>
                    </div>
                    <div className="col-md-6">
                      <InputTopLabel
                        label="Top P"
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={config.top_p}
                        onChange={(e) => handleConfigChange('top_p', parseFloat(e.target.value))}
                      />
                      <small className="text-muted">
                        Nucleus sampling (0-1). Controls diversity of token selection. 
                        <strong> Default: 1</strong> (use all tokens). Lower values = more focused.
                      </small>
                    </div>
                    <div className="col-md-6">
                      <InputTopLabel
                        label="Frequency Penalty"
                        type="number"
                        min="-2"
                        max="2"
                        step="0.1"
                        value={config.frequency_penalty}
                        onChange={(e) => handleConfigChange('frequency_penalty', parseFloat(e.target.value))}
                      />
                      <small className="text-muted">
                        Reduces repetition (-2 to 2). Positive values discourage repeated phrases. 
                        <strong> Recommended: 0</strong> for most use cases. Use 0.5-1 for longer content.
                      </small>
                    </div>
                    <div className="col-md-6">
                      <InputTopLabel
                        label="Presence Penalty"
                        type="number"
                        min="-2"
                        max="2"
                        step="0.1"
                        value={config.presence_penalty}
                        onChange={(e) => handleConfigChange('presence_penalty', parseFloat(e.target.value))}
                      />
                      <small className="text-muted">
                        Encourages new topics (-2 to 2). Positive values encourage talking about new subjects. 
                        <strong> Recommended: 0</strong> for most use cases.
                      </small>
                    </div>
                  </div>
                </div>

                {/* System Prompt */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label fw-semibold mb-0">
                      <FiEdit3 className="me-2" />
                      System Prompt
                    </label>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => {
                          const examples = [
                            'You are a professional medical assistant for a clinic management system. Provide clear, accurate, and empathetic responses. Always maintain patient confidentiality and use appropriate medical terminology.',
                            'You are a helpful AI assistant specialized in healthcare communication. Generate professional, patient-friendly content that is accurate, clear, and compassionate.',
                            'You are an expert medical communication assistant. Create content that is medically accurate, easy to understand, and maintains a professional yet warm tone.',
                          ];
                          const randomExample = examples[Math.floor(Math.random() * examples.length)];
                          handleConfigChange('system_prompt', randomExample);
                          toast.info('Example prompt loaded!');
                        }}
                      >
                        <FiBook className="me-1" size={12} />
                        Load Example
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => {
                          navigator.clipboard.writeText(config.system_prompt);
                          toast.success('System prompt copied!');
                        }}
                      >
                        <FiCopy className="me-1" size={12} />
                        Copy
                      </button>
                    </div>
                  </div>
                  <TextAreaTopLabel
                    label=""
                    value={config.system_prompt}
                    onChange={(e) => handleConfigChange('system_prompt', e.target.value)}
                    rows={6}
                    placeholder="Enter system prompt..."
                  />
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <small className="text-muted">
                      {config.system_prompt.length} characters • ~{Math.ceil(config.system_prompt.length / 4)} tokens
                    </small>
                    <small className="text-muted">
                      Define the AI's behavior and role. This helps guide all GPT responses.
                    </small>
                  </div>
                  {showHelp.parameters && (
                    <InfoBox type="info" title="System Prompt Best Practices">
                      <p className="mb-2">The system prompt defines the AI's role and behavior. Good prompts include:</p>
                      <ul className="mb-2">
                        <li><strong>Role:</strong> "You are a helpful medical assistant..."</li>
                        <li><strong>Tone:</strong> "Provide clear, professional, and empathetic responses"</li>
                        <li><strong>Context:</strong> "for a clinic management system"</li>
                        <li><strong>Guidelines:</strong> "Always use medical terminology accurately"</li>
                        <li><strong>Constraints:</strong> "Never provide medical diagnoses, only assist with communication"</li>
                      </ul>
                      <div className="mt-2 p-2 bg-light rounded">
                        <strong>Example:</strong>
                        <p className="mb-0 small">
                          "You are a professional medical assistant for a clinic management system. 
                          Provide clear, accurate, and empathetic responses. Always maintain patient confidentiality, 
                          use appropriate medical terminology, and never provide medical diagnoses or treatment advice."
                        </p>
                      </div>
                    </InfoBox>
                  )}
                </div>

                <button
                  className="btn btn-primary"
                  onClick={handleSaveConfig}
                  disabled={loading}
                >
                  <FiSave className="me-2" />
                  {loading ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </div>
            </>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <>
              <HelpSection id="features" title="How to Use GPT Features">
                <div className="mb-3">
                  <h6 className="fw-semibold mb-2">Understanding GPT Features:</h6>
                  <p className="mb-3">
                    GPT features automate content generation across your clinic management system. 
                    Each feature can be enabled or disabled independently based on your needs.
                  </p>
                  
                  <div className="mb-3">
                    <strong>Communication Features:</strong>
                    <ul className="mb-2">
                      <li><strong>Auto-Generate Messages:</strong> Automatically creates patient messages based on context (appointments, prescriptions, etc.)</li>
                      <li><strong>Auto-Generate Emails:</strong> Generates professional email content with appropriate subject lines</li>
                      <li><strong>Smart Suggestions:</strong> Provides AI-powered suggestions while you type or compose messages</li>
                      <li><strong>Content Enhancement:</strong> Improves and polishes existing content for better clarity and professionalism</li>
                    </ul>
                  </div>

                  <div className="mb-3">
                    <strong>Documentation Features:</strong>
                    <ul className="mb-2">
                      <li><strong>Auto-Generate Summaries:</strong> Creates concise summaries of reports, consultations, and documents</li>
                      <li><strong>Appointment Reminders:</strong> Generates personalized reminder messages with all relevant details</li>
                      <li><strong>Prescription Summaries:</strong> Creates patient-friendly explanations of medications and instructions</li>
                      <li><strong>Report Summaries:</strong> Summarizes lab results and diagnostic reports in easy-to-understand language</li>
                      <li><strong>Medical Notes:</strong> Generates structured medical notes from consultation data</li>
                    </ul>
                  </div>

                  <InfoBox type="success" title="Best Practices">
                    <ul className="mb-0">
                      <li>Start by enabling one or two features to test how they work</li>
                      <li>Review generated content before sending to ensure accuracy</li>
                      <li>Customize system prompts to match your clinic's communication style</li>
                      <li>Use GPT-3.5 Turbo for most features to keep costs low</li>
                      <li>Enable GPT-4 only for critical medical documentation</li>
                    </ul>
                  </InfoBox>
                </div>
              </HelpSection>

              <div className="card mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0 fw-bold">
                    <FiZap className="me-2" />
                    GPT Features
                  </h5>
                </div>
                <div className="card-body">
                  <div className="alert alert-info mb-4">
                    <FiInfo className="me-2" />
                    Enable or disable specific GPT-powered features for your clinic. Click "How to Use GPT Features" above for detailed guidance.
                  </div>

                <div className="mb-4">
                  <h6 className="fw-semibold mb-3">
                    <FiMessageSquare className="me-2" />
                    Communication Features
                  </h6>
                  <ToggleSwitch
                    checked={features.auto_generate_messages}
                    onChange={() => handleFeatureToggle('auto_generate_messages')}
                    label="Auto-Generate Messages"
                    description="Automatically generate patient messages using GPT"
                  />
                  <ToggleSwitch
                    checked={features.auto_generate_emails}
                    onChange={() => handleFeatureToggle('auto_generate_emails')}
                    label="Auto-Generate Emails"
                    description="Automatically generate email content using GPT"
                  />
                  <ToggleSwitch
                    checked={features.smart_suggestions}
                    onChange={() => handleFeatureToggle('smart_suggestions')}
                    label="Smart Suggestions"
                    description="Get AI-powered suggestions for responses and actions"
                  />
                  <ToggleSwitch
                    checked={features.content_enhancement}
                    onChange={() => handleFeatureToggle('content_enhancement')}
                    label="Content Enhancement"
                    description="Enhance and improve existing content with GPT"
                  />
                </div>

                <div className="mb-4">
                  <h6 className="fw-semibold mb-3">
                    <FiFileText className="me-2" />
                    Documentation Features
                  </h6>
                  <ToggleSwitch
                    checked={features.auto_generate_summaries}
                    onChange={() => handleFeatureToggle('auto_generate_summaries')}
                    label="Auto-Generate Summaries"
                    description="Automatically generate concise summaries for reports, consultations, and documents. Helps save time on documentation."
                  />
                  <ToggleSwitch
                    checked={features.appointment_reminders}
                    onChange={() => handleFeatureToggle('appointment_reminders')}
                    label="Appointment Reminders"
                    description="Generate personalized appointment reminder messages with all relevant details (patient name, date, time, doctor, location)."
                  />
                  <ToggleSwitch
                    checked={features.prescription_summaries}
                    onChange={() => handleFeatureToggle('prescription_summaries')}
                    label="Prescription Summaries"
                    description="Generate patient-friendly prescription summaries explaining medications, dosages, and instructions in simple language."
                  />
                  <ToggleSwitch
                    checked={features.report_summaries}
                    onChange={() => handleFeatureToggle('report_summaries')}
                    label="Report Summaries"
                    description="Generate easy-to-understand summaries for lab results and diagnostic reports. Translates medical jargon into patient-friendly language."
                  />
                  <ToggleSwitch
                    checked={features.medical_notes}
                    onChange={() => handleFeatureToggle('medical_notes')}
                    label="Medical Notes Generation"
                    description="Generate structured medical notes from consultation data. Creates organized documentation with symptoms, diagnosis, and treatment plans."
                  />
                  <div className="mt-3 p-3 bg-light rounded">
                    <div className="d-flex align-items-start">
                      <FiAlertTriangle className="text-warning me-2 mt-1" />
                      <div className="small">
                        <strong>Important:</strong> Always review AI-generated medical content before use. 
                        These features assist with documentation but should not replace professional medical judgment.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="fw-semibold mb-3">
                    <FiGlobe className="me-2" />
                    Additional Features
                  </h6>
                  <ToggleSwitch
                    checked={features.translation}
                    onChange={() => handleFeatureToggle('translation')}
                    label="Translation Support"
                    description="Translate content to different languages using GPT. Supports 50+ languages for patient communications."
                  />
                  <div className="mt-3 p-3 bg-light rounded">
                    <div className="d-flex align-items-start">
                      <FiInfo className="text-info me-2 mt-1" />
                      <div className="small">
                        <strong>Translation Features:</strong>
                        <ul className="mb-0 mt-2">
                          <li>Translate patient messages, emails, and SMS to multiple languages</li>
                          <li>Maintains medical terminology accuracy</li>
                          <li>Supports 50+ languages including Spanish, Hindi, Arabic, Chinese, and more</li>
                          <li>Context-aware translations for medical content</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={handleSaveFeatures}
                  disabled={loading}
                >
                  <FiSave className="me-2" />
                  {loading ? 'Saving...' : 'Save Features'}
                </button>
              </div>
            </div>
            </>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <>
              <HelpSection id="integrations" title="How to Set Up GPT Integrations">
                <div className="mb-3">
                  <h6 className="fw-semibold mb-2">Integration Overview:</h6>
                  <p className="mb-3">
                    GPT integrations allow AI-powered content generation to work seamlessly with your existing 
                    communication channels and clinic modules.
                  </p>
                  
                  <div className="mb-3">
                    <strong>Communication Channel Integrations:</strong>
                    <ul className="mb-2">
                      <li><strong>WhatsApp Integration:</strong> When enabled, GPT generates WhatsApp messages automatically. 
                      Works with your existing WhatsApp templates and schedules.</li>
                      <li><strong>Email Integration:</strong> Generates email subject lines and body content. 
                      Integrates with your email templates and auto-send rules.</li>
                      <li><strong>SMS Integration:</strong> Creates concise SMS messages optimized for character limits. 
                      Works with SMS templates and scheduling.</li>
                    </ul>
                  </div>

                  <div className="mb-3">
                    <strong>Clinic Module Integrations:</strong>
                    <ul className="mb-2">
                      <li><strong>Appointments Automation:</strong> Auto-generates appointment confirmations, reminders, 
                      and follow-up messages using patient and appointment data.</li>
                      <li><strong>Prescriptions Automation:</strong> Creates patient-friendly prescription summaries 
                      and medication instructions automatically.</li>
                      <li><strong>Reports Automation:</strong> Generates summaries and explanations for lab results 
                      and diagnostic reports.</li>
                    </ul>
                  </div>

                  <InfoBox type="warning" title="Setup Requirements">
                    <ul className="mb-0">
                      <li>Ensure your communication channels (WhatsApp, Email, SMS) are properly configured first</li>
                      <li>Test integrations one at a time to ensure they work correctly</li>
                      <li>Review generated content before enabling auto-send features</li>
                      <li>Monitor usage and costs when using multiple integrations</li>
                    </ul>
                  </InfoBox>
                </div>
              </HelpSection>

              <div className="card mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0 fw-bold">
                    <FiMessageSquare className="me-2" />
                    Integrations
                  </h5>
                </div>
                <div className="card-body">
                  <div className="alert alert-info mb-4">
                    <FiInfo className="me-2" />
                    Connect GPT with other communication channels and clinic modules. Click "How to Set Up GPT Integrations" above for detailed instructions.
                  </div>

                <div className="mb-4">
                  <h6 className="fw-semibold mb-3">
                    <FiMessageSquare className="me-2" />
                    Communication Channels
                  </h6>
                  <ToggleSwitch
                    checked={integrations.whatsapp_enabled}
                    onChange={() => handleIntegrationToggle('whatsapp_enabled')}
                    label="WhatsApp Integration"
                    description="Use GPT to generate WhatsApp messages. Works with your existing WhatsApp templates and schedules. Generates personalized messages with patient data."
                  />
                  <ToggleSwitch
                    checked={integrations.email_enabled}
                    onChange={() => handleIntegrationToggle('email_enabled')}
                    label="Email Integration"
                    description="Use GPT to generate email content including subject lines and body. Integrates with your email templates and auto-send rules. Creates professional, context-aware emails."
                  />
                  <ToggleSwitch
                    checked={integrations.sms_enabled}
                    onChange={() => handleIntegrationToggle('sms_enabled')}
                    label="SMS Integration"
                    description="Use GPT to generate concise SMS messages optimized for character limits. Works with SMS templates and scheduling. Perfect for appointment reminders and quick updates."
                  />
                  <div className="mt-3 p-3 bg-light rounded">
                    <div className="d-flex align-items-start">
                      <FiInfo className="text-info me-2 mt-1" />
                      <div className="small">
                        <strong>Integration Benefits:</strong>
                        <ul className="mb-0 mt-2">
                          <li>Seamless integration with existing communication workflows</li>
                          <li>Automatic content generation based on clinic events</li>
                          <li>Consistent tone and style across all channels</li>
                          <li>Time-saving automation for routine communications</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="fw-semibold mb-3">
                    <FiActivity className="me-2" />
                    Clinic Modules
                  </h6>
                  <ToggleSwitch
                    checked={integrations.appointments_enabled}
                    onChange={() => handleIntegrationToggle('appointments_enabled')}
                    label="Appointments Automation"
                    description="Automate appointment-related communications with GPT"
                  />
                  <ToggleSwitch
                    checked={integrations.prescriptions_enabled}
                    onChange={() => handleIntegrationToggle('prescriptions_enabled')}
                    label="Prescriptions Automation"
                    description="Automate prescription-related content generation"
                  />
                  <ToggleSwitch
                    checked={integrations.reports_enabled}
                    onChange={() => handleIntegrationToggle('reports_enabled')}
                    label="Reports Automation"
                    description="Automate report summaries and communications"
                  />
                </div>

                <button
                  className="btn btn-primary"
                  onClick={handleSaveIntegrations}
                  disabled={loading}
                >
                  <FiSave className="me-2" />
                  {loading ? 'Saving...' : 'Save Integrations'}
                </button>
              </div>
            </div>
            </>
          )}

          {/* Usage & Costs Tab */}
          {activeTab === 'usage' && (
            <>
              <HelpSection id="usage" title="Understanding Usage & Costs">
                <div className="mb-3">
                  <h6 className="fw-semibold mb-2">Cost Management Guide:</h6>
                  
                  <div className="mb-3">
                    <strong>Understanding Tokens:</strong>
                    <p className="mb-2">
                      Tokens are the units GPT uses to process text. Roughly:
                    </p>
                    <ul className="mb-2">
                      <li>1 token ≈ 4 characters or 0.75 words</li>
                      <li>A typical message of 100 words ≈ 133 tokens</li>
                      <li>Both input (your prompt) and output (GPT's response) count toward token usage</li>
                    </ul>
                  </div>

                  <div className="mb-3">
                    <strong>Cost Factors:</strong>
                    <ul className="mb-2">
                      <li><strong>Model Choice:</strong> GPT-4 costs 10-20x more than GPT-3.5 Turbo</li>
                      <li><strong>Response Length:</strong> Longer responses (higher max_tokens) cost more</li>
                      <li><strong>Frequency:</strong> More requests = higher costs</li>
                      <li><strong>Features Enabled:</strong> Each auto-generation feature uses tokens</li>
                    </ul>
                  </div>

                  <InfoBox type="success" title="Cost Optimization Tips">
                    <ul className="mb-0">
                      <li>Use GPT-3.5 Turbo for 90% of tasks (saves 90%+ on costs)</li>
                      <li>Set lower max_tokens for simple messages (200-500 tokens)</li>
                      <li>Use GPT-4 only for critical medical documentation</li>
                      <li>Set monthly spending limits in OpenAI dashboard</li>
                      <li>Monitor usage daily to catch unexpected spikes</li>
                      <li>Disable unused features to reduce unnecessary API calls</li>
                      <li>Review and optimize system prompts to get better results with fewer tokens</li>
                    </ul>
                  </InfoBox>

                  <InfoBox type="info" title="Estimated Monthly Costs">
                    <p className="mb-2">Based on typical clinic usage:</p>
                    <ul className="mb-2">
                      <li><strong>Small Clinic (100-200 messages/month):</strong> $5-15/month with GPT-3.5 Turbo</li>
                      <li><strong>Medium Clinic (500-1000 messages/month):</strong> $20-50/month with GPT-3.5 Turbo</li>
                      <li><strong>Large Clinic (2000+ messages/month):</strong> $50-150/month with GPT-3.5 Turbo</li>
                    </ul>
                    <p className="mb-0">
                      <strong>Note:</strong> Using GPT-4 will increase costs by 10-20x. Always start with GPT-3.5 Turbo.
                    </p>
                  </InfoBox>
                </div>
              </HelpSection>

              <div className="card mb-4">
                <div className="card-header bg-white">
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <h5 className="mb-0 fw-bold">
                      <FiBarChart2 className="me-2" />
                      Usage & Costs
                    </h5>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={fetchUsageStats}
                    >
                      <FiRefreshCw className="me-1" />
                      Refresh
                    </button>
                  </div>
                </div>
                <div className="card-body">
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <StatCard
                      icon={FiActivity}
                      label="Total Requests"
                      value={usageStats.total_requests.toLocaleString()}
                      subValue={`${usageStats.requests_today} today`}
                      color="primary"
                    />
                  </div>
                  <div className="col-md-6">
                    <StatCard
                      icon={FiZap}
                      label="Total Tokens"
                      value={usageStats.total_tokens.toLocaleString()}
                      subValue={`${usageStats.tokens_today.toLocaleString()} today`}
                      color="info"
                    />
                  </div>
                  <div className="col-md-6">
                    <StatCard
                      icon={FiDollarSign}
                      label="Total Cost"
                      value={`$${usageStats.total_cost.toFixed(4)}`}
                      subValue={`$${usageStats.cost_today.toFixed(4)} today`}
                      color="success"
                    />
                  </div>
                  <div className="col-md-6">
                    <StatCard
                      icon={FiClock}
                      label="Average Response Time"
                      value="~2.5s"
                      subValue="Last 24 hours"
                      color="warning"
                    />
                  </div>
                </div>

                  <div className="alert alert-warning">
                    <FiInfo className="me-2" />
                    <strong>Cost Management:</strong> Monitor your usage regularly to control costs. 
                    Consider using GPT-3.5 Turbo for most tasks to reduce expenses. 
                    Click "Understanding Usage & Costs" above for detailed cost optimization tips.
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <>
              <div className="card mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0 fw-bold">
                    <FiBarChart2 className="me-2" />
                    Usage Analytics
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3 mb-4">
                    <div className="col-md-3">
                      <StatCard
                        icon={FiActivity}
                        label="Total Requests"
                        value={usageStats.total_requests.toLocaleString()}
                        subValue={`${usageStats.requests_today} today`}
                        color="primary"
                      />
                    </div>
                    <div className="col-md-3">
                      <StatCard
                        icon={FiZap}
                        label="Total Tokens"
                        value={usageStats.total_tokens.toLocaleString()}
                        subValue={`${usageStats.tokens_today.toLocaleString()} today`}
                        color="info"
                      />
                    </div>
                    <div className="col-md-3">
                      <StatCard
                        icon={FiDollarSign}
                        label="Total Cost"
                        value={`$${usageStats.total_cost.toFixed(4)}`}
                        subValue={`$${usageStats.cost_today.toFixed(4)} today`}
                        color="success"
                      />
                    </div>
                    <div className="col-md-3">
                      <StatCard
                        icon={FiClock}
                        label="Avg Response"
                        value="~2.5s"
                        subValue="Last 24 hours"
                        color="warning"
                      />
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header bg-light">
                          <h6 className="mb-0">Usage Trend (Last 7 Days)</h6>
                        </div>
                        <div className="card-body">
                          <div className="text-center py-5">
                            <FiBarChart2 size={48} className="text-muted mb-3" />
                            <p className="text-muted mb-0">Chart visualization will be displayed here</p>
                            <small className="text-muted">Shows daily requests and token usage trends</small>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header bg-light">
                          <h6 className="mb-0">Cost Breakdown by Model</h6>
                        </div>
                        <div className="card-body">
                          <div className="text-center py-5">
                            <FiDollarSign size={48} className="text-muted mb-3" />
                            <p className="text-muted mb-0">Cost distribution chart</p>
                            <small className="text-muted">Shows spending by AI model and provider</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">Top Use Cases</h6>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Use Case</th>
                              <th>Requests</th>
                              <th>Tokens</th>
                              <th>Cost</th>
                              <th>Avg Response Time</th>
                              <th>Success Rate</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td><strong>Appointment Reminders</strong></td>
                              <td>1,234</td>
                              <td>45,678</td>
                              <td>$0.068</td>
                              <td>1.2s</td>
                              <td><span className="badge bg-success">98.5%</span></td>
                            </tr>
                            <tr>
                              <td><strong>Email Generation</strong></td>
                              <td>856</td>
                              <td>32,145</td>
                              <td>$0.048</td>
                              <td>1.5s</td>
                              <td><span className="badge bg-success">97.2%</span></td>
                            </tr>
                            <tr>
                              <td><strong>Prescription Summaries</strong></td>
                              <td>642</td>
                              <td>28,901</td>
                              <td>$0.043</td>
                              <td>2.1s</td>
                              <td><span className="badge bg-success">96.8%</span></td>
                            </tr>
                            <tr>
                              <td><strong>Report Summaries</strong></td>
                              <td>423</td>
                              <td>19,567</td>
                              <td>$0.029</td>
                              <td>2.8s</td>
                              <td><span className="badge bg-success">95.3%</span></td>
                            </tr>
                            <tr>
                              <td><strong>Medical Notes</strong></td>
                              <td>312</td>
                              <td>15,234</td>
                              <td>$0.023</td>
                              <td>3.2s</td>
                              <td><span className="badge bg-warning">92.1%</span></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">Cost Estimation Calculator</h6>
                    </div>
                    <div className="card-body">
                      <InfoBox type="info" title="Estimate Your Monthly Costs">
                        Calculate expected costs based on your usage patterns and model selection.
                      </InfoBox>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="form-label">Estimated Requests/Month</label>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="1000"
                            onChange={(e) => {
                              const requests = parseInt(e.target.value) || 0;
                              const avgTokens = 150; // Average tokens per request
                              const totalTokens = requests * avgTokens;
                              const costPer1K = config.provider === 'openai' && config.model.includes('gpt-4') ? 0.03 : 0.002;
                              const estimatedCost = (totalTokens / 1000) * costPer1K;
                              setCostEstimate({ tokens: totalTokens, cost: estimatedCost });
                            }}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Avg Tokens per Request</label>
                          <input
                            type="number"
                            className="form-control"
                            value="150"
                            readOnly
                          />
                          <small className="text-muted">Based on typical clinic messages</small>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Selected Model</label>
                          <input
                            type="text"
                            className="form-control"
                            value={config.model}
                            readOnly
                          />
                        </div>
                        {costEstimate.cost > 0 && (
                          <div className="col-12">
                            <div className="alert alert-info">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <strong>Estimated Monthly Cost:</strong> ${costEstimate.cost.toFixed(2)}
                                  <br />
                                  <small className="text-muted">
                                    Based on ~{costEstimate.tokens.toLocaleString()} tokens/month
                                  </small>
                                </div>
                                <div className="text-end">
                                  <div className="h4 mb-0 text-primary">${(costEstimate.cost * 12).toFixed(2)}</div>
                                  <small className="text-muted">per year</small>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Test Playground Tab */}
          {activeTab === 'playground' && (
            <>
              <div className="card mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0 fw-bold">
                    <FiPlay className="me-2" />
                    Test Playground
                  </h5>
                </div>
                <div className="card-body">
                  <InfoBox type="info" title="Test Your GPT Configuration">
                    Use this playground to test your GPT integration with different prompts and see responses in real-time.
                  </InfoBox>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <FiEdit3 className="me-2" />
                      Test Prompt
                    </label>
                    <TextAreaTopLabel
                      label=""
                      value={testPrompt}
                      onChange={(e) => {
                        setTestPrompt(e.target.value);
                        // Estimate tokens (rough: 1 token ≈ 4 characters)
                        const estimatedTokens = Math.ceil(e.target.value.length / 4);
                        const costPer1K = config.provider === 'openai' && config.model.includes('gpt-4') ? 0.03 : 0.002;
                        setCostEstimate({
                          tokens: estimatedTokens,
                          cost: (estimatedTokens / 1000) * costPer1K
                        });
                      }}
                      rows={5}
                      placeholder="Enter your test prompt here... (e.g., 'Generate an appointment reminder for John Doe scheduled on March 15, 2024 at 2:00 PM')"
                    />
                    {testPrompt && (
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <small className="text-muted">
                          Estimated: ~{costEstimate.tokens} tokens (${costEstimate.cost.toFixed(6)})
                        </small>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => {
                            navigator.clipboard.writeText(testPrompt);
                            toast.success('Prompt copied to clipboard!');
                          }}
                        >
                          <FiCopy className="me-1" size={14} />
                          Copy
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label fw-semibold mb-0">
                        <FiCpu className="me-2" />
                        Model & Settings
                      </label>
                      <button
                        className="btn btn-primary"
                        onClick={async () => {
                          if (!testPrompt.trim()) {
                            toast.error('Please enter a test prompt');
                            return;
                          }
                          setTestingPrompt(true);
                          setTestResponse('');
                          try {
                            const result = await gptApi.generateText({
                              prompt: testPrompt,
                              model: config.model,
                              temperature: config.temperature,
                              max_tokens: config.max_tokens,
                            });
                            setTestResponse(result.text || result.response || 'No response received');
                            toast.success('Test completed successfully!');
                          } catch (error) {
                            setTestResponse(`Error: ${error.message}`);
                            console.log('Test failed. Please check your configuration.');
                            // toast.error('Test failed. Please check your configuration.');
                          } finally {
                            setTestingPrompt(false);
                          }
                        }}
                        disabled={testingPrompt || !config.enabled}
                      >
                        {testingPrompt ? (
                          <>
                            <FiRefreshCw className="me-2 spinner-border spinner-border-sm" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <FiPlay className="me-2" />
                            Run Test
                          </>
                        )}
                      </button>
                    </div>
                    <div className="row g-2 mb-3">
                      <div className="col-md-4">
                        <small className="text-muted">Model: <strong>{config.model}</strong></small>
                      </div>
                      <div className="col-md-4">
                        <small className="text-muted">Temperature: <strong>{config.temperature}</strong></small>
                      </div>
                      <div className="col-md-4">
                        <small className="text-muted">Max Tokens: <strong>{config.max_tokens}</strong></small>
                      </div>
                    </div>
                  </div>

                  {testResponse && (
                    <div className="mb-4">
                      <label className="form-label fw-semibold">
                        <FiCheckCircle className="me-2 text-success" />
                        Response
                      </label>
                      <div className="card bg-light">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <small className="text-muted">Generated Response:</small>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => {
                                navigator.clipboard.writeText(testResponse);
                                toast.success('Response copied to clipboard!');
                              }}
                            >
                              <FiCopy className="me-1" size={14} />
                              Copy
                            </button>
                          </div>
                          <div className="border rounded p-3 bg-white" style={{ minHeight: '100px', whiteSpace: 'pre-wrap' }}>
                            {testResponse}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">Example Prompts</h6>
                    </div>
                    <div className="card-body">
                      <div className="row g-2">
                        {[
                          { 
                            title: 'Appointment Reminder', 
                            prompt: 'Generate a friendly appointment reminder for a patient named Sarah scheduled for a dental checkup on March 20, 2024 at 10:00 AM.',
                            category: 'Appointments',
                            tokens: '~45',
                            cost: '$0.0001'
                          },
                          { 
                            title: 'Prescription Summary', 
                            prompt: 'Create a patient-friendly summary for a prescription containing: Amoxicillin 500mg (twice daily), Ibuprofen 200mg (as needed for pain).',
                            category: 'Prescriptions',
                            tokens: '~60',
                            cost: '$0.0001'
                          },
                          { 
                            title: 'Email Subject', 
                            prompt: 'Generate a professional email subject line for a follow-up appointment confirmation.',
                            category: 'Emails',
                            tokens: '~25',
                            cost: '$0.00005'
                          },
                          { 
                            title: 'Report Summary', 
                            prompt: 'Summarize these lab results in simple terms: Blood pressure 120/80, Heart rate 72 bpm, Temperature 98.6°F.',
                            category: 'Reports',
                            tokens: '~50',
                            cost: '$0.0001'
                          },
                          { 
                            title: 'Follow-up Message', 
                            prompt: 'Create a follow-up message for a patient who had a consultation yesterday. Ask about their recovery and if they have any questions.',
                            category: 'Messages',
                            tokens: '~55',
                            cost: '$0.0001'
                          },
                          { 
                            title: 'Test Results Notification', 
                            prompt: 'Generate a professional message informing a patient that their test results are ready and they can collect them from the clinic.',
                            category: 'Notifications',
                            tokens: '~40',
                            cost: '$0.00008'
                          },
                        ].map((example, idx) => (
                          <div key={idx} className="col-md-6">
                            <div className="card border h-100">
                              <div className="card-body p-3">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div>
                                    <h6 className="fw-semibold mb-1">{example.title}</h6>
                                    <span className="badge bg-secondary">{example.category}</span>
                                  </div>
                                  <div className="text-end">
                                    <small className="text-muted d-block">{example.tokens} tokens</small>
                                    <small className="text-muted">{example.cost}</small>
                                  </div>
                                </div>
                                <p className="small text-muted mb-2">{example.prompt}</p>
                                <button
                                  className="btn btn-sm btn-outline-primary w-100"
                                  onClick={() => setTestPrompt(example.prompt)}
                                >
                                  <FiCopy className="me-1" size={12} />
                                  Use This Prompt
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">Prompt Tips & Best Practices</h6>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="p-3 border rounded h-100">
                            <h6 className="fw-semibold mb-2">
                              <FiCheckCircle className="text-success me-2" />
                              Do's
                            </h6>
                            <ul className="small mb-0">
                              <li>Be specific about what you want</li>
                              <li>Include relevant context (patient name, date, etc.)</li>
                              <li>Specify tone (professional, friendly, empathetic)</li>
                              <li>Mention target audience (patient, doctor, staff)</li>
                              <li>Include any constraints or requirements</li>
                            </ul>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="p-3 border rounded h-100">
                            <h6 className="fw-semibold mb-2">
                              <FiXCircle className="text-danger me-2" />
                              Don'ts
                            </h6>
                            <ul className="small mb-0">
                              <li>Don't ask for medical diagnoses</li>
                              <li>Avoid vague or ambiguous requests</li>
                              <li>Don't include sensitive data in prompts</li>
                              <li>Avoid overly complex instructions</li>
                              <li>Don't forget to review generated content</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <>
              <div className="card mb-4">
                <div className="card-header bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">
                      <FiFileText className="me-2" />
                      Prompt Templates
                    </h5>
                    <button className="btn btn-sm btn-primary">
                      <FiUpload className="me-1" />
                      New Template
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <InfoBox type="info" title="Template Library">
                    Save and reuse common prompts for faster content generation. Templates can include variables that are automatically replaced.
                  </InfoBox>

                  <div className="mb-3">
                    <div className="input-group">
                      <span className="input-group-text">
                        <FiSearch />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search templates..."
                      />
                      <select className="form-select" style={{ maxWidth: '200px' }}>
                        <option>All Categories</option>
                        <option>Appointments</option>
                        <option>Prescriptions</option>
                        <option>Reports</option>
                        <option>Emails</option>
                        <option>Messages</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-3">
                    {[
                      { name: 'Appointment Reminder', category: 'Appointments', description: 'Generate appointment reminders with patient details', variables: ['patient_name', 'date', 'time'] },
                      { name: 'Prescription Summary', category: 'Prescriptions', description: 'Create patient-friendly prescription explanations', variables: ['medications', 'dosage', 'instructions'] },
                      { name: 'Follow-up Email', category: 'Emails', description: 'Professional follow-up email template', variables: ['patient_name', 'visit_date'] },
                      { name: 'Lab Report Summary', category: 'Reports', description: 'Summarize lab results in simple language', variables: ['test_name', 'results'] },
                      { name: 'SMS Reminder', category: 'Messages', description: 'Short SMS reminder message', variables: ['patient_name', 'date', 'time'] },
                      { name: 'Medical Notes', category: 'Reports', description: 'Generate structured medical consultation notes', variables: ['symptoms', 'diagnosis', 'treatment'] },
                    ].map((template, idx) => (
                      <div key={idx} className="col-md-6">
                        <div className="card border h-100">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <h6 className="fw-semibold mb-1">{template.name}</h6>
                                <span className="badge bg-secondary">{template.category}</span>
                              </div>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => setSelectedTemplate(template)}
                              >
                                <FiEdit3 size={14} />
                              </button>
                            </div>
                            <p className="small text-muted mb-2">{template.description}</p>
                            <div className="mb-2">
                              <small className="text-muted">Variables: </small>
                              {template.variables.map((v, i) => (
                                <span key={i} className="badge bg-light text-dark me-1">{`{${v}}`}</span>
                              ))}
                            </div>
                            <div className="mb-2 d-flex justify-content-between align-items-center">
                              <small className="text-muted">
                                <FiActivity className="me-1" size={12} />
                                Used {template.usage}
                              </small>
                              <small className="text-muted">
                                Last: {template.lastUsed}
                              </small>
                            </div>
                            <div className="d-flex gap-2">
                              <button className="btn btn-sm btn-outline-primary flex-fill">
                                <FiPlay className="me-1" size={12} />
                                Test
                              </button>
                              <button className="btn btn-sm btn-outline-secondary flex-fill">
                                <FiCopy className="me-1" size={12} />
                                Copy
                              </button>
                              <button className="btn btn-sm btn-outline-info">
                                <FiEdit3 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <>
              <div className="card mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0 fw-bold">
                    <FiSettings className="me-2" />
                    Advanced Settings
                  </h5>
                </div>
                <div className="card-body">
                  <div className="mb-4">
                    <h6 className="fw-semibold mb-3">
                      <FiShield className="me-2" />
                      Rate Limiting & Safety
                    </h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <InputTopLabel
                          label="Max Requests Per Minute"
                          type="number"
                          value={config.rate_limit_per_minute || 60}
                          onChange={(e) => handleConfigChange('rate_limit_per_minute', parseInt(e.target.value))}
                        />
                        <small className="text-muted">Limit API requests to prevent excessive usage</small>
                      </div>
                      <div className="col-md-6">
                        <InputTopLabel
                          label="Max Requests Per Day"
                          type="number"
                          value={config.rate_limit_per_day || 1000}
                          onChange={(e) => handleConfigChange('rate_limit_per_day', parseInt(e.target.value))}
                        />
                        <small className="text-muted">Daily request limit for cost control</small>
                      </div>
                      <div className="col-md-6">
                        <InputTopLabel
                          label="Max Cost Per Day ($)"
                          type="number"
                          step="0.01"
                          value={config.max_cost_per_day || 10}
                          onChange={(e) => handleConfigChange('max_cost_per_day', parseFloat(e.target.value))}
                        />
                        <small className="text-muted">Daily spending limit to prevent overages</small>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Enable Response Caching</label>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={config.enable_caching || false}
                              onChange={(e) => handleConfigChange('enable_caching', e.target.checked)}
                            />
                            <label className="form-check-label">
                              Cache responses for identical prompts (saves costs)
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr />

                  <div className="mb-4">
                    <h6 className="fw-semibold mb-3">
                      <FiActivity className="me-2" />
                      Performance & Optimization
                    </h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Request Timeout (seconds)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={config.timeout || 30}
                            onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
                          />
                          <small className="text-muted">Maximum time to wait for API response</small>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Retry Attempts</label>
                          <input
                            type="number"
                            className="form-control"
                            value={config.retry_attempts || 3}
                            onChange={(e) => handleConfigChange('retry_attempts', parseInt(e.target.value))}
                          />
                          <small className="text-muted">Number of retries on API failure</small>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Enable Request Logging</label>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={config.enable_logging || true}
                              onChange={(e) => handleConfigChange('enable_logging', e.target.checked)}
                            />
                            <label className="form-check-label">
                              Log all API requests for debugging and analytics
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Enable Cost Alerts</label>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={config.enable_cost_alerts || true}
                              onChange={(e) => handleConfigChange('enable_cost_alerts', e.target.checked)}
                            />
                            <label className="form-check-label">
                              Send alerts when daily cost limit is reached
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr />

                  <div className="mb-4">
                    <h6 className="fw-semibold mb-3">
                      <FiTarget className="me-2" />
                      Model Comparison & Recommendations
                    </h6>
                    <InfoBox type="info" title="Choosing the Right Model">
                      Select models based on your needs: Speed vs. Quality vs. Cost. Most clinics use GPT-3.5 Turbo for 90% of tasks 
                      and GPT-4 only for critical medical documentation.
                    </InfoBox>
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th>Model</th>
                            <th>Speed</th>
                            <th>Quality</th>
                            <th>Context Window</th>
                            <th>Cost/1K Tokens</th>
                            <th>Best For</th>
                            <th>Monthly Cost*</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>GPT-3.5 Turbo</strong></td>
                            <td><FiTrendingUp className="text-success" /> Fast</td>
                            <td>Good</td>
                            <td>16K tokens</td>
                            <td>$0.002</td>
                            <td>General messages, emails, reminders</td>
                            <td>$30-50</td>
                          </tr>
                          <tr>
                            <td><strong>GPT-4</strong></td>
                            <td><FiTrendingDown className="text-warning" /> Slower</td>
                            <td>Excellent</td>
                            <td>8K tokens</td>
                            <td>$0.03</td>
                            <td>Medical notes, complex reports</td>
                            <td>$450-750</td>
                          </tr>
                          <tr>
                            <td><strong>GPT-4 Turbo</strong></td>
                            <td><FiTrendingDown className="text-warning" /> Moderate</td>
                            <td>Excellent</td>
                            <td>128K tokens</td>
                            <td>$0.01</td>
                            <td>Long documents, detailed analysis</td>
                            <td>$150-250</td>
                          </tr>
                          <tr>
                            <td><strong>Claude 3 Haiku</strong></td>
                            <td><FiTrendingUp className="text-success" /> Very Fast</td>
                            <td>Good</td>
                            <td>200K tokens</td>
                            <td>$0.001</td>
                            <td>Quick responses, summaries</td>
                            <td>$15-25</td>
                          </tr>
                          <tr>
                            <td><strong>Claude 3.5 Sonnet</strong></td>
                            <td><FiTrendingUp className="text-success" /> Fast</td>
                            <td>Excellent</td>
                            <td>200K tokens</td>
                            <td>$0.003</td>
                            <td>Medical documentation, complex tasks</td>
                            <td>$45-75</td>
                          </tr>
                          <tr>
                            <td><strong>Gemini 1.5 Flash</strong></td>
                            <td><FiTrendingUp className="text-success" /> Fast</td>
                            <td>Good</td>
                            <td>1M tokens</td>
                            <td>$0.0015</td>
                            <td>Multimodal tasks, general use</td>
                            <td>$22-37</td>
                          </tr>
                        </tbody>
                      </table>
                      <small className="text-muted">
                        *Monthly cost estimates based on 15,000 requests/month with average 150 tokens per request
                      </small>
                    </div>
                  </div>

                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">Integration Examples & Use Cases</h6>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="card border h-100">
                            <div className="card-body">
                              <h6 className="fw-semibold mb-2">
                                <FiMessageSquare className="me-2 text-primary" />
                                Appointment Automation
                              </h6>
                              <p className="small text-muted mb-2">
                                When a new appointment is booked, GPT automatically generates:
                              </p>
                              <ul className="small mb-0">
                                <li>Confirmation message with all details</li>
                                <li>Reminder 24 hours before</li>
                                <li>Follow-up message after visit</li>
                                <li>Rescheduling notifications</li>
                              </ul>
                              <div className="mt-2">
                                <span className="badge bg-primary">WhatsApp</span>
                                <span className="badge bg-primary ms-1">Email</span>
                                <span className="badge bg-primary ms-1">SMS</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="card border h-100">
                            <div className="card-body">
                              <h6 className="fw-semibold mb-2">
                                <FiFileText className="me-2 text-success" />
                                Prescription Automation
                              </h6>
                              <p className="small text-muted mb-2">
                                When a prescription is created, GPT generates:
                              </p>
                              <ul className="small mb-0">
                                <li>Patient-friendly medication explanations</li>
                                <li>Dosage instructions in simple terms</li>
                                <li>Side effects and precautions</li>
                                <li>Storage and administration tips</li>
                              </ul>
                              <div className="mt-2">
                                <span className="badge bg-success">Auto-Generated</span>
                                <span className="badge bg-success ms-1">Patient-Friendly</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="card border h-100">
                            <div className="card-body">
                              <h6 className="fw-semibold mb-2">
                                <FiBarChart2 className="me-2 text-info" />
                                Report Automation
                              </h6>
                              <p className="small text-muted mb-2">
                                When lab results are ready, GPT creates:
                              </p>
                              <ul className="small mb-0">
                                <li>Easy-to-understand summaries</li>
                                <li>Normal vs. abnormal value explanations</li>
                                <li>Next steps and recommendations</li>
                                <li>Patient notification messages</li>
                              </ul>
                              <div className="mt-2">
                                <span className="badge bg-info">Medical Accuracy</span>
                                <span className="badge bg-info ms-1">Simple Language</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="card border h-100">
                            <div className="card-body">
                              <h6 className="fw-semibold mb-2">
                                <FiGlobe className="me-2 text-warning" />
                                Multi-Language Support
                              </h6>
                              <p className="small text-muted mb-2">
                                GPT can translate content to:
                              </p>
                              <ul className="small mb-0">
                                <li>50+ languages supported</li>
                                <li>Maintains medical terminology</li>
                                <li>Context-aware translations</li>
                                <li>Automatic language detection</li>
                              </ul>
                              <div className="mt-2">
                                <span className="badge bg-warning">Spanish</span>
                                <span className="badge bg-warning ms-1">Hindi</span>
                                <span className="badge bg-warning ms-1">Arabic</span>
                                <span className="badge bg-warning ms-1">+47 more</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">Security & Compliance</h6>
                    </div>
                    <div className="card-body">
                      <InfoBox type="warning" title="Data Privacy & Security">
                        Always ensure patient data is handled securely and in compliance with healthcare regulations (HIPAA, GDPR, etc.).
                      </InfoBox>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="p-3 border rounded">
                            <h6 className="fw-semibold mb-2">
                              <FiShield className="text-success me-2" />
                              Security Features
                            </h6>
                            <ul className="small mb-0">
                              <li>API keys encrypted at rest</li>
                              <li>No patient data stored in prompts</li>
                              <li>Request logging for audit trails</li>
                              <li>Rate limiting to prevent abuse</li>
                              <li>Cost alerts to prevent overages</li>
                            </ul>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="p-3 border rounded">
                            <h6 className="fw-semibold mb-2">
                              <FiCheckCircle className="text-info me-2" />
                              Best Practices
                            </h6>
                            <ul className="small mb-0">
                              <li>Review all generated content before sending</li>
                              <li>Never include full patient records in prompts</li>
                              <li>Use anonymized data when testing</li>
                              <li>Regularly rotate API keys</li>
                              <li>Monitor usage for unusual patterns</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={handleSaveConfig}
                    disabled={loading}
                  >
                    <FiSave className="me-2" />
                    {loading ? 'Saving...' : 'Save Advanced Settings'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        <Footer />
      </PerfectScrollbar>
    </div>
  );
};

export default SettingsGptForm;

