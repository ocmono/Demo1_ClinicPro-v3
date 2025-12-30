import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { toast } from 'react-toastify';
import whatsappApi from '../utils/whatsappApi';

const WhatsAppContext = createContext();

// Constants
const CACHE_DURATION = 60000; // 60 seconds
const AUTO_REFRESH_INTERVAL = 120000; // 2 minutes

export const WhatsAppProvider = ({ children }) => {
  // WhatsApp state
  const [schedules, setSchedules] = useState([]);
  const [messageHistory, setMessageHistory] = useState([]);
  const [templates, setTemplates] = useState([]);
  
  // Email state
  const [emailSchedules, setEmailSchedules] = useState([]);
  const [emailHistory, setEmailHistory] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);
  
  // SMS state
  const [smsSchedules, setSmsSchedules] = useState([]);
  const [smsHistory, setSmsHistory] = useState([]);
  const [smsTemplates, setSmsTemplates] = useState([]);
  
  // Common state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);

  // Cache management
  const cache = useRef({
    schedules: { data: null, timestamp: 0 },
    messageHistory: { data: null, timestamp: 0 },
    templates: { data: null, timestamp: 0 },
    emailSchedules: { data: null, timestamp: 0 },
    emailHistory: { data: null, timestamp: 0 },
    emailTemplates: { data: null, timestamp: 0 },
    smsSchedules: { data: null, timestamp: 0 },
    smsHistory: { data: null, timestamp: 0 },
    smsTemplates: { data: null, timestamp: 0 },
  });

  const isCacheValid = (key) => {
    return (
      cache.current[key]?.data &&
      Date.now() - cache.current[key].timestamp < CACHE_DURATION
    );
  };

  const getCache = (key) => {
    return isCacheValid(key) ? cache.current[key].data : null;
  };

  const setCache = (key, data) => {
    cache.current[key] = {
      data,
      timestamp: Date.now(),
    };
  };

  const clearCache = (key = null) => {
    if (key) {
      cache.current[key] = { data: null, timestamp: 0 };
    } else {
      cache.current = {
        schedules: { data: null, timestamp: 0 },
        messageHistory: { data: null, timestamp: 0 },
        templates: { data: null, timestamp: 0 },
        emailSchedules: { data: null, timestamp: 0 },
        emailHistory: { data: null, timestamp: 0 },
        emailTemplates: { data: null, timestamp: 0 },
        smsSchedules: { data: null, timestamp: 0 },
        smsHistory: { data: null, timestamp: 0 },
        smsTemplates: { data: null, timestamp: 0 },
      };
    }
  };

  // Fetch schedules
  const fetchSchedules = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = getCache('schedules');
      if (cached) {
        setSchedules(cached);
        return cached;
      }
    }

    try {
      setLoading(true);
      const data = await whatsappApi.getSchedules();
      const schedulesArray = Array.isArray(data) ? data : data?.results || [];
      setSchedules(schedulesArray);
      setCache('schedules', schedulesArray);
      return schedulesArray;
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch message history
  const fetchMessageHistory = useCallback(async (filters = {}, forceRefresh = false) => {
    const cacheKey = `messageHistory_${JSON.stringify(filters)}`;
    
    if (!forceRefresh) {
      const cached = getCache(cacheKey);
      if (cached) {
        setMessageHistory(cached);
        return cached;
      }
    }

    try {
      setLoading(true);
      const data = await whatsappApi.getMessageHistory(filters);
      const historyArray = Array.isArray(data) ? data : data?.results || [];
      setMessageHistory(historyArray);
      setCache(cacheKey, historyArray);
      return historyArray;
    } catch (error) {
      console.error('Failed to fetch message history:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch templates
  const fetchTemplates = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = getCache('templates');
      if (cached) {
        setTemplates(cached);
        return cached;
      }
    }

    try {
      setLoading(true);
      const data = await whatsappApi.getTemplates();
      const templatesArray = Array.isArray(data) ? data : [];
      setTemplates(templatesArray);
      setCache('templates', templatesArray);
      return templatesArray;
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Send message immediately
  const sendMessage = useCallback(async (messageData) => {
    try {
      setLoading(true);
      const response = await whatsappApi.sendMessage(messageData);
      toast.success('WhatsApp message sent successfully!');
      
      // Refresh message history
      await fetchMessageHistory({}, true);
      
      return response;
    } catch (error) {
      console.error('Failed to send message:', error);
      // toast.error('Failed to send WhatsApp message');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchMessageHistory]);

  // Create schedule
  const createSchedule = useCallback(async (scheduleData) => {
    try {
      setLoading(true);
      const response = await whatsappApi.createSchedule(scheduleData);
      toast.success('Scheduled message created successfully!');
      
      // Refresh schedules
      await fetchSchedules(true);
      
      return response;
    } catch (error) {
      console.error('Failed to create schedule:', error);
      // toast.error('Failed to create scheduled message');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchSchedules]);

  // Update schedule
  const updateSchedule = useCallback(async (scheduleId, updateData) => {
    try {
      setLoading(true);
      const response = await whatsappApi.updateSchedule(scheduleId, updateData);
      toast.success('Scheduled message updated successfully!');
      
      // Refresh schedules
      await fetchSchedules(true);
      
      return response;
    } catch (error) {
      console.error('Failed to update schedule:', error);
      // toast.error('Failed to update scheduled message');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchSchedules]);

  // Delete schedule
  const deleteSchedule = useCallback(async (scheduleId) => {
    try {
      setLoading(true);
      await whatsappApi.deleteSchedule(scheduleId);
      toast.success('Scheduled message deleted successfully!');
      
      // Refresh schedules
      await fetchSchedules(true);
      
      return true;
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      // toast.error('Failed to delete scheduled message');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchSchedules]);

  // Toggle schedule active status
  const toggleSchedule = useCallback(async (scheduleId, isActive) => {
    try {
      setLoading(true);
      const response = await whatsappApi.toggleSchedule(scheduleId, isActive);
      toast.success(`Schedule ${isActive ? 'activated' : 'deactivated'} successfully!`);
      
      // Refresh schedules
      await fetchSchedules(true);
      
      return response;
    } catch (error) {
      console.error('Failed to toggle schedule:', error);
      // toast.error('Failed to update schedule status');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchSchedules]);

  // Create template
  const createTemplate = useCallback(async (templateData) => {
    try {
      setLoading(true);
      const response = await whatsappApi.createTemplate(templateData);
      toast.success('Message template created successfully!');
      
      // Refresh templates
      await fetchTemplates(true);
      
      return response;
    } catch (error) {
      console.error('Failed to create template:', error);
      // toast.error('Failed to create message template');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates]);

  // Update template
  const updateTemplate = useCallback(async (templateId, updateData) => {
    try {
      setLoading(true);
      const response = await whatsappApi.updateTemplate(templateId, updateData);
      toast.success('Message template updated successfully!');
      
      // Refresh templates
      await fetchTemplates(true);
      
      return response;
    } catch (error) {
      console.error('Failed to update template:', error);
      // toast.error('Failed to update message template');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates]);

  // Delete template
  const deleteTemplate = useCallback(async (templateId) => {
    try {
      setLoading(true);
      await whatsappApi.deleteTemplate(templateId);
      toast.success('Message template deleted successfully!');
      
      // Refresh templates
      await fetchTemplates(true);
      
      return true;
    } catch (error) {
      console.error('Failed to delete template:', error);
      // toast.error('Failed to delete message template');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates]);

  // Test connection
  const testConnection = useCallback(async () => {
    try {
      setLoading(true);
      const response = await whatsappApi.testConnection();
      setConnectionStatus(response);
      toast.success('WhatsApp API connection test successful!');
      return response;
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus({ connected: false, error: error.message });
      // toast.error('WhatsApp API connection test failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get active schedules
  const getActiveSchedules = useCallback(() => {
    return schedules.filter(schedule => schedule.is_active === true);
  }, [schedules]);

  // Get inactive schedules
  const getInactiveSchedules = useCallback(() => {
    return schedules.filter(schedule => schedule.is_active === false);
  }, [schedules]);

  // Get schedules by recurrence
  const getSchedulesByRecurrence = useCallback((recurrence) => {
    return schedules.filter(schedule => schedule.recurrence === recurrence);
  }, [schedules]);

  // ==================== EMAIL FUNCTIONS ====================

  // Fetch email schedules
  const fetchEmailSchedules = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = getCache('emailSchedules');
      if (cached) {
        setEmailSchedules(cached);
        return cached;
      }
    }

    try {
      setLoading(true);
      const data = await whatsappApi.getEmailSchedules();
      const schedulesArray = Array.isArray(data) ? data : data?.results || [];
      setEmailSchedules(schedulesArray);
      setCache('emailSchedules', schedulesArray);
      return schedulesArray;
    } catch (error) {
      console.error('Failed to fetch email schedules:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch email history
  const fetchEmailHistory = useCallback(async (filters = {}, forceRefresh = false) => {
    const cacheKey = `emailHistory_${JSON.stringify(filters)}`;
    
    if (!forceRefresh) {
      const cached = getCache(cacheKey);
      if (cached) {
        setEmailHistory(cached);
        return cached;
      }
    }

    try {
      setLoading(true);
      const data = await whatsappApi.getEmailHistory(filters);
      const historyArray = Array.isArray(data) ? data : data?.results || [];
      setEmailHistory(historyArray);
      setCache(cacheKey, historyArray);
      return historyArray;
    } catch (error) {
      console.error('Failed to fetch email history:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch email templates
  const fetchEmailTemplates = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = getCache('emailTemplates');
      if (cached) {
        setEmailTemplates(cached);
        return cached;
      }
    }

    try {
      setLoading(true);
      const data = await whatsappApi.getEmailTemplates();
      const templatesArray = Array.isArray(data) ? data : [];
      setEmailTemplates(templatesArray);
      setCache('emailTemplates', templatesArray);
      return templatesArray;
    } catch (error) {
      console.error('Failed to fetch email templates:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Send email
  const sendEmail = useCallback(async (emailData) => {
    try {
      setLoading(true);
      const response = await whatsappApi.sendEmail(emailData);
      toast.success('Email sent successfully!');
      
      await fetchEmailHistory({}, true);
      
      return response;
    } catch (error) {
      console.error('Failed to send email:', error);
      // toast.error('Failed to send email');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchEmailHistory]);

  // Create email schedule
  const createEmailSchedule = useCallback(async (scheduleData) => {
    try {
      setLoading(true);
      const response = await whatsappApi.createEmailSchedule(scheduleData);
      toast.success('Scheduled email created successfully!');
      
      await fetchEmailSchedules(true);
      
      return response;
    } catch (error) {
      console.error('Failed to create email schedule:', error);
      // toast.error('Failed to create scheduled email');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchEmailSchedules]);

  // Update email schedule
  const updateEmailSchedule = useCallback(async (scheduleId, updateData) => {
    try {
      setLoading(true);
      const response = await whatsappApi.updateEmailSchedule(scheduleId, updateData);
      toast.success('Scheduled email updated successfully!');
      
      await fetchEmailSchedules(true);
      
      return response;
    } catch (error) {
      console.error('Failed to update email schedule:', error);
      // toast.error('Failed to update scheduled email');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchEmailSchedules]);

  // Delete email schedule
  const deleteEmailSchedule = useCallback(async (scheduleId) => {
    try {
      setLoading(true);
      await whatsappApi.deleteEmailSchedule(scheduleId);
      toast.success('Scheduled email deleted successfully!');
      
      await fetchEmailSchedules(true);
      
      return true;
    } catch (error) {
      console.error('Failed to delete email schedule:', error);
      // toast.error('Failed to delete scheduled email');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchEmailSchedules]);

  // Toggle email schedule
  const toggleEmailSchedule = useCallback(async (scheduleId, isActive) => {
    try {
      setLoading(true);
      const response = await whatsappApi.toggleEmailSchedule(scheduleId, isActive);
      toast.success(`Email schedule ${isActive ? 'activated' : 'deactivated'} successfully!`);
      
      await fetchEmailSchedules(true);
      
      return response;
    } catch (error) {
      console.error('Failed to toggle email schedule:', error);
      // toast.error('Failed to update email schedule status');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchEmailSchedules]);

  // Create email template
  const createEmailTemplate = useCallback(async (templateData) => {
    try {
      setLoading(true);
      const response = await whatsappApi.createEmailTemplate(templateData);
      toast.success('Email template created successfully!');
      
      await fetchEmailTemplates(true);
      
      return response;
    } catch (error) {
      console.error('Failed to create email template:', error);
      // toast.error('Failed to create email template');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchEmailTemplates]);

  // Update email template
  const updateEmailTemplate = useCallback(async (templateId, updateData) => {
    try {
      setLoading(true);
      const response = await whatsappApi.updateEmailTemplate(templateId, updateData);
      toast.success('Email template updated successfully!');
      
      await fetchEmailTemplates(true);
      
      return response;
    } catch (error) {
      console.error('Failed to update email template:', error);
      // toast.error('Failed to update email template');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchEmailTemplates]);

  // Delete email template
  const deleteEmailTemplate = useCallback(async (templateId) => {
    try {
      setLoading(true);
      await whatsappApi.deleteEmailTemplate(templateId);
      toast.success('Email template deleted successfully!');
      
      await fetchEmailTemplates(true);
      
      return true;
    } catch (error) {
      console.error('Failed to delete email template:', error);
      // toast.error('Failed to delete email template');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchEmailTemplates]);

  // Test email connection
  const testEmailConnection = useCallback(async () => {
    try {
      setLoading(true);
      const response = await whatsappApi.testEmailConnection();
      setConnectionStatus(response);
      toast.success('Email API connection test successful!');
      return response;
    } catch (error) {
      console.error('Email connection test failed:', error);
      setConnectionStatus({ connected: false, error: error.message });
      // toast.error('Email API connection test failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== SMS FUNCTIONS ====================

  // Fetch SMS schedules
  const fetchSMSSchedules = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = getCache('smsSchedules');
      if (cached) {
        setSmsSchedules(cached);
        return cached;
      }
    }

    try {
      setLoading(true);
      const data = await whatsappApi.getSMSSchedules();
      const schedulesArray = Array.isArray(data) ? data : data?.results || [];
      setSmsSchedules(schedulesArray);
      setCache('smsSchedules', schedulesArray);
      return schedulesArray;
    } catch (error) {
      console.error('Failed to fetch SMS schedules:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch SMS history
  const fetchSMSHistory = useCallback(async (filters = {}, forceRefresh = false) => {
    const cacheKey = `smsHistory_${JSON.stringify(filters)}`;
    
    if (!forceRefresh) {
      const cached = getCache(cacheKey);
      if (cached) {
        setSmsHistory(cached);
        return cached;
      }
    }

    try {
      setLoading(true);
      const data = await whatsappApi.getSMSHistory(filters);
      const historyArray = Array.isArray(data) ? data : data?.results || [];
      setSmsHistory(historyArray);
      setCache(cacheKey, historyArray);
      return historyArray;
    } catch (error) {
      console.error('Failed to fetch SMS history:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch SMS templates
  const fetchSMSTemplates = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = getCache('smsTemplates');
      if (cached) {
        setSmsTemplates(cached);
        return cached;
      }
    }

    try {
      setLoading(true);
      const data = await whatsappApi.getSMSTemplates();
      const templatesArray = Array.isArray(data) ? data : [];
      setSmsTemplates(templatesArray);
      setCache('smsTemplates', templatesArray);
      return templatesArray;
    } catch (error) {
      console.error('Failed to fetch SMS templates:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Send SMS
  const sendSMS = useCallback(async (smsData) => {
    try {
      setLoading(true);
      const response = await whatsappApi.sendSMS(smsData);
      toast.success('SMS sent successfully!');
      
      await fetchSMSHistory({}, true);
      
      return response;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      // toast.error('Failed to send SMS');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchSMSHistory]);

  // Create SMS schedule
  const createSMSSchedule = useCallback(async (scheduleData) => {
    try {
      setLoading(true);
      const response = await whatsappApi.createSMSSchedule(scheduleData);
      toast.success('Scheduled SMS created successfully!');
      
      await fetchSMSSchedules(true);
      
      return response;
    } catch (error) {
      console.error('Failed to create SMS schedule:', error);
      // toast.error('Failed to create scheduled SMS');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchSMSSchedules]);

  // Update SMS schedule
  const updateSMSSchedule = useCallback(async (scheduleId, updateData) => {
    try {
      setLoading(true);
      const response = await whatsappApi.updateSMSSchedule(scheduleId, updateData);
      toast.success('Scheduled SMS updated successfully!');
      
      await fetchSMSSchedules(true);
      
      return response;
    } catch (error) {
      console.error('Failed to update SMS schedule:', error);
      // toast.error('Failed to update scheduled SMS');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchSMSSchedules]);

  // Delete SMS schedule
  const deleteSMSSchedule = useCallback(async (scheduleId) => {
    try {
      setLoading(true);
      await whatsappApi.deleteSMSSchedule(scheduleId);
      toast.success('Scheduled SMS deleted successfully!');
      
      await fetchSMSSchedules(true);
      
      return true;
    } catch (error) {
      console.error('Failed to delete SMS schedule:', error);
      // toast.error('Failed to delete scheduled SMS');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchSMSSchedules]);

  // Toggle SMS schedule
  const toggleSMSSchedule = useCallback(async (scheduleId, isActive) => {
    try {
      setLoading(true);
      const response = await whatsappApi.toggleSMSSchedule(scheduleId, isActive);
      toast.success(`SMS schedule ${isActive ? 'activated' : 'deactivated'} successfully!`);
      
      await fetchSMSSchedules(true);
      
      return response;
    } catch (error) {
      console.error('Failed to toggle SMS schedule:', error);
      // toast.error('Failed to update SMS schedule status');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchSMSSchedules]);

  // Create SMS template
  const createSMSTemplate = useCallback(async (templateData) => {
    try {
      setLoading(true);
      const response = await whatsappApi.createSMSTemplate(templateData);
      toast.success('SMS template created successfully!');
      
      await fetchSMSTemplates(true);
      
      return response;
    } catch (error) {
      console.error('Failed to create SMS template:', error);
      // toast.error('Failed to create SMS template');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchSMSTemplates]);

  // Update SMS template
  const updateSMSTemplate = useCallback(async (templateId, updateData) => {
    try {
      setLoading(true);
      const response = await whatsappApi.updateSMSTemplate(templateId, updateData);
      toast.success('SMS template updated successfully!');
      
      await fetchSMSTemplates(true);
      
      return response;
    } catch (error) {
      console.error('Failed to update SMS template:', error);
      // toast.error('Failed to update SMS template');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchSMSTemplates]);

  // Delete SMS template
  const deleteSMSTemplate = useCallback(async (templateId) => {
    try {
      setLoading(true);
      await whatsappApi.deleteSMSTemplate(templateId);
      toast.success('SMS template deleted successfully!');
      
      await fetchSMSTemplates(true);
      
      return true;
    } catch (error) {
      console.error('Failed to delete SMS template:', error);
      // toast.error('Failed to delete SMS template');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchSMSTemplates]);

  // Test SMS connection
  const testSMSConnection = useCallback(async () => {
    try {
      setLoading(true);
      const response = await whatsappApi.testSMSConnection();
      setConnectionStatus(response);
      toast.success('SMS API connection test successful!');
      return response;
    } catch (error) {
      console.error('SMS connection test failed:', error);
      setConnectionStatus({ connected: false, error: error.message });
      // toast.error('SMS API connection test failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh schedules
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSchedules(true);
      fetchEmailSchedules(true);
      fetchSMSSchedules(true);
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchSchedules, fetchEmailSchedules, fetchSMSSchedules]);

  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.allSettled([
          fetchSchedules(),
          fetchTemplates(),
          fetchEmailSchedules(),
          fetchEmailTemplates(),
          fetchSMSSchedules(),
          fetchSMSTemplates(),
        ]);
      } catch (error) {
        console.error('Error initializing communication data:', error);
      }
    };

    initializeData();
  }, [fetchSchedules, fetchTemplates, fetchEmailSchedules, fetchEmailTemplates, fetchSMSSchedules, fetchSMSTemplates]);

  const value = {
    // WhatsApp State
    schedules,
    messageHistory,
    templates,
    
    // Email State
    emailSchedules,
    emailHistory,
    emailTemplates,
    
    // SMS State
    smsSchedules,
    smsHistory,
    smsTemplates,
    
    // Common State
    loading,
    error,
    connectionStatus,

    // WhatsApp Actions
    sendMessage,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    toggleSchedule,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    testConnection,

    // WhatsApp Fetch functions
    fetchSchedules,
    fetchMessageHistory,
    fetchTemplates,

    // Email Actions
    sendEmail,
    createEmailSchedule,
    updateEmailSchedule,
    deleteEmailSchedule,
    toggleEmailSchedule,
    createEmailTemplate,
    updateEmailTemplate,
    deleteEmailTemplate,
    testEmailConnection,

    // Email Fetch functions
    fetchEmailSchedules,
    fetchEmailHistory,
    fetchEmailTemplates,

    // SMS Actions
    sendSMS,
    createSMSSchedule,
    updateSMSSchedule,
    deleteSMSSchedule,
    toggleSMSSchedule,
    createSMSTemplate,
    updateSMSTemplate,
    deleteSMSTemplate,
    testSMSConnection,

    // SMS Fetch functions
    fetchSMSSchedules,
    fetchSMSHistory,
    fetchSMSTemplates,

    // Helper functions
    getActiveSchedules,
    getInactiveSchedules,
    getSchedulesByRecurrence,
    clearCache,
  };

  return (
    <WhatsAppContext.Provider value={value}>
      {children}
    </WhatsAppContext.Provider>
  );
};

export const useWhatsApp = () => {
  const context = useContext(WhatsAppContext);
  if (!context) {
    throw new Error('useWhatsApp must be used within a WhatsAppProvider');
  }
  return context;
};

export default WhatsAppContext;

