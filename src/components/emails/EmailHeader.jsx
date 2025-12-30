import React, { useState } from 'react'
import { FiAlertOctagon, FiAlignLeft, FiArchive, FiBell, FiBellOff, FiCheckCircle, FiChevronDown, FiChevronLeft, FiChevronRight, FiClock, FiDownload, FiEye, FiEyeOff, FiFolderPlus, FiMoreVertical, FiPlus, FiRefreshCw, FiSearch, FiShieldOff, FiSlash, FiSliders, FiStar, FiTag, FiTrash2, FiUserPlus } from 'react-icons/fi'
import Checkbox from '@/components/shared/Checkbox'
import { emailList } from '@/utils/fackData/emailList'
import Dropdown from '@/components/shared/Dropdown'
import HeaderSearchForm from '@/components/shared/pageHeader/HeaderSearchForm'
import { getGoogleToken, batchModifyGmailMessageLabels, batchDeleteGmailMessages, archiveGmailMessage, starGmailMessage, unstarGmailMessage } from '@/utils/gmailApi'
import { toast } from 'react-toastify'

export const emailMoreOptions = [
    { icon: <FiPlus />, label: "Add to Group" },
    { icon: <FiUserPlus />, label: "Add to Contact" },
    { icon: <FiEyeOff />, label: "Make as Unread" },
    { icon: <FiSliders />, label: "Filter Messages" },
    { icon: <FiArchive />, label: "Make as Archive" },
    { type: "divider" },
    { icon: <FiSlash />, label: "Report Spam" },
    { icon: <FiSliders />, label: "Report phishing" },
    { type: "divider" },
    { icon: <FiDownload />, label: "Download Messages" },
    { icon: <FiBellOff />, label: "Mute Conversion" },
    { icon: <FiSlash />, label: "Block Conversion" },
    { icon: <FiTrash2 />, label: "Delete Conversion" },
]

export const emailActions = [
    { label: "Read", icon: <FiEye /> },
    { label: "Unread", icon: <FiEyeOff /> },
    { label: "Starred", icon: <FiStar /> },
    { label: "Unstarred", icon: <FiShieldOff /> },
    { type: "divider" },
    { label: "Snooze", icon: <FiClock />, },
    { label: "Add Tasks", icon: <FiCheckCircle />, },
    { type: "divider" },
    { label: "Archive", icon: <FiArchive /> },
    { label: "Report Spam", icon: <FiAlertOctagon /> },
    { type: "divider" },
    { label: "Delete Chat", icon: <FiTrash2 /> },
];

export const tagsItems = [
    {
        id: "item_1",
        label: "Office",
        checkbox: true,
        checked: true,
    },
    {
        id: "item_2",
        label: "Family",
        checkbox: true,
        checked: false,
    },
    {
        id: "item_3",
        label: "Friend",
        checkbox: true,
        checked: true,
    },
    {
        id: "item_4",
        label: "Marketplace",
        checkbox: true,
        checked: false,
    },
    {
        id: "item_5",
        label: "Development",
        checkbox: true,
        checked: false,
    },
    { type: "divider" },
    { label: "Create Tag", icon: <FiPlus /> },
    { label: "Manages Tag", icon: <FiTag /> },
];



