import React, { useState, useEffect } from 'react'
import { FiArrowLeft, FiBell, FiFlag, FiPrinter, FiStar, FiTrash2, FiDownload, FiCornerUpRight, FiRepeat } from 'react-icons/fi'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css';
import ComposeMailFooter from './ComposeMailFooter';
import ComposeMailForm from './ComposeMailForm';
import { getGoogleToken, deleteGmailMessage, starGmailMessage, unstarGmailMessage, fetchGmailAttachment } from '@/utils/gmailApi'
import { confirmDelete } from '@/utils/confirmDelete';
import { toast } from 'react-toastify'

const EmailDetails = ({ setShowDetails, selectedEmail, isGoogleConnected, fetchEmails, currentLabel }) => {
    const [value, setValue] = useState('');
    const [emailData, setEmailData] = useState(selectedEmail);

    useEffect(() => {
        setEmailData(selectedEmail);
    }, [selectedEmail]);

    const handleDeleteMessage = async () => {
        if (!emailData) return;
        const result = await confirmDelete(emailData.id);
        if (result.confirmed) {
            if (isGoogleConnected) {
                const token = getGoogleToken();
                if (token) {
                    try {
                        await deleteGmailMessage(token, emailData.id);
                        toast.success('Email deleted successfully');
                        setShowDetails(false);
                        if (fetchEmails) {
                            await fetchEmails(currentLabel);
                        }
                    } catch (error) {
                        console.error('Error deleting email:', error);
                        // toast.error('Failed to delete email');
                    }
                }
            }
        }
    };

    const handleStarToggle = async () => {
        if (!emailData || !isGoogleConnected) return;
        const token = getGoogleToken();
        if (token) {
            try {
                if (emailData.is_starred) {
                    await unstarGmailMessage(token, emailData.id);
                    setEmailData({ ...emailData, is_starred: false });
                    toast.success('Email unstarred');
                } else {
                    await starGmailMessage(token, emailData.id);
                    setEmailData({ ...emailData, is_starred: true });
                    toast.success('Email starred');
                }
                if (fetchEmails) {
                    await fetchEmails(currentLabel);
                }
            } catch (error) {
                console.error('Error toggling star:', error);
                // toast.error('Failed to update star status');
            }
        }
    };

    const handleDownloadAttachment = async (attachment) => {
        if (!emailData || !isGoogleConnected) return;
        const token = getGoogleToken();
        if (token) {
            try {
                const blob = await fetchGmailAttachment(token, emailData.id, attachment.attachmentId);
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = attachment.filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success('Attachment downloaded');
            } catch (error) {
                console.error('Error downloading attachment:', error);
                // toast.error('Failed to download attachment');
            }
        }
    };

    if (!emailData) {
        return (
            <div className="items-details" data-scrollbar-target="#psScrollbarInit">
                <div className="d-flex justify-content-center align-items-center p-5">
                    <p className="text-muted">Select an email to view details</p>
                </div>
            </div>
        );
    }

    return (
        <div className="items-details" data-scrollbar-target="#psScrollbarInit">
            <div className="items-details-header bg-white sticky-top">
                <div className="d-flex align-items-center">
                    <div
                        onClick={() => setShowDetails(false)}
                        className="avatar-text avatar-md item-info-close"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        title="Back"
                    >
                        <FiArrowLeft />
                    </div>
                    <span className="vr mx-4" />
                    <div className="d-flex align-items-center">
                        <h4 className="fw-bold mb-0 text-dark text-truncate-1-line">
                            {emailData.subject || '(No Subject)'}
                        </h4>
                        <span className="vr mx-2 d-none d-sm-block" />
                        {emailData.labels && (
                            <span className="d-none d-sm-inline-flex gap-2">
                                <span className="badge bg-soft-primary text-primary">{emailData.labels}</span>
                            </span>
                        )}
                    </div>
                </div>
                <div className="ms-4 d-none d-md-flex gap-1">
                    <a href="#" className="d-flex me-1" onClick={handleClick}>
                        <div
                            className="avatar-text avatar-md"
                            data-bs-toggle="tooltip"
                            data-bs-trigger="hover"
                            title="Print"
                        >
                            <FiPrinter strokeWidth={1.6} />
                        </div>
                    </a>
                    <a href="#" className="d-flex me-1" onClick={handleClick}>
                        <div
                            className="avatar-text avatar-md"
                            data-bs-toggle="tooltip"
                            data-bs-trigger="hover"
                            title="Snooze"
                        >
                            <FiBell strokeWidth={1.6} />
                        </div>
                    </a>
                    <a href="#" className="d-flex me-1" onClick={(e) => { e.preventDefault(); handleStarToggle(); }}>
                        <div
                            className={`avatar-text avatar-md ${emailData.is_starred ? 'text-warning' : ''}`}
                            data-bs-toggle="tooltip"
                            data-bs-trigger="hover"
                            title={emailData.is_starred ? "Unstar" : "Star"}
                        >
                            <FiStar strokeWidth={1.6} style={emailData.is_starred ? { fill: 'currentColor' } : {}} />
                        </div>
                    </a>
                    <a href="#" className="d-flex me-1" onClick={handleClick}>
                        <div
                            className="avatar-text avatar-md"
                            data-bs-toggle="tooltip"
                            data-bs-trigger="hover"
                            title="Flag"
                        >
                            <FiFlag strokeWidth={1.6} />
                        </div>
                    </a>
                    <a href="#" className="d-flex me-1" onClick={handleDeleteMessage}>
                        <div
                            className="avatar-text avatar-md"
                            data-bs-toggle="tooltip"
                            data-bs-trigger="hover"
                            title="Delete"
                        >
                            <FiTrash2 strokeWidth={1.6} />
                        </div>
                    </a>
                </div>
            </div>
            <div className="items-details-body">
                <div className="p-4">
                    {/* Email Header Info */}
                    <div className="mb-4">
                        <div className="d-flex align-items-start mb-3">
                            {emailData.user_img ? (
                                <img src={emailData.user_img} alt={emailData.user_name} className="avatar-image avatar-lg me-3" />
                            ) : (
                                <div className="text-white avatar-text user-avatar-text avatar-lg me-3">
                                    {(emailData.user_name || emailData.user_email || 'U').substring(0, 1).toUpperCase()}
                                </div>
                            )}
                            <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h5 className="mb-1">{emailData.user_name || emailData.user_email}</h5>
                                        <p className="text-muted small mb-0">{emailData.user_email}</p>
                                        {emailData.to && (
                                            <p className="text-muted small mb-0">
                                                <span className="fw-medium">To:</span> {emailData.to}
                                            </p>
                                        )}
                                        {emailData.cc && (
                                            <p className="text-muted small mb-0">
                                                <span className="fw-medium">Cc:</span> {emailData.cc}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-end">
                                        <p className="text-muted small mb-0">{emailData.date}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Email Body */}
                    <div className="email-body-content border-top pt-4">
                        {emailData.bodyHtml ? (
                            <div 
                                dangerouslySetInnerHTML={{ __html: emailData.bodyHtml }}
                                style={{ 
                                    maxWidth: '100%',
                                    wordWrap: 'break-word',
                                    overflowWrap: 'break-word'
                                }}
                            />
                        ) : (
                            <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                                {emailData.body || emailData.snippet || 'No content'}
                            </div>
                        )}
                    </div>

                    {/* Attachments */}
                    {emailData.attachments && emailData.attachments.length > 0 && (
                        <div className="mt-4 pt-4 border-top">
                            <h6 className="mb-3">Attachments ({emailData.attachments.length})</h6>
                            <div className="d-flex flex-wrap gap-2">
                                {emailData.attachments.map((attachment, index) => (
                                    <div key={index} className="card" style={{ minWidth: '200px' }}>
                                        <div className="card-body p-3">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="flex-grow-1">
                                                    <p className="mb-1 small text-truncate" style={{ maxWidth: '150px' }}>{attachment.filename}</p>
                                                    <small className="text-muted">
                                                        {(attachment.size / 1024).toFixed(2)} KB
                                                    </small>
                                                </div>
                                                <button
                                                    className="btn btn-sm btn-light ms-2"
                                                    onClick={() => handleDownloadAttachment(attachment)}
                                                    title="Download"
                                                >
                                                    <FiDownload />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="items-details-footer mail-action-editor m-4 border border-top-0 rounded-3">
                <div className="p-3 border-bottom">
                    <div className="btn-group" role="group">
                        <button type="button" className="btn btn-light btn-sm">
                            <FiCornerUpRight className="me-2" />
                            Reply
                        </button>
                        <button type="button" className="btn btn-light btn-sm">
                            <FiRepeat className="me-2" />
                            Forward
                        </button>
                    </div>
                </div>
                <div
                    className="p-0 ht-400 border-top position-relative editor-section"
                    data-scrollbar-target="#psScrollbarInit"
                >
                    <ComposeMailForm defaultTo={emailData.replyTo || emailData.user_email} defaultSubject={`Re: ${emailData.subject}`} />
                    <ReactQuill theme="snow" value={value} onChange={setValue} className="ht-150 border-0" />
                </div>
                <div className="px-4 py-3 d-flex align-items-center justify-content-between border-top email-modal">
                    <ComposeMailFooter />
                </div>
            </div>
        </div>

    )
}

export default EmailDetails