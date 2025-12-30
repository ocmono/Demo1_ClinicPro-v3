/**
 * Gmail API Integration Utility
 * Handles fetching emails from Gmail API for users authenticated with Google
 */

/**
 * Check if user has Google access token stored
 */
export const hasGoogleAuth = () => {
  const token = localStorage.getItem('googleAccessToken');
  return !!token;
};

/**
 * Store Google access token
 */
export const storeGoogleToken = (accessToken) => {
  localStorage.setItem('googleAccessToken', accessToken);
};

/**
 * Get stored Google access token
 */
export const getGoogleToken = () => {
  return localStorage.getItem('googleAccessToken');
};

/**
 * Remove Google access token
 */
export const removeGoogleToken = () => {
  localStorage.removeItem('googleAccessToken');
};

/**
 * Fetch emails from Gmail API
 * @param {string} accessToken - Google OAuth access token
 * @param {number} maxResults - Maximum number of emails to fetch (default: 20)
 * @returns {Promise<Array>} Array of formatted email objects
 */
export const fetchGmailMessages = async (accessToken, maxResults = 20) => {
  try {
    // First, get list of message IDs
    const listResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!listResponse.ok) {
      const error = await listResponse.json();
      throw new Error(error.error?.message || 'Failed to fetch messages');
    }

    const listData = await listResponse.json();
    const messages = listData.messages || [];

    // Fetch full details for each message
    const emailPromises = messages.map(async (message) => {
      try {
        const messageResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!messageResponse.ok) {
          return null;
        }

        const messageData = await messageResponse.json();
        return formatGmailMessage(messageData);
      } catch (error) {
        console.error(`Error fetching message ${message.id}:`, error);
        return null;
      }
    });

    const emails = await Promise.all(emailPromises);
    return emails.filter((email) => email !== null);
  } catch (error) {
    console.error('Error fetching Gmail messages:', error);
    throw error;
  }
};

/**
 * Format Gmail message to match the app's email structure
 * @param {Object} messageData - Raw Gmail message data
 * @returns {Object} Formatted email object
 */
export const formatGmailMessage = (messageData) => {
  const headers = messageData.payload?.headers || [];
  const getHeader = (name) => {
    const header = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
    return header?.value || '';
  };

  const from = getHeader('From');
  const subject = getHeader('Subject');
  const date = getHeader('Date');
  const to = getHeader('To');
  const cc = getHeader('Cc');
  const bcc = getHeader('Bcc');
  const replyTo = getHeader('Reply-To');

  // Extract email address and name from "Name <email@example.com>" format
  const parseEmail = (emailString) => {
    const match = emailString.match(/^(.*?)\s*<(.+?)>|(.+?)$/);
    if (match) {
      return {
        name: (match[1] || match[3] || '').trim() || match[2] || match[3],
        email: (match[2] || match[3] || '').trim(),
      };
    }
    return { name: emailString, email: emailString };
  };

  const fromInfo = parseEmail(from);

  // Extract email body - prefer HTML over plain text
  let body = '';
  let bodyHtml = '';
  let attachments = [];

  if (messageData.payload?.body?.data) {
    body = decodeBase64(messageData.payload.body.data);
    bodyHtml = body;
  } else if (messageData.payload?.parts) {
    // Find HTML part first, then plain text
    const htmlPart = messageData.payload.parts.find(
      (part) => part.mimeType === 'text/html'
    );
    const textPart = messageData.payload.parts.find(
      (part) => part.mimeType === 'text/plain'
    );

    if (htmlPart?.body?.data) {
      bodyHtml = decodeBase64(htmlPart.body.data);
      body = bodyHtml.replace(/<[^>]*>/g, ''); // Strip HTML tags for plain text
    } else if (textPart?.body?.data) {
      body = decodeBase64(textPart.body.data);
      bodyHtml = body.replace(/\n/g, '<br>');
    }

    // Extract attachments
    attachments = messageData.payload.parts
      .filter(part => part.filename && part.filename.length > 0 && part.body?.attachmentId)
      .map(part => ({
        filename: part.filename,
        mimeType: part.mimeType,
        size: part.body.size || 0,
        attachmentId: part.body.attachmentId,
      }));
  }

  // Format date
  const formattedDate = date ? formatDate(new Date(date)) : '';
  const rawDate = date ? new Date(date) : new Date();

  return {
    id: messageData.id,
    threadId: messageData.threadId,
    user_img: '', // Gmail API doesn't provide avatar, can be enhanced later
    user_name: fromInfo.name,
    user_email: fromInfo.email,
    to: to,
    cc: cc || '',
    bcc: bcc || '',
    replyTo: replyTo || fromInfo.email,
    labels: getLabel(messageData.labelIds),
    labelIds: messageData.labelIds || [],
    subject: subject || '(No Subject)',
    date: formattedDate,
    rawDate: rawDate,
    body: body,
    bodyHtml: bodyHtml || body,
    snippet: messageData.snippet || '',
    attachments: attachments,
    is_active: 'active',
    active_time: formattedDate,
    is_message_read: !messageData.labelIds?.includes('UNREAD'),
    is_starred: messageData.labelIds?.includes('STARRED') || false,
  };
};

