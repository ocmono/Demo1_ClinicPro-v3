import React, { useEffect, useState } from 'react'
import EmailHeader from './EmailHeader'
import { emailList } from '@/utils/fackData/emailList'
import EmailFooter from './EmailFooter'
import EmailList from './EmailList'
import PerfectScrollbar from "react-perfect-scrollbar";
import EmailSIdebar from './EmailSIdebar'
import EmailDetails from './EmailDetails'
import { hasGoogleAuth, getGoogleToken, fetchGmailMessages, fetchGmailMessagesWithFilter, fetchGmailStatistics } from '@/utils/gmailApi'
import { toast } from 'react-toastify'

const EmailContent = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [emails, setEmails] = useState(emailList.emails)
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [showIcon, setShowIcon] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [selectedEmail, setSelectedEmail] = useState(null)
    const [isLoadingEmails, setIsLoadingEmails] = useState(false)
    const [isGoogleConnected, setIsGoogleConnected] = useState(false)
    const [currentLabel, setCurrentLabel] = useState('INBOX')
    const [searchQuery, setSearchQuery] = useState('')
    const [nextPageToken, setNextPageToken] = useState(null)
    const [sortBy, setSortBy] = useState('date') // 'date', 'sender', 'subject'
    const [sortOrder, setSortOrder] = useState('desc') // 'asc', 'desc'
    const [emailStats, setEmailStats] = useState({ unread: 0, total: 0 })

    // Handle individual item selection
    const handleSelectItem = (id) => {
        setSelectedItems((prevSelected) => {
            if (prevSelected.includes(id)) {
                return prevSelected.filter((itemId) => itemId !== id);
            } else {
                return [...prevSelected, id];
            }
        });
    };

    // Handle select all items
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedItems([]);
        } else {
            setSelectedItems(emails.map((item) => item.id));
        }
        setSelectAll(!selectAll);
    };

    // Handle email details
    const handleDetailsShow = (email) => {
        setSelectedEmail(email);
        setShowDetails(true);
    }

    // Function to fetch emails (supports Gmail or default)
    const fetchEmails = async (labelId = 'INBOX', loadMore = false) => {
        if (hasGoogleAuth()) {
            setIsGoogleConnected(true);
            const token = getGoogleToken();
            if (token) {
                setIsLoadingEmails(true);
                try {
                    const result = await fetchGmailMessagesWithFilter(token, {
                        labelIds: labelId,
                        q: searchQuery,
                        maxResults: 50,
                        pageToken: loadMore ? nextPageToken : null,
                    });
                    
                    if (result && result.emails) {
                        let newEmails = result.emails;
                        // Sort the new emails
                        newEmails = sortEmails(newEmails);
                        
                        if (loadMore && nextPageToken) {
                            setEmails(prev => sortEmails([...prev, ...newEmails]));
                        } else {
                            setEmails(newEmails);
                        }
                        setNextPageToken(result.nextPageToken || null);
                    } else {
                        if (!loadMore) setEmails([]);
                    }

                    // Fetch statistics
                    try {
                        const stats = await fetchGmailStatistics(token, labelId);
                        setEmailStats(stats);
                    } catch (statsError) {
                        console.error('Error fetching statistics:', statsError);
                    }
                } catch (error) {
                    console.error('Error fetching Gmail emails:', error);
                    // toast.error('Failed to fetch emails from Gmail.');
                    if (!loadMore) setEmails([]);
                } finally {
                    setIsLoadingEmails(false);
                }
            }
        } else {
            setIsGoogleConnected(false);
            // Use default emails if not connected to Google
            setEmails(emailList.emails);
            setNextPageToken(null);
        }
    };

    // Sort emails function (called when emails or sort options change)
    const sortEmails = (emailList) => {
        if (emailList.length === 0) return emailList;
        return [...emailList].sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'date':
                    const dateA = a.rawDate ? new Date(a.rawDate) : (a.date ? new Date(a.date) : new Date(0));
                    const dateB = b.rawDate ? new Date(b.rawDate) : (b.date ? new Date(b.date) : new Date(0));
                    comparison = dateA - dateB;
                    break;
                case 'sender':
                    comparison = (a.user_name || a.user_email || '').localeCompare(b.user_name || b.user_email || '');
                    break;
                case 'subject':
                    comparison = (a.subject || '').localeCompare(b.subject || '');
                    break;
                default:
                    comparison = 0;
            }
            return sortOrder === 'desc' ? -comparison : comparison;
        });
    };

    // Check for Google authentication and fetch emails
    useEffect(() => {
        setNextPageToken(null);
        fetchEmails(currentLabel, false);
    }, [currentLabel, searchQuery]);

    // Re-sort emails when sort options change
    useEffect(() => {
        if (emails.length > 0) {
            const sorted = sortEmails(emails);
            setEmails(sorted);
        }
    }, [sortBy, sortOrder]);

    // Auto-refresh emails every 30 seconds
    useEffect(() => {
        if (isGoogleConnected && currentLabel) {
            const interval = setInterval(() => {
                fetchEmails(currentLabel, false);
            }, 30000); // 30 seconds

            return () => clearInterval(interval);
        }
    }, [isGoogleConnected, currentLabel]);

    useEffect(() => {
        if (selectedItems.length === emails.length) {
            setSelectAll(true);
        } else {
            setSelectAll(false);
        }

        if (selectedItems.length > 0) {
            setShowIcon(true)
        }
        else {
            setShowIcon(false)
        }

    }, [selectedItems, emails.length]);


    return (
        <>
            <EmailSIdebar 
                setSidebarOpen={setSidebarOpen} 
                sidebarOpen={sidebarOpen}
                isGoogleConnected={isGoogleConnected}
                setIsGoogleConnected={setIsGoogleConnected}
                setEmails={setEmails}
                fetchEmails={fetchEmails}
                currentLabel={currentLabel}
                setCurrentLabel={setCurrentLabel}
            />
            <div className={`content-area ${showDetails ? "items-details-active" : ""}`}>
                <PerfectScrollbar>
                    <EmailHeader 
                        handleSelectAll={handleSelectAll} 
                        selectAll={selectAll} 
                        showIcon={showIcon} 
                        setSidebarOpen={setSidebarOpen}
                        selectedItems={selectedItems}
                        setSelectedItems={setSelectedItems}
                        isGoogleConnected={isGoogleConnected}
                        fetchEmails={fetchEmails}
                        currentLabel={currentLabel}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        sortOrder={sortOrder}
                        setSortOrder={setSortOrder}
                        emailStats={emailStats}
                    />
                    <div className="content-area-body p-0">
                        {isLoadingEmails ? (
                            <div className="d-flex justify-content-center align-items-center p-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading emails...</span>
                                </div>
                                <span className="ms-3">Loading emails from Gmail...</span>
                            </div>
                        ) : (
                            <>
                                {
                                    emails.length > 0 ? (
                                        <>
                                            {emails.map((email) => (
                                                <EmailList
                                                    key={email.id}
                                                    id={email.id}
                                                    user_img={email.user_img}
                                                    user_name={email.user_name}
                                                    subject={email.subject}
                                                    labels={email.labels}
                                                    date={email.date}
                                                    is_message_read={email.is_message_read}
                                                    is_starred={email.is_starred}
                                                    handleSelectItem={handleSelectItem}
                                                    selectedItems={selectedItems}
                                                    handleDetailsShow={() => handleDetailsShow(email)}
                                                    emails={emails}
                                                    setEmails={setEmails}
                                                    isGoogleConnected={isGoogleConnected}
                                                    fetchEmails={fetchEmails}
                                                    currentLabel={currentLabel}
                                                    email={email}
                                                />
                                            ))}
                                            {nextPageToken && (
                                                <div className="text-center p-4">
                                                    <button 
                                                        className="btn btn-light"
                                                        onClick={() => fetchEmails(currentLabel, true)}
                                                        disabled={isLoadingEmails}
                                                    >
                                                        {isLoadingEmails ? 'Loading...' : 'Load More'}
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center p-5 text-muted">
                                            <p>No emails found</p>
                                        </div>
                                    )
                                }
                                <EmailFooter />
                            </>
                        )}
                    </div>
                </PerfectScrollbar>
                <EmailDetails 
                    setShowDetails={setShowDetails} 
                    selectedEmail={selectedEmail}
                    isGoogleConnected={isGoogleConnected}
                    fetchEmails={fetchEmails}
                    currentLabel={currentLabel}
                />
            </div>
        </>
    )
}

export default EmailContent