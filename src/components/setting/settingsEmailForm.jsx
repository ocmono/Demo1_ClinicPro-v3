import { useState, useEffect } from 'react'
import Footer from '@/components/shared/Footer'
import PageHeaderSetting from '@/components/shared/pageHeader/PageHeaderSetting'
import SelectDropdown from '@/components/shared/SelectDropdown'
import InputTopLabel from '@/components/shared/InputTopLabel'
import TextAreaTopLabel from '@/components/shared/TextAreaTopLabel'
import { FiInfo, FiMail, FiSettings } from 'react-icons/fi'
import PerfectScrollbar from 'react-perfect-scrollbar'

const mailEngine = [
    { value: "HPMailer", label: "HPMailer" },
    { value: "codeIgniter", label: "CodeIgniter" },
]
const mailProtocol = [
    { value: "Mail", label: "Mail" },
    { value: "SMTP", label: "SMTP" },
    { value: "Sendmail", label: "Sendmail" },
]
export const settingOptions = [
    { value: "yes", label: "Yes", icon: "feather-check", iconClassName: "text-success" },
    { value: "no", label: "No", icon: "feather-x", iconClassName: "text-danger" },
]

// SMTP Service Provider Templates
const smtpProviders = [
    {
        name: "Gmail",
        icon: "📧",
        host: "smtp.gmail.com",
        port: "587",
        security: "TLS",
        description: "Google's email service"
    },
    {
        name: "Outlook/Hotmail",
        icon: "📧",
        host: "smtp-mail.outlook.com",
        port: "587",
        security: "TLS",
        description: "Microsoft's email service"
    },
    {
        name: "Yahoo Mail",
        icon: "📧",
        host: "smtp.mail.yahoo.com",
        port: "587",
        security: "TLS",
        description: "Yahoo's email service"
    },
    {
        name: "Brevo (Sendinblue)",
        icon: "📧",
        host: "smtp-relay.brevo.com",
        port: "587",
        security: "TLS",
        description: "Email marketing platform"
    },
    {
        name: "ProtonMail",
        icon: "🔒",
        host: "smtp.protonmail.ch",
        port: "587",
        security: "TLS",
        description: "Secure email service"
    },
    {
        name: "Zoho Mail",
        icon: "📧",
        host: "smtp.zoho.com",
        port: "587",
        security: "TLS",
        description: "Business email service"
    },
    {
        name: "SendGrid",
        icon: "📧",
        host: "smtp.sendgrid.net",
        port: "587",
        security: "TLS",
        description: "Email delivery service"
    },
    {
        name: "Mailgun",
        icon: "📧",
        host: "smtp.mailgun.org",
        port: "587",
        security: "TLS",
        description: "Email API service"
    },
    {
        name: "Amazon SES",
        icon: "☁️",
        host: "email-smtp.us-east-1.amazonaws.com",
        port: "587",
        security: "TLS",
        description: "AWS email service"
    },
    {
        name: "Mailchimp",
        icon: "📧",
        host: "smtp.mailchimp.com",
        port: "587",
        security: "TLS",
        description: "Email marketing platform"
    },
    {
        name: "Postmark",
        icon: "📧",
        host: "smtp.postmarkapp.com",
        port: "587",
        security: "TLS",
        description: "Transactional email service"
    },
    {
        name: "SparkPost",
        icon: "📧",
        host: "smtp.sparkpostmail.com",
        port: "587",
        security: "TLS",
        description: "Email delivery platform"
    },
    {
        name: "iCloud Mail",
        icon: "📧",
        host: "smtp.mail.me.com",
        port: "587",
        security: "TLS",
        description: "Apple's email service"
    },
    {
        name: "Fastmail",
        icon: "📧",
        host: "smtp.fastmail.com",
        port: "587",
        security: "TLS",
        description: "Premium email service"
    },
    {
        name: "Tutanota",
        icon: "🔒",
        host: "smtp.tutanota.com",
        port: "587",
        security: "TLS",
        description: "Secure email provider"
    },
    {
        name: "Custom",
        icon: "⚙️",
        host: "",
        port: "",
        security: "TLS",
        description: "Custom SMTP server"
    }
]

