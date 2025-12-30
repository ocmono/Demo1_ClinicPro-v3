import React, { useState, useEffect } from 'react';
import { FiDownload, FiPlus, FiFileText, FiBarChart2, FiCheckCircle, FiEdit3, FiTrash2, FiMoreHorizontal } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Table from '@/components/shared/table/Table';
import Dropdown from '@/components/shared/Dropdown';

const TemplatesTab = () => {
    const [templates, setTemplates] = useState([]);
    const [activeTypeFilter, setActiveTypeFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    useEffect(() => {
        const saved = localStorage.getItem('communicationTemplates');
        if (saved) {
            try {
                setTemplates(JSON.parse(saved));
            } catch (error) {
                console.error('Failed to load templates:', error);
            }
        } else {
            const sampleTemplates = [
                {
                    id: 1,
                    name: 'Welcome Email',
                    type: 'EMAIL',
                    subject: 'Welcome to Our Service',
                    preview: 'Dear {{name}}, Welcome to our platform! We are ex...',
                    variables: ['name', 'company'],
                    status: 'active',
                    usage: 45,
                    successRate: 98.5,
                    version: 'v2',
                    tags: ['Onboarding', 'welcome', 'intro']
                },
                {
                    id: 2,
                    name: 'WhatsApp Follow-up',
                    type: 'WHATSAPP',
                    subject: '',
                    preview: 'Hi {{name}}, thank you for your interest in {{comp...',
                    variables: ['name', 'company', 'phone'],
                    status: 'active',
                    usage: 120,
                    successRate: 95.2,
                    version: 'v1',
                    tags: ['Follow-up', 'followup', 'quick']
                },
                {
                    id: 3,
                    name: 'SMS Reminder',
                    type: 'SMS',
                    subject: '',
                    preview: 'Hi {{name}}, this is a reminder about your upcomin...',
                    variables: ['name', 'company'],
                    status: 'active',
                    usage: 89,
                    successRate: 97.8,
                    version: 'v2',
                    tags: ['Reminder', 'reminder', 'notification']
                },
                {
                    id: 4,
                    name: 'Lead Qualification Email',
                    type: 'EMAIL',
                    subject: 'Quick Question About Your Requirements',
                    preview: 'Hello {{name}}, I noticed your interest in our se...',
                    variables: ['name', 'company', 'sender_name'],
                    status: 'active',
                    usage: 67,
                    successRate: 94.5,
                    version: 'v1',
                    tags: ['Sales', 'qualification', 'sales']
                },
                {
                    id: 5,
                    name: 'WhatsApp Offer',
                    type: 'WHATSAPP',
                    subject: '',
                    preview: 'Hi {{name}}! We have a special offer for {{company...',
                    variables: ['name', 'company'],
                    status: 'draft',
                    usage: 0,
                    successRate: 0,
                    version: 'v1',
                    tags: ['Promotion', 'offer', 'promotion']
                }
            ];
            setTemplates(sampleTemplates);
            localStorage.setItem('communicationTemplates', JSON.stringify(sampleTemplates));
        }
    }, []);

    const stats = {
        totalTemplates: templates.length,
        totalUsage: templates.reduce((sum, t) => sum + (t.usage || 0), 0),
        avgSuccessRate: templates.length > 0 
            ? (templates.reduce((sum, t) => sum + (t.successRate || 0), 0) / templates.length).toFixed(1)
            : 0,
        activeTemplates: templates.filter(t => t.status === 'active').length
    };

    const filteredTemplates = templates.filter(template => {
        const matchesSearch = !searchTerm || 
            template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.preview?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = typeFilter === 'all' || template.type === typeFilter;
        const matchesActiveType = activeTypeFilter === 'all' || 
            (activeTypeFilter === 'email' && template.type === 'EMAIL') ||
            (activeTypeFilter === 'whatsapp' && template.type === 'WHATSAPP') ||
            (activeTypeFilter === 'sms' && template.type === 'SMS');
        return matchesSearch && matchesType && matchesActiveType;
    });

    const columns = [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: (info) => <span className="badge bg-light text-dark">#{info.getValue()}</span>
        },
        {
            accessorKey: 'name',
            header: 'Template Name',
            cell: (info) => {
                const template = info.row.original;
                return (
                    <div>
                        <div className="fw-bold">{info.getValue()}</div>
                        <div className="d-flex gap-1 mt-1">
                            {template.tags?.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="badge bg-light text-dark" style={{ fontSize: '10px' }}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: 'type',
            header: 'Type',
            cell: (info) => {
                const type = info.getValue();
                const colors = { EMAIL: 'primary', WHATSAPP: 'success', SMS: 'info' };
                return <span className={`badge bg-${colors[type] || 'secondary'}`}>{type}</span>;
            }
        },
        {
            accessorKey: 'preview',
            header: 'Subject/Preview',
            cell: (info) => {
                const template = info.row.original;
                return (
                    <div>
                        {template.subject && <div className="fw-semibold">{template.subject}</div>}
                        <div className="text-muted small">{info.getValue()}</div>
                    </div>
                );
            }
        },
        {
            accessorKey: 'variables',
            header: 'Variables',
            cell: (info) => {
                const vars = info.getValue() || [];
                return (
                    <div className="d-flex gap-1 flex-wrap">
                        {vars.map((v, idx) => (
                            <span key={idx} className="badge bg-secondary" style={{ fontSize: '10px' }}>
                                {v}
                            </span>
                        ))}
                    </div>
                );
            }
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: (info) => {
                const status = info.getValue();
                return (
                    <span className={`badge ${status === 'active' ? 'bg-success' : 'bg-warning'}`}>
                        {status === 'active' ? 'Active' : 'Draft'}
                    </span>
                );
            }
        },
        {
            accessorKey: 'usage',
            header: 'Stats',
            cell: (info) => {
                const template = info.row.original;
                return (
                    <div>
                        <div>{template.usage} uses</div>
                        {template.successRate > 0 && (
                            <small className="text-muted">{template.successRate}% success</small>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: 'version',
            header: 'Version',
            cell: (info) => <span className="badge bg-warning">{info.getValue()}</span>
        },
        {
            accessorKey: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const actions = [
                    { label: 'Edit', icon: <FiEdit3 /> },
                    { label: 'Delete', icon: <FiTrash2 /> }
                ];
                return (
                    <Dropdown
                        dropdownItems={actions}
                        triggerClass="btn btn-sm btn-outline-secondary"
                        triggerIcon={<FiMoreHorizontal />}
                    />
                );
            }
        }
    ];

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h5 className="mb-0">Communication Templates</h5>
                    <p className="text-muted mb-0">Manage advanced templates for Email, WhatsApp, and SMS</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary">
                        <FiDownload className="me-1" />
                        Import Template
                    </button>
                    <button className="btn btn-primary">
                        <FiPlus className="me-1" />
                        Create Template
                    </button>
                </div>
            </div>

            {/* Summary Statistics */}
            <div className="row mb-4">
                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border">
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h6 className="text-muted mb-1">Total Templates</h6>
                                    <h3 className="mb-0">{stats.totalTemplates}</h3>
                                </div>
                                <div className="avatar-text avatar-lg bg-primary">
                                    <FiFileText size={24} />
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
                                    <h6 className="text-muted mb-1">Total Usage</h6>
                                    <h3 className="mb-0">{stats.totalUsage}</h3>
                                </div>
                                <div className="avatar-text avatar-lg bg-info">
                                    <FiBarChart2 size={24} />
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
                                    <h6 className="text-muted mb-1">Avg Success Rate</h6>
                                    <h3 className="mb-0">{stats.avgSuccessRate}%</h3>
                                </div>
                                <div className="avatar-text avatar-lg bg-success">
                                    <FiBarChart2 size={24} />
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
                                    <h6 className="text-muted mb-1">Active Templates</h6>
                                    <h3 className="mb-0">{stats.activeTemplates}</h3>
                                </div>
                                <div className="avatar-text avatar-lg bg-warning">
                                    <FiCheckCircle size={24} />
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
                    placeholder="Search templates by name, content, or tags..."
                    style={{ width: '300px' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="d-flex gap-2">
                    <select
                        className="form-select"
                        style={{ width: '150px' }}
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="EMAIL">Email</option>
                        <option value="WHATSAPP">WhatsApp</option>
                        <option value="SMS">SMS</option>
                    </select>
                </div>
            </div>

            {/* Type Tabs */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <ul className="nav nav-tabs" role="tablist">
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTypeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTypeFilter('all')}
                        >
                            All Templates
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTypeFilter === 'email' ? 'active' : ''}`}
                            onClick={() => setActiveTypeFilter('email')}
                        >
                            Email Templates
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTypeFilter === 'whatsapp' ? 'active' : ''}`}
                            onClick={() => setActiveTypeFilter('whatsapp')}
                        >
                            WhatsApp Templates
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTypeFilter === 'sms' ? 'active' : ''}`}
                            onClick={() => setActiveTypeFilter('sms')}
                        >
                            SMS Templates
                        </button>
                    </li>
                </ul>
                <button className="btn btn-outline-primary">
                    <FiBarChart2 className="me-1" />
                    View Analytics
                </button>
            </div>

            {/* Templates Table */}
            <Table
                data={filteredTemplates}
                columns={columns}
                emptyMessage="No templates found"
            />
        </div>
    );
};

export default TemplatesTab;


