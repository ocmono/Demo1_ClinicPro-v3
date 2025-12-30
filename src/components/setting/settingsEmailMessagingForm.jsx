import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import PageHeaderSetting from '@/components/shared/pageHeader/PageHeaderSetting';
import Footer from '@/components/shared/Footer';
import SelectDropdown from '@/components/shared/SelectDropdown';
import { useWhatsApp } from '@/context/WhatsAppContext';
import { FiSend, FiClock, FiFileText, FiList, FiPlus, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight, FiCheckCircle, FiXCircle, FiMail, FiZap } from 'react-icons/fi';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { ACTION_TYPE_OPTIONS, ACTION_TYPE_LABELS, ACTION_VARIABLES } from '@/utils/actionTypes';

const recurrenceOptions = [
  { value: 'once', label: 'Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const SettingsEmailMessagingForm = () => {
  const [activeTab, setActiveTab] = useState('send');
  const {
    emailSchedules,
    emailHistory,
    emailTemplates,
    sendEmail,
    createEmailSchedule,
    updateEmailSchedule,
    deleteEmailSchedule,
    toggleEmailSchedule,
    createEmailTemplate,
    updateEmailTemplate,
    deleteEmailTemplate,
    testEmailConnection,
    fetchEmailSchedules,
    fetchEmailHistory,
    fetchEmailTemplates,
    loading,
  } = useWhatsApp();

  // Email Send Form State
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    body: '',
    template_id: '',
    cc: '',
    bcc: '',
  });

  // Email Schedule Form State
  const [emailScheduleForm, setEmailScheduleForm] = useState({
    to: '',
    subject: '',
    body: '',
    scheduled_time: '',
    recurrence: 'once',
    template_id: '',
    is_active: true,
    cc: '',
    bcc: '',
  });

  // Email Template Form State
  const [emailTemplateForm, setEmailTemplateForm] = useState({
    name: '',
    subject: '',
    body: '',
    action_type: '',
    auto_send: false,
  });
  
  const [templateViewMode, setTemplateViewMode] = useState('all'); // 'all', 'action', 'manual'

  const [editingEmailSchedule, setEditingEmailSchedule] = useState(null);
  const [editingEmailTemplate, setEditingEmailTemplate] = useState(null);
  const [showEmailScheduleModal, setShowEmailScheduleModal] = useState(false);
  const [showEmailTemplateModal, setShowEmailTemplateModal] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    fetchEmailSchedules();
    fetchEmailTemplates();
  }, [fetchEmailSchedules, fetchEmailTemplates]);

  // Handle send email
  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailForm.to || !emailForm.subject || !emailForm.body) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await sendEmail(emailForm);
      setEmailForm({ to: '', subject: '', body: '', template_id: '', cc: '', bcc: '' });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  // Handle create/update email schedule
  const handleEmailScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!emailScheduleForm.to || !emailScheduleForm.subject || !emailScheduleForm.body || !emailScheduleForm.scheduled_time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingEmailSchedule) {
        await updateEmailSchedule(editingEmailSchedule.id, emailScheduleForm);
      } else {
        await createEmailSchedule(emailScheduleForm);
      }
      setEmailScheduleForm({
        to: '',
        subject: '',
        body: '',
        scheduled_time: '',
        recurrence: 'once',
        template_id: '',
        is_active: true,
        cc: '',
        bcc: '',
      });
      setEditingEmailSchedule(null);
      setShowEmailScheduleModal(false);
    } catch (error) {
      console.error('Failed to save email schedule:', error);
    }
  };

  // Handle edit email schedule
  const handleEditEmailSchedule = (schedule) => {
    setEditingEmailSchedule(schedule);
    setEmailScheduleForm({
      to: schedule.to || '',
      subject: schedule.subject || '',
      body: schedule.body || '',
      scheduled_time: schedule.scheduled_time ? dayjs(schedule.scheduled_time).format('YYYY-MM-DDTHH:mm') : '',
      recurrence: schedule.recurrence || 'once',
      template_id: schedule.template_id || '',
      is_active: schedule.is_active !== undefined ? schedule.is_active : true,
      cc: schedule.cc || '',
      bcc: schedule.bcc || '',
    });
    setShowEmailScheduleModal(true);
  };

  // Handle delete email schedule
  const handleDeleteEmailSchedule = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this scheduled email?')) {
      try {
        await deleteEmailSchedule(scheduleId);
      } catch (error) {
        console.error('Failed to delete email schedule:', error);
      }
    }
  };

  // Handle toggle email schedule
  const handleToggleEmailSchedule = async (scheduleId, currentStatus) => {
    try {
      await toggleEmailSchedule(scheduleId, !currentStatus);
    } catch (error) {
      console.error('Failed to toggle email schedule:', error);
    }
  };

  // Handle create/update email template
  const handleEmailTemplateSubmit = async (e) => {
    e.preventDefault();
    if (!emailTemplateForm.name || !emailTemplateForm.subject || !emailTemplateForm.body) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingEmailTemplate) {
        await updateEmailTemplate(editingEmailTemplate.id, emailTemplateForm);
      } else {
        await createEmailTemplate(emailTemplateForm);
      }
      setEmailTemplateForm({ name: '', subject: '', body: '', action_type: '', auto_send: false });
      setEditingEmailTemplate(null);
      setShowEmailTemplateModal(false);
    } catch (error) {
      console.error('Failed to save email template:', error);
    }
  };

  // Handle edit email template
  const handleEditEmailTemplate = (template) => {
    setEditingEmailTemplate(template);
    setEmailTemplateForm({
      name: template.name || '',
      subject: template.subject || '',
      body: template.body || '',
      action_type: template.action_type || '',
      auto_send: template.auto_send || false,
    });
    setShowEmailTemplateModal(true);
  };

  // Handle delete email template
  const handleDeleteEmailTemplate = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this email template?')) {
      try {
        await deleteEmailTemplate(templateId);
      } catch (error) {
        console.error('Failed to delete email template:', error);
      }
    }
  };
  
  // Get available variables for selected action type
  const getAvailableVariables = () => {
    if (!emailTemplateForm.action_type) return [];
    return ACTION_VARIABLES[emailTemplateForm.action_type] || [];
  };
  
  // Filter templates by view mode
  const getFilteredTemplates = () => {
    if (templateViewMode === 'all') return emailTemplates;
    if (templateViewMode === 'action') return emailTemplates.filter(t => t.action_type);
    if (templateViewMode === 'manual') return emailTemplates.filter(t => !t.action_type);
    return emailTemplates;
  };

  // Load email history when tab is active
  useEffect(() => {
    if (activeTab === 'history') {
      fetchEmailHistory({ limit: 50 });
    }
  }, [activeTab, fetchEmailHistory]);

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
                  Send Email
                </button>
                <button
                  className={`nav-link ${activeTab === 'schedules' ? 'active' : ''}`}
                  onClick={() => setActiveTab('schedules')}
                  type="button"
                >
                  <FiClock className="me-2" />
                  Scheduled Emails
                </button>
                <button
                  className={`nav-link ${activeTab === 'templates' ? 'active' : ''}`}
                  onClick={() => setActiveTab('templates')}
                  type="button"
                >
                  <FiFileText className="me-2" />
                  Email Templates
                </button>
                <button
                  className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveTab('history')}
                  type="button"
                >
                  <FiList className="me-2" />
                  Email History
                </button>
              </div>
            </div>

            <div className="card-body">
              {/* Send Email Tab */}
              {activeTab === 'send' && (
                <div className="tab-content">
                  <div className="mb-4">
                    <h5 className="mb-3">Send Email</h5>
                    <p className="text-muted">Send an immediate email to a recipient.</p>
                  </div>
                  <form onSubmit={handleSendEmail}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          To <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="recipient@example.com"
                          value={emailForm.to}
                          onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                          required
                        />
                        <small className="form-text text-muted">Separate multiple emails with commas</small>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Template (Optional)</label>
                        <SelectDropdown
                          options={[
                            { value: '', label: 'None' },
                            ...emailTemplates.map(t => ({ value: t.id, label: t.name })),
                          ]}
                          selectedOption={emailTemplates.find(t => t.id === emailForm.template_id) ? { value: emailForm.template_id, label: emailTemplates.find(t => t.id === emailForm.template_id).name } : { value: '', label: 'None' }}
                          onSelectOption={(option) => {
                            const selectedTemplate = emailTemplates.find(t => t.id === option.value);
                            setEmailForm({
                              ...emailForm,
                              template_id: option.value || '',
                              subject: selectedTemplate ? selectedTemplate.subject : emailForm.subject,
                              body: selectedTemplate ? selectedTemplate.body : emailForm.body,
                            });
                          }}
                        />
                      </div>
                      <div className="col-12 mb-3">
                        <label className="form-label">
                          Subject <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Email subject"
                          value={emailForm.subject}
                          onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">CC (Optional)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="cc@example.com"
                          value={emailForm.cc}
                          onChange={(e) => setEmailForm({ ...emailForm, cc: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">BCC (Optional)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="bcc@example.com"
                          value={emailForm.bcc}
                          onChange={(e) => setEmailForm({ ...emailForm, bcc: e.target.value })}
                        />
                      </div>
                      <div className="col-12 mb-3">
                        <label className="form-label">
                          Body <span className="text-danger">*</span>
                        </label>
                        <textarea
                          className="form-control"
                          placeholder="Enter email body here..."
                          value={emailForm.body}
                          onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })}
                          rows={8}
                          required
                        />
                        <small className="form-text text-muted">HTML is supported</small>
                      </div>
                      <div className="col-12">
                        <div className='d-flex'>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                          <FiMail className="me-2" />
                          Send Email
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary ms-2"
                          onClick={() => testEmailConnection()}
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

              {/* Scheduled Emails Tab */}
              {activeTab === 'schedules' && (
                <div className="tab-content">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h5 className="mb-1">Scheduled Emails</h5>
                      <p className="text-muted mb-0">Manage your scheduled emails</p>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setEditingEmailSchedule(null);
                        setEmailScheduleForm({
                          to: '',
                          subject: '',
                          body: '',
                          scheduled_time: '',
                          recurrence: 'once',
                          template_id: '',
                          is_active: true,
                          cc: '',
                          bcc: '',
                        });
                        setShowEmailScheduleModal(true);
                      }}
                    >
                      <FiPlus className="me-2" />
                      New Schedule
                    </button>
                  </div>

                  {loading && emailSchedules.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : emailSchedules.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-muted">No scheduled emails found. Create one to get started.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover" style={{ backgroundColor: '#fafbfc' }}>
                        <thead>
                          <tr>
                            <th>To</th>
                            <th>Subject</th>
                            <th>Scheduled Time</th>
                            <th>Recurrence</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {emailSchedules.map((schedule) => (
                            <tr key={schedule.id}>
                              <td>{schedule.to}</td>
                              <td>
                                <span className="text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                                  {schedule.subject}
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
                                  onClick={() => handleToggleEmailSchedule(schedule.id, schedule.is_active)}
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
                                    onClick={() => handleEditEmailSchedule(schedule)}
                                    title="Edit"
                                  >
                                    <FiEdit size={14} />
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteEmailSchedule(schedule.id)}
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

                  {/* Email Schedule Modal */}
                  {showEmailScheduleModal && (
                    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                      <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">
                              {editingEmailSchedule ? 'Edit Scheduled Email' : 'Create Scheduled Email'}
                            </h5>
                            <button
                              type="button"
                              className="btn-close"
                              onClick={() => {
                                setShowEmailScheduleModal(false);
                                setEditingEmailSchedule(null);
                              }}
                            ></button>
                          </div>
                          <form onSubmit={handleEmailScheduleSubmit}>
                            <div className="modal-body">
                              <div className="row">
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">
                                    To <span className="text-danger">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="recipient@example.com"
                                    value={emailScheduleForm.to}
                                    onChange={(e) =>
                                      setEmailScheduleForm({ ...emailScheduleForm, to: e.target.value })
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
                                    value={emailScheduleForm.scheduled_time}
                                    onChange={(e) =>
                                      setEmailScheduleForm({ ...emailScheduleForm, scheduled_time: e.target.value })
                                    }
                                    required
                                  />
                                </div>
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">Recurrence</label>
                                  <SelectDropdown
                                    options={recurrenceOptions}
                                    selectedOption={recurrenceOptions.find(o => o.value === emailScheduleForm.recurrence) || recurrenceOptions[0]}
                                    onSelectOption={(option) =>
                                      setEmailScheduleForm({ ...emailScheduleForm, recurrence: option.value })
                                    }
                                  />
                                </div>
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">Template (Optional)</label>
                                  <SelectDropdown
                                    options={[
                                      { value: '', label: 'None' },
                                      ...emailTemplates.map(t => ({ value: t.id, label: t.name })),
                                    ]}
                                    selectedOption={emailTemplates.find(t => t.id === emailScheduleForm.template_id) ? { value: emailScheduleForm.template_id, label: emailTemplates.find(t => t.id === emailScheduleForm.template_id).name } : { value: '', label: 'None' }}
                                    onSelectOption={(option) => {
                                      const selectedTemplate = emailTemplates.find(t => t.id === option.value);
                                      setEmailScheduleForm({
                                        ...emailScheduleForm,
                                        template_id: option.value || '',
                                        subject: selectedTemplate ? selectedTemplate.subject : emailScheduleForm.subject,
                                        body: selectedTemplate ? selectedTemplate.body : emailScheduleForm.body,
                                      });
                                    }}
                                  />
                                </div>
                                <div className="col-12 mb-3">
                                  <label className="form-label">
                                    Subject <span className="text-danger">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Email subject"
                                    value={emailScheduleForm.subject}
                                    onChange={(e) =>
                                      setEmailScheduleForm({ ...emailScheduleForm, subject: e.target.value })
                                    }
                                    required
                                  />
                                </div>
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">CC (Optional)</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="cc@example.com"
                                    value={emailScheduleForm.cc}
                                    onChange={(e) =>
                                      setEmailScheduleForm({ ...emailScheduleForm, cc: e.target.value })
                                    }
                                  />
                                </div>
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">BCC (Optional)</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="bcc@example.com"
                                    value={emailScheduleForm.bcc}
                                    onChange={(e) =>
                                      setEmailScheduleForm({ ...emailScheduleForm, bcc: e.target.value })
                                    }
                                  />
                                </div>
                                <div className="col-12 mb-3">
                                  <label className="form-label">
                                    Body <span className="text-danger">*</span>
                                  </label>
                                  <textarea
                                    className="form-control"
                                    placeholder="Enter email body here..."
                                    value={emailScheduleForm.body}
                                    onChange={(e) =>
                                      setEmailScheduleForm({ ...emailScheduleForm, body: e.target.value })
                                    }
                                    rows={8}
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
                                  setShowEmailScheduleModal(false);
                                  setEditingEmailSchedule(null);
                                }}
                              >
                                Cancel
                              </button>
                              <button type="submit" className="btn btn-primary" disabled={loading}>
                                {editingEmailSchedule ? 'Update' : 'Create'} Schedule
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Email Templates Tab */}
              {activeTab === 'templates' && (
                <div className="tab-content">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h5 className="mb-1">Email Templates</h5>
                      <p className="text-muted mb-0">Create and manage reusable email templates with action-based triggers</p>
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
                          setEditingEmailTemplate(null);
                          setEmailTemplateForm({ name: '', subject: '', body: '', action_type: '', auto_send: false });
                          setShowEmailTemplateModal(true);
                        }}
                      >
                        <FiPlus className="me-2" />
                        New Template
                      </button>
                    </div>
                  </div>

                  {loading && emailTemplates.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : emailTemplates.length === 0 ? (
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
                                    onClick={() => handleEditEmailTemplate(template)}
                                    title="Edit"
                                  >
                                    <FiEdit size={14} />
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteEmailTemplate(template.id)}
                                    title="Delete"
                                  >
                                    <FiTrash2 size={14} />
                                  </button>
                                </div>
                              </div>
                              <p className="fw-semibold small mb-1">Subject: {template.subject}</p>
                              <p className="text-muted small mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                                {template.body}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Email Template Modal */}
                  {showEmailTemplateModal && (
                    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                      <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">
                              {editingEmailTemplate ? 'Edit Email Template' : 'Create Email Template'}
                            </h5>
                            <button
                              type="button"
                              className="btn-close"
                              onClick={() => {
                                setShowEmailTemplateModal(false);
                                setEditingEmailTemplate(null);
                              }}
                            ></button>
                          </div>
                          <form onSubmit={handleEmailTemplateSubmit}>
                            <div className="modal-body">
                              <div className="mb-3">
                                <label className="form-label">
                                  Template Name <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="e.g., Appointment Reminder"
                                  value={emailTemplateForm.name}
                                  onChange={(e) =>
                                    setEmailTemplateForm({ ...emailTemplateForm, name: e.target.value })
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
                                  selectedOption={emailTemplateForm.action_type 
                                    ? ACTION_TYPE_OPTIONS.find(o => o.value === emailTemplateForm.action_type) || { value: emailTemplateForm.action_type, label: ACTION_TYPE_LABELS[emailTemplateForm.action_type] || emailTemplateForm.action_type }
                                    : { value: '', label: 'None (Manual Template)' }}
                                  onSelectOption={(option) =>
                                    setEmailTemplateForm({ ...emailTemplateForm, action_type: option.value || '' })
                                  }
                                />
                                <small className="form-text text-muted">
                                  Select an action to automatically send this template when the action occurs
                                </small>
                              </div>
                              {emailTemplateForm.action_type && (
                                <>
                                  <div className="mb-3">
                                    <div className="form-check">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="emailAutoSendCheck"
                                        checked={emailTemplateForm.auto_send}
                                        onChange={(e) =>
                                          setEmailTemplateForm({ ...emailTemplateForm, auto_send: e.target.checked })
                                        }
                                      />
                                      <label className="form-check-label" htmlFor="emailAutoSendCheck">
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
                                  Subject <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder={emailTemplateForm.action_type 
                                    ? "Email subject... Use {variable_name} for dynamic values"
                                    : "Email subject"}
                                  value={emailTemplateForm.subject}
                                  onChange={(e) =>
                                    setEmailTemplateForm({ ...emailTemplateForm, subject: e.target.value })
                                  }
                                  required
                                />
                              </div>
                              <div className="mb-3">
                                <label className="form-label">
                                  Body <span className="text-danger">*</span>
                                </label>
                                <textarea
                                  className="form-control"
                                  placeholder={emailTemplateForm.action_type 
                                    ? "Enter template body here... Use {variable_name} for dynamic values"
                                    : "Enter template body here..."}
                                  value={emailTemplateForm.body}
                                  onChange={(e) =>
                                    setEmailTemplateForm({ ...emailTemplateForm, body: e.target.value })
                                  }
                                  rows={8}
                                  required
                                />
                                {emailTemplateForm.action_type && (
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
                                  setShowEmailTemplateModal(false);
                                  setEditingEmailTemplate(null);
                                }}
                              >
                                Cancel
                              </button>
                              <button type="submit" className="btn btn-primary" disabled={loading}>
                                {editingEmailTemplate ? 'Update' : 'Create'} Template
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Email History Tab */}
              {activeTab === 'history' && (
                <div className="tab-content">
                  <div className="mb-4">
                    <h5 className="mb-1">Email History</h5>
                    <p className="text-muted mb-0">View sent emails</p>
                  </div>

                  {loading && emailHistory.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : emailHistory.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-muted">No email history found.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover" style={{ backgroundColor: '#fafbfc' }}>
                        <thead>
                          <tr>
                            <th>To</th>
                            <th>Subject</th>
                            <th>Status</th>
                            <th>Sent At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {emailHistory.map((email, index) => (
                            <tr key={email.id || index}>
                              <td>{email.to}</td>
                              <td>
                                <span className="text-truncate d-inline-block" style={{ maxWidth: '300px' }}>
                                  {email.subject}
                                </span>
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    email.status === 'sent'
                                      ? 'bg-success'
                                      : email.status === 'failed'
                                      ? 'bg-danger'
                                      : 'bg-warning'
                                  }`}
                                >
                                  {email.status || 'pending'}
                                </span>
                              </td>
                              <td>
                                {email.sent_at
                                  ? dayjs(email.sent_at).format('MMM DD, YYYY HH:mm')
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

export default SettingsEmailMessagingForm;

