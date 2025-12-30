import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit3, FiMail, FiPhone, FiMessageSquare, FiClock, FiChevronDown, FiChevronRight, FiCopy, FiMove, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { toast } from 'react-toastify';
import SelectDropdown from '@/components/shared/SelectDropdown';
import TextArea from '@/components/shared/TextArea';
import Input from '@/components/shared/Input';

const ACTION_TYPES = [
    { value: 'whatsapp', label: 'WhatsApp', icon: <FaWhatsapp />, color: '#25D366' },
    { value: 'sms', label: 'SMS', icon: <FiMessageSquare />, color: '#007bff' },
    { value: 'email', label: 'Email', icon: <FiMail />, color: '#6c757d' },
    { value: 'call', label: 'Call', icon: <FiPhone />, color: '#28a745' },
    { value: 'delay', label: 'Delay', icon: <FiClock />, color: '#ffc107' },
    { value: 'condition', label: 'Condition', icon: <FiChevronDown />, color: '#17a2b8' }
];

const DELAY_UNITS = [
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' }
];

const TRIGGER_CONDITIONS = [
    { value: 'lead_created', label: 'New Lead Created' },
    { value: 'lead_qualified', label: 'Lead Qualified' },
    { value: 'no_response_3_days', label: 'No Response (3 days)' },
    { value: 'no_response_7_days', label: 'No Response (7 days)' },
    { value: 'lead_lost', label: 'Lead Lost' },
    { value: 'lead_converted', label: 'Lead Converted' },
    { value: 'custom', label: 'Custom Condition' }
];

