import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import PageHeaderSetting from '@/components/shared/pageHeader/PageHeaderSetting';
import Footer from '@/components/shared/Footer';
import SelectDropdown from '@/components/shared/SelectDropdown';
import { useWhatsApp } from '@/context/WhatsAppContext';
import { FiSend, FiClock, FiFileText, FiList, FiPlus, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight, FiCheckCircle, FiXCircle, FiZap } from 'react-icons/fi';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { ACTION_TYPE_OPTIONS, ACTION_TYPE_LABELS, ACTION_VARIABLES } from '@/utils/actionTypes';

const recurrenceOptions = [
  { value: 'once', label: 'Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const SettingsWhatsAppOnlyForm = () => {
  const [activeTab, setActiveTab] = useState('send');
  const {
    schedules,
    messageHistory,
    templates,
    sendMessage,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    toggleSchedule,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    testConnection,
    fetchSchedules,
    fetchMessageHistory,
    fetchTemplates,
    loading,
  } = useWhatsApp();

  // Send Message Form State
  const [sendForm, setSendForm] = useState({
    phone_number: '',
    message: '',
    template_id: '',
  });

  // Schedule Form State
  const [scheduleForm, setScheduleForm] = useState({
    phone_number: '',
    message: '',
    scheduled_time: '',
    recurrence: 'once',
    template_id: '',
    is_active: true,
  });

  // Template Form State
  const [templateForm, setTemplateForm] = useState({
    name: '',
    content: '',
    action_type: '',
    auto_send: false,
  });
  
  const [templateViewMode, setTemplateViewMode] = useState('all'); // 'all', 'action', 'manual'

  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    fetchSchedules();
    fetchTemplates();
  }, [fetchSchedules, fetchTemplates]);

  // Handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!sendForm.phone_number || !sendForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await sendMessage(sendForm);
      setSendForm({ phone_number: '', message: '', template_id: '' });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle create/update schedule
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleForm.phone_number || !scheduleForm.message || !scheduleForm.scheduled_time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, scheduleForm);
      } else {
        await createSchedule(scheduleForm);
      }
      setScheduleForm({
        phone_number: '',
        message: '',
        scheduled_time: '',
        recurrence: 'once',
        template_id: '',
        is_active: true,
      });
      setEditingSchedule(null);
      setShowScheduleModal(false);
    } catch (error) {
      console.error('Failed to save schedule:', error);
    }
  };

  // Handle edit schedule
  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      phone_number: schedule.phone_number || '',
      message: schedule.message || '',
      scheduled_time: schedule.scheduled_time ? dayjs(schedule.scheduled_time).format('YYYY-MM-DDTHH:mm') : '',
      recurrence: schedule.recurrence || 'once',
      template_id: schedule.template_id || '',
      is_active: schedule.is_active !== undefined ? schedule.is_active : true,
    });
    setShowScheduleModal(true);
  };

  // Handle delete schedule
  const handleDeleteSchedule = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this scheduled message?')) {
      try {
        await deleteSchedule(scheduleId);
      } catch (error) {
        console.error('Failed to delete schedule:', error);
      }
    }
  };

  // Handle toggle schedule
  const handleToggleSchedule = async (scheduleId, currentStatus) => {
    try {
      await toggleSchedule(scheduleId, !currentStatus);
    } catch (error) {
      console.error('Failed to toggle schedule:', error);
    }
  };

  // Handle create/update template
  const handleTemplateSubmit = async (e) => {
    e.preventDefault();
    if (!templateForm.name || !templateForm.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, templateForm);
      } else {
        await createTemplate(templateForm);
      }
      setTemplateForm({ name: '', content: '', action_type: '', auto_send: false });
      setEditingTemplate(null);
      setShowTemplateModal(false);
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  // Handle edit template
  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name || '',
      content: template.content || '',
      action_type: template.action_type || '',
      auto_send: template.auto_send || false,
    });
    setShowTemplateModal(true);
  };
  
  // Get available variables for selected action type
  const getAvailableVariables = () => {
    if (!templateForm.action_type) return [];
    return ACTION_VARIABLES[templateForm.action_type] || [];
  };
  
  // Filter templates by view mode
  const getFilteredTemplates = () => {
    if (templateViewMode === 'all') return templates;
    if (templateViewMode === 'action') return templates.filter(t => t.action_type);
    if (templateViewMode === 'manual') return templates.filter(t => !t.action_type);
    return templates;
  };

  // Handle delete template
  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate(templateId);
      } catch (error) {
        console.error('Failed to delete template:', error);
      }
    }
  };

  // Load message history when tab is active
  useEffect(() => {
    if (activeTab === 'history') {
      fetchMessageHistory({ limit: 50 });
    }
  }, [activeTab, fetchMessageHistory]);

  return (
    <div className="content-area setting-form">
      <PerfectScrollbar>
        <PageHeaderSetting />
        <div className="content-area-body">
          <div className="card mb-0">
            <div className="card-header border-bottom-0 pb-0">
              <div className="nav nav-tabs nav-tabs-line" role="tablist">
                <button
                  className={`nav-link ${activeTab === 'send' ? 'active' : ''}`}
                  onClick={() => setActiveTab('send')}
                  type="button"
                >
                  <FiSend className="me-2" />
                  Send Message
                </button>
                <button
                  className={`nav-link ${activeTab === 'schedules' ? 'active' : ''}`}
                  onClick={() => setActiveTab('schedules')}
                  type="button"
                >
                  <FiClock className="me-2" />
                  Scheduled Messages
                </button>
                <button
                  className={`nav-link ${activeTab === 'templates' ? 'active' : ''}`}
                  onClick={() => setActiveTab('templates')}
                  type="button"
                >
                  <FiFileText className="me-2" />
                  Message Templates
                </button>
                <button
                  className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveTab('history')}
                  type="button"
                >
                  <FiList className="me-2" />
                  Message History
                </button>
              </div>
            </div>

            <div className="card-body">
              {/* Send Message Tab */}
              {activeTab === 'send' && (
                <div className="tab-content">
                  <div className="mb-4">
                    <h5 className="mb-3">Send WhatsApp Message</h5>
                    <p className="text-muted">Send an immediate WhatsApp message to a recipient.</p>
                  </div>
                  <form onSubmit={handleSendMessage}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          Phone Number <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="+1234567890 (with country code)"
                          value={sendForm.phone_number}
                          onChange={(e) => setSendForm({ ...sendForm, phone_number: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Template (Optional)</label>
                        <SelectDropdown
                          options={[
                            { value: '', label: 'None' },
                            ...templates.map(t => ({ value: t.id, label: t.name })),
                          ]}
                          selectedOption={templates.find(t => t.id === sendForm.template_id) ? { value: sendForm.template_id, label: templates.find(t => t.id === sendForm.template_id).name } : { value: '', label: 'None' }}
                          onSelectOption={(option) => {
                            const selectedTemplate = templates.find(t => t.id === option.value);
                            setSendForm({
                              ...sendForm,
                              template_id: option.value || '',
                              message: selectedTemplate ? selectedTemplate.content : sendForm.message,
                            });
                          }}
                        />
                      </div>
                      <div className="col-12 mb-3">
                        <label className="form-label">
                          Message <span className="text-danger">*</span>
                        </label>
                        <textarea
                          className="form-control"
                          placeholder="Enter your message here..."
                          value={sendForm.message}
                          onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
                          rows={6}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <div className='d-flex'>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                          <FiSend className="me-2" />
                          Send Message
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary ms-2"
                          onClick={() => testConnection()}
                          disabled={loading}
                        >
                          Test Connection
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Scheduled Messages Tab */}
              {activeTab === 'schedules' && (
                <div className="tab-content">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h5 className="mb-1">Scheduled Messages</h5>
                      <p className="text-muted mb-0">Manage your scheduled WhatsApp messages</p>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setEditingSchedule(null);
                        setScheduleForm({
                          phone_number: '',
                          message: '',
                          scheduled_time: '',
                          recurrence: 'once',
                          template_id: '',
                          is_active: true,
                        });
                        setShowScheduleModal(true);
                      }}
                    >
                      <FiPlus className="me-2" />
                      New Schedule
                    </button>
                  </div>

                  {loading && schedules.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : schedules.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-muted">No scheduled messages found. Create one to get started.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover" style={{ backgroundColor: '#fafbfc' }}>
                        <thead>
                          <tr>
                            <th>Phone Number</th>
                            <th>Message Preview</th>
                            <th>Scheduled Time</th>
                            <th>Recurrence</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {schedules.map((schedule) => (
                            <tr key={schedule.id}>
                              <td>{schedule.phone_number}</td>
                              <td>
                                <span className="text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                                  {schedule.message?.substring(0, 50)}...
                                </span>
                              </td>
                              <td>
                                {schedule.scheduled_time
                                  ? dayjs(schedule.scheduled_time).format('MMM DD, YYYY HH:mm')
                                  : 'N/A'}
                              </td>
                              <td>
                                <span className="badge bg-info">{schedule.recurrence || 'once'}</span>
                              </td>
                              <td>
                                <button
                                  className="btn btn-sm btn-link p-0"
                                  onClick={() => handleToggleSchedule(schedule.id, schedule.is_active)}
                                  title={schedule.is_active ? 'Deactivate' : 'Activate'}
                                >
                                  {schedule.is_active ? (
                                    <FiToggleRight className="text-success" size={20} />
                                  ) : (
                                    <FiToggleLeft className="text-muted" size={20} />
                                  )}
                                </button>
                                {schedule.is_active ? (
                                  <FiCheckCircle className="text-success ms-2" size={16} />
                                ) : (
                                  <FiXCircle className="text-muted ms-2" size={16} />
                                )}
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleEditSchedule(schedule)}
                                    title="Edit"
                                  >
                                    <FiEdit size={14} />
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteSchedule(schedule.id)}
                                    title="Delete"
                                  >
                                    <FiTrash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Schedule Modal */}
                  {showScheduleModal && (
                    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                      <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">
                              {editingSchedule ? 'Edit Scheduled Message' : 'Create Scheduled Message'}
                            </h5>
                            <button
                              type="button"
                              className="btn-close"
                              onClick={() => {
                                setShowScheduleModal(false);
                                setEditingSchedule(null);
                              }}
                            ></button>
                          </div>
                          <form onSubmit={handleScheduleSubmit}>
                            <div className="modal-body">
                              <div className="row">
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">
                                    Phone Number <span className="text-danger">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="+1234567890 (with country code)"
                                    value={scheduleForm.phone_number}
                                    onChange={(e) =>
                                      setScheduleForm({ ...scheduleForm, phone_number: e.target.value })
                                    }
                                    required
                                  />
                                </div>
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">
                                    Scheduled Time <span className="text-danger">*</span>
                                  </label>
                                  <input
                                    type="datetime-local"
                                    className="form-control"
                                    value={scheduleForm.scheduled_time}
                                    onChange={(e) =>
                                      setScheduleForm({ ...scheduleForm, scheduled_time: e.target.value })
                                    }
                                    required
                                  />
                                </div>
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">Recurrence</label>
                                  <SelectDropdown
                                    options={recurrenceOptions}
                                    selectedOption={recurrenceOptions.find(o => o.value === scheduleForm.recurrence) || recurrenceOptions[0]}
                                    onSelectOption={(option) =>
                                      setScheduleForm({ ...scheduleForm, recurrence: option.value })
                                    }
                                  />
                                </div>
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">Template (Optional)</label>
                                  <SelectDropdown
                                    options={[
                                      { value: '', label: 'None' },
                                      ...templates.map(t => ({ value: t.id, label: t.name })),
                                    ]}
                                    selectedOption={templates.find(t => t.id === scheduleForm.template_id) ? { value: scheduleForm.template_id, label: templates.find(t => t.id === scheduleForm.template_id).name } : { value: '', label: 'None' }}
                                    onSelectOption={(option) => {
                                      const selectedTemplate = templates.find(t => t.id === option.value);
                                      setScheduleForm({
                                        ...scheduleForm,
                                        template_id: option.value || '',
                                        message: selectedTemplate ? selectedTemplate.content : scheduleForm.message,
                                      });
                                    }}
                                  />
                                </div>
                                <div className="col-12 mb-3">
                                  <label className="form-label">
                                    Message <span className="text-danger">*</span>
                                  </label>
                                  <textarea
                                    className="form-control"
                                    placeholder="Enter your message here..."
                                    value={scheduleForm.message}
                                    onChange={(e) =>
                                      setScheduleForm({ ...scheduleForm, message: e.target.value })
                                    }
                                    rows={6}
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="modal-footer">
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                  setShowScheduleModal(false);
                                  setEditingSchedule(null);
                                }}
                              >
                                Cancel
                              </button>
                              <button type="submit" className="btn btn-primary" disabled={loading}>
                                {editingSchedule ? 'Update' : 'Create'} Schedule
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Templates Tab */}
              {activeTab === 'templates' && (
                <div className="tab-content">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h5 className="mb-1">Message Templates</h5>
                      <p className="text-muted mb-0">Create and manage reusable message templates with action-based triggers</p>
                    </div>
                    <div className="d-flex gap-2">
                      <div className="btn-group" role="group">
                        <button
                          type="button"
                          className={`btn btn-sm ${templateViewMode === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => setTemplateViewMode('all')}
                        >
                          All
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${templateViewMode === 'action' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => setTemplateViewMode('action')}
                        >
                          <FiZap className="me-1" size={14} />
                          Action-Based
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${templateViewMode === 'manual' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => setTemplateViewMode('manual')}
                        >
                          Manual
                        </button>
                      </div>
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          setEditingTemplate(null);
                          setTemplateForm({ name: '', content: '', action_type: '', auto_send: false });
                          setShowTemplateModal(true);
                        }}
                      >
                        <FiPlus className="me-2" />
                        New Template
                      </button>
                    </div>
                  </div>

                  {loading && templates.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-muted">No templates found. Create one to get started.</p>
                    </div>
                  ) : (
                    <div className="row">
                      {getFilteredTemplates().map((template) => (
                        <div key={template.id} className="col-md-6 mb-3">
                          <div className="card">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <h6 className="mb-0">{template.name}</h6>
                                  {template.action_type && (
                                    <div className="mt-1">
                                      <span className="badge bg-info me-2">
                                        {ACTION_TYPE_LABELS[template.action_type] || template.action_type}
                                      </span>
                                      {template.auto_send && (
                                        <span className="badge bg-success">
                                          <FiZap size={10} className="me-1" />
                                          Auto-Send
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleEditTemplate(template)}
                                    title="Edit"
                                  >
                                    <FiEdit size={14} />
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteTemplate(template.id)}
                                    title="Delete"
                                  >
                                    <FiTrash2 size={14} />
                                  </button>
                                </div>
                              </div>
                              <p className="text-muted small mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                                {template.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Template Modal */}
                  {showTemplateModal && (
                    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                      <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">
                              {editingTemplate ? 'Edit Template' : 'Create Template'}
                            </h5>
                            <button
                              type="button"
                              className="btn-close"
                              onClick={() => {
                                setShowTemplateModal(false);
                                setEditingTemplate(null);
                              }}
                            ></button>
                          </div>
                          <form onSubmit={handleTemplateSubmit}>
                            <div className="modal-body">
                              <div className="mb-3">
                                <label className="form-label">
                                  Template Name <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="e.g., Appointment Reminder"
                                  value={templateForm.name}
                                  onChange={(e) =>
                                    setTemplateForm({ ...templateForm, name: e.target.value })
                                  }
                                  required
                                />
                              </div>
                              <div className="mb-3">
                                <label className="form-label">Action Type (Optional)</label>
                                <SelectDropdown
                                  options={[
                                    { value: '', label: 'None (Manual Template)' },
                                    ...ACTION_TYPE_OPTIONS,
                                  ]}
                                  selectedOption={templateForm.action_type 
                                    ? ACTION_TYPE_OPTIONS.find(o => o.value === templateForm.action_type) || { value: templateForm.action_type, label: ACTION_TYPE_LABELS[templateForm.action_type] || templateForm.action_type }
                                    : { value: '', label: 'None (Manual Template)' }}
                                  onSelectOption={(option) =>
                                    setTemplateForm({ ...templateForm, action_type: option.value || '' })
                                  }
                                />
                                <small className="form-text text-muted">
                                  Select an action to automatically send this template when the action occurs
                                </small>
                              </div>
                              {templateForm.action_type && (
                                <div className="mb-3">
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id="autoSendCheck"
                                      checked={templateForm.auto_send}
                                      onChange={(e) =>
                                        setTemplateForm({ ...templateForm, auto_send: e.target.checked })
                                      }
                                    />
                                    <label className="form-check-label" htmlFor="autoSendCheck">
                                      Enable Auto-Send
                                    </label>
                                  </div>
                                  <small className="form-text text-muted">
                                    When enabled, this template will be automatically sent when the action occurs
                                  </small>
                                </div>
                              )}
                              {templateForm.action_type && getAvailableVariables().length > 0 && (
                                <div className="mb-3">
                                  <label className="form-label">Available Variables</label>
                                  <div className="alert alert-info">
                                    <small>
                                      You can use these variables in your template: <br />
                                      {getAvailableVariables().map((v, idx) => (
                                        <span key={idx}>
                                          <code>{'{' + v.key + '}'}</code> - {v.label}
                                          {idx < getAvailableVariables().length - 1 && ', '}
                                        </span>
                                      ))}
                                    </small>
                                  </div>
                                </div>
                              )}
                              <div className="mb-3">
                                <label className="form-label">
                                  Template Content <span className="text-danger">*</span>
                                </label>
                                <textarea
                                  className="form-control"
                                  placeholder="Enter template content here... Use {variable_name} for dynamic values"
                                  value={templateForm.content}
                                  onChange={(e) =>
                                    setTemplateForm({ ...templateForm, content: e.target.value })
                                  }
                                  rows={8}
                                  required
                                />
                                {templateForm.action_type && (
                                  <small className="form-text text-muted">
                                    Use variables like {'{patient_name}'}, {'{appointment_date}'}, etc. in your message
                                  </small>
                                )}
                              </div>
                            </div>
                            <div className="modal-footer">
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                  setShowTemplateModal(false);
                                  setEditingTemplate(null);
                                }}
                              >
                                Cancel
                              </button>
                              <button type="submit" className="btn btn-primary" disabled={loading}>
                                {editingTemplate ? 'Update' : 'Create'} Template
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Message History Tab */}
              {activeTab === 'history' && (
                <div className="tab-content">
                  <div className="mb-4">
                    <h5 className="mb-1">Message History</h5>
                    <p className="text-muted mb-0">View sent WhatsApp messages</p>
                  </div>

                  {loading && messageHistory.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : messageHistory.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-muted">No message history found.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover" style={{ backgroundColor: '#fafbfc' }}>
                        <thead>
                          <tr>
                            <th>Phone Number</th>
                            <th>Message</th>
                            <th>Status</th>
                            <th>Sent At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {messageHistory.map((message, index) => (
                            <tr key={message.id || index}>
                              <td>{message.phone_number}</td>
                              <td>
                                <span className="text-truncate d-inline-block" style={{ maxWidth: '300px' }}>
                                  {message.message}
                                </span>
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    message.status === 'sent'
                                      ? 'bg-success'
                                      : message.status === 'failed'
                                      ? 'bg-danger'
                                      : 'bg-warning'
                                  }`}
                                >
                                  {message.status || 'pending'}
                                </span>
                              </td>
                              <td>
                                {message.sent_at
                                  ? dayjs(message.sent_at).format('MMM DD, YYYY HH:mm')
                                  : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </PerfectScrollbar>
    </div>
  );
};

export default SettingsWhatsAppOnlyForm;

