import React, { useState } from 'react'
import SelectDropdown from '@/components/shared/SelectDropdown';
import MultiSelectTags from '@/components/shared/MultiSelectTags';
// import PageHeaderSetting from '@/components/shared/pageHeader/PageHeaderSetting';
// import PageHeaderSetting from '@/components/shared/pageHeader/PageHeaderSetting';
import Footer from '@/components/shared/Footer';
import PerfectScrollbar from 'react-perfect-scrollbar'

const categoryOptions = [
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing' },
    { value: 'sales', label: 'Sales' },
    { value: 'general', label: 'General Inquiry' }
];

const priorityOptions = [
    { value: 'low', label: 'Low', color: '#283c50' },
    { value: 'medium', label: 'Medium', color: '#3454d1' },
    { value: 'high', label: 'High', color: '#ea4d4d' },
    { value: 'urgent', label: 'Urgent', color: '#17c666' }
];

const categoryOptions = [
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing' },
    { value: 'sales', label: 'Sales' },
    { value: 'general', label: 'General Inquiry' }
];

const priorityOptions = [
    { value: 'low', label: 'Low', color: '#283c50' },
    { value: 'medium', label: 'Medium', color: '#3454d1' },
    { value: 'high', label: 'High', color: '#ea4d4d' },
    { value: 'urgent', label: 'Urgent', color: '#17c666' }
];

const statusOptions = [
    { value: 'open', label: 'Open', color: '#283c50' },
    { value: 'inprogress', label: 'In Progress', color: '#3454d1' },
    { value: 'answered', label: 'Answered', color: '#ea4d4d' },
    { value: 'onhold', label: 'On Hold', color: '#28a745' },
    { value: 'closed', label: 'Closed', color: '#ffa21d' }
]

const fileTypeOptions = [
]

const fileTypeOptions = [
    { value: '.jpg', label: 'JPG', color: '#3454d1' },
    { value: '.png', label: 'PNG', color: '#17c666' },
    { value: '.pdf', label: 'PDF', color: '#ea4d4d' },
    { value: '.doc', label: 'DOC', color: '#64748b' },
    { value: '.zip', label: 'ZIP', color: '#283c50' },
    { value: '.rar', label: 'RAR', color: '#ffa21d' }
];


const orderOptions = [
    { value: 'ascending', label: 'Ascending', color: '#3454d1' },
    { value: 'descending', label: 'Descending', color: '#17c666' },
]

const settingOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
];


const settingOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
];

