import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import { FiArrowLeft, FiDownload, FiPlus, FiFileText, FiBarChart2, FiCheckCircle, FiEdit3, FiTrash2, FiMoreHorizontal, FiSearch, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Table from '@/components/shared/table/Table';
import Dropdown from '@/components/shared/Dropdown';

const TemplatesPage = () => {
    const [templates, setTemplates] = useState([]);
    const [activeTypeFilter, setActiveTypeFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

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
                    preview: 'Namaste {{name}}, Welcome to our platform! We are excited to have you on board...',
                    content: 'Namaste {{name}},\n\nWelcome to our platform! We are excited to have you on board.\n\nBest regards,\n{{sender_name}}',
                    variables: ['name', 'company', 'sender_name'],
                    status: 'active',
                    usage: 45,
                    successRate: 98.5,
                    version: 'v2',
                    tags: ['Onboarding', 'welcome', 'intro'],
                    createdAt: '2024-01-15',
                    updatedAt: '2024-01-20'
                },
                {
                    id: 2,
                    name: 'WhatsApp Follow-up',
                    type: 'WHATSAPP',
                    subject: '',
                    preview: 'Namaste {{name}}, thank you for your interest in {{company}}. We would like to follow up...',
                    content: 'Namaste {{name}}, thank you for your interest in {{company}}. We would like to follow up with you regarding your inquiry.',
                    variables: ['name', 'company', 'phone'],
                    status: 'active',
                    usage: 120,
                    successRate: 95.2,
                    version: 'v1',
                    tags: ['Follow-up', 'followup', 'quick'],
                    createdAt: '2024-01-10',
                    updatedAt: '2024-01-10'
                },
                {
                    id: 3,
                    name: 'SMS Reminder',
                    type: 'SMS',
                    subject: '',
                    preview: 'Hi {{name}}, this is a reminder about your upcoming appointment...',
                    content: 'Hi {{name}}, this is a reminder about your upcoming appointment on {{date}}. Please confirm your attendance.',
                    variables: ['name', 'date'],
                    status: 'active',
                    usage: 89,
                    successRate: 97.8,
                    version: 'v2',
                    tags: ['Reminder', 'reminder', 'notification'],
                    createdAt: '2024-01-08',
                    updatedAt: '2024-01-18'
                },
                {
                    id: 4,
                    name: 'Lead Qualification Email',
                    type: 'EMAIL',
                    subject: 'Quick Question About Your Requirements',
                    preview: 'Hello {{name}}, I noticed your interest in our services...',
                    content: 'Hello {{name}},\n\nI noticed your interest in our services. Could you please provide more details about your requirements?\n\nBest regards,\n{{sender_name}}',
                    variables: ['name', 'company', 'sender_name'],
                    status: 'active',
                    usage: 67,
                    successRate: 94.5,
                    version: 'v1',
                    tags: ['Sales', 'qualification', 'sales'],
                    createdAt: '2024-01-12',
                    updatedAt: '2024-01-12'
                },
                {
                    id: 5,
                    name: 'WhatsApp Offer',
                    type: 'WHATSAPP',
                    subject: '',
                    preview: 'Hi {{name}}! We have a special offer for {{company}}...',
                    content: 'Hi {{name}}! We have a special offer for {{company}}. Limited time only!',
                    variables: ['name', 'company'],
                    status: 'draft',
                    usage: 0,
                    successRate: 0,
                    version: 'v1',
                    tags: ['Promotion', 'offer', 'promotion'],
                    createdAt: '2024-01-22',
                    updatedAt: '2024-01-22'
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

    const handleDelete = (templateId) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            const updated = templates.filter(t => t.id !== templateId);
            setTemplates(updated);
            localStorage.setItem('communicationTemplates', JSON.stringify(updated));
            toast.success('Template deleted successfully');
        }
    };

    const handleEdit = (template) => {
        setSelectedTemplate(template);
        setShowEditModal(true);
    };

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
                const template = row.original;
                const actions = [
                    { label: 'Edit', icon: <FiEdit3 />, onClick: () => handleEdit(template) },
                    { label: 'Delete', icon: <FiTrash2 />, onClick: () => handleDelete(template.id) }
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
        <>
            <PageHeader>
                <div className="d-flex align-items-center justify-content-between w-100 gap-2">
                    <Link to="/leads/all-leads" className="btn btn-light">
                        <FiArrowLeft size={16} className='me-2' />
                        <span>Back to Leads</span>
                    </Link>
                    <div className="d-flex gap-2">
                        <button 
                            className="btn btn-outline-primary"
                            onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = '.json';
                                input.onchange = (e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                            try {
                                                const imported = JSON.parse(event.target.result);
                                                if (Array.isArray(imported)) {
                                                    setTemplates([...templates, ...imported]);
                                                    localStorage.setItem('communicationTemplates', JSON.stringify([...templates, ...imported]));
                                                    toast.success(`Imported ${imported.length} template(s) successfully!`);
                                                } else {
                                                    console.log('Invalid template file format');
                                                    // toast.error('Invalid template file format');
                                                }
                                            } catch (error) {
                                                console.log('Failed to import template: ' + error.message);
                                                // toast.error('Failed to import template: ' + error.message);
                                            }
                                        };
                                        reader.readAsText(file);
                                    }
                                };
                                input.click();
                            }}
                        >
                            <FiDownload className="me-1" />
                            Import Template
                        </button>
                        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                            <FiPlus className="me-1" />
                            Create Template
                        </button>
                    </div>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <div className="col-lg-12">
                        <div className="card">
                            <div className="card-header">
                                <div>
                                    <h5 className="card-title mb-0">Communication Templates</h5>
                                    <p className="text-muted mb-0">Manage advanced templates for Email, WhatsApp, and SMS</p>
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
                                                        <h6 className="text-muted mb-1">Total Templates</h6>
                                                        <h3 className="mb-0">{stats.totalTemplates}</h3>
                                                    </div>
                                                    <div className="avatar-text avatar-lg bg-primary">
                                                        <FiFileText className="text-white" size={24} />
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
                                                        <FiBarChart2 className="text-white" size={24} />
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
                                                        <FiBarChart2 className="text-white" size={24} />
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
                                                        <FiCheckCircle className="text-white" size={24} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                                    <div className="input-group" style={{ width: '300px' }}>
                                        <span className="input-group-text"><FiSearch /></span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search templates by name, content, or tags..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
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
                                    <button 
                                        className="btn btn-outline-primary"
                                        onClick={() => toast.info('Template analytics coming soon!')}
                                    >
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Template Modal */}
            {showCreateModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Create New Template</h5>
                                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="alert alert-info">
                                    Template creation form will be implemented here
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary"
                                    onClick={() => {
                                        toast.info('Template creation form will be implemented here');
                                        setShowCreateModal(false);
                                    }}
                                >
                                    Create Template
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Template Modal */}
            {showEditModal && selectedTemplate && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Template</h5>
                                <button type="button" className="btn-close" onClick={() => {
                                    setShowEditModal(false);
                                    setSelectedTemplate(null);
                                }}></button>
                            </div>
                            <div className="modal-body">
                                <div className="alert alert-info">
                                    Template editing form will be implemented here
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Template Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        defaultValue={selectedTemplate.name || ''}
                                        readOnly
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Type</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        defaultValue={selectedTemplate.type || ''}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => {
                                    setShowEditModal(false);
                                    setSelectedTemplate(null);
                                }}>
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary"
                                    onClick={() => {
                                        toast.info('Template editing form will be implemented here');
                                        setShowEditModal(false);
                                        setSelectedTemplate(null);
                                    }}
                                >
                                    Update Template
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

export default TemplatesPage;