const WorkflowBuilder = ({ workflow, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: workflow?.name || '',
        description: workflow?.description || '',
        trigger: workflow?.trigger || 'lead_created',
        status: workflow?.status || 'active',
        steps: workflow?.steps || []
    });

    const [editingStepIndex, setEditingStepIndex] = useState(null);
    const [expandedSteps, setExpandedSteps] = useState(new Set());

    useEffect(() => {
        // Load templates from localStorage or context
        loadTemplates();
    }, []);

    const loadTemplates = () => {
        // This would load templates from context or API
        // For now, we'll use mock data
    };

    const addStep = (type) => {
        const newStep = {
            id: Date.now(),
            type: type,
            order: formData.steps.length + 1,
            ...getDefaultStepData(type)
        };
        setFormData({
            ...formData,
            steps: [...formData.steps, newStep]
        });
        setEditingStepIndex(formData.steps.length);
        setExpandedSteps(new Set([...expandedSteps, newStep.id]));
    };

    const getDefaultStepData = (type) => {
        switch (type) {
            case 'whatsapp':
                return {
                    phoneField: 'mobile',
                    message: '',
                    templateId: null,
                    delay: 0,
                    delayUnit: 'minutes'
                };
            case 'sms':
                return {
                    phoneField: 'mobile',
                    message: '',
                    templateId: null,
                    delay: 0,
                    delayUnit: 'minutes'
                };
            case 'email':
                return {
                    emailField: 'email',
                    subject: '',
                    body: '',
                    templateId: null,
                    cc: '',
                    bcc: '',
                    delay: 0,
                    delayUnit: 'minutes'
                };
            case 'call':
                return {
                    phoneField: 'mobile',
                    callType: 'outbound',
                    notes: '',
                    delay: 0,
                    delayUnit: 'minutes'
                };
            case 'delay':
                return {
                    delay: 60,
                    delayUnit: 'minutes'
                };
            case 'condition':
                return {
                    conditionType: 'lead_status',
                    operator: 'equals',
                    value: '',
                    trueSteps: [],
                    falseSteps: []
                };
            default:
                return {};
        }
    };

    const updateStep = (index, updates) => {
        const updatedSteps = [...formData.steps];
        updatedSteps[index] = { ...updatedSteps[index], ...updates };
        setFormData({ ...formData, steps: updatedSteps });
    };

    const deleteStep = (index) => {
        const updatedSteps = formData.steps.filter((_, i) => i !== index);
        // Reorder steps
        updatedSteps.forEach((step, i) => {
            step.order = i + 1;
        });
        setFormData({ ...formData, steps: updatedSteps });
        if (editingStepIndex === index) {
            setEditingStepIndex(null);
        }
    };

    const duplicateStep = (index) => {
        const step = formData.steps[index];
        const newStep = {
            ...JSON.parse(JSON.stringify(step)),
            id: Date.now(),
            order: formData.steps.length + 1
        };
        setFormData({
            ...formData,
            steps: [...formData.steps, newStep]
        });
    };

    const moveStep = (index, direction) => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === formData.steps.length - 1)) {
            return;
        }
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        const updatedSteps = [...formData.steps];
        [updatedSteps[index], updatedSteps[newIndex]] = [updatedSteps[newIndex], updatedSteps[index]];
        updatedSteps.forEach((step, i) => {
            step.order = i + 1;
        });
        setFormData({ ...formData, steps: updatedSteps });
    };

    const toggleStepExpanded = (stepId) => {
        const newExpanded = new Set(expandedSteps);
        if (newExpanded.has(stepId)) {
            newExpanded.delete(stepId);
        } else {
            newExpanded.add(stepId);
        }
        setExpandedSteps(newExpanded);
    };

    const validateWorkflow = () => {
        if (!formData.name.trim()) {
            toast.error('Please enter a workflow name');
            return false;
        }
        if (formData.steps.length === 0) {
            toast.error('Please add at least one step to the workflow');
            return false;
        }
        // Validate each step
        for (let i = 0; i < formData.steps.length; i++) {
            const step = formData.steps[i];
            if (step.type === 'whatsapp' || step.type === 'sms') {
                if (!step.message && !step.templateId) {
                    toast.error(`Step ${i + 1}: Please provide a message or select a template`);
                    return false;
                }
            } else if (step.type === 'email') {
                if (!step.subject || !step.body) {
                    toast.error(`Step ${i + 1}: Please provide email subject and body`);
                    return false;
                }
            }
        }
        return true;
    };

    const handleSave = () => {
        if (!validateWorkflow()) {
            return;
        }
        onSave(formData);
    };

    const renderStepEditor = (step, index) => {
        const actionType = ACTION_TYPES.find(t => t.value === step.type);
        const isExpanded = expandedSteps.has(step.id);
        const isEditing = editingStepIndex === index;

        return (
            <div key={step.id} className="card mb-3 border">
                <div className="card-header bg-light d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                        <button
                            className="btn btn-sm btn-link p-0"
                            onClick={() => toggleStepExpanded(step.id)}
                        >
                            {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                        </button>
                        <span className="badge" style={{ backgroundColor: actionType?.color, color: 'white' }}>
                            {actionType?.icon} {actionType?.label}
                        </span>
                        <span className="text-muted">Step {step.order}</span>
                    </div>
                    <div className="d-flex gap-1">
                        {index > 0 && (
                            <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => moveStep(index, 'up')}
                                title="Move Up"
                            >
                                ↑
                            </button>
                        )}
                        {index < formData.steps.length - 1 && (
                            <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => moveStep(index, 'down')}
                                title="Move Down"
                            >
                                ↓
                            </button>
                        )}
                        <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => duplicateStep(index)}
                            title="Duplicate"
                        >
                            <FiCopy size={14} />
                        </button>
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteStep(index)}
                            title="Delete"
                        >
                            <FiTrash2 size={14} />
                        </button>
                    </div>
                </div>
                {isExpanded && (
                    <div className="card-body">
                        {step.type === 'whatsapp' && renderWhatsAppStep(step, index)}
                        {step.type === 'sms' && renderSMSStep(step, index)}
                        {step.type === 'email' && renderEmailStep(step, index)}
                        {step.type === 'call' && renderCallStep(step, index)}
                        {step.type === 'delay' && renderDelayStep(step, index)}
                        {step.type === 'condition' && renderConditionStep(step, index)}
                        
                        {/* Delay Settings (for all action types except delay itself) */}
                        {step.type !== 'delay' && (
                            <div className="row mt-3">
                                <div className="col-md-6">
                                    <label className="form-label">Delay Before This Step</label>
                                    <div className="d-flex gap-2">
                                        <input
                                            type="number"
                                            className="form-control"
                                            min="0"
                                            value={step.delay || 0}
                                            onChange={(e) => updateStep(index, { delay: parseInt(e.target.value) || 0 })}
                                        />
                                        <select
                                            className="form-select"
                                            style={{ width: '150px' }}
                                            value={step.delayUnit || 'minutes'}
                                            onChange={(e) => updateStep(index, { delayUnit: e.target.value })}
                                        >
                                            {DELAY_UNITS.map(unit => (
                                                <option key={unit.value} value={unit.value}>{unit.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderWhatsAppStep = (step, index) => {
        return (
            <div>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Phone Number Field</label>
                        <select
                            className="form-select"
                            value={step.phoneField || 'mobile'}
                            onChange={(e) => updateStep(index, { phoneField: e.target.value })}
                        >
                            <option value="mobile">Mobile</option>
                            <option value="phone">Phone</option>
                            <option value="emergencyContactPhone">Emergency Contact</option>
                        </select>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Template (Optional)</label>
                        <select
                            className="form-select"
                            value={step.templateId || ''}
                            onChange={(e) => updateStep(index, { templateId: e.target.value || null })}
                        >
                            <option value="">None - Use Custom Message</option>
                            <option value="1">Welcome Template</option>
                            <option value="2">Follow-up Template</option>
                            <option value="3">Reminder Template</option>
                        </select>
                    </div>
                </div>
                <div className="mb-3">
                    <label className="form-label">Message {!step.templateId && <span className="text-danger">*</span>}</label>
                    <TextArea
                        rows={4}
                        value={step.message || ''}
                        onChange={(e) => updateStep(index, { message: e.target.value })}
                        placeholder="Enter WhatsApp message... You can use variables like {{fullName}}, {{mobile}}, {{email}}"
                        disabled={!!step.templateId}
                    />
                    <small className="text-muted">Available variables: {{fullName}}, {{mobile}}, {{email}}, {{leadStatus}}, {{campaignName}}</small>
                </div>
            </div>
        );
    };

    const renderSMSStep = (step, index) => {
        return (
            <div>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Phone Number Field</label>
                        <select
                            className="form-select"
                            value={step.phoneField || 'mobile'}
                            onChange={(e) => updateStep(index, { phoneField: e.target.value })}
                        >
                            <option value="mobile">Mobile</option>
                            <option value="phone">Phone</option>
                            <option value="emergencyContactPhone">Emergency Contact</option>
                        </select>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Template (Optional)</label>
                        <select
                            className="form-select"
                            value={step.templateId || ''}
                            onChange={(e) => updateStep(index, { templateId: e.target.value || null })}
                        >
                            <option value="">None - Use Custom Message</option>
                            <option value="1">SMS Welcome Template</option>
                            <option value="2">SMS Reminder Template</option>
                        </select>
                    </div>
                </div>
                <div className="mb-3">
                    <label className="form-label">Message {!step.templateId && <span className="text-danger">*</span>}</label>
                    <TextArea
                        rows={3}
                        value={step.message || ''}
                        onChange={(e) => updateStep(index, { message: e.target.value })}
                        placeholder="Enter SMS message (max 160 characters recommended)..."
                        disabled={!!step.templateId}
                        maxLength={500}
                    />
                    <small className="text-muted">
                        {step.message?.length || 0}/500 characters. Available variables: {{fullName}}, {{mobile}}, {{email}}
                    </small>
                </div>
            </div>
        );
    };

    const renderEmailStep = (step, index) => {
        return (
            <div>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Email Field</label>
                        <select
                            className="form-select"
                            value={step.emailField || 'email'}
                            onChange={(e) => updateStep(index, { emailField: e.target.value })}
                        >
                            <option value="email">Email</option>
                            <option value="alternateEmail">Alternate Email</option>
                        </select>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Template (Optional)</label>
                        <select
                            className="form-select"
                            value={step.templateId || ''}
                            onChange={(e) => updateStep(index, { templateId: e.target.value || null })}
                        >
                            <option value="">None - Use Custom Email</option>
                            <option value="1">Welcome Email Template</option>
                            <option value="2">Follow-up Email Template</option>
                            <option value="3">Newsletter Template</option>
                        </select>
                    </div>
                </div>
                <div className="mb-3">
                    <label className="form-label">Subject <span className="text-danger">*</span></label>
                    <Input
                        value={step.subject || ''}
                        onChange={(e) => updateStep(index, { subject: e.target.value })}
                        placeholder="Email subject..."
                        disabled={!!step.templateId}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Body <span className="text-danger">*</span></label>
                    <TextArea
                        rows={6}
                        value={step.body || ''}
                        onChange={(e) => updateStep(index, { body: e.target.value })}
                        placeholder="Email body... You can use HTML or plain text. Variables: {{fullName}}, {{mobile}}, {{email}}"
                        disabled={!!step.templateId}
                    />
                </div>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">CC (Optional)</label>
                        <Input
                            value={step.cc || ''}
                            onChange={(e) => updateStep(index, { cc: e.target.value })}
                            placeholder="cc@example.com"
                            type="email"
                        />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">BCC (Optional)</label>
                        <Input
                            value={step.bcc || ''}
                            onChange={(e) => updateStep(index, { bcc: e.target.value })}
                            placeholder="bcc@example.com"
                            type="email"
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderCallStep = (step, index) => {
        return (
            <div>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Phone Number Field</label>
                        <select
                            className="form-select"
                            value={step.phoneField || 'mobile'}
                            onChange={(e) => updateStep(index, { phoneField: e.target.value })}
                        >
                            <option value="mobile">Mobile</option>
                            <option value="phone">Phone</option>
                            <option value="emergencyContactPhone">Emergency Contact</option>
                        </select>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Call Type</label>
                        <select
                            className="form-select"
                            value={step.callType || 'outbound'}
                            onChange={(e) => updateStep(index, { callType: e.target.value })}
                        >
                            <option value="outbound">Outbound Call</option>
                            <option value="callback">Schedule Callback</option>
                            <option value="reminder">Call Reminder</option>
                        </select>
                    </div>
                </div>
                <div className="mb-3">
                    <label className="form-label">Call Notes / Script</label>
                    <TextArea
                        rows={4}
                        value={step.notes || ''}
                        onChange={(e) => updateStep(index, { notes: e.target.value })}
                        placeholder="Enter call notes or script for the agent..."
                    />
                    <small className="text-muted">This will be shown to the agent when making the call</small>
                </div>
            </div>
        );
    };

    const renderDelayStep = (step, index) => {
        return (
            <div>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Delay Duration</label>
                        <input
                            type="number"
                            className="form-control"
                            min="0"
                            value={step.delay || 60}
                            onChange={(e) => updateStep(index, { delay: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Unit</label>
                        <select
                            className="form-select"
                            value={step.delayUnit || 'minutes'}
                            onChange={(e) => updateStep(index, { delayUnit: e.target.value })}
                        >
                            {DELAY_UNITS.map(unit => (
                                <option key={unit.value} value={unit.value}>{unit.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        );
    };

    const renderConditionStep = (step, index) => {
        return (
            <div>
                <div className="alert alert-info">
                    <FiAlertCircle className="me-2" />
                    Conditional branching will be implemented in the next phase
                </div>
                <div className="row">
                    <div className="col-md-4 mb-3">
                        <label className="form-label">Condition Type</label>
                        <select
                            className="form-select"
                            value={step.conditionType || 'lead_status'}
                            onChange={(e) => updateStep(index, { conditionType: e.target.value })}
                        >
                            <option value="lead_status">Lead Status</option>
                            <option value="lead_source">Lead Source</option>
                            <option value="campaign">Campaign</option>
                            <option value="score">Lead Score</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                    <div className="col-md-4 mb-3">
                        <label className="form-label">Operator</label>
                        <select
                            className="form-select"
                            value={step.operator || 'equals'}
                            onChange={(e) => updateStep(index, { operator: e.target.value })}
                        >
                            <option value="equals">Equals</option>
                            <option value="not_equals">Not Equals</option>
                            <option value="contains">Contains</option>
                            <option value="greater_than">Greater Than</option>
                            <option value="less_than">Less Than</option>
                        </select>
                    </div>
                    <div className="col-md-4 mb-3">
                        <label className="form-label">Value</label>
                        <Input
                            value={step.value || ''}
                            onChange={(e) => updateStep(index, { value: e.target.value })}
                            placeholder="Condition value..."
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            {/* Basic Information */}
            <div className="card mb-4">
                <div className="card-header">
                    <h6 className="mb-0">Workflow Information</h6>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Workflow Name <span className="text-danger">*</span></label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., New Lead Welcome Sequence"
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Trigger Condition</label>
                            <select
                                className="form-select"
                                value={formData.trigger}
                                onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                            >
                                {TRIGGER_CONDITIONS.map(trigger => (
                                    <option key={trigger.value} value={trigger.value}>{trigger.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Description</label>
                        <TextArea
                            rows={2}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe what this workflow does..."
                        />
                    </div>
                </div>
            </div>

            {/* Workflow Steps */}
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Workflow Steps ({formData.steps.length})</h6>
                    <div className="btn-group">
                        <button
                            className="btn btn-primary btn-sm dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <FiPlus size={14} className="me-1" />
                            Add Step
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            {ACTION_TYPES.map(type => (
                                <li key={type.value}>
                                    <button
                                        className="dropdown-item"
                                        type="button"
                                        onClick={() => addStep(type.value)}
                                    >
                                        <span style={{ color: type.color, marginRight: '8px' }}>
                                            {type.icon}
                                        </span>
                                        {type.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="card-body">
                    {formData.steps.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <p>No steps added yet. Click "Add Step" to start building your workflow.</p>
                        </div>
                    ) : (
                        formData.steps.map((step, index) => renderStepEditor(step, index))
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                    <FiCheck className="me-1" />
                    {workflow ? 'Update Workflow' : 'Create Workflow'}
                </button>
            </div>
        </div>
    );
};

export default WorkflowBuilder;