/**
 * Decode base64 URL-safe string
 */
const decodeBase64 = (str) => {
  try {
    // Replace URL-safe characters
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    while (str.length % 4) {
      str += '=';
    }
    return decodeURIComponent(
      atob(str)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (error) {
    console.error('Error decoding base64:', error);
    return '';
  }
};

/**
 * Format date to match app format
 */
const formatDate = (date) => {
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return 'Today';
  } else if (diffDays === 2) {
    return 'Yesterday';
  } else if (diffDays <= 7) {
    return `${diffDays - 1} days ago`;
  } else {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
  }
};

/**
 * Get label from Gmail label IDs
 */
const getLabel = (labelIds) => {
  if (!labelIds || labelIds.length === 0) return 'Inbox';

  // Priority mapping
  if (labelIds.includes('IMPORTANT')) return 'Important';
  if (labelIds.includes('SENT')) return 'Sent';
  if (labelIds.includes('DRAFT')) return 'Draft';
  if (labelIds.includes('SPAM')) return 'Spam';
  if (labelIds.includes('TRASH')) return 'Trash';

  // Check for custom labels (CATEGORY_*)
  const category = labelIds.find((id) => id.startsWith('CATEGORY_'));
  if (category) {
    return category.replace('CATEGORY_', '').toLowerCase();
  }

  return 'Inbox';
};

/**
 * Get full message body (for email details view)
 */
export const fetchGmailMessageBody = async (accessToken, messageId) => {
  try {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch message body');
    }

    const messageData = await response.json();
    return formatGmailMessage(messageData);
  } catch (error) {
    console.error('Error fetching message body:', error);
    throw error;
  }
};

/**
 * Get email attachment
 * @param {string} accessToken - Google OAuth access token
 * @param {string} messageId - Gmail message ID
 * @param {string} attachmentId - Attachment ID
 * @returns {Promise<Blob>} Attachment file as Blob
 */
export const fetchGmailAttachment = async (accessToken, messageId, attachmentId) => {
  try {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch attachment');
    }

    const data = await response.json();
    const fileData = decodeBase64(data.data);
    
    // Convert to Blob
    const byteCharacters = atob(data.data.replace(/-/g, '+').replace(/_/g, '/'));
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    
    return new Blob([byteArray], { type: data.mimeType || 'application/octet-stream' });
  } catch (error) {
    console.error('Error fetching attachment:', error);
    throw error;
  }
};

/**
 * Get email statistics (unread count, etc.)
 * @param {string} accessToken - Google OAuth access token
 * @param {string} labelId - Label ID (default: 'INBOX')
 * @returns {Promise<Object>} Statistics object
 */
export const fetchGmailStatistics = async (accessToken, labelId = 'INBOX') => {
  try {
    // Fetch labels to get unread count
    const labelsResponse = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/labels',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!labelsResponse.ok) {
      throw new Error('Failed to fetch labels');
    }

    const labelsData = await labelsResponse.json();
    const label = labelsData.labels?.find(l => l.id === labelId);
    
    return {
      unread: label?.messagesUnread || 0,
      total: label?.messagesTotal || 0,
      threadsUnread: label?.threadsUnread || 0,
      threadsTotal: label?.threadsTotal || 0,
    };
  } catch (error) {
    console.error('Error fetching Gmail statistics:', error);
    throw error;
  }
};