const EmailHeader = ({ selectAll, handleSelectAll, showIcon, setSidebarOpen, selectedItems = [], setSelectedItems, isGoogleConnected = false, fetchEmails, currentLabel = 'INBOX', searchQuery = '', setSearchQuery, sortBy = 'date', setSortBy, sortOrder = 'desc', setSortOrder, emailStats = { unread: 0, total: 0 } }) => {
    const [emails, setEmails] = useState(emailList.emails)
    const [isProcessing, setIsProcessing] = useState(false)
    const uniquelabels = []
    emails.forEach(({ labels }) => {
        if (!uniquelabels.includes(labels)) {
            uniquelabels.push(labels)
        }
    })

    // Handle bulk actions
    const handleBulkAction = async (action) => {
        if (selectedItems.length === 0) {
            toast.info('Please select emails first');
            return;
        }

        if (!isGoogleConnected) {
            toast.info('Gmail operations require Google connection');
            return;
        }

        setIsProcessing(true);
        const token = getGoogleToken();
        if (!token) {
            console.log('Google authentication token not found');
            // toast.error('Google authentication token not found');
            setIsProcessing(false);
            return;
        }

        try {
            switch (action) {
                case 'read':
                    await batchModifyGmailMessageLabels(token, selectedItems, {
                        removeLabelIds: ['UNREAD'],
                    });
                    toast.success(`Marked ${selectedItems.length} email(s) as read`);
                    break;
                case 'unread':
                    await batchModifyGmailMessageLabels(token, selectedItems, {
                        addLabelIds: ['UNREAD'],
                    });
                    toast.success(`Marked ${selectedItems.length} email(s) as unread`);
                    break;
                case 'star':
                    await batchModifyGmailMessageLabels(token, selectedItems, {
                        addLabelIds: ['STARRED'],
                    });
                    toast.success(`Starred ${selectedItems.length} email(s)`);
                    break;
                case 'unstar':
                    await batchModifyGmailMessageLabels(token, selectedItems, {
                        removeLabelIds: ['STARRED'],
                    });
                    toast.success(`Unstarred ${selectedItems.length} email(s)`);
                    break;
                case 'archive':
                    await batchModifyGmailMessageLabels(token, selectedItems, {
                        removeLabelIds: ['INBOX'],
                    });
                    toast.success(`Archived ${selectedItems.length} email(s)`);
                    break;
                case 'delete':
                    await batchDeleteGmailMessages(token, selectedItems);
                    toast.success(`Deleted ${selectedItems.length} email(s)`);
                    break;
                default:
                    toast.info('Action not implemented');
                    setIsProcessing(false);
                    return;
            }

            // Clear selection and refresh emails
            if (setSelectedItems) {
                setSelectedItems([]);
            }
            if (fetchEmails) {
                await fetchEmails(currentLabel);
            }
        } catch (error) {
            console.error(`Error performing bulk action ${action}:`, error);
            // toast.error(`Failed to ${action} emails`);
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle refresh
    const handleRefresh = async () => {
        if (isGoogleConnected && fetchEmails) {
            setIsProcessing(true);
            try {
                await fetchEmails(currentLabel);
                toast.success('Emails refreshed');
            } catch (error) {
                console.error('Error refreshing emails:', error);
                // toast.error('Failed to refresh emails');
            } finally {
                setIsProcessing(false);
            }
        }
    };

    // Handle dropdown action selection
    const handleActionSelect = (label) => {
        const actionMap = {
            'Read': 'read',
            'Unread': 'unread',
            'Starred': 'star',
            'Unstarred': 'unstar',
            'Archive': 'archive',
            'Delete Chat': 'delete',
        };
        const actionKey = actionMap[label];
        if (actionKey) {
            handleBulkAction(actionKey);
        }
    };

    return (
        <div className="content-area-header bg-white sticky-top">
            <div class={`page-header-left d-flex align-items-center gap-2 ${showIcon ? "show-action" : ""}`}>
                <a href="#" className="app-sidebar-open-trigger me-2" onClick={() => setSidebarOpen(true)}>
                    <i className="fs-20"><FiAlignLeft /></i>
                </a>
                <Checkbox
                    id={"checkAll"}
                    name={""}
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="ms-1 me-2"
                />
                <div class={`action-list-items`}>
                    <Dropdown
                        dropdownItems={emailActions}
                        triggerIcon={<FiChevronDown />}
                        triggerPosition={"0,22"}
                        triggerClass='avatar-md'
                        dropdownPosition='dropdown-menu-start'
                        onSelect={handleActionSelect}
                    />

                    <Dropdown
                        dropdownItems={tagsItems}
                        triggerIcon={<FiTag />}
                        triggerPosition={"0,22"}
                        triggerClass='avatar-md'
                        dropdownPosition='dropdown-menu-start'
                        dropdownAutoClose='outside'
                        tooltipTitle={"TAGS"}
                    />


                    <div className="dropdown">
                        <a href="#" className="d-flex" data-bs-toggle="dropdown" data-bs-offset="0,22" data-bs-auto-close="outside" aria-expanded="false">
                            <div className="avatar-text avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Labels">
                                <i><FiFolderPlus /></i>
                            </div>
                        </a>
                        <div className="dropdown-menu">
                            {uniquelabels.map((name, index) => (
                                <div className="dropdown-item">
                                    <Checkbox id={index} name={name} checked={name === "Primary" ? "checked" : ""} />
                                </div>
                            ))}

                            <div className="dropdown-divider"></div>
                            <a href="#" className="dropdown-item">
                                <FiPlus size={16} className='me-3' />
                                <span>Create Label</span>
                            </a>
                            <a href="#" className="dropdown-item">
                                <FiFolderPlus size={16} className='me-3' />
                                <span>Manages Label</span>
                            </a>
                        </div>
                    </div>
                    <Dropdown
                        dropdownItems={emailMoreOptions}
                        triggerPosition={"0,22"}
                        triggerClass='avatar-md'
                        dropdownPosition='dropdown-menu-start'
                    />

                </div>
                <a href="#" className="d-none d-sm-flex" onClick={(e) => { e.preventDefault(); handleRefresh(); }}>
                    <div className={`avatar-text avatar-md ${isProcessing ? 'spinning' : ''}`} data-bs-toggle="tooltip" data-bs-trigger="hover" title="Refresh">
                        <i><FiRefreshCw /></i>
                    </div>
                </a>
                <a href="#" className="d-none d-sm-flex">
                    <div className="avatar-text avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Snooze">
                        <i><FiBell /></i>
                    </div>
                </a>
            </div>
            <div className="page-header-right ms-auto">
                <div className="hstack gap-2">
                    {/* Enhanced Search Form */}
                    <div className="hstack">
                        <div className="position-relative">
                            <input 
                                type="search" 
                                className="form-control form-control-sm" 
                                placeholder="Search emails..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                                style={{ width: '250px', paddingRight: '35px' }}
                            />
                            <FiSearch className="position-absolute" style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6c757d' }} />
                            {searchQuery && (
                                <button 
                                    className="btn-close position-absolute" 
                                    style={{ right: '30px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px' }}
                                    onClick={() => setSearchQuery && setSearchQuery('')}
                                />
                            )}
                        </div>
                    </div>
                    
                    {/* Email Statistics */}
                    {isGoogleConnected && emailStats && (
                        <div className="d-none d-md-flex align-items-center text-muted small">
                            <span>{emailStats.unread > 0 && <strong>{emailStats.unread} unread</strong>} {emailStats.total} total</span>
                        </div>
                    )}
                    
                    {/* Sort Dropdown */}
                    <div className="filter-dropdown d-none d-sm-flex">
                        <a href="#" className="btn btn-light-brand btn-sm rounded-pill dropdown-toggle" data-bs-toggle="dropdown" data-bs-offset="0,23" aria-expanded="false">
                            Sort: {sortBy === 'date' ? 'Date' : sortBy === 'sender' ? 'Sender' : 'Subject'} ({sortOrder === 'desc' ? 'Newest' : 'Oldest'})
                        </a>
                        <ul className="dropdown-menu">
                            <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSortBy && setSortBy('date'); }}>Sort by Date</a></li>
                            <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSortBy && setSortBy('sender'); }}>Sort by Sender</a></li>
                            <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSortBy && setSortBy('subject'); }}>Sort by Subject</a></li>
                            <li className="dropdown-divider"></li>
                            <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSortOrder && setSortOrder('desc'); }}>Newest First</a></li>
                            <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSortOrder && setSortOrder('asc'); }}>Oldest First</a></li>
                        </ul>
                    </div>
                    <div className="hstack d-none d-sm-flex">
                        <a href="#" className="d-flex me-1">
                            <div className="avatar-text avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Previous">
                                <i><FiChevronLeft /></i>
                            </div>
                        </a>
                        <a href="#" className="d-flex me-1">
                            <div className="avatar-text avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Next">
                                <i><FiChevronRight /></i>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmailHeader