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

const SettingsSMSForm = () => {
  const [activeTab, setActiveTab] = useState('send');
  const {
    smsSchedules,
    smsHistory,
    smsTemplates,
    sendSMS,
    createSMSSchedule,
    updateSMSSchedule,
    deleteSMSSchedule,
    toggleSMSSchedule,
    createSMSTemplate,
    updateSMSTemplate,
    deleteSMSTemplate,
    testSMSConnection,
    fetchSMSSchedules,
    fetchSMSHistory,
    fetchSMSTemplates,
    loading,
  } = useWhatsApp();

  // SMS Send Form State
  const [smsForm, setSmsForm] = useState({
    phone_number: '',
    message: '',
    template_id: '',
  });

  // SMS Schedule Form State
  const [smsScheduleForm, setSmsScheduleForm] = useState({
    phone_number: '',
    message: '',
    scheduled_time: '',
    recurrence: 'once',
    template_id: '',
    is_active: true,
  });

  // SMS Template Form State
  const [smsTemplateForm, setSmsTemplateForm] = useState({
    name: '',
    content: '',
    action_type: '',
    auto_send: false,
  });
  
  const [templateViewMode, setTemplateViewMode] = useState('all'); // 'all', 'action', 'manual'

  const [editingSMSSchedule, setEditingSMSSchedule] = useState(null);
  const [editingSMSTemplate, setEditingSMSTemplate] = useState(null);
  const [showSMSScheduleModal, setShowSMSScheduleModal] = useState(false);
  const [showSMSTemplateModal, setShowSMSTemplateModal] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    fetchSMSSchedules();
    fetchSMSTemplates();
  }, [fetchSMSSchedules, fetchSMSTemplates]);

  // Handle send SMS
  const handleSendSMS = async (e) => {
    e.preventDefault();
    if (!smsForm.phone_number || !smsForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await sendSMS(smsForm);
      setSmsForm({ phone_number: '', message: '', template_id: '' });
    } catch (error) {
      console.error('Failed to send SMS:', error);
    }
  };

  // Handle create/update SMS schedule
  const handleSMSScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!smsScheduleForm.phone_number || !smsScheduleForm.message || !smsScheduleForm.scheduled_time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingSMSSchedule) {
        await updateSMSSchedule(editingSMSSchedule.id, smsScheduleForm);
      } else {
        await createSMSSchedule(smsScheduleForm);
      }
      setSmsScheduleForm({
        phone_number: '',
        message: '',
        scheduled_time: '',
        recurrence: 'once',
        template_id: '',
        is_active: true,
      });
      setEditingSMSSchedule(null);
      setShowSMSScheduleModal(false);
    } catch (error) {
      console.error('Failed to save SMS schedule:', error);
    }
  };

  // Handle edit SMS schedule
  const handleEditSMSSchedule = (schedule) => {
    setEditingSMSSchedule(schedule);
    setSmsScheduleForm({
      phone_number: schedule.phone_number || '',
      message: schedule.message || '',
      scheduled_time: schedule.scheduled_time ? dayjs(schedule.scheduled_time).format('YYYY-MM-DDTHH:mm') : '',
      recurrence: schedule.recurrence || 'once',
      template_id: schedule.template_id || '',
      is_active: schedule.is_active !== undefined ? schedule.is_active : true,
    });
    setShowSMSScheduleModal(true);
  };

  // Handle delete SMS schedule
  const handleDeleteSMSSchedule = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this scheduled SMS?')) {
      try {
        await deleteSMSSchedule(scheduleId);
      } catch (error) {
        console.error('Failed to delete SMS schedule:', error);
      }
    }
  };

  // Handle toggle SMS schedule
  const handleToggleSMSSchedule = async (scheduleId, currentStatus) => {
    try {
      await toggleSMSSchedule(scheduleId, !currentStatus);
    } catch (error) {
      console.error('Failed to toggle SMS schedule:', error);
    }
  };

  // Handle create/update SMS template
  const handleSMSTemplateSubmit = async (e) => {
    e.preventDefault();
    if (!smsTemplateForm.name || !smsTemplateForm.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingSMSTemplate) {
        await updateSMSTemplate(editingSMSTemplate.id, smsTemplateForm);
      } else {
        await createSMSTemplate(smsTemplateForm);
      }
      setSmsTemplateForm({ name: '', content: '', action_type: '', auto_send: false });
      setEditingSMSTemplate(null);
      setShowSMSTemplateModal(false);
    } catch (error) {
      console.error('Failed to save SMS template:', error);
    }
  };

  // Handle edit SMS template
  const handleEditSMSTemplate = (template) => {
    setEditingSMSTemplate(template);
    setSmsTemplateForm({
      name: template.name || '',
      content: template.content || '',
      action_type: template.action_type || '',
      auto_send: template.auto_send || false,
    });
    setShowSMSTemplateModal(true);
  };
  
  // Get available variables for selected action type
  const getAvailableVariables = () => {
    if (!smsTemplateForm.action_type) return [];
    return ACTION_VARIABLES[smsTemplateForm.action_type] || [];
  };
  
  // Filter templates by view mode
  const getFilteredTemplates = () => {
    if (templateViewMode === 'all') return smsTemplates;
    if (templateViewMode === 'action') return smsTemplates.filter(t => t.action_type);
    if (templateViewMode === 'manual') return smsTemplates.filter(t => !t.action_type);
    return smsTemplates;
  };

  // Handle delete SMS template
  const handleDeleteSMSTemplate = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this SMS template?')) {
      try {
        await deleteSMSTemplate(templateId);
      } catch (error) {
        console.error('Failed to delete SMS template:', error);
      }
    }
  };

  // Load SMS history when tab is active
  useEffect(() => {
    if (activeTab === 'history') {
      fetchSMSHistory({ limit: 50 });
    }
  }, [activeTab, fetchSMSHistory]);

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
                  Send SMS
                </button>
                <button
                  className={`nav-link ${activeTab === 'schedules' ? 'active' : ''}`}
                  onClick={() => setActiveTab('schedules')}
                  type="button"
                >
                  <FiClock className="me-2" />
                  Scheduled SMS
                </button>
                <button
                  className={`nav-link ${activeTab === 'templates' ? 'active' : ''}`}
                  onClick={() => setActiveTab('templates')}
                  type="button"
                >
                  <FiFileText className="me-2" />
                  SMS Templates
                </button>
                <button
                  className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveTab('history')}
                  type="button"
                >
                  <FiList className="me-2" />
                  SMS History
                </button>
              </div>
            </div>

            <div className="card-body">
              {/* Send SMS Tab */}
              {activeTab === 'send' && (
                <div className="tab-content">
                  <div className="mb-4">
                    <h5 className="mb-3">Send SMS</h5>
                    <p className="text-muted">Send an immediate SMS to a recipient.</p>
                  </div>
                  <form onSubmit={handleSendSMS}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          Phone Number <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="+1234567890 (with country code)"
                          value={smsForm.phone_number}
                          onChange={(e) => setSmsForm({ ...smsForm, phone_number: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Template (Optional)</label>
                        <SelectDropdown
                          options={[
                            { value: '', label: 'None' },
                            ...smsTemplates.map(t => ({ value: t.id, label: t.name })),
                          ]}
                          selectedOption={smsTemplates.find(t => t.id === smsForm.template_id) ? { value: smsForm.template_id, label: smsTemplates.find(t => t.id === smsForm.template_id).name } : { value: '', label: 'None' }}
                          onSelectOption={(option) => {
                            const selectedTemplate = smsTemplates.find(t => t.id === option.value);
                            setSmsForm({
                              ...smsForm,
                              template_id: option.value || '',
                              message: selectedTemplate ? selectedTemplate.content : smsForm.message,
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
                          placeholder="Enter your SMS message here..."
                          value={smsForm.message}
                          onChange={(e) => setSmsForm({ ...smsForm, message: e.target.value })}
                          rows={6}
                          required
                        />
                        <small className="form-text text-muted">Maximum 160 characters per SMS</small>
                      </div>
                      <div className="col-12">
                        <div className='d-flex'>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                          <FiSend className="me-2" />
                          Send SMS
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary ms-2"
                          onClick={() => testSMSConnection()}
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

              {/* Scheduled SMS Tab */}
              {activeTab === 'schedules' && (
                <div className="tab-content">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h5 className="mb-1">Scheduled SMS</h5>
                      <p className="text-muted mb-0">Manage your scheduled SMS messages</p>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setEditingSMSSchedule(null);
                        setSmsScheduleForm({
                          phone_number: '',
                          message: '',
                          scheduled_time: '',
                          recurrence: 'once',
                          template_id: '',
                          is_active: true,
                        });
                        setShowSMSScheduleModal(true);
                      }}
                    >
                      <FiPlus className="me-2" />
                      New Schedule
                    </button>
                  </div>

                  {loading && smsSchedules.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : smsSchedules.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-muted">No scheduled SMS found. Create one to get started.</p>
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
                          {smsSchedules.map((schedule) => (
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
                                  onClick={() => handleToggleSMSSchedule(schedule.id, schedule.is_active)}
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
                                    onClick={() => handleEditSMSSchedule(schedule)}
                                    title="Edit"
                                  >
                                    <FiEdit size={14} />
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteSMSSchedule(schedule.id)}
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

                  {/* SMS Schedule Modal */}
                  {showSMSScheduleModal && (
                    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                      <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">
                              {editingSMSSchedule ? 'Edit Scheduled SMS' : 'Create Scheduled SMS'}
                            </h5>
                            <button
                              type="button"
                              className="btn-close"
                              onClick={() => {
                                setShowSMSScheduleModal(false);
                                setEditingSMSSchedule(null);
                              }}
                            ></button>
                          </div>
                          <form onSubmit={handleSMSScheduleSubmit}>
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
                                    value={smsScheduleForm.phone_number}
                                    onChange={(e) =>
                                      setSmsScheduleForm({ ...smsScheduleForm, phone_number: e.target.value })
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
                                    value={smsScheduleForm.scheduled_time}
                                    onChange={(e) =>
                                      setSmsScheduleForm({ ...smsScheduleForm, scheduled_time: e.target.value })
                                    }
                                    required
                                  />
                                </div>
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">Recurrence</label>
                                  <SelectDropdown
                                    options={recurrenceOptions}
                                    selectedOption={recurrenceOptions.find(o => o.value === smsScheduleForm.recurrence) || recurrenceOptions[0]}
                                    onSelectOption={(option) =>
                                      setSmsScheduleForm({ ...smsScheduleForm, recurrence: option.value })
                                    }
                                  />
                                </div>
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">Template (Optional)</label>
                                  <SelectDropdown
                                    options={[
                                      { value: '', label: 'None' },
                                      ...smsTemplates.map(t => ({ value: t.id, label: t.name })),
                                    ]}
                                    selectedOption={smsTemplates.find(t => t.id === smsScheduleForm.template_id) ? { value: smsScheduleForm.template_id, label: smsTemplates.find(t => t.id === smsScheduleForm.template_id).name } : { value: '', label: 'None' }}
                                    onSelectOption={(option) => {
                                      const selectedTemplate = smsTemplates.find(t => t.id === option.value);
                                      setSmsScheduleForm({
                                        ...smsScheduleForm,
                                        template_id: option.value || '',
                                        message: selectedTemplate ? selectedTemplate.content : smsScheduleForm.message,
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
                                    placeholder="Enter your SMS message here..."
                                    value={smsScheduleForm.message}
                                    onChange={(e) =>
                                      setSmsScheduleForm({ ...smsScheduleForm, message: e.target.value })
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
                                  setShowSMSScheduleModal(false);
                                  setEditingSMSSchedule(null);
                                }}
                              >
                                Cancel
                              </button>
                              <button type="submit" className="btn btn-primary" disabled={loading}>
                                {editingSMSSchedule ? 'Update' : 'Create'} Schedule
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SMS Templates Tab */}
              {activeTab === 'templates' && (
                <div className="tab-content">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h5 className="mb-1">SMS Templates</h5>
                      <p className="text-muted mb-0">Create and manage reusable SMS templates with action-based triggers</p>
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
                          setEditingSMSTemplate(null);
                          setSmsTemplateForm({ name: '', content: '', action_type: '', auto_send: false });
                          setShowSMSTemplateModal(true);
                        }}
                      >
                        <FiPlus className="me-2" />
                        New Template
                      </button>
                    </div>
                  </div>

                  {loading && smsTemplates.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : smsTemplates.length === 0 ? (
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
                                    onClick={() => handleEditSMSTemplate(template)}
                                    title="Edit"
                                  >
                                    <FiEdit size={14} />
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteSMSTemplate(template.id)}
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

                  {/* SMS Template Modal */}
                  {showSMSTemplateModal && (
                    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                      <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">
                              {editingSMSTemplate ? 'Edit SMS Template' : 'Create SMS Template'}
                            </h5>
                            <button
                              type="button"
                              className="btn-close"
                              onClick={() => {
                                setShowSMSTemplateModal(false);
                                setEditingSMSTemplate(null);
                              }}
                            ></button>
                          </div>
                          <form onSubmit={handleSMSTemplateSubmit}>
                            <div className="modal-body">
                              <div className="mb-3">
                                <label className="form-label">
                                  Template Name <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="e.g., Appointment Reminder"
                                  value={smsTemplateForm.name}
                                  onChange={(e) =>
                                    setSmsTemplateForm({ ...smsTemplateForm, name: e.target.value })
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
                                  selectedOption={smsTemplateForm.action_type 
                                    ? ACTION_TYPE_OPTIONS.find(o => o.value === smsTemplateForm.action_type) || { value: smsTemplateForm.action_type, label: ACTION_TYPE_LABELS[smsTemplateForm.action_type] || smsTemplateForm.action_type }
                                    : { value: '', label: 'None (Manual Template)' }}
                                  onSelectOption={(option) =>
                                    setSmsTemplateForm({ ...smsTemplateForm, action_type: option.value || '' })
                                  }
                                />
                                <small className="form-text text-muted">
                                  Select an action to automatically send this template when the action occurs
                                </small>
                              </div>
                              {smsTemplateForm.action_type && (
                                <>
                                  <div className="mb-3">
                                    <div className="form-check">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="smsAutoSendCheck"
                                        checked={smsTemplateForm.auto_send}
                                        onChange={(e) =>
                                          setSmsTemplateForm({ ...smsTemplateForm, auto_send: e.target.checked })
                                        }
                                      />
                                      <label className="form-check-label" htmlFor="smsAutoSendCheck">
                                        Enable Auto-Send
                                      </label>
                                    </div>
                                    <small className="form-text text-muted">
                                      When enabled, this template will be automatically sent when the action occurs
                                    </small>
                                  </div>
                                  {getAvailableVariables().length > 0 && (
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
                                </>
                              )}
                              <div className="mb-3">
                                <label className="form-label">
                                  Template Content <span className="text-danger">*</span>
                                </label>
                                <textarea
                                  className="form-control"
                                  placeholder={smsTemplateForm.action_type 
                                    ? "Enter template content here... Use {variable_name} for dynamic values"
                                    : "Enter template content here..."}
                                  value={smsTemplateForm.content}
                                  onChange={(e) =>
                                    setSmsTemplateForm({ ...smsTemplateForm, content: e.target.value })
                                  }
                                  rows={8}
                                  required
                                />
                                {smsTemplateForm.action_type && (
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
                                  setShowSMSTemplateModal(false);
                                  setEditingSMSTemplate(null);
                                }}
                              >
                                Cancel
                              </button>
                              <button type="submit" className="btn btn-primary" disabled={loading}>
                                {editingSMSTemplate ? 'Update' : 'Create'} Template
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SMS History Tab */}
              {activeTab === 'history' && (
                <div className="tab-content">
                  <div className="mb-4">
                    <h5 className="mb-1">SMS History</h5>
                    <p className="text-muted mb-0">View sent SMS messages</p>
                  </div>

                  {loading && smsHistory.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : smsHistory.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-muted">No SMS history found.</p>
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
                          {smsHistory.map((sms, index) => (
                            <tr key={sms.id || index}>
                              <td>{sms.phone_number}</td>
                              <td>
                                <span className="text-truncate d-inline-block" style={{ maxWidth: '300px' }}>
                                  {sms.message}
                                </span>
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    sms.status === 'sent'
                                      ? 'bg-success'
                                      : sms.status === 'failed'
                                      ? 'bg-danger'
                                      : 'bg-warning'
                                  }`}
                                >
                                  {sms.status || 'pending'}
                                </span>
                              </td>
                              <td>
                                {sms.sent_at
                                  ? dayjs(sms.sent_at).format('MMM DD, YYYY HH:mm')
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

export default SettingsSMSForm;

