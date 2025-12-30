/**
 * Utility function to convert a lead to a patient
 * Maps lead fields to patient fields and creates a patient record
 */

export const convertLeadToPatient = (lead) => {
    if (!lead) {
        throw new Error('Lead data is required');
    }

    // Map lead fields to patient fields
    const patientData = {
        // Basic Information
        fullName: lead.fullName || '',
        mobile: lead.mobile || '',
        email: lead.email || '',
        
        // Personal Information
        age: lead.age || null,
        dob: lead.dob || null,
        gender: lead.gender || '',
        bloodGroup: lead.bloodGroup || '',
        weight: lead.weight || null,
        
        // Address Information
        address: lead.address || '',
        city: lead.city || '',
        state: lead.state || '',
        country: lead.country || '',
        
        // Emergency Contact
        emergencyContactName: lead.emergencyContactName || '',
        emergencyContactPhone: lead.emergencyContactPhone || '',
        
        // Medical Information
        medicalHistory: lead.medicalHistory || '',
        allergies: lead.allergies || [],
        
        // Insurance Information
        insuranceProvider: lead.insuranceProvider || '',
        insurancePolicyNumber: lead.insurancePolicyNumber || '',
        
        // Lead Reference
        leadId: lead.id || lead._id,
        leadSource: lead.leadSource || '',
        leadDate: lead.leadDate || new Date().toISOString().split('T')[0],
        campaignId: lead.campaignId || null,
        
        // Additional Notes
        notes: lead.comments || '',
        
        // Status
        status: 'active',
        createdAt: new Date().toISOString(),
        convertedFromLead: true,
        conversionDate: new Date().toISOString()
    };

    return patientData;
};

/**
 * Validate if a lead can be converted to patient
 */
export const canConvertLeadToPatient = (lead) => {
    if (!lead) return { canConvert: false, reason: 'Lead not found' };
    
    // Minimum required fields for patient creation
    if (!lead.fullName || lead.fullName.trim() === '') {
        return { canConvert: false, reason: 'Lead name is required' };
    }
    
    if (!lead.mobile || lead.mobile.trim() === '') {
        return { canConvert: false, reason: 'Lead mobile number is required' };
    }
    
    // Check if already converted
    if (lead.leadStatus?.toLowerCase() === 'converted' && lead.patientId) {
        return { canConvert: false, reason: 'Lead already converted to patient' };
    }
    
    return { canConvert: true, reason: '' };
};