const SettingsEmailForm = () => {
    const [selectedOption, setSelectedOption] = useState(null)
    const options = settingOptions
    
    // SMTP config state
    const [smtpHost, setSmtpHost] = useState('');
    const [smtpPort, setSmtpPort] = useState('');
    const [smtpUser, setSmtpUser] = useState('');
    const [smtpPass, setSmtpPass] = useState('');
    const [smtpSecurity, setSmtpSecurity] = useState('TLS');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [selectedProvider, setSelectedProvider] = useState(null);

    // Load settings on mount
    useEffect(() => {
        setLoading(true);
        fetch('/api/settings/email').then(r => r.ok ? r.json() : {})
        .then((email) => {
            setSmtpHost(email.smtpHost || '');
            setSmtpPort(email.smtpPort || '');
            setSmtpUser(email.smtpUser || '');
            setSmtpPass(email.smtpPass || '');
            setSmtpSecurity(email.smtpSecurity || 'TLS');
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleEmailSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus('');
        try {
            const res = await fetch('/api/settings/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ smtpHost, smtpPort, smtpUser, smtpPass, smtpSecurity })
            });
            if (res.ok) setStatus('Email settings saved!');
            else setStatus('Failed to save email settings.');
        } catch {
            setStatus('Failed to save email settings.');
        }
        setLoading(false);
    };

    const loadProviderTemplate = (provider) => {
        setSmtpHost(provider.host);
        setSmtpPort(provider.port);
        setSmtpSecurity(provider.security);
        setSelectedProvider(provider.name);
        setStatus(`Loaded ${provider.name} template. Please enter your credentials.`);
    };

    return (
        <div className="content-area setting-form">
            <PerfectScrollbar>
                <PageHeaderSetting />
                <div className="content-area-body">
                    <div className="card mb-0">
                        <div className="card-body">
                            <h4 className="mb-4 fw-bold">Email Settings</h4>
                            {loading && <div className="alert alert-info">Loading...</div>}
                            {status && <div className="alert alert-success">{status}</div>}
                            
                            <div className="mb-4">
                                <h6 className="fw-semibold mb-3">
                                    <FiSettings className="me-2" />
                                    SMTP Configuration
                                </h6>
                                
                                {/* SMTP Provider Templates */}
                                <div className="mb-4">
                                    <label className="form-label fw-medium mb-3">Quick Setup - Select Your Email Provider</label>
                                    <div className="row g-2">
                                        {smtpProviders.map((provider, index) => (
                                            <div key={index} className="col-md-3 col-sm-6">
                                                <button
                                                    type="button"
                                                    className={`btn w-100 text-start p-3 border ${
                                                        selectedProvider === provider.name 
                                                            ? 'btn-primary' 
                                                            : 'btn-outline-secondary'
                                                    }`}
                                                    onClick={() => loadProviderTemplate(provider)}
                                                >
                                                    <div className="d-flex align-items-center">
                                                        <span className="fs-4 me-2">{provider.icon}</span>
                                                        <div>
                                                            <div className="fw-semibold">{provider.name}</div>
                                                            <small className="text-muted">{provider.description}</small>
                                                        </div>
                                                    </div>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <form onSubmit={handleEmailSave}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">SMTP Host</label>
                                            <input 
                                                className="form-control" 
                                                value={smtpHost} 
                                                onChange={e => setSmtpHost(e.target.value)}
                                                placeholder="e.g., smtp.gmail.com"
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">SMTP Port</label>
                                            <input 
                                                className="form-control" 
                                                value={smtpPort} 
                                                onChange={e => setSmtpPort(e.target.value)}
                                                placeholder="587"
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Security</label>
                                            <select 
                                                className="form-select" 
                                                value={smtpSecurity} 
                                                onChange={e => setSmtpSecurity(e.target.value)}
                                            >
                                                <option value="TLS">TLS</option>
                                                <option value="SSL">SSL</option>
                                                <option value="None">None</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">SMTP Username</label>
                                            <input 
                                                className="form-control" 
                                                value={smtpUser} 
                                                onChange={e => setSmtpUser(e.target.value)}
                                                placeholder="your-email@gmail.com"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">SMTP Password</label>
                                            <input 
                                                className="form-control" 
                                                type="password" 
                                                value={smtpPass} 
                                                onChange={e => setSmtpPass(e.target.value)}
                                                placeholder="Your email password or app password"
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Help Text */}
                                    <div className="mt-3 p-3 bg-light rounded">
                                        <div className="d-flex align-items-start">
                                            <FiInfo className="text-info me-2 mt-1" />
                                            <div>
                                                <small className="text-muted">
                                                    <strong>Note:</strong> For Gmail, you may need to use an "App Password" instead of your regular password. 
                                                    Enable 2-factor authentication and generate an app password in your Google Account settings.
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button className="btn btn-primary mt-3" type="submit" disabled={loading}>
                                        <FiMail className="me-2" />
                                        Save Email Settings
                                    </button>
                                </form>
                            </div>

                            <hr />

                            <div className="mb-4">
                                <h6 className="fw-semibold mb-3">Email Template Settings</h6>
                            <div className="mb-5">
                                <label className="form-label">Mail Engine <span className="text-danger">*</span></label>
                                <SelectDropdown
                                    options={mailEngine}
                                    defaultSelect={"HPMailer"}
                                    selectedOption={selectedOption}
                                    onSelectOption={(option) => setSelectedOption(option)}
                                />
                                <small className="form-text text-muted">Mail Engine [Ex: HPMailer/CodeIgniter]</small>
                            </div>
                            <div className="mb-5">
                                <label className="form-label">Email Protocol</label>
                                <SelectDropdown
                                    options={mailProtocol}
                                    defaultSelect={"SMTP"}
                                    selectedOption={selectedOption}
                                    onSelectOption={(option) => setSelectedOption(option)}
                                />
                                <small className="form-text text-muted">Email Protocol [Ex: Mail/SMTP/Sendmail]</small>
                            </div>
                            <InputTopLabel
                                label={"Email"}
                                placeholder={"Email"}
                                info={"Email [Ex: contact@ocmono.com]"}
                            />
                            <InputTopLabel
                                label={"Email Charset"}
                                placeholder={"Email Charset"}
                                info={"Email [Ex: utf-8]"}
                            />
                            <InputTopLabel
                                label={"Email Signature"}
                                placeholder={"Email Signature"}
                                info={"Email Signature [Ex: themeocean]"}
                            />
                            <TextAreaTopLabel
                                label={"Predefined Header"}
                                placeholder={"Predefined Header"}
                                info={"Predefined Header [Ex: Email template header code]"}
                                className={"mb-5"}
                            />
                            <TextAreaTopLabel
                                label={"Predefined Footer"}
                                placeholder={"Predefined Footer"}
                                info={"Predefined footer [Ex: Email template footer code]"}
                                className={"mb-5"}
                            />
                            </div>

                            <hr />

                            <div className="mb-4">
                                <h6 className="fw-semibold mb-3">Email Queue</h6>
                            <div className="mb-5">
                                <label className="form-label">
                                    <span className="me-2">Enable Email Queue</span>
                                    <span data-bs-toggle="tooltip" title="To speed up the emailing process, the system will add the emails in queue and will send them via cron job, make sure that the cron job is properly configured in order to use this feature."><i className="fs-13 text-muted lh-1" ><FiInfo /></i></span>
                                </label>
                                <SelectDropdown
                                    options={options}
                                    defaultSelect={"yes"}
                                    selectedOption={selectedOption}
                                    onSelectOption={(option) => setSelectedOption(option)}
                                />
                                <small className="form-text text-muted">Enable Email Queue [Ex: YES/NO]</small>
                            </div>
                            <div className="mb-0">
                                <label className="form-label">
                                    <span className="me-2">Do not add emails with attachments in the queue?</span>
                                    <span data-bs-toggle="tooltip" title="Most likely you will encounter problems with the email queue if the system needs to add big files to the queue."><i className="fs-13 text-muted lh-1" ><FiInfo /></i></span>
                                </label>
                                <SelectDropdown
                                    options={options}
                                    defaultSelect={"yes"}
                                    selectedOption={selectedOption}
                                    onSelectOption={(option) => setSelectedOption(option)}
                                />
                                <small className="form-text text-muted">Do not add emails with attachments in the queue? [Ex: YES/NO]</small>
                            </div>
                            </div>

                            <hr />

                            <div className="mb-4">
                                <h6 className="fw-semibold mb-3">Send Test Email</h6>
                            <div className="mb-0">
                                <label className="form-label">Test Email</label>
                                <div className="input-group">
                                    <input type="text" className="form-control" placeholder="Send Test Email" />
                                    <a href="#" className="input-group-text">Send Test</a>
                                </div>
                                <small className="form-text text-muted">Send Test Email [Ex: test_1@email.com, test_2@email.com, test_3@email.com]</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </PerfectScrollbar>
        </div>
    )
}

export default SettingsEmailForm