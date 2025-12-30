import React, { useState } from "react";
import { FiDownload } from "react-icons/fi";

const SupportViewModal = ({
    isOpen,
    ticket,
    onClose,
    getPriorityBadge,
    getStatusBadge,
    formatDate,
    handleDownloadAttachment
}) => {
    const [replyText, setReplyText] = useState("");

    if (!isOpen || !ticket) return null;

    const handleSendReply = () => {
        if (replyText.trim()) {
            // Handle reply submission here
            console.log("Reply:", replyText);
            setReplyText("");
        }
    };

    return (
        <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header border-0 pb-0">
                        <div className="w-100">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <h5 className="modal-title fw-bold mb-1">
                                        Ticket T-{ticket.id} - {ticket.subject}
                                    </h5>
                                    <p className="text-muted small mb-0">
                                        Created on {formatDate(ticket.created_at)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={onClose}
                                ></button>
                            </div>
                        </div>
                    </div>

                    <div className="modal-body pt-3">
                        <div className="row mb-4">
                            <div className="col-md-6 mb-3">
                                <label className="text-muted small mb-1">Status</label>
                                <div>{getStatusBadge(ticket.status)}</div>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="text-muted small mb-1">Priority</label>
                                <div>{getPriorityBadge(ticket.priority)}</div>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="text-muted small mb-1">Category</label>
                                <p className="mb-0 fw-medium">{ticket.category}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="text-muted small mb-1">Last Updated</label>
                                <p className="mb-0 fw-medium">{formatDate(ticket.updated_at)}</p>
                            </div>
                        </div>

                        <hr className="my-3" />

                        <div className="mb-4">
                            <label className="text-muted small mb-2">Description</label>
                            <p className="mb-0" style={{ lineHeight: "1.6" }}>
                                {ticket.description || "No description provided."}
                            </p>
                        </div>

                        {ticket.attachment_urls?.length > 0 && (
                            <div className="mb-4">
                                <label className="text-muted small mb-2">Attachments</label>
                                <div className="d-flex flex-wrap gap-2">
                                    {ticket.attachment_urls.map((url, index) => {
                                        const fileName = url.split("/").pop();
                                        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);

                                        return (
                                            <div key={index} className="card" style={{ width: "120px" }}>
                                                <div className="card-body text-center p-2">
                                                    {isImage ? (
                                                        <img
                                                            src={url}
                                                            alt="Attachment"
                                                            className="img-fluid rounded mb-1"
                                                            style={{ height: "60px", objectFit: "cover" }}
                                                        />
                                                    ) : (
                                                        <div className="bg-light rounded d-flex align-items-center justify-content-center mb-1" style={{ height: "60px" }}>
                                                            <FiDownload size={24} className="text-muted" />
                                                        </div>
                                                    )}
                                                    <small className="d-block text-truncate">{fileName}</small>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary mt-1"
                                                        onClick={() => handleDownloadAttachment(url, fileName)}
                                                        style={{ fontSize: "0.7rem" }}
                                                    >
                                                        Download
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <hr className="my-3" />

                        <div className="mb-4">
                            <label className="text-muted small mb-3">Responses</label>
                            
                            {ticket.responses && ticket.responses.length > 0 ? (
                                <div className="responses-container">
                                    {ticket.responses.map((response, index) => (
                                        <div key={index} className="bg-light rounded p-3 mb-3">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <strong className="text-dark">{response.author || "Support Team"}</strong>
                                                <small className="text-muted">{formatDate(response.created_at)}</small>
                                            </div>
                                            <p className="mb-0" style={{ lineHeight: "1.6" }}>
                                                {response.message}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-light rounded p-3 mb-3">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <strong className="text-dark">Support Team</strong>
                                        <small className="text-muted">Apr 25, 2023, 11:15 AM</small>
                                    </div>
                                    <p className="mb-0" style={{ lineHeight: "1.6" }}>
                                        Thank you for reporting this issue. We're investigating the database connection problem and will update you shortly.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mb-3">
                            <label className="text-muted small mb-2">Reply</label>
                            <textarea
                                className="form-control"
                                rows="4"
                                placeholder="Type your reply here..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                style={{ resize: "none" }}
                            ></textarea>
                        </div>
                    </div>

                    <div className="modal-footer border-0 pt-0">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            className="btn btn-dark"
                            onClick={handleSendReply}
                            disabled={!replyText.trim()}
                        >
                            Send Reply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportViewModal;
