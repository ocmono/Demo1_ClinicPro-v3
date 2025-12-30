import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

/**
 * Export leads to CSV format
 * @param {Array} leads - Array of lead objects
 * @param {string} filename - Optional filename
 */
export const exportLeadsToCSV = (leads, filename = 'leads-export') => {
  if (!leads || leads.length === 0) {
    throw new Error('No leads to export');
  }

  // Define CSV headers
  const headers = [
    'ID',
    'Full Name',
    'Mobile',
    'Campaign ID',
    'Lead Date',
    'Lead Source',
    'Lead Status',
    'Comments',
    'Created At',
    'Updated At'
  ];

  // Convert leads to CSV rows
  const rows = leads.map(lead => [
    lead.id || '',
    lead.fullName || '',
    lead.mobile || '',
    lead.campaignId || '',
    lead.leadDate || '',
    lead.leadSource || '',
    lead.leadStatus || '',
    (lead.comments || '').replace(/,/g, ';'), // Replace commas in comments
    lead.createdAt || '',
    lead.updatedAt || ''
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
};

/**
 * Export leads to Excel format (CSV with .xlsx extension for compatibility)
 * @param {Array} leads - Array of lead objects
 * @param {string} filename - Optional filename
 */
export const exportLeadsToExcel = (leads, filename = 'leads-export') => {
  // For now, we'll export as CSV with .xlsx extension
  // For full Excel support, you'd need xlsx library
  exportLeadsToCSV(leads, filename);
};

/**
 * Export leads to PDF format
 * @param {Array} leads - Array of lead objects
 * @param {string} filename - Optional filename
 */
export const exportLeadsToPDF = async (leads, filename = 'leads-export') => {
  if (!leads || leads.length === 0) {
    throw new Error('No leads to export');
  }

  // Dynamically import jspdf-autotable to avoid Vite resolution issues
  let autoTable;
  try {
    const autotableModule = await import('jspdf-autotable');
    autoTable = autotableModule.default || autotableModule;
  } catch (error) {
    console.warn('jspdf-autotable not available, using manual table generation');
    // Fallback to manual table generation
    return exportLeadsToPDFManual(leads, filename);
  }

  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('Leads Export', 14, 22);
  
  // Add export date
  doc.setFontSize(10);
  doc.text(`Exported on: ${new Date().toLocaleString()}`, 14, 30);

  // Prepare table data
  const tableData = leads.map(lead => [
    lead.id || 'N/A',
    lead.fullName || 'N/A',
    lead.mobile || 'N/A',
    lead.campaignId || 'N/A',
    lead.leadDate || 'N/A',
    lead.leadSource || 'N/A',
    lead.leadStatus || 'N/A'
  ]);

  // Add table using autoTable if available
  if (doc.autoTable) {
    doc.autoTable({
      head: [['ID', 'Name', 'Mobile', 'Campaign', 'Date', 'Source', 'Status']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });
  } else {
    // Fallback to manual table
    return exportLeadsToPDFManual(leads, filename);
  }

  // Save PDF
  doc.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Manual PDF export without jspdf-autotable (fallback)
 * @param {Array} leads - Array of lead objects
 * @param {string} filename - Optional filename
 */
const exportLeadsToPDFManual = (leads, filename = 'leads-export') => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('Leads Export', 14, 22);
  
  // Add export date
  doc.setFontSize(10);
  doc.text(`Exported on: ${new Date().toLocaleString()}`, 14, 30);

  // Manual table generation
  let yPos = 45;
  const lineHeight = 7;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 14;
  const colWidths = [15, 40, 30, 25, 25, 25, 25];
  const headers = ['ID', 'Name', 'Mobile', 'Campaign', 'Date', 'Source', 'Status'];
  
  // Draw header
  doc.setFillColor(66, 139, 202);
  doc.rect(margin, yPos, doc.internal.pageSize.width - 2 * margin, lineHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  let xPos = margin + 2;
  headers.forEach((header, i) => {
    doc.text(header, xPos, yPos + 5);
    xPos += colWidths[i];
  });

  // Draw rows
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  leads.forEach((lead, index) => {
    if (yPos + lineHeight > pageHeight - 20) {
      doc.addPage();
      yPos = margin;
    }
    
    yPos += lineHeight;
    const rowData = [
      lead.id || 'N/A',
      lead.fullName || 'N/A',
      lead.mobile || 'N/A',
      lead.campaignId || 'N/A',
      lead.leadDate || 'N/A',
      lead.leadSource || 'N/A',
      lead.leadStatus || 'N/A'
    ];
    
    // Alternate row color
    if (index % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, yPos - lineHeight, doc.internal.pageSize.width - 2 * margin, lineHeight, 'F');
    }
    
    xPos = margin + 2;
    rowData.forEach((cell, i) => {
      const cellText = String(cell).substring(0, 15); // Truncate long text
      doc.text(cellText, xPos, yPos - 2);
      xPos += colWidths[i];
    });
  });

  // Save PDF
  doc.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Parse CSV file and return leads array
 * @param {File} file - CSV file to parse
 * @returns {Promise<Array>} Array of lead objects
 */
export const importLeadsFromCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n');
        
        if (lines.length < 2) {
          reject(new Error('CSV file is empty or invalid'));
          return;
        }

        // Parse headers
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        // Parse data rows
        const leads = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue; // Skip empty lines
          
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const lead = {};
          
          headers.forEach((header, index) => {
            const value = values[index] || '';
            // Map CSV headers to lead object properties
            switch (header.toLowerCase()) {
              case 'id':
              case 'lead id':
                lead.id = value;
                break;
              case 'full name':
              case 'name':
                lead.fullName = value;
                break;
              case 'mobile':
              case 'phone':
              case 'phone number':
                lead.mobile = value;
                break;
              case 'campaign id':
              case 'campaign':
                lead.campaignId = value;
                break;
              case 'lead date':
              case 'date':
                lead.leadDate = value;
                break;
              case 'lead source':
              case 'source':
                lead.leadSource = value;
                break;
              case 'lead status':
              case 'status':
                lead.leadStatus = value;
                break;
              case 'comments':
              case 'comment':
                lead.comments = value.replace(/;/g, ','); // Restore commas
                break;
            }
          });
          
          if (lead.fullName || lead.mobile) {
            leads.push(lead);
          }
        }
        
        resolve(leads);
      } catch (error) {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Validate lead data before import
 * @param {Object} lead - Lead object to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateLead = (lead) => {
  const errors = [];
  
  if (!lead.fullName || lead.fullName.trim() === '') {
    errors.push('Full name is required');
  }
  
  if (!lead.mobile || lead.mobile.trim() === '') {
    errors.push('Mobile number is required');
  }
  
  if (!lead.leadDate) {
    errors.push('Lead date is required');
  }
  
  if (!lead.campaignId) {
    errors.push('Campaign ID is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

