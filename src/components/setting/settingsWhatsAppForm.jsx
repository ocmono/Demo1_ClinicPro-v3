import React, { useState, useEffect } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import PageHeaderSetting from '@/components/shared/pageHeader/PageHeaderSetting';
import Footer from '@/components/shared/Footer';
import SelectDropdown from '@/components/shared/SelectDropdown';
import { useWhatsApp } from '@/context/WhatsAppContext';
import { FiSend, FiClock, FiFileText, FiList, FiPlus, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight, FiCheckCircle, FiXCircle, FiMail, FiMessageSquare } from 'react-icons/fi';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const recurrenceOptions = [
  { value: 'once', label: 'Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const SettingsWhatsAppForm = () => {
  const [communicationType, setCommunicationType] = useState('whatsapp'); // whatsapp, email, sms
  const [activeTab, setActiveTab] = useState('send');
  const {
    // WhatsApp
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
    // Email
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
    // SMS
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
    // Common
    loading,
    getActiveSchedules,
  } = useWhatsApp();

  // WhatsApp Send Message Form State
  const [sendForm, setSendForm] = useState({
    phone_number: '',
    message: '',
    template_id: '',
  });

  // WhatsApp Schedule Form State
  const [scheduleForm, setScheduleForm] = useState({
    phone_number: '',
    message: '',
    scheduled_time: '',
    recurrence: 'once',
    template_id: '',
    is_active: true,
  });

  // WhatsApp Template Form State
  const [templateForm, setTemplateForm] = useState({
    name: '',
    content: '',
  });

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
  });

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
  });

  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  
  // Email modals
  const [editingEmailSchedule, setEditingEmailSchedule] = useState(null);
  const [editingEmailTemplate, setEditingEmailTemplate] = useState(null);
  const [showEmailScheduleModal, setShowEmailScheduleModal] = useState(false);
  const [showEmailTemplateModal, setShowEmailTemplateModal] = useState(false);
  
  // SMS modals
  const [editingSMSSchedule, setEditingSMSSchedule] = useState(null);
  const [editingSMSTemplate, setEditingSMSTemplate] = useState(null);
  const [showSMSScheduleModal, setShowSMSScheduleModal] = useState(false);
  const [showSMSTemplateModal, setShowSMSTemplateModal] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    fetchSchedules();
    fetchTemplates();
    fetchEmailSchedules();
    fetchEmailTemplates();
    fetchSMSSchedules();
    fetchSMSTemplates();
  }, [fetchSchedules, fetchTemplates, fetchEmailSchedules, fetchEmailTemplates, fetchSMSSchedules, fetchSMSTemplates]);

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
      setTemplateForm({ name: '', content: '' });
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
    });
    setShowTemplateModal(true);
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
      if (communicationType === 'whatsapp') {
        fetchMessageHistory({ limit: 50 });
      } else if (communicationType === 'email') {
        fetchEmailHistory({ limit: 50 });
      } else if (communicationType === 'sms') {
        fetchSMSHistory({ limit: 50 });
      }
    }
  }, [activeTab, communicationType, fetchMessageHistory, fetchEmailHistory, fetchSMSHistory]);

  // ==================== EMAIL HANDLERS ====================

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
      setEmailTemplateForm({ name: '', subject: '', body: '' });
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

  // ==================== SMS HANDLERS ====================

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
      setSmsTemplateForm({ name: '', content: '' });
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
    });
    setShowSMSTemplateModal(true);
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

  return (
    <div className="content-area setting-form">
      <PerfectScrollbar>
        <PageHeaderSetting />
        <div className="content-area-body">
          <div className="card mb-0">
            <div className="card-header border-bottom-0 pb-0">
              {/* Communication Type Selector */}
              <div className="mb-3">
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn ${communicationType === 'whatsapp' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => {
                      setCommunicationType('whatsapp');
                      setActiveTab('send');
                    }}
                  >
                    <FiMessageSquare className="me-2" />
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    className={`btn ${communicationType === 'email' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => {
                      setCommunicationType('email');
                      setActiveTab('send');
                    }}
                  >
                    <FiMail className="me-2" />
                    Email
                  </button>
                  <button
                    type="button"
                    className={`btn ${communicationType === 'sms' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => {
                      setCommunicationType('sms');
                      setActiveTab('send');
                    }}
                  >
                    <FiSend className="me-2" />
                    SMS
                  </button>
                </div>
              </div>
              
              {/* Tab Navigation */}
              <div className="nav nav-tabs nav-tabs-line" role="tablist">
                <button
                  className={`nav-link ${activeTab === 'send' ? 'active' : ''}`}
                  onClick={() => setActiveTab('send')}
                  type="button"
                >
                  <FiSend className="me-2" />
                  Send {communicationType === 'whatsapp' ? 'Message' : communicationType === 'email' ? 'Email' : 'SMS'}
                </button>
                <button
                  className={`nav-link ${activeTab === 'schedules' ? 'active' : ''}`}
                  onClick={() => setActiveTab('schedules')}
                  type="button"
                >
                  <FiClock className="me-2" />
                  Scheduled {communicationType === 'whatsapp' ? 'Messages' : communicationType === 'email' ? 'Emails' : 'SMS'}
                </button>
                <button
                  className={`nav-link ${activeTab === 'templates' ? 'active' : ''}`}
                  onClick={() => setActiveTab('templates')}
                  type="button"
                >
                  <FiFileText className="me-2" />
                  Templates
                </button>
                <button
                  className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveTab('history')}
                  type="button"
                >
                  <FiList className="me-2" />
                  History
                </button>
              </div>
            </div>

            <div className="card-body">
              {/* Send Tab - WhatsApp/Email/SMS */}
              {activeTab === 'send' && communicationType === 'whatsapp' && (
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

              {/* Send Tab - Email */}
              {activeTab === 'send' && communicationType === 'email' && (
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
                  </form>
                </div>
              )}

              {/* Send Tab - SMS */}
              {activeTab === 'send' && communicationType === 'sms' && (
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
                  </form>
                </div>
              )}

              {/* Scheduled Messages Tab - WhatsApp */}
              {activeTab === 'schedules' && communicationType === 'whatsapp' && (
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

              {/* Scheduled Messages Tab - Email */}
              {activeTab === 'schedules' && communicationType === 'email' && (
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

              {/* Scheduled Messages Tab - SMS */}
              {activeTab === 'schedules' && communicationType === 'sms' && (
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

              {/* Templates Tab */}
              {activeTab === 'templates' && communicationType === 'whatsapp' && (
                <div className="tab-content">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h5 className="mb-1">Message Templates</h5>
                      <p className="text-muted mb-0">Create and manage reusable message templates</p>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setEditingTemplate(null);
                        setTemplateForm({ name: '', content: '' });
                        setShowTemplateModal(true);
                      }}
                    >
                      <FiPlus className="me-2" />
                      New Template
                    </button>
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
                      {templates.map((template) => (
                        <div key={template.id} className="col-md-6 mb-3">
                          <div className="card">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h6 className="mb-0">{template.name}</h6>
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
                                <label className="form-label">
                                  Template Content <span className="text-danger">*</span>
                                </label>
                                <textarea
                                  className="form-control"
                                  placeholder="Enter template content here..."
                                  value={templateForm.content}
                                  onChange={(e) =>
                                    setTemplateForm({ ...templateForm, content: e.target.value })
                                  }
                                  rows={8}
                                  required
                                />
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

              {/* Templates Tab - Email */}
              {activeTab === 'templates' && communicationType === 'email' && (
                <div className="tab-content">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h5 className="mb-1">Email Templates</h5>
                      <p className="text-muted mb-0">Create and manage reusable email templates</p>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setEditingEmailTemplate(null);
                        setEmailTemplateForm({ name: '', subject: '', body: '' });
                        setShowEmailTemplateModal(true);
                      }}
                    >
                      <FiPlus className="me-2" />
                      New Template
                    </button>
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
                      {emailTemplates.map((template) => (
                        <div key={template.id} className="col-md-6 mb-3">
                          <div className="card">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h6 className="mb-0">{template.name}</h6>
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
                                <label className="form-label">
                                  Subject <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Email subject"
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
                                  placeholder="Enter template body here..."
                                  value={emailTemplateForm.body}
                                  onChange={(e) =>
                                    setEmailTemplateForm({ ...emailTemplateForm, body: e.target.value })
                                  }
                                  rows={8}
                                  required
                                />
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

              {/* Templates Tab - SMS */}
              {activeTab === 'templates' && communicationType === 'sms' && (
                <div className="tab-content">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h5 className="mb-1">SMS Templates</h5>
                      <p className="text-muted mb-0">Create and manage reusable SMS templates</p>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setEditingSMSTemplate(null);
                        setSmsTemplateForm({ name: '', content: '' });
                        setShowSMSTemplateModal(true);
                      }}
                    >
                      <FiPlus className="me-2" />
                      New Template
                    </button>
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
                      {smsTemplates.map((template) => (
                        <div key={template.id} className="col-md-6 mb-3">
                          <div className="card">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h6 className="mb-0">{template.name}</h6>
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
                                <label className="form-label">
                                  Template Content <span className="text-danger">*</span>
                                </label>
                                <textarea
                                  className="form-control"
                                  placeholder="Enter template content here..."
                                  value={smsTemplateForm.content}
                                  onChange={(e) =>
                                    setSmsTemplateForm({ ...smsTemplateForm, content: e.target.value })
                                  }
                                  rows={8}
                                  required
                                />
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

              {/* Message History Tab */}
              {activeTab === 'history' && communicationType === 'whatsapp' && (
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

              {/* Message History Tab - Email */}
              {activeTab === 'history' && communicationType === 'email' && (
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

              {/* Message History Tab - SMS */}
              {activeTab === 'history' && communicationType === 'sms' && (
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

export default SettingsWhatsAppForm;

