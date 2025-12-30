import api from './api';

/**
 * Meta (Facebook) Lead Integration
 */
export const metaLeadIntegration = {
  /**
   * Fetch leads from Meta Lead Ads
   * @param {string} accessToken - Meta access token
   * @param {string} adAccountId - Meta ad account ID
   * @returns {Promise<Array>} Array of leads from Meta
   */
  fetchLeads: async (accessToken, adAccountId) => {
    try {
      // This would typically call Meta Graph API
      // For now, we'll use a backend endpoint that handles the Meta API
      const response = await api.post('/leads/integrations/meta/fetch', {
        accessToken,
        adAccountId
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch Meta leads: ${error.message}`);
    }
  },

  /**
   * Sync Meta leads to system
   * @param {Array} metaLeads - Leads from Meta
   * @param {string} campaignId - Campaign ID to assign leads to
   * @returns {Promise<Object>} Sync result
   */
  syncLeads: async (metaLeads, campaignId) => {
    try {
      const response = await api.post('/leads/integrations/meta/sync', {
        leads: metaLeads,
        campaignId
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to sync Meta leads: ${error.message}`);
    }
  },

  /**
   * Test Meta connection
   * @param {string} accessToken - Meta access token
   * @returns {Promise<boolean>} Connection status
   */
  testConnection: async (accessToken) => {
    try {
      const response = await api.post('/leads/integrations/meta/test', {
        accessToken
      });
      return response.data.connected;
    } catch (error) {
      return false;
    }
  }
};

/**
 * Google Lead Integration
 */
export const googleLeadIntegration = {
  /**
   * Fetch leads from Google Ads
   * @param {string} accessToken - Google access token
   * @param {string} customerId - Google Ads customer ID
   * @returns {Promise<Array>} Array of leads from Google
   */
  fetchLeads: async (accessToken, customerId) => {
    try {
      const response = await api.post('/leads/integrations/google/fetch', {
        accessToken,
        customerId
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch Google leads: ${error.message}`);
    }
  },

  /**
   * Sync Google leads to system
   * @param {Array} googleLeads - Leads from Google
   * @param {string} campaignId - Campaign ID to assign leads to
   * @returns {Promise<Object>} Sync result
   */
  syncLeads: async (googleLeads, campaignId) => {
    try {
      const response = await api.post('/leads/integrations/google/sync', {
        leads: googleLeads,
        campaignId
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to sync Google leads: ${error.message}`);
    }
  },

  /**
   * Test Google connection
   * @param {string} accessToken - Google access token
   * @returns {Promise<boolean>} Connection status
   */
  testConnection: async (accessToken) => {
    try {
      const response = await api.post('/leads/integrations/google/test', {
        accessToken
      });
      return response.data.connected;
    } catch (error) {
      return false;
    }
  }
};

/**
 * Google Sheets Integration
 */
export const googleSheetsIntegration = {
  /**
   * Connect to Google Sheets
   * @param {string} accessToken - Google OAuth access token
   * @param {string} spreadsheetId - Google Sheets spreadsheet ID
   * @param {string} sheetName - Sheet name (optional)
   * @returns {Promise<Object>} Connection result
   */
  connect: async (accessToken, spreadsheetId, sheetName = 'Sheet1') => {
    try {
      const response = await api.post('/leads/integrations/sheets/connect', {
        accessToken,
        spreadsheetId,
        sheetName
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to connect to Google Sheets: ${error.message}`);
    }
  },

  /**
   * Sync leads to Google Sheets
   * @param {Array} leads - Leads to sync
   * @param {string} spreadsheetId - Google Sheets spreadsheet ID
   * @param {string} sheetName - Sheet name
   * @param {string} accessToken - Optional Google OAuth access token
   * @returns {Promise<Object>} Sync result
   */
  syncToSheets: async (leads, spreadsheetId, sheetName = 'Sheet1', accessToken = null) => {
    try {
      const payload = {
        leads,
        spreadsheetId,
        sheetName
      };
      
      if (accessToken) {
        payload.accessToken = accessToken;
      }
      
      const response = await api.post('/leads/integrations/sheets/sync', payload);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to sync to Google Sheets: ${error.message}`);
    }
  },

  /**
   * Fetch leads from Google Sheets
   * @param {string} spreadsheetId - Google Sheets spreadsheet ID
   * @param {string} sheetName - Sheet name
   * @returns {Promise<Array>} Array of leads from Sheets
   */
  fetchFromSheets: async (spreadsheetId, sheetName = 'Sheet1') => {
    try {
      const response = await api.post('/leads/integrations/sheets/fetch', {
        spreadsheetId,
        sheetName
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch from Google Sheets: ${error.message}`);
    }
  },

  /**
   * Enable auto-sync with Google Sheets
   * @param {string} spreadsheetId - Google Sheets spreadsheet ID
   * @param {string} sheetName - Sheet name
   * @param {number} intervalMinutes - Sync interval in minutes
   * @returns {Promise<Object>} Auto-sync configuration
   */
  enableAutoSync: async (spreadsheetId, sheetName = 'Sheet1', intervalMinutes = 15) => {
    try {
      const response = await api.post('/leads/integrations/sheets/auto-sync', {
        spreadsheetId,
        sheetName,
        intervalMinutes
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to enable auto-sync: ${error.message}`);
    }
  },

  /**
   * Disable auto-sync with Google Sheets
   * @returns {Promise<Object>} Disable result
   */
  disableAutoSync: async () => {
    try {
      const response = await api.post('/leads/integrations/sheets/disable-auto-sync');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to disable auto-sync: ${error.message}`);
    }
  },

  /**
   * Get auto-sync status
   * @returns {Promise<Object>} Auto-sync status
   */
  getAutoSyncStatus: async () => {
    try {
      const response = await api.get('/leads/integrations/sheets/auto-sync-status');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get auto-sync status: ${error.message}`);
    }
  }
};

/**
 * Detect duplicate leads
 * @param {Array} leads - Array of leads to check
 * @param {Object} newLead - New lead to check against
 * @returns {Object} Duplicate detection result
 */
export const detectDuplicates = (leads, newLead) => {
  const duplicates = leads.filter(lead => {
    // Check by mobile number (most reliable)
    if (lead.mobile && newLead.mobile && lead.mobile === newLead.mobile) {
      return true;
    }
    
    // Check by name and mobile combination
    if (
      lead.fullName?.toLowerCase() === newLead.fullName?.toLowerCase() &&
      lead.mobile === newLead.mobile
    ) {
      return true;
    }
    
    return false;
  });

  return {
    hasDuplicates: duplicates.length > 0,
    duplicates,
    count: duplicates.length
  };
};

/**
 * Calculate lead score based on various factors
 * @param {Object} lead - Lead object
 * @returns {number} Lead score (0-100)
 */
export const calculateLeadScore = (lead) => {
  let score = 0;

  // Source scoring
  const sourceScores = {
    'website': 30,
    'referral': 40,
    'social media': 25,
    'google ads': 35,
    'facebook ads': 30,
    'email': 20,
    'phone': 15
  };
  score += sourceScores[lead.leadSource?.toLowerCase()] || 10;

  // Status scoring
  const statusScores = {
    'new': 20,
    'contacted': 30,
    'qualified': 50,
    'converted': 100,
    'lost': 0
  };
  score += statusScores[lead.leadStatus?.toLowerCase()] || 10;

  // Completeness scoring
  if (lead.fullName) score += 10;
  if (lead.mobile) score += 10;
  if (lead.comments) score += 5;
  if (lead.campaignId) score += 5;

  // Date recency (newer leads get higher score)
  if (lead.leadDate) {
    const leadDate = new Date(lead.leadDate);
    const daysSince = (new Date() - leadDate) / (1000 * 60 * 60 * 24);
    if (daysSince < 1) score += 10;
    else if (daysSince < 7) score += 5;
  }

  return Math.min(100, score);
};