const SettingsSupportForm = () => {
    const [ticketForm, setTicketForm] = useState({
        subject: '',
        category: '',
        priority: '',
        description: '',
        attachments: []
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [settings, setSettings] = useState({
        status: null,
        priority: null,
        order: null,
        staffAccess: null,
        notificationsAssignee: null,
        notificationsNewTicket: null,
        notificationsCustomerReply: null,
        staffOpenTickets: null,
        autoAssign: null,
        nonStaffAccess: null,
        deleteAttachments: null,
        customerChangeStatus: null,
        showRelatedTickets: null,
        supportBadge: null,
        pipeRegistered: null,
        emailReplies: null,
        importActualReply: null
    });

    const handleTicketInputChange = (field, value) => {
        setTicketForm(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const removeAttachment = (index) => {
        setTicketForm(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);

        setTicketForm(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...files],
        }));
    };

    const handleSettingChange = (field, option) => {
        setSettings(prev => ({
            ...prev,
            [field]: option
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!ticketForm.subject.trim()) {
            newErrors.subject = 'Subject is required';
        } else if (ticketForm.subject.length < 5) {
            newErrors.subject = 'Subject must be at least 5 characters long';
        }

        if (!ticketForm.category) {
            newErrors.category = 'Category is required';
        }

        if (!ticketForm.priority) {
            newErrors.priority = 'Priority is required';
        }

        if (!ticketForm.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (ticketForm.description.length < 10) {
            newErrors.description = 'Description must be at least 10 characters long';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem("access_token");

            // Prepare ticket data
            const formData = new FormData();
            formData.append("subject", ticketForm.subject);
            formData.append("category", ticketForm.category.value);
            formData.append("priority", ticketForm.priority.value);
            formData.append("description", ticketForm.description);

            ticketForm.attachments.forEach((file, index) => {
                formData.append(`attachments[${index}]`, file);
            });

            const response = await fetch(
                'https://bkdemo1.clinicpro.cc/support/create-ticket',
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to submit");
            }

            // Success - reset form
            resetTicketForm();
            alert('Ticket submitted successfully!');

        } catch (error) {
            console.error('Error submitting ticket:', error);
            alert('Error submitting ticket. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset ticket form
    const resetTicketForm = () => {
        setTicketForm({
            subject: '',
            category: '',
            priority: '',
            description: '',
            attachments: []
        });
        setErrors({});
    };

    // Handle cancel
    const handleCancel = () => {
        resetTicketForm();
    };
    const [ticketForm, setTicketForm] = useState({
        subject: '',
        category: '',
        priority: '',
        description: '',
        attachments: []
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [settings, setSettings] = useState({
        status: null,
        priority: null,
        order: null,
        staffAccess: null,
        notificationsAssignee: null,
        notificationsNewTicket: null,
        notificationsCustomerReply: null,
        staffOpenTickets: null,
        autoAssign: null,
        nonStaffAccess: null,
        deleteAttachments: null,
        customerChangeStatus: null,
        showRelatedTickets: null,
        supportBadge: null,
        pipeRegistered: null,
        emailReplies: null,
        importActualReply: null
    });

    const handleTicketInputChange = (field, value) => {
        setTicketForm(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const removeAttachment = (index) => {
        setTicketForm(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);

        setTicketForm(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...files],
        }));
    };

    const handleSettingChange = (field, option) => {
        setSettings(prev => ({
            ...prev,
            [field]: option
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!ticketForm.subject.trim()) {
            newErrors.subject = 'Subject is required';
        } else if (ticketForm.subject.length < 5) {
            newErrors.subject = 'Subject must be at least 5 characters long';
        }

        if (!ticketForm.category) {
            newErrors.category = 'Category is required';
        }

        if (!ticketForm.priority) {
            newErrors.priority = 'Priority is required';
        }

        if (!ticketForm.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (ticketForm.description.length < 10) {
            newErrors.description = 'Description must be at least 10 characters long';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem("access_token");

            // Prepare ticket data
            const formData = new FormData();
            formData.append("subject", ticketForm.subject);
            formData.append("category", ticketForm.category.value);
            formData.append("priority", ticketForm.priority.value);
            formData.append("description", ticketForm.description);

            ticketForm.attachments.forEach((file, index) => {
                formData.append(`attachments[${index}]`, file);
            });

            const response = await fetch(
                'https://bkdemo1.clinicpro.cc/support/create-ticket',
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to submit");
            }

            // Success - reset form
            resetTicketForm();
            alert('Ticket submitted successfully!');

        } catch (error) {
            console.error('Error submitting ticket:', error);
            alert('Error submitting ticket. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset ticket form
    const resetTicketForm = () => {
        setTicketForm({
            subject: '',
            category: '',
            priority: '',
            description: '',
            attachments: []
        });
        setErrors({});
    };

    // Handle cancel
    const handleCancel = () => {
        resetTicketForm();
    };
    return (
        <div className="content-area" data-scrollbar-target="#psScrollbarInit">
            <PerfectScrollbar >
                <div className="container-fluid py-4">
                    <div className="row justify-content-center">
                        <div className="col-12 col-lg-10 col-xl-8">
                            <div className="card border-0">
                                <div className="card-header py-3">
                                    <h4 className="card-title mb-0">
                                        <i className="fas fa-ticket-alt me-2"></i>
                                        Submit a Support Ticket
                                    </h4>
                                </div>

                                <div className="card-body p-4">
                                    <form onSubmit={handleSubmit}>
                                        {/* Subject Field */}
                                        <div className="row mb-4">
                                            <div className="col-12">
                                                <label htmlFor="subject" className="form-label">
                                                    Subject *
                                                </label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                                                    id="subject"
                                                    placeholder="Brief description of the issue"
                                                    value={ticketForm.subject}
                                                    onChange={(e) => handleTicketInputChange('subject', e.target.value)}
                                                    required
                                                />
                                                {errors.subject && (
                                                    <div className="invalid-feedback d-block">
                                                        {errors.subject}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Category and Priority Row */}
                                        <div className="row mb-4">
                                            <div className="col-md-6 mb-3 mb-md-0">
                                                <label className="form-label fw-semibold">Category *</label>
                                                <SelectDropdown
                                                    options={categoryOptions}
                                                    placeholder="Select category"
                                                    selectedOption={ticketForm.category}
                                                    onSelectOption={(option) => handleTicketInputChange('category', option)}
                                                    hasError={!!errors.category}
                                                />
                                                {errors.category && (
                                                    <div className="invalid-feedback d-block">
                                                        {errors.category}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">Priority *</label>
                                                <SelectDropdown
                                                    options={priorityOptions}
                                                    placeholder="Select priority"
                                                    selectedOption={ticketForm.priority}
                                                    onSelectOption={(option) => handleTicketInputChange('priority', option)}
                                                    hasError={!!errors.priority}
                                                />
                                                {errors.priority && (
                                                    <div className="invalid-feedback d-block">
                                                        {errors.priority}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Description Field */}
                                        <div className="row mb-4">
                                            <div className="col-12">
                                                <label htmlFor="description" className="form-label fw-semibold">
                                                    Description *
                                                </label>
                                                <textarea
                                                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                                                    id="description"
                                                    rows={6}
                                                    placeholder="Please provide detailed information about your issue"
                                                    value={ticketForm.description}
                                                    onChange={(e) => handleTicketInputChange('description', e.target.value)}
                                                    required
                                                />
                                                {errors.description && (
                                                    <div className="invalid-feedback d-block">
                                                        {errors.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Attachments Field */}
                                        <div className="row mb-4">
                                            <div className="col-12">
                                                <label className="form-label fw-semibold">
                                                    Attachments (optional)
                                                </label>
                                                <div className="file-upload-area border rounded p-3 text-center">
                                                    <input
                                                        type="file"
                                                        id="file-upload"
                                                        className="d-none"
                                                        onChange={handleFileChange}
                                                        multiple
                                                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.zip,.rar"
                                                    />
                                                    <label htmlFor="file-upload" className="file-upload-label cursor-pointer mb-2">
                                                        <i className="fas fa-cloud-upload-alt fa-2x text-muted mb-3"></i>
                                                        <h6 className="text-muted">
                                                            {ticketForm.attachments.length > 0
                                                                ? `${ticketForm.attachments.length} file(s) chosen`
                                                                : 'Choose Files - No file chosen'
                                                            }
                                                        </h6>
                                                        <span className="btn btn-outline-primary mt-2">
                                                            <i className="fas fa-folder-open me-2"></i>
                                                            Browse Files
                                                        </span>
                                                    </label>
                                                </div>
                                                {/* Show selected file names */}
                                                {ticketForm.attachments.length > 0 && (
                                                    <div className="mt-2">
                                                        <small className="text-muted">Selected files:</small>
                                                        <div className="d-flex flex-wrap gap-1 mt-1">
                                                            {ticketForm.attachments.map((file, index) => (
                                                                <span key={index} className="badge bg-secondary">
                                                                    {file.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                <small className="form-text text-muted">
                                                    <i className="fas fa-info-circle me-1"></i>
                                                    You can upload screenshots or documents to help explain your issue (max 5MB per file)
                                                </small>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="row mt-5">
                                            <div className="col-12">
                                                <div className="d-flex gap-3 justify-content-end">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary btn-lg px-4"
                                                        onClick={handleCancel}
                                                        disabled={isSubmitting}
                                                    >
                                                        <i className="fas fa-times me-2"></i>
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary btn-md px-4"
                                                        disabled={isSubmitting}
                                                    >
                                                        {isSubmitting ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                Submitting...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="fas fa-paper-plane me-2"></i>
                                                                Submit Ticket
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </PerfectScrollbar >
        </div>

    )
}

export default SettingsSupportForm