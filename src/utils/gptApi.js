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

const GPT_BASE_URL = '/gpt';

/**
 * GPT/OpenAI API Service
 * Handles all GPT integration, configuration, and AI-powered features
 */
export const gptApi = {
  /**
   * Get GPT configuration settings
   * @returns {Promise<Object>} GPT configuration
   */
  getConfig: async () => {
    try {
      const response = await apiClient.get(`${GPT_BASE_URL}/config`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch GPT configuration');
      throw error;
    }
  },

  /**
   * Update GPT configuration settings
   * @param {Object} configData - Configuration data
   * @param {string} configData.api_key - OpenAI API key
   * @param {string} configData.model - Model name (gpt-3.5-turbo, gpt-4, etc.)
   * @param {number} configData.temperature - Temperature (0-2)
   * @param {number} configData.max_tokens - Max tokens
   * @param {number} configData.top_p - Top P (0-1)
   * @param {number} configData.frequency_penalty - Frequency penalty (-2 to 2)
   * @param {number} configData.presence_penalty - Presence penalty (-2 to 2)
   * @param {string} configData.system_prompt - System prompt
   * @param {boolean} configData.enabled - Whether GPT is enabled
   * @param {Object} configData.features - Feature flags
   * @returns {Promise<Object>} Updated configuration
   */
  updateConfig: async (configData) => {
    try {
      const response = await apiClient.put(`${GPT_BASE_URL}/config`, configData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update GPT configuration');
      throw error;
    }
  },

  /**
   * Test GPT API connection
   * @param {string} apiKey - API key to test (optional, uses saved if not provided)
   * @returns {Promise<Object>} Connection status
   */
  testConnection: async (apiKey = null) => {
    try {
      const response = await apiClient.post(`${GPT_BASE_URL}/test-connection`, {
        api_key: apiKey
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to test GPT connection');
      throw error;
    }
  },

  /**
   * Generate text using GPT
   * @param {Object} requestData - Request data
   * @param {string} requestData.prompt - User prompt
   * @param {string} [requestData.system_prompt] - Custom system prompt
   * @param {string} [requestData.model] - Model override
   * @param {number} [requestData.temperature] - Temperature override
   * @param {number} [requestData.max_tokens] - Max tokens override
   * @param {Array} [requestData.messages] - Conversation history
   * @returns {Promise<Object>} Generated text response
   */
  generateText: async (requestData) => {
    try {
      const response = await apiClient.post(`${GPT_BASE_URL}/generate`, requestData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to generate text');
      throw error;
    }
  },

  /**
   * Generate appointment reminder message
   * @param {Object} appointmentData - Appointment data
   * @param {string} appointmentData.patient_name - Patient name
   * @param {string} appointmentData.appointment_date - Appointment date
   * @param {string} appointmentData.appointment_time - Appointment time
   * @param {string} appointmentData.doctor_name - Doctor name
   * @param {string} [appointmentData.reason] - Appointment reason
   * @param {string} [appointmentData.tone] - Message tone (professional, friendly, casual)
   * @returns {Promise<Object>} Generated message
   */
  generateAppointmentReminder: async (appointmentData) => {
    try {
      const response = await apiClient.post(`${GPT_BASE_URL}/generate/appointment-reminder`, appointmentData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to generate appointment reminder');
      throw error;
    }
  },

  /**
   * Generate prescription summary
   * @param {Object} prescriptionData - Prescription data
   * @param {string} prescriptionData.patient_name - Patient name
   * @param {Array} prescriptionData.medications - Medications array
   * @param {string} [prescriptionData.diagnosis] - Diagnosis
   * @param {string} [prescriptionData.instructions] - Instructions
   * @param {string} [prescriptionData.format] - Output format (summary, detailed, patient-friendly)
   * @returns {Promise<Object>} Generated prescription summary
   */
  generatePrescriptionSummary: async (prescriptionData) => {
    try {
      const response = await apiClient.post(`${GPT_BASE_URL}/generate/prescription-summary`, prescriptionData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to generate prescription summary');
      throw error;
    }
  },

  /**
   * Generate patient communication message
   * @param {Object} messageData - Message data
   * @param {string} messageData.patient_name - Patient name
   * @param {string} messageData.message_type - Type (follow-up, test-results, general)
   * @param {string} messageData.context - Message context
   * @param {string} [messageData.tone] - Message tone
   * @param {string} [messageData.channel] - Channel (whatsapp, email, sms)
   * @returns {Promise<Object>} Generated message
   */
  generatePatientMessage: async (messageData) => {
    try {
      const response = await apiClient.post(`${GPT_BASE_URL}/generate/patient-message`, messageData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to generate patient message');
      throw error;
    }
  },

  /**
   * Generate email subject and body
   * @param {Object} emailData - Email data
   * @param {string} emailData.purpose - Email purpose
   * @param {string} emailData.content - Email content/context
   * @param {string} [emailData.tone] - Email tone
   * @param {string} [emailData.recipient_type] - Recipient type (patient, doctor, staff)
   * @returns {Promise<Object>} Generated email subject and body
   */
  generateEmail: async (emailData) => {
    try {
      const response = await apiClient.post(`${GPT_BASE_URL}/generate/email`, emailData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to generate email');
      throw error;
    }
  },

  /**
   * Generate report summary
   * @param {Object} reportData - Report data
   * @param {string} reportData.report_type - Report type (lab, diagnostic, consultation)
   * @param {Object} reportData.data - Report data
   * @param {string} [reportData.format] - Output format
   * @returns {Promise<Object>} Generated report summary
   */
  generateReportSummary: async (reportData) => {
    try {
      const response = await apiClient.post(`${GPT_BASE_URL}/generate/report-summary`, reportData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to generate report summary');
      throw error;
    }
  },

  /**
   * Generate medical notes
   * @param {Object} notesData - Notes data
   * @param {string} notesData.consultation_type - Consultation type
   * @param {Object} notesData.patient_info - Patient information
   * @param {Object} notesData.symptoms - Symptoms
   * @param {Object} notesData.examination - Examination findings
   * @param {string} [notesData.format] - Output format
   * @returns {Promise<Object>} Generated medical notes
   */
  generateMedicalNotes: async (notesData) => {
    try {
      const response = await apiClient.post(`${GPT_BASE_URL}/generate/medical-notes`, notesData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to generate medical notes');
      throw error;
    }
  },

  /**
   * Get available GPT models
   * @returns {Promise<Array>} Array of available models
   */
  getModels: async () => {
    try {
      const response = await apiClient.get(`${GPT_BASE_URL}/models`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch GPT models');
      throw error;
    }
  },

  /**
   * Get usage statistics
   * @param {Object} [filters] - Optional filters
   * @param {string} [filters.start_date] - Start date
   * @param {string} [filters.end_date] - End date
   * @param {string} [filters.model] - Filter by model
   * @returns {Promise<Object>} Usage statistics
   */
  getUsage: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });
      
      const response = await apiClient.get(
        `${GPT_BASE_URL}/usage${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch usage statistics');
      throw error;
    }
  },

  /**
   * Get cost statistics
   * @param {Object} [filters] - Optional filters
   * @param {string} [filters.start_date] - Start date
   * @param {string} [filters.end_date] - End date
   * @returns {Promise<Object>} Cost statistics
   */
  getCosts: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });
      
      const response = await apiClient.get(
        `${GPT_BASE_URL}/costs${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch cost statistics');
      throw error;
    }
  },

  /**
   * Get prompt templates
   * @param {Object} [filters] - Optional filters
   * @param {string} [filters.category] - Filter by category
   * @returns {Promise<Array>} Array of prompt templates
   */
  getPromptTemplates: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.category) {
        params.append('category', filters.category);
      }
      
      const response = await apiClient.get(
        `${GPT_BASE_URL}/prompt-templates${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch prompt templates');
      throw error;
    }
  },

  /**
   * Create a prompt template
   * @param {Object} templateData - Template data
   * @param {string} templateData.name - Template name
   * @param {string} templateData.prompt - Template prompt
   * @param {string} templateData.category - Template category
   * @param {string} [templateData.description] - Template description
   * @param {Object} [templateData.variables] - Template variables
   * @returns {Promise<Object>} Created template
   */
  createPromptTemplate: async (templateData) => {
    try {
      const response = await apiClient.post(`${GPT_BASE_URL}/prompt-templates`, templateData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create prompt template');
      throw error;
    }
  },

  /**
   * Update a prompt template
   * @param {number|string} templateId - Template ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated template
   */
  updatePromptTemplate: async (templateId, updateData) => {
    try {
      const response = await apiClient.put(
        `${GPT_BASE_URL}/prompt-templates/${templateId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update prompt template');
      throw error;
    }
  },

  /**
   * Delete a prompt template
   * @param {number|string} templateId - Template ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deletePromptTemplate: async (templateId) => {
    try {
      const response = await apiClient.delete(`${GPT_BASE_URL}/prompt-templates/${templateId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to delete prompt template');
      throw error;
    }
  },

  /**
   * Get response templates
   * @param {Object} [filters] - Optional filters
   * @param {string} [filters.use_case] - Filter by use case
   * @returns {Promise<Array>} Array of response templates
   */
  getResponseTemplates: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.use_case) {
        params.append('use_case', filters.use_case);
      }
      
      const response = await apiClient.get(
        `${GPT_BASE_URL}/response-templates${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch response templates');
      throw error;
    }
  },

  /**
   * Create a response template
   * @param {Object} templateData - Template data
   * @param {string} templateData.name - Template name
   * @param {string} templateData.content - Template content
   * @param {string} templateData.use_case - Use case
   * @param {string} [templateData.description] - Template description
   * @returns {Promise<Object>} Created template
   */
  createResponseTemplate: async (templateData) => {
    try {
      const response = await apiClient.post(`${GPT_BASE_URL}/response-templates`, templateData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create response template');
      throw error;
    }
  },

  /**
   * Update a response template
   * @param {number|string} templateId - Template ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated template
   */
  updateResponseTemplate: async (templateId, updateData) => {
    try {
      const response = await apiClient.put(
        `${GPT_BASE_URL}/response-templates/${templateId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update response template');
      throw error;
    }
  },

  /**
   * Delete a response template
   * @param {number|string} templateId - Template ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteResponseTemplate: async (templateId) => {
    try {
      const response = await apiClient.delete(`${GPT_BASE_URL}/response-templates/${templateId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to delete response template');
      throw error;
    }
  },

  /**
   * Get integration settings
   * @returns {Promise<Object>} Integration settings
   */
  getIntegrations: async () => {
    try {
      const response = await apiClient.get(`${GPT_BASE_URL}/integrations`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch integration settings');
      throw error;
    }
  },

  /**
   * Update integration settings
   * @param {Object} integrationData - Integration data
   * @param {boolean} [integrationData.whatsapp_enabled] - Enable WhatsApp integration
   * @param {boolean} [integrationData.email_enabled] - Enable Email integration
   * @param {boolean} [integrationData.sms_enabled] - Enable SMS integration
   * @param {boolean} [integrationData.appointments_enabled] - Enable appointment automation
   * @param {boolean} [integrationData.prescriptions_enabled] - Enable prescription automation
   * @param {boolean} [integrationData.reports_enabled] - Enable report automation
   * @returns {Promise<Object>} Updated integration settings
   */
  updateIntegrations: async (integrationData) => {
    try {
      const response = await apiClient.put(`${GPT_BASE_URL}/integrations`, integrationData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update integration settings');
      throw error;
    }
  },

  /**
   * Get feature flags
   * @returns {Promise<Object>} Feature flags
   */
  getFeatures: async () => {
    try {
      const response = await apiClient.get(`${GPT_BASE_URL}/features`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch feature flags');
      throw error;
    }
  },

  /**
   * Update feature flags
   * @param {Object} featuresData - Features data
   * @param {boolean} [featuresData.auto_generate_messages] - Auto-generate messages
   * @param {boolean} [featuresData.auto_generate_emails] - Auto-generate emails
   * @param {boolean} [featuresData.auto_generate_summaries] - Auto-generate summaries
   * @param {boolean} [featuresData.smart_suggestions] - Smart suggestions
   * @param {boolean} [featuresData.content_enhancement] - Content enhancement
   * @param {boolean} [featuresData.translation] - Translation support
   * @returns {Promise<Object>} Updated feature flags
   */
  updateFeatures: async (featuresData) => {
    try {
      const response = await apiClient.put(`${GPT_BASE_URL}/features`, featuresData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update feature flags');
      throw error;
    }
  },

  /**
   * Get conversation history
   * @param {Object} [filters] - Optional filters
   * @param {string} [filters.start_date] - Start date
   * @param {string} [filters.end_date] - End date
   * @param {string} [filters.model] - Filter by model
   * @param {number} [filters.limit] - Limit results
   * @param {number} [filters.offset] - Offset for pagination
   * @returns {Promise<Object>} Conversation history with pagination
   */
  getConversationHistory: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });
      
      const response = await apiClient.get(
        `${GPT_BASE_URL}/conversations${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch conversation history');
      throw error;
    }
  },

  /**
   * Translate text using GPT
   * @param {Object} translationData - Translation data
   * @param {string} translationData.text - Text to translate
   * @param {string} translationData.target_language - Target language
   * @param {string} [translationData.source_language] - Source language (auto-detect if not provided)
   * @returns {Promise<Object>} Translated text
   */
  translate: async (translationData) => {
    try {
      const response = await apiClient.post(`${GPT_BASE_URL}/translate`, translationData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to translate text');
      throw error;
    }
  },

  /**
   * Summarize text using GPT
   * @param {Object} summaryData - Summary data
   * @param {string} summaryData.text - Text to summarize
   * @param {number} [summaryData.max_length] - Maximum summary length
   * @param {string} [summaryData.format] - Summary format (bullet, paragraph, list)
   * @returns {Promise<Object>} Summarized text
   */
  summarize: async (summaryData) => {
    try {
      const response = await apiClient.post(`${GPT_BASE_URL}/summarize`, summaryData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to summarize text');
      throw error;
    }
  },
};

export default gptApi;


