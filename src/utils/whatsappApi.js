import axios from 'axios';
import { setupAxiosInterceptors, handleApiError } from './apiErrorHandler';

// Create axios instance with interceptors
const apiClient = setupAxiosInterceptors(axios.create({
  baseURL: 'https://bkdemo1.clinicpro.cc',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
}));

const WHATSAPP_BASE_URL = '/whatsapp';
const EMAIL_BASE_URL = '/email';
const SMS_BASE_URL = '/sms';

/**
 * Communication API Service
 * Handles all WhatsApp, Email, and SMS-related API calls
 */
export const whatsappApi = {
  /**
   * Send a WhatsApp message immediately
   * @param {Object} messageData - Message data
   * @param {string} messageData.phone_number - Recipient phone number (with country code)
   * @param {string} messageData.message - Message content
   * @param {string} [messageData.template_id] - Optional template ID
   * @returns {Promise<Object>} Response data
   */
  sendMessage: async (messageData) => {
    try {
      const response = await apiClient.post(
        `${WHATSAPP_BASE_URL}/send`,
        {
          phone_number: messageData.phone_number,
          message: messageData.message,
          template_id: messageData.template_id || null,
        }
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to send WhatsApp message');
      throw error;
    }
  },

  /**
   * Create a scheduled WhatsApp message
   * @param {Object} scheduleData - Schedule data
   * @param {string} scheduleData.phone_number - Recipient phone number
   * @param {string} scheduleData.message - Message content
   * @param {string} scheduleData.scheduled_time - ISO datetime string
   * @param {string} [scheduleData.recurrence] - 'once', 'daily', 'weekly', 'monthly'
   * @param {string} [scheduleData.template_id] - Optional template ID
   * @param {boolean} [scheduleData.is_active] - Whether the schedule is active
   * @returns {Promise<Object>} Created schedule data
   */
  createSchedule: async (scheduleData) => {
    try {
      const response = await apiClient.post(
        `${WHATSAPP_BASE_URL}/schedules`,
        {
          phone_number: scheduleData.phone_number,
          message: scheduleData.message,
          scheduled_time: scheduleData.scheduled_time,
          recurrence: scheduleData.recurrence || 'once',
          template_id: scheduleData.template_id || null,
          is_active: scheduleData.is_active !== undefined ? scheduleData.is_active : true,
        }
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create scheduled message');
      throw error;
    }
  },

  /**
   * Get all scheduled messages
   * @param {Object} [filters] - Optional filters
   * @param {boolean} [filters.is_active] - Filter by active status
   * @returns {Promise<Array>} Array of scheduled messages
   */
  getSchedules: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.is_active !== undefined) {
        params.append('is_active', filters.is_active);
      }
      
      const response = await apiClient.get(
        `${WHATSAPP_BASE_URL}/schedules${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch scheduled messages');
      throw error;
    }
  },

  /**
   * Get a single scheduled message by ID
   * @param {number|string} scheduleId - Schedule ID
   * @returns {Promise<Object>} Schedule data
   */
  getSchedule: async (scheduleId) => {
    try {
      const response = await apiClient.get(`${WHATSAPP_BASE_URL}/schedules/${scheduleId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch scheduled message');
      throw error;
    }
  },

  /**
   * Update a scheduled message
   * @param {number|string} scheduleId - Schedule ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated schedule data
   */
  updateSchedule: async (scheduleId, updateData) => {
    try {
      const response = await apiClient.put(
        `${WHATSAPP_BASE_URL}/schedules/${scheduleId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update scheduled message');
      throw error;
    }
  },

  /**
   * Delete a scheduled message
   * @param {number|string} scheduleId - Schedule ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteSchedule: async (scheduleId) => {
    try {
      const response = await apiClient.delete(`${WHATSAPP_BASE_URL}/schedules/${scheduleId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to delete scheduled message');
      throw error;
    }
  },

  /**
   * Toggle schedule active status
   * @param {number|string} scheduleId - Schedule ID
   * @param {boolean} isActive - New active status
   * @returns {Promise<Object>} Updated schedule data
   */
  toggleSchedule: async (scheduleId, isActive) => {
    try {
      const response = await apiClient.patch(
        `${WHATSAPP_BASE_URL}/schedules/${scheduleId}/toggle`,
        { is_active: isActive }
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to toggle schedule status');
      throw error;
    }
  },

  /**
   * Get message history
   * @param {Object} [filters] - Optional filters
   * @param {string} [filters.phone_number] - Filter by phone number
   * @param {string} [filters.start_date] - Start date filter
   * @param {string} [filters.end_date] - End date filter
   * @param {number} [filters.limit] - Limit results
   * @param {number} [filters.offset] - Offset for pagination
   * @returns {Promise<Object>} Message history with pagination
   */
  getMessageHistory: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });
      
      const response = await apiClient.get(
        `${WHATSAPP_BASE_URL}/messages${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch message history');
      throw error;
    }
  },

  /**
   * Get message templates
   * @param {Object} [filters] - Optional filters
   * @param {string} [filters.action_type] - Filter by action type
   * @returns {Promise<Array>} Array of message templates
   */
  getTemplates: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.action_type) {
        params.append('action_type', filters.action_type);
      }
      
      const response = await apiClient.get(
        `${WHATSAPP_BASE_URL}/templates${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch message templates');
      throw error;
    }
  },

  /**
   * Create a message template
   * @param {Object} templateData - Template data
   * @param {string} templateData.name - Template name
   * @param {string} templateData.content - Template content
   * @param {string} [templateData.action_type] - Action type (e.g., 'appointment_booked', 'appointment_reminder', 'prescription_ready', etc.)
   * @param {boolean} [templateData.auto_send] - Whether to auto-send on action
   * @param {Array} [templateData.variables] - Template variables
   * @returns {Promise<Object>} Created template data
   */
  createTemplate: async (templateData) => {
    try {
      const response = await apiClient.post(
        `${WHATSAPP_BASE_URL}/templates`,
        {
          name: templateData.name,
          content: templateData.content,
          action_type: templateData.action_type || null,
          auto_send: templateData.auto_send !== undefined ? templateData.auto_send : false,
          variables: templateData.variables || null,
        }
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create message template');
      throw error;
    }
  },

  /**
   * Update a message template
   * @param {number|string} templateId - Template ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated template data
   */
  updateTemplate: async (templateId, updateData) => {
    try {
      const response = await apiClient.put(
        `${WHATSAPP_BASE_URL}/templates/${templateId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update message template');
      throw error;
    }
  },

  /**
   * Delete a message template
   * @param {number|string} templateId - Template ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteTemplate: async (templateId) => {
    try {
      const response = await apiClient.delete(`${WHATSAPP_BASE_URL}/templates/${templateId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to delete message template');
      throw error;
    }
  },

  /**
   * Test WhatsApp API connection
   * @returns {Promise<Object>} Connection status
   */
  testConnection: async () => {
    try {
      const response = await apiClient.get(`${WHATSAPP_BASE_URL}/test-connection`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to test WhatsApp connection');
      throw error;
    }
  },

  // ==================== EMAIL API METHODS ====================

  /**
   * Send an email immediately
   * @param {Object} emailData - Email data
   * @param {string|Array} emailData.to - Recipient email(s)
   * @param {string} emailData.subject - Email subject
   * @param {string} emailData.body - Email body (HTML or plain text)
   * @param {string} [emailData.from] - Sender email
   * @param {Array} [emailData.cc] - CC recipients
   * @param {Array} [emailData.bcc] - BCC recipients
   * @param {Array} [emailData.attachments] - File attachments
   * @param {string} [emailData.template_id] - Optional template ID
   * @returns {Promise<Object>} Response data
   */
  sendEmail: async (emailData) => {
    try {
      const response = await apiClient.post(
        `${EMAIL_BASE_URL}/send`,
        {
          to: emailData.to,
          subject: emailData.subject,
          body: emailData.body,
          from: emailData.from || null,
          cc: emailData.cc || null,
          bcc: emailData.bcc || null,
          attachments: emailData.attachments || null,
          template_id: emailData.template_id || null,
        }
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to send email');
      throw error;
    }
  },

  /**
   * Create a scheduled email
   * @param {Object} scheduleData - Schedule data
   * @param {string|Array} scheduleData.to - Recipient email(s)
   * @param {string} scheduleData.subject - Email subject
   * @param {string} scheduleData.body - Email body
   * @param {string} scheduleData.scheduled_time - ISO datetime string
   * @param {string} [scheduleData.recurrence] - 'once', 'daily', 'weekly', 'monthly'
   * @param {string} [scheduleData.template_id] - Optional template ID
   * @param {boolean} [scheduleData.is_active] - Whether the schedule is active
   * @returns {Promise<Object>} Created schedule data
   */
  createEmailSchedule: async (scheduleData) => {
    try {
      const response = await apiClient.post(
        `${EMAIL_BASE_URL}/schedules`,
        {
          to: scheduleData.to,
          subject: scheduleData.subject,
          body: scheduleData.body,
          scheduled_time: scheduleData.scheduled_time,
          recurrence: scheduleData.recurrence || 'once',
          template_id: scheduleData.template_id || null,
          is_active: scheduleData.is_active !== undefined ? scheduleData.is_active : true,
          from: scheduleData.from || null,
          cc: scheduleData.cc || null,
          bcc: scheduleData.bcc || null,
        }
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create scheduled email');
      throw error;
    }
  },

  /**
   * Get all scheduled emails
   * @param {Object} [filters] - Optional filters
   * @param {boolean} [filters.is_active] - Filter by active status
   * @returns {Promise<Array>} Array of scheduled emails
   */
  getEmailSchedules: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.is_active !== undefined) {
        params.append('is_active', filters.is_active);
      }
      
      const response = await apiClient.get(
        `${EMAIL_BASE_URL}/schedules${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch scheduled emails');
      throw error;
    }
  },

  /**
   * Update a scheduled email
   * @param {number|string} scheduleId - Schedule ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated schedule data
   */
  updateEmailSchedule: async (scheduleId, updateData) => {
    try {
      const response = await apiClient.put(
        `${EMAIL_BASE_URL}/schedules/${scheduleId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update scheduled email');
      throw error;
    }
  },

  /**
   * Delete a scheduled email
   * @param {number|string} scheduleId - Schedule ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteEmailSchedule: async (scheduleId) => {
    try {
      const response = await apiClient.delete(`${EMAIL_BASE_URL}/schedules/${scheduleId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to delete scheduled email');
      throw error;
    }
  },

  /**
   * Toggle email schedule active status
   * @param {number|string} scheduleId - Schedule ID
   * @param {boolean} isActive - New active status
   * @returns {Promise<Object>} Updated schedule data
   */
  toggleEmailSchedule: async (scheduleId, isActive) => {
    try {
      const response = await apiClient.patch(
        `${EMAIL_BASE_URL}/schedules/${scheduleId}/toggle`,
        { is_active: isActive }
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to toggle email schedule status');
      throw error;
    }
  },

  /**
   * Get email history
   * @param {Object} [filters] - Optional filters
   * @param {string} [filters.to] - Filter by recipient
   * @param {string} [filters.start_date] - Start date filter
   * @param {string} [filters.end_date] - End date filter
   * @param {number} [filters.limit] - Limit results
   * @param {number} [filters.offset] - Offset for pagination
   * @returns {Promise<Object>} Email history with pagination
   */
  getEmailHistory: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });
      
      const response = await apiClient.get(
        `${EMAIL_BASE_URL}/messages${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch email history');
      throw error;
    }
  },

  /**
   * Get email templates
   * @param {Object} [filters] - Optional filters
   * @param {string} [filters.action_type] - Filter by action type
   * @returns {Promise<Array>} Array of email templates
   */
  getEmailTemplates: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.action_type) {
        params.append('action_type', filters.action_type);
      }
      
      const response = await apiClient.get(
        `${EMAIL_BASE_URL}/templates${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch email templates');
      throw error;
    }
  },

  /**
   * Create an email template
   * @param {Object} templateData - Template data
   * @param {string} templateData.name - Template name
   * @param {string} templateData.subject - Email subject
   * @param {string} templateData.body - Template content
   * @param {string} [templateData.action_type] - Action type
   * @param {boolean} [templateData.auto_send] - Whether to auto-send on action
   * @returns {Promise<Object>} Created template data
   */
  createEmailTemplate: async (templateData) => {
    try {
      const response = await apiClient.post(
        `${EMAIL_BASE_URL}/templates`,
        {
          name: templateData.name,
          subject: templateData.subject,
          body: templateData.body,
          action_type: templateData.action_type || null,
          auto_send: templateData.auto_send !== undefined ? templateData.auto_send : false,
        }
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create email template');
      throw error;
    }
  },

  /**
   * Update an email template
   * @param {number|string} templateId - Template ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated template data
   */
  updateEmailTemplate: async (templateId, updateData) => {
    try {
      const response = await apiClient.put(
        `${EMAIL_BASE_URL}/templates/${templateId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update email template');
      throw error;
    }
  },

  /**
   * Delete an email template
   * @param {number|string} templateId - Template ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteEmailTemplate: async (templateId) => {
    try {
      const response = await apiClient.delete(`${EMAIL_BASE_URL}/templates/${templateId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to delete email template');
      throw error;
    }
  },

  /**
   * Test Email API connection
   * @returns {Promise<Object>} Connection status
   */
  testEmailConnection: async () => {
    try {
      const response = await apiClient.get(`${EMAIL_BASE_URL}/test-connection`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to test email connection');
      throw error;
    }
  },

  // ==================== SMS API METHODS ====================

  /**
   * Send an SMS immediately
   * @param {Object} smsData - SMS data
   * @param {string} smsData.phone_number - Recipient phone number (with country code)
   * @param {string} smsData.message - Message content
   * @param {string} [smsData.template_id] - Optional template ID
   * @returns {Promise<Object>} Response data
   */
  sendSMS: async (smsData) => {
    try {
      const response = await apiClient.post(
        `${SMS_BASE_URL}/send`,
        {
          phone_number: smsData.phone_number,
          message: smsData.message,
          template_id: smsData.template_id || null,
        }
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to send SMS');
      throw error;
    }
  },

  /**
   * Create a scheduled SMS
   * @param {Object} scheduleData - Schedule data
   * @param {string} scheduleData.phone_number - Recipient phone number
   * @param {string} scheduleData.message - Message content
   * @param {string} scheduleData.scheduled_time - ISO datetime string
   * @param {string} [scheduleData.recurrence] - 'once', 'daily', 'weekly', 'monthly'
   * @param {string} [scheduleData.template_id] - Optional template ID
   * @param {boolean} [scheduleData.is_active] - Whether the schedule is active
   * @returns {Promise<Object>} Created schedule data
   */
  createSMSSchedule: async (scheduleData) => {
    try {
      const response = await apiClient.post(
        `${SMS_BASE_URL}/schedules`,
        {
          phone_number: scheduleData.phone_number,
          message: scheduleData.message,
          scheduled_time: scheduleData.scheduled_time,
          recurrence: scheduleData.recurrence || 'once',
          template_id: scheduleData.template_id || null,
          is_active: scheduleData.is_active !== undefined ? scheduleData.is_active : true,
        }
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create scheduled SMS');
      throw error;
    }
  },

  /**
   * Get all scheduled SMS
   * @param {Object} [filters] - Optional filters
   * @param {boolean} [filters.is_active] - Filter by active status
   * @returns {Promise<Array>} Array of scheduled SMS
   */
  getSMSSchedules: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.is_active !== undefined) {
        params.append('is_active', filters.is_active);
      }
      
      const response = await apiClient.get(
        `${SMS_BASE_URL}/schedules${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch scheduled SMS');
      throw error;
    }
  },

  /**
   * Update a scheduled SMS
   * @param {number|string} scheduleId - Schedule ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated schedule data
   */
  updateSMSSchedule: async (scheduleId, updateData) => {
    try {
      const response = await apiClient.put(
        `${SMS_BASE_URL}/schedules/${scheduleId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update scheduled SMS');
      throw error;
    }
  },

  /**
   * Delete a scheduled SMS
   * @param {number|string} scheduleId - Schedule ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteSMSSchedule: async (scheduleId) => {
    try {
      const response = await apiClient.delete(`${SMS_BASE_URL}/schedules/${scheduleId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to delete scheduled SMS');
      throw error;
    }
  },

  /**
   * Toggle SMS schedule active status
   * @param {number|string} scheduleId - Schedule ID
   * @param {boolean} isActive - New active status
   * @returns {Promise<Object>} Updated schedule data
   */
  toggleSMSSchedule: async (scheduleId, isActive) => {
    try {
      const response = await apiClient.patch(
        `${SMS_BASE_URL}/schedules/${scheduleId}/toggle`,
        { is_active: isActive }
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to toggle SMS schedule status');
      throw error;
    }
  },

  /**
   * Get SMS history
   * @param {Object} [filters] - Optional filters
   * @param {string} [filters.phone_number] - Filter by phone number
   * @param {string} [filters.start_date] - Start date filter
   * @param {string} [filters.end_date] - End date filter
   * @param {number} [filters.limit] - Limit results
   * @param {number} [filters.offset] - Offset for pagination
   * @returns {Promise<Object>} SMS history with pagination
   */
  getSMSHistory: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });
      
      const response = await apiClient.get(
        `${SMS_BASE_URL}/messages${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch SMS history');
      throw error;
    }
  },

  /**
   * Get SMS templates
   * @param {Object} [filters] - Optional filters
   * @param {string} [filters.action_type] - Filter by action type
   * @returns {Promise<Array>} Array of SMS templates
   */
  getSMSTemplates: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.action_type) {
        params.append('action_type', filters.action_type);
      }
      
      const response = await apiClient.get(
        `${SMS_BASE_URL}/templates${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch SMS templates');
      throw error;
    }
  },

  /**
   * Create an SMS template
   * @param {Object} templateData - Template data
   * @param {string} templateData.name - Template name
   * @param {string} templateData.content - Template content
   * @param {string} [templateData.action_type] - Action type
   * @param {boolean} [templateData.auto_send] - Whether to auto-send on action
   * @returns {Promise<Object>} Created template data
   */
  createSMSTemplate: async (templateData) => {
    try {
      const response = await apiClient.post(
        `${SMS_BASE_URL}/templates`,
        {
          name: templateData.name,
          content: templateData.content,
          action_type: templateData.action_type || null,
          auto_send: templateData.auto_send !== undefined ? templateData.auto_send : false,
        }
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create SMS template');
      throw error;
    }
  },

  /**
   * Update an SMS template
   * @param {number|string} templateId - Template ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated template data
   */
  updateSMSTemplate: async (templateId, updateData) => {
    try {
      const response = await apiClient.put(
        `${SMS_BASE_URL}/templates/${templateId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update SMS template');
      throw error;
    }
  },

  /**
   * Delete an SMS template
   * @param {number|string} templateId - Template ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteSMSTemplate: async (templateId) => {
    try {
      const response = await apiClient.delete(`${SMS_BASE_URL}/templates/${templateId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to delete SMS template');
      throw error;
    }
  },

  /**
   * Test SMS API connection
   * @returns {Promise<Object>} Connection status
   */
  testSMSConnection: async () => {
    try {
      const response = await apiClient.get(`${SMS_BASE_URL}/test-connection`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to test SMS connection');
      throw error;
    }
  },

  /**
   * Send message based on action
   * @param {Object} actionData - Action data
   * @param {string} actionData.action_type - Action type
   * @param {Object} actionData.data - Action data (appointment, prescription, etc.)
   * @param {string} [actionData.channel] - 'whatsapp', 'email', 'sms', or 'all'
   * @returns {Promise<Object>} Response data
   */
  sendActionMessage: async (actionData) => {
    try {
      const response = await apiClient.post(
        `${WHATSAPP_BASE_URL}/send-action`,
        {
          action_type: actionData.action_type,
          data: actionData.data,
          channel: actionData.channel || 'whatsapp',
        }
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to send action message');
      throw error;
    }
  },

  /**
   * Get action types
   * @returns {Promise<Array>} Array of available action types
   */
  getActionTypes: async () => {
    try {
      const response = await apiClient.get(`${WHATSAPP_BASE_URL}/action-types`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch action types');
      throw error;
    }
  },
};

export default whatsappApi;

