import React from 'react'
import { FiBell, FiEdit, FiInbox, FiInfo, FiPlus, FiSend, FiStar, FiTrash2, FiX, FiCheck } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import PerfectScrollbar from "react-perfect-scrollbar";
import { useGoogleLogin } from '@react-oauth/google'
import { storeGoogleToken, fetchGmailMessages, removeGoogleToken } from '@/utils/gmailApi'
import { toast } from 'react-toastify'
import { SiGmail } from 'react-icons/si'

const EmailSIdebar = ({setSidebarOpen, sidebarOpen, isGoogleConnected, setIsGoogleConnected, setEmails, fetchEmails, currentLabel, setCurrentLabel}) => {
    const handleGoogleLogin = useGoogleLogin({
        scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.send',
        onSuccess: async (tokenResponse) => {
            try {
                storeGoogleToken(tokenResponse.access_token);
                setIsGoogleConnected(true);
                
                // Fetch emails after connecting
                if (fetchEmails) {
                    await fetchEmails('INBOX');
                    toast.success('Gmail connected successfully!');
                } else {
                    const gmailEmails = await fetchGmailMessages(tokenResponse.access_token, 20);
                    if (gmailEmails && gmailEmails.length > 0) {
                        setEmails(gmailEmails);
                        toast.success('Gmail connected successfully!');
                    } else {
                        toast.info('Connected to Gmail but no emails found.');
                    }
                }
            } catch (error) {
                console.error('Error connecting to Gmail:', error);
                // toast.error('Failed to connect to Gmail. Please try again.');
            }
        },
        onError: () => {
            console.log('Google authentication failed');
            // toast.error('Google authentication failed');
        }
    });

    const handleDisconnectGoogle = () => {
        removeGoogleToken();
        setIsGoogleConnected(false);
        toast.success('Disconnected from Gmail');
        // Reload the page or reset emails to default
        window.location.reload();
    };

    return (
        <div className={`content-sidebar content-sidebar-md ${sidebarOpen ? "app-sidebar-open" : ""}`}>
            <PerfectScrollbar>
                <div className="content-sidebar-header bg-white sticky-top hstack justify-content-between">
                    <h4 className="fw-bolder mb-0">Email</h4>
                    <Link to="#" className="app-sidebar-close-trigger d-flex" onClick={()=>setSidebarOpen(false)}>
                        <i><FiX /></i>
                    </Link>
                </div>
                <div className="content-sidebar-header gap-2 px-3 py-2">
                    <Link to="#" className="btn btn-primary w-100" data-bs-toggle="modal" data-bs-target="#composeMail">
                        <i className="me-2"><FiPlus size={16} /></i>
                        <span>Compose</span>
                    </Link>
                    {!isGoogleConnected ? (
                        <button 
                            className="btn btn-light w-100" 
                            onClick={handleGoogleLogin}
                            style={{border: '1px solid #dee2e6'}}
                        >
                            <SiGmail size={16} className="me-2 text-danger" />
                            <span>Connect</span>
                        </button>
                    ) : (
                        <button 
                            className="btn btn-light-success w-100" 
                            onClick={handleDisconnectGoogle}
                            style={{border: '1px solid #28a745'}}
                        >
                            <FiCheck size={16} className="me-2 text-success" />
                            <span>Gmail Connected</span>
                        </button>
                    )}
                </div>
                <div className="content-sidebar-body">
                    <ul className="nav flex-column nxl-content-sidebar-item">
                        <li className="nav-item">
                            <Link 
                                className={`nav-link d-flex align-items-center justify-content-between ${currentLabel === 'INBOX' ? 'active' : ''}`}
                                to="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (setCurrentLabel) setCurrentLabel('INBOX');
                                    if (fetchEmails) fetchEmails('INBOX');
                                }}
                            >
                                <span className="d-flex align-items-center">
                                    <FiInbox size={16} className="me-3" />
                                    <span>Inbox</span>
                                </span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${currentLabel === 'SENT' ? 'active' : ''}`}
                                to="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (setCurrentLabel) setCurrentLabel('SENT');
                                    if (fetchEmails) fetchEmails('SENT');
                                }}
                            >
                                <FiSend size={16} />
                                <span>Sent</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${currentLabel === 'DRAFT' ? 'active' : ''}`}
                                to="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (setCurrentLabel) setCurrentLabel('DRAFT');
                                    if (fetchEmails) fetchEmails('DRAFT');
                                }}
                            >
                                <FiEdit size={16} />
                                <span>Draft</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                className={`nav-link d-flex align-items-center justify-content-between ${currentLabel === 'SPAM' ? 'active' : ''}`}
                                to="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (setCurrentLabel) setCurrentLabel('SPAM');
                                    if (fetchEmails) fetchEmails('SPAM');
                                }}
                            >
                                <span className="d-flex align-items-center">
                                    <FiInbox size={16} className="me-3" />
                                    <span>Spam</span>
                                </span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${currentLabel === 'TRASH' ? 'active' : ''}`}
                                to="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (setCurrentLabel) setCurrentLabel('TRASH');
                                    if (fetchEmails) fetchEmails('TRASH');
                                }}
                            >
                                <FiTrash2 size={16} />
                                <span>Trash</span>
                            </Link>
                        </li>
                    </ul>
                    <ul className="nav flex-column nxl-content-sidebar-item">
                        <li className="px-4 my-2 fs-10 fw-bold text-uppercase text-muted text-spacing-1 d-flex align-items-center justify-content-between">
                            <span>Label</span>
                            <Link to="#">
                                <span className="avatar-text avatar-sm" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Add New"><FiPlus /> </span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="#">
                                <span className="wd-7 ht-7 bg-primary rounded-circle"></span>
                                <span>Work</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="#">
                                <span className="wd-7 ht-7 bg-warning rounded-circle"></span>
                                <span>Partnership</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="#">
                                <span className="wd-7 ht-7 bg-teal rounded-circle"></span>
                                <span>In Progress</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="#">
                                <span className="wd-7 ht-7 bg-danger rounded-circle"></span>
                                <span>Personal</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="#">
                                <span className="wd-7 ht-7 bg-success rounded-circle"></span>
                                <span>Payments</span>
                            </Link>
                        </li>
                    </ul>
                    <ul className="nav flex-column nxl-content-sidebar-item">
                        <li className="px-4 my-2 fs-10 fw-bold text-uppercase text-muted text-spacing-1 d-flex align-items-center justify-content-between">
                            <span>Filter</span>
                            <Link to="#">
                                <span className="avatar-text avatar-sm" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Add New"><FiPlus /></span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="#">
                                <FiStar size={16} />
                                <span>Favorite</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="#">
                                <FiBell size={16} />
                                <span>Snoozed</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link d-flex align-items-center justify-content-between" to="#">
                                <span className="d-flex align-items-center">
                                    <FiInfo size={16} className="me-3" />
                                    <span>Important</span>
                                </span>
                                <span className="badge bg-soft-success text-success">3</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </PerfectScrollbar>
        </div>
    )
}

export default EmailSIdebar