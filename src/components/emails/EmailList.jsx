import React from 'react'
import { FiCornerUpRight, FiEye, FiFastForward, FiLink2, FiMoreVertical, FiRepeat, FiStar, FiX } from 'react-icons/fi'
import { confirmDelete } from '@/utils/confirmDelete';
import { deleteGmailMessage, getGoogleToken } from '@/utils/gmailApi'
import { toast } from 'react-toastify'

// const moreOptions = [
//     { icon: <FiEye />, label: "View" },
//     { icon: <FiCornerUpRight />, label: "Reply" },
//     { icon: <FiFastForward />, label: "Forward" },
//     { icon: <FiRepeat />, label: "Reply All" },
//     { icon: <FiX />, label: "Delete" },
// ]
const EmailList = ({ id, user_img, user_name, subject, labels, date, is_message_read, is_starred, selectedItems, handleSelectItem, handleDetailsShow, emails, setEmails, isGoogleConnected, fetchEmails, currentLabel, email }) => {

    const handleDeleteMessage = async (messageId) => {
        const result = await confirmDelete(messageId);
        if (result.confirmed) {
            if (isGoogleConnected) {
                // Delete from Gmail
                const token = getGoogleToken();
                if (token) {
                    try {
                        await deleteGmailMessage(token, messageId);
                        toast.success('Email deleted successfully');
                        // Refresh emails from Gmail
                        if (fetchEmails) {
                            await fetchEmails(currentLabel);
                        } else {
                            // Fallback: remove from local state
                            setEmails(emails.filter((email) => email.id !== messageId));
                        }
                    } catch (error) {
                        console.error('Error deleting Gmail message:', error);
                        // toast.error('Failed to delete email from Gmail');
                    }
                }
            } else {
                // Delete from local state (default emails)
                setEmails(emails.filter((email) => email.id !== messageId));
            }
        }
    };


    return (
        <div className="single-items chat-single-item">
            {/*! [item-meta] !*/}
            <div className="d-flex wd-80 gap-4 ms-1 item-meta">
                <div className="item-checkbox">
                    <div className="custom-control custom-checkbox">
                        <input
                            type="checkbox"
                            className="custom-control-input checkbox"
                            id={id}
                            // data-checked-action="show-options"
                            checked={selectedItems.includes(id)}
                            onChange={() => handleSelectItem(id)}
                        />
                        <label className="custom-control-label" htmlFor={id} />
                    </div>
                </div>
                <span className="item-favorite">
                    <FiStar className={`fs-12 ${is_starred ? 'text-warning fill' : ''}`} style={is_starred ? { fill: 'currentColor' } : {}} />
                </span>
            </div>
            <div
                onClick={handleDetailsShow}
                className="d-flex align-items-center gap-4 w-100 item-info"
            >
                <a href="#" className="hstack gap-3 wd-200 item-user">
                    {
                        user_img ?
                            <div className="avatar-image avatar-md">
                                <img src={user_img} alt="" className="img-fluid" />
                            </div>
                            :
                            <div className="text-white avatar-text user-avatar-text avatar-md">{user_name.substring(0, 1)}</div>
                    }

                    <div className={`text-truncate-1-line mb-0 ${!is_message_read ? 'fw-bold' : ''}`}>{user_name}</div>
                </a>
                <a href="#" className="d-none d-md-block">
                    <div className="w-100 text-truncate-1-line item-desc">
                        <span className="badge bg-gray-200 text-dark me-2">{labels}</span>
                        <FiLink2 className="fs-12" />
                        <span className={`ms-3 ${!is_message_read ? 'fw-bold' : ''}`}>{subject}</span>
                    </div>
                </a>
            </div>
            {/*! [item-date] !*/}
            <div className="d-flex align-items-center justify-content-end wd-150 gap-3 item-data">
                <div className="fs-11 fw-medium text-muted text-uppercase d-none d-sm-block item-time">{date}</div>
                <div className="item-action">
                    {/* <Dropdown dropdownItems={moreOptions} triggerPosition={"0, 28"} tooltipTitle={"More Options"} /> */}
                    <div className="filter-dropdown">
                        <a href="#" data-bs-toggle="dropdown" data-bs-offset="0, 28">
                            <div className="avatar-text avatar-sm" data-bs-toggle="tooltip" data-bs-trigger="hover" title="More Options">
                                <i><FiMoreVertical /></i>
                            </div>
                        </a>
                        <div className="dropdown-menu dropdown-menu-end">
                            <a href="#" className="dropdown-item" data-view-toggle="details">
                                <i className="me-3" ><FiEye /></i>
                                <span>View</span>
                            </a>
                            <a href="#" className="dropdown-item">
                                <i className="me-3" ><FiCornerUpRight /></i>
                                <span>Reply</span>
                            </a>
                            <a href="#" className="dropdown-item">
                                <i className="me-3" ><FiFastForward /></i>
                                <span>Forward</span>
                            </a>
                            <a href="#" className="dropdown-item">
                                <i className="me-3" ><FiRepeat /></i>
                                <span>Reply All</span>
                            </a>
                            <div className="dropdown-divider" />
                            <a href="#" className="dropdown-item" onClick={() => handleDeleteMessage(id)}>
                                <i className="me-3" ><FiX /></i>
                                <span>Delete</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmailList