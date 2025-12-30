import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import { FiArrowLeft, FiPlus, FiEdit3, FiTrash2, FiPlay, FiPause, FiCheck, FiX, FiSettings, FiClock, FiMail, FiPhone, FiMessageSquare, FiFilter, FiSearch, FiUsers, FiChevronDown } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Table from '@/components/shared/table/Table';
import WorkflowBuilder from '@/components/leads/WorkflowBuilder';

const LeadsWorkflows = () => {
    const [workflows, setWorkflows] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingWorkflow, setEditingWorkflow] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadWorkflows();
    }, []);

    const loadWorkflows = () => {
        const saved = localStorage.getItem('leadWorkflows');
        if (saved) {
            try {
                setWorkflows(JSON.parse(saved));
            } catch (error) {
                console.error('Failed to load workflows:', error);
            }
        } else {
            // Initialize with sample workflows
            const sampleWorkflows = [
                {
                    id: 1,
                    name: 'New Lead Welcome Sequence',
                    description: 'Automatically welcome new leads with email and SMS',
                    trigger: 'lead_created',
                    status: 'active',
                    steps: [
                        { type: 'email', delay: 0, template: 'Welcome Email' },
                        { type: 'sms', delay: 60, template: 'Welcome SMS' },
                        { type: 'email', delay: 1440, template: 'Follow-up Email' }
                    ],
                    leadsProcessed: 245,
                    successRate: 98.5,
                    createdAt: '2024-01-15',
                    updatedAt: '2024-01-20'
                },
                {
                    id: 2,
                    name: 'Lead Nurturing Campaign',
                    description: 'Nurture leads over 7 days with educational content',
                    trigger: 'lead_qualified',
                    status: 'active',
                    steps: [
                        { type: 'email', delay: 0, template: 'Qualification Email' },
                        { type: 'email', delay: 1440, template: 'Educational Content' },
                        { type: 'email', delay: 2880, template: 'Case Study' },
                        { type: 'email', delay: 4320, template: 'Final Offer' }
                    ],
                    leadsProcessed: 189,
                    successRate: 95.2,
                    createdAt: '2024-01-10',
                    updatedAt: '2024-01-18'
                },
                {
                    id: 3,
                    name: 'Abandoned Lead Re-engagement',
                    description: 'Re-engage leads that haven\'t responded in 3 days',
                    trigger: 'no_response_3_days',
                    status: 'paused',
                    steps: [
                        { type: 'email', delay: 0, template: 'Re-engagement Email' },
                        { type: 'sms', delay: 1440, template: 'Re-engagement SMS' }
                    ],
                    leadsProcessed: 78,
                    successRate: 87.3,
                    createdAt: '2024-01-08',
                    updatedAt: '2024-01-15'
                }
            ];
            setWorkflows(sampleWorkflows);
            localStorage.setItem('leadWorkflows', JSON.stringify(sampleWorkflows));
        }
    };

    const saveWorkflows = (workflowsToSave) => {
        localStorage.setItem('leadWorkflows', JSON.stringify(workflowsToSave));
        setWorkflows(workflowsToSave);
    };

    const filteredWorkflows = workflows.filter(workflow => {
        const matchesSearch = !searchTerm || 
            workflow.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            workflow.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleDelete = (workflowId) => {
        if (window.confirm('Are you sure you want to delete this workflow?')) {
            const updated = workflows.filter(w => w.id !== workflowId);
            saveWorkflows(updated);
            toast.success('Workflow deleted successfully');
        }
    };

    const handleToggleStatus = (workflowId) => {
        const updated = workflows.map(w => {
            if (w.id === workflowId) {
                return { ...w, status: w.status === 'active' ? 'paused' : 'active' };
            }
            return w;
        });
        saveWorkflows(updated);
        toast.success(`Workflow ${updated.find(w => w.id === workflowId).status === 'active' ? 'activated' : 'paused'} successfully`);
    };

    const handleCreate = () => {
        setEditingWorkflow(null);
        setShowCreateModal(true);
    };

    const handleEdit = (workflow) => {
        setEditingWorkflow(workflow);
        setShowCreateModal(true);
    };

    const handleSaveWorkflow = (workflowData) => {
        if (editingWorkflow) {
            const updated = workflows.map(w => 
                w.id === editingWorkflow.id 
                    ? { ...w, ...workflowData, updatedAt: new Date().toISOString().split('T')[0] }
                    : w
            );
            saveWorkflows(updated);
            toast.success('Workflow updated successfully');
        } else {
            const newWorkflow = {
                id: Date.now(),
                ...workflowData,
                leadsProcessed: 0,
                successRate: 0,
                createdAt: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString().split('T')[0]
            };
            saveWorkflows([...workflows, newWorkflow]);
            toast.success('Workflow created successfully');
        }
        setShowCreateModal(false);
        setEditingWorkflow(null);
    };

    const columns = [
        {
            accessorKey: 'name',
            header: 'Workflow Name',
            cell: (info) => {
                const workflow = info.row.original;
                return (
                    <div>
                        <div className="fw-bold">{info.getValue()}</div>
                        <small className="text-muted">{workflow.description}</small>
                    </div>
                );
            }
        },
        {
            accessorKey: 'trigger',
            header: 'Trigger',
            cell: (info) => {
                const trigger = info.getValue();
                const labels = {
                    'lead_created': 'New Lead Created',
                    'lead_qualified': 'Lead Qualified',
                    'no_response_3_days': 'No Response (3 days)',
                    'lead_lost': 'Lead Lost',
                    'custom': 'Custom Condition'
                };
                return <span className="badge bg-info">{labels[trigger] || trigger}</span>;
            }
        },
        {
            accessorKey: 'steps',
            header: 'Steps',
            cell: (info) => {
                const steps = info.getValue() || [];
                return (
                    <div>
                        <span className="badge bg-secondary">{steps.length} steps</span>
                        <div className="d-flex gap-1 mt-1">
                            {steps.slice(0, 4).map((step, idx) => {
                                const icons = {
                                    email: <FiMail size={12} />,
                                    sms: <FiMessageSquare size={12} />,
                                    call: <FiPhone size={12} />,
                                    whatsapp: <FaWhatsapp size={12} />,
                                    delay: <FiClock size={12} />,
                                    condition: <FiChevronDown size={12} />
                                };
                                const colors = {
                                    email: '#6c757d',
                                    sms: '#007bff',
                                    call: '#28a745',
                                    whatsapp: '#25D366',
                                    delay: '#ffc107',
                                    condition: '#17a2b8'
                                };
                                const delayText = step.delay > 0 
                                    ? `${step.delay}${step.delayUnit === 'minutes' ? 'm' : step.delayUnit === 'hours' ? 'h' : 'd'}`
                                    : 'Immediate';
                                return (
                                    <span 
                                        key={idx} 
                                        className="badge" 
                                        style={{ 
                                            fontSize: '10px',
                                            backgroundColor: colors[step.type] || '#6c757d',
                                            color: 'white'
                                        }}
                                    >
                                        {icons[step.type] || <FiSettings size={12} />} {delayText}
                                    </span>
                                );
                            })}
                            {steps.length > 4 && (
                                <span className="badge bg-light text-dark" style={{ fontSize: '10px' }}>
                                    +{steps.length - 4} more
                                </span>
                            )}
                        </div>
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
                    <span className={`badge ${status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                        {status === 'active' ? 'Active' : 'Paused'}
                    </span>
                );
            }
        },
        {
            accessorKey: 'leadsProcessed',
            header: 'Leads Processed',
            cell: (info) => <span className="badge bg-primary">{info.getValue()}</span>
        },
        {
            accessorKey: 'successRate',
            header: 'Success Rate',
            cell: (info) => {
                const rate = info.getValue();
                return (
                    <span className={`badge ${rate >= 95 ? 'bg-success' : rate >= 85 ? 'bg-warning' : 'bg-danger'}`}>
                        {rate}%
                    </span>
                );
            }
        },
        {
            accessorKey: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const workflow = row.original;
                return (
                    <div className="d-flex gap-1">
                        <button
                            className="avatar-text avatar-md"
                            onClick={() => handleEdit(workflow)}
                            title="Edit"
                        >
                            <FiEdit3 size={14} />
                        </button>
                        <button
                            className={`avatar-text avatar-md ${workflow.status === 'active' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                            onClick={() => handleToggleStatus(workflow.id)}
                            title={workflow.status === 'active' ? 'Pause' : 'Activate'}
                        >
                            {workflow.status === 'active' ? <FiPause size={14} /> : <FiPlay size={14} />}
                        </button>
                        <button
                            className="avatar-text avatar-md"
                            onClick={() => handleDelete(workflow.id)}
                            title="Delete"
                        >
                            <FiTrash2 size={14} />
                        </button>
                    </div>
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
                    <button className="btn btn-primary" onClick={handleCreate}>
                        <FiPlus size={16} className='me-2' />
                        Create Workflow
                    </button>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <div className="col-lg-12">
                        <div className="card">
                            <div className="card-header">
                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                    <div>
                                        <h5 className="card-title mb-0">Automated Workflows</h5>
                                        <p className="text-muted mb-0">Create and manage automated lead nurturing sequences</p>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <div className="input-group" style={{ width: '250px' }}>
                                            <span className="input-group-text"><FiSearch /></span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Search workflows..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <select
                                            className="form-select"
                                            style={{ width: '150px' }}
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="all">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="paused">Paused</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                {/* Statistics */}
                                <div className="row mb-4">
                                    <div className="col-lg-3 col-md-6 mb-3">
                                        <div className="card border">
                                            <div className="card-body">
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div>
                                                        <h6 className="text-muted mb-1">Total Workflows</h6>
                                                        <h3 className="mb-0">{workflows.length}</h3>
                                                    </div>
                                                    <div className="avatar-text avatar-lg bg-primary">
                                                        <FiSettings className="text-white" size={24} />
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
                                                        <h6 className="text-muted mb-1">Active Workflows</h6>
                                                        <h3 className="mb-0">{workflows.filter(w => w.status === 'active').length}</h3>
                                                    </div>
                                                    <div className="avatar-text avatar-lg bg-success">
                                                        <FiPlay className="text-white" size={24} />
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
                                                        <h6 className="text-muted mb-1">Total Leads Processed</h6>
                                                        <h3 className="mb-0">{workflows.reduce((sum, w) => sum + (w.leadsProcessed || 0), 0)}</h3>
                                                    </div>
                                                    <div className="avatar-text avatar-lg bg-info">
                                                        <FiUsers className="text-white" size={24} />
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
                                                        <h3 className="mb-0">
                                                            {workflows.length > 0
                                                                ? (workflows.reduce((sum, w) => sum + (w.successRate || 0), 0) / workflows.length).toFixed(1)
                                                                : 0}%
                                                        </h3>
                                                    </div>
                                                    <div className="avatar-text avatar-lg bg-warning">
                                                        <FiCheck className="text-white" size={24} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Workflows Table */}
                                <Table
                                    data={filteredWorkflows}
                                    columns={columns}
                                    emptyMessage="No workflows found. Create your first automated workflow!"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Workflow Modal */}
            {showCreateModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-xl" style={{ maxWidth: '95%' }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setEditingWorkflow(null);
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                                <WorkflowBuilder
                                    workflow={editingWorkflow}
                                    onSave={handleSaveWorkflow}
                                    onCancel={() => {
                                        setShowCreateModal(false);
                                        setEditingWorkflow(null);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};

export default LeadsWorkflows;