/**
 * Fetch emails with filters (by label, query, etc.)
 * @param {string} accessToken - Google OAuth access token
 * @param {Object} options - Filter options
 * @param {string} options.labelIds - Gmail label IDs (e.g., 'INBOX', 'SENT', 'DRAFT')
 * @param {string} options.q - Search query string
 * @param {number} options.maxResults - Maximum number of emails (default: 20)
 * @param {string} options.pageToken - Token for pagination
 * @returns {Promise<Object>} Object with emails array and nextPageToken
 */
export const fetchGmailMessagesWithFilter = async (accessToken, options = {}) => {
  try {
    const { labelIds, q, maxResults = 20, pageToken } = options;
    let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`;
    
    if (labelIds) {
      const labelParam = Array.isArray(labelIds) ? labelIds.join('&labelIds=') : labelIds;
      url += `&labelIds=${labelParam}`;
    }
    
    if (q) {
      url += `&q=${encodeURIComponent(q)}`;
    }

    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }

    const listResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!listResponse.ok) {
      const error = await listResponse.json();
      throw new Error(error.error?.message || 'Failed to fetch messages');
    }

    const listData = await listResponse.json();
    const messages = listData.messages || [];

    // Fetch full details for each message
    const emailPromises = messages.map(async (message) => {
      try {
        const messageResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!messageResponse.ok) {
          return null;
        }

        const messageData = await messageResponse.json();
        return formatGmailMessage(messageData);
      } catch (error) {
        console.error(`Error fetching message ${message.id}:`, error);
        return null;
      }
    });

    const emails = await Promise.all(emailPromises);
    const filteredEmails = emails.filter((email) => email !== null);
    
    return {
      emails: filteredEmails,
      nextPageToken: listData.nextPageToken || null,
      resultSizeEstimate: listData.resultSizeEstimate || 0,
    };
  } catch (error) {
    console.error('Error fetching Gmail messages with filter:', error);
    throw error;
  }
};

/**
 * Delete an email message
 * @param {string} accessToken - Google OAuth access token
 * @param {string} messageId - Gmail message ID
 * @returns {Promise<boolean>} True if successful
 */
export const deleteGmailMessage = async (accessToken, messageId) => {
  try {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to delete message');
    }

    return true;
  } catch (error) {
    console.error('Error deleting Gmail message:', error);
    throw error;
  }
};

/**
 * Batch delete multiple email messages
 * @param {string} accessToken - Google OAuth access token
 * @param {Array<string>} messageIds - Array of Gmail message IDs
 * @returns {Promise<boolean>} True if successful
 */
export const batchDeleteGmailMessages = async (accessToken, messageIds) => {
  try {
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/batchDelete',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: messageIds,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to delete messages');
    }

    return true;
  } catch (error) {
    console.error('Error batch deleting Gmail messages:', error);
    throw error;
  }
};

/**
 * Modify message labels (mark as read/unread, archive, star, etc.)
 * @param {string} accessToken - Google OAuth access token
 * @param {string} messageId - Gmail message ID
 * @param {Object} options - Label modification options
 * @param {Array<string>} options.addLabelIds - Labels to add (e.g., ['STARRED', 'IMPORTANT'])
 * @param {Array<string>} options.removeLabelIds - Labels to remove (e.g., ['UNREAD', 'INBOX'])
 * @returns {Promise<Object>} Updated message object
 */
export const modifyGmailMessageLabels = async (accessToken, messageId, options = {}) => {
  try {
    const { addLabelIds = [], removeLabelIds = [] } = options;
    
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addLabelIds,
          removeLabelIds,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to modify message labels');
    }

    const messageData = await response.json();
    return formatGmailMessage(messageData);
  } catch (error) {
    console.error('Error modifying Gmail message labels:', error);
    throw error;
  }
};

/**
 * Mark email as read
 * @param {string} accessToken - Google OAuth access token
 * @param {string} messageId - Gmail message ID
 */
export const markGmailMessageAsRead = async (accessToken, messageId) => {
  return modifyGmailMessageLabels(accessToken, messageId, {
    removeLabelIds: ['UNREAD'],
  });
};

/**
 * Mark email as unread
 * @param {string} accessToken - Google OAuth access token
 * @param {string} messageId - Gmail message ID
 */
export const markGmailMessageAsUnread = async (accessToken, messageId) => {
  return modifyGmailMessageLabels(accessToken, messageId, {
    addLabelIds: ['UNREAD'],
  });
};

/**
 * Star an email
 * @param {string} accessToken - Google OAuth access token
 * @param {string} messageId - Gmail message ID
 */
export const starGmailMessage = async (accessToken, messageId) => {
  return modifyGmailMessageLabels(accessToken, messageId, {
    addLabelIds: ['STARRED'],
  });
};

/**
 * Unstar an email
 * @param {string} accessToken - Google OAuth access token
 * @param {string} messageId - Gmail message ID
 */
export const unstarGmailMessage = async (accessToken, messageId) => {
  return modifyGmailMessageLabels(accessToken, messageId, {
    removeLabelIds: ['STARRED'],
  });
};

/**
 * Archive an email (remove from INBOX)
 * @param {string} accessToken - Google OAuth access token
 * @param {string} messageId - Gmail message ID
 */
export const archiveGmailMessage = async (accessToken, messageId) => {
  return modifyGmailMessageLabels(accessToken, messageId, {
    removeLabelIds: ['INBOX'],
  });
};

/**
 * Move email to trash
 * @param {string} accessToken - Google OAuth access token
 * @param {string} messageId - Gmail message ID
 */
export const trashGmailMessage = async (accessToken, messageId) => {
  return modifyGmailMessageLabels(accessToken, messageId, {
    addLabelIds: ['TRASH'],
    removeLabelIds: ['INBOX'],
  });
};

/**
 * Batch modify message labels for multiple emails
 * @param {string} accessToken - Google OAuth access token
 * @param {Array<string>} messageIds - Array of Gmail message IDs
 * @param {Object} options - Label modification options
 * @param {Array<string>} options.addLabelIds - Labels to add
 * @param {Array<string>} options.removeLabelIds - Labels to remove
 * @returns {Promise<boolean>} True if successful
 */
export const batchModifyGmailMessageLabels = async (accessToken, messageIds, options = {}) => {
  try {
    const { addLabelIds = [], removeLabelIds = [] } = options;
    
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/batchModify',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: messageIds,
          addLabelIds,
          removeLabelIds,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to modify message labels');
    }

    return true;
  } catch (error) {
    console.error('Error batch modifying Gmail message labels:', error);
    throw error;
  }
};

/**
 * Get all Gmail labels
 * @param {string} accessToken - Google OAuth access token
 * @returns {Promise<Array>} Array of label objects
 */
export const fetchGmailLabels = async (accessToken) => {
  try {
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/labels',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch labels');
    }

    const data = await response.json();
    return data.labels || [];
  } catch (error) {
    console.error('Error fetching Gmail labels:', error);
    throw error;
  }
};

/**
 * Send an email (reply/forward/compose)
 * @param {string} accessToken - Google OAuth access token
 * @param {Object} emailData - Email data
 * @param {string} emailData.to - Recipient email address
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.body - Email body (HTML or plain text)
 * @param {string} emailData.from - Sender email address (optional)
 * @param {Array<string>} emailData.cc - CC recipients (optional)
 * @param {Array<string>} emailData.bcc - BCC recipients (optional)
 * @param {string} emailData.threadId - Thread ID for replies (optional)
 * @returns {Promise<Object>} Sent message object
 */
export const sendGmailMessage = async (accessToken, emailData) => {
  try {
    const { to, subject, body, from, cc = [], bcc = [], threadId } = emailData;
    
    // Build email headers
    let rawEmail = `To: ${to}\r\n`;
    if (from) rawEmail += `From: ${from}\r\n`;
    if (cc.length > 0) rawEmail += `Cc: ${cc.join(', ')}\r\n`;
    if (bcc.length > 0) rawEmail += `Bcc: ${bcc.join(', ')}\r\n`;
    rawEmail += `Subject: ${subject}\r\n`;
    rawEmail += `Content-Type: text/html; charset=utf-8\r\n\r\n`;
    rawEmail += body;

    // Encode email in base64url format
    const encodedEmail = btoa(rawEmail)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const requestBody = {
      raw: encodedEmail,
    };

    if (threadId) {
      requestBody.threadId = threadId;
    }

    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to send message');
    }

    const messageData = await response.json();
    return messageData;
  } catch (error) {
    console.error('Error sending Gmail message:', error);
    throw error;
  }
};

