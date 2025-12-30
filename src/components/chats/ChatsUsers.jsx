import React, { Fragment, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiX } from 'react-icons/fi'
import Dropdown from '@/components/shared/Dropdown'
import { FiAlertTriangle, FiArchive, FiBellOff, FiCheckCircle, FiMail, FiMoreVertical, FiPhoneCall, FiStar, FiTrash2, FiVideo } from 'react-icons/fi'
import PerfectScrollbar from "react-perfect-scrollbar";
import { useChat } from '@/context/ChatContext';

const filteringOptions = ["Oldest", "Newest", "Replied", "Snoozed", "Ascending", "Descending", "Mute Conversion", "Block Conversion", "Delete Conversion"]

const chatItems = [
  { label: "Make as Read", icon: <FiCheckCircle /> },
  { label: "Add to Favorite", icon: <FiStar /> },
  { label: "Mute Notifications", icon: <FiBellOff /> },
  { type: "divider" },
  { label: "Audio Call", icon: <FiPhoneCall />, modalTarget: "#voiceCallingModalScreen" },
  { label: "Video Call", icon: <FiVideo />, modalTarget: "#videoCallingModalScreen" },
  { label: "Send eMail", icon: <FiMail /> },
  { type: "divider" },
  { label: "Report Chat", icon: <FiAlertTriangle /> },
  { label: "Delete Chat", icon: <FiTrash2 /> },
  { label: "Archive Chat", icon: <FiArchive /> },
];

const ChatsUsers = ({ sidebarOpen, setSidebarOpen }) => {
  const [selectOption, setSelectOption] = useState("Newest");
  const [searchQuery, setSearchQuery] = useState("");
  const { 
    conversations, 
    selectedConversation, 
    users, 
    selectConversation, 
    selectUser, 
    loading 
  } = useChat();

  // Get current user
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  };

  const currentUser = getCurrentUser();

  // Format conversation data for display
  const formatConversation = (conversation) => {
    const otherParticipant = conversation.participants?.find(
      (p) => p.id !== currentUser?.id
    );

    if (!otherParticipant && conversation.participants?.length === 1) {
      // Only current user in conversation
      return null;
    }

    const participant = otherParticipant || conversation.participants?.[0] || {};
    const lastMessage = conversation.last_message;
    
    return {
      id: conversation.id,
      user_id: participant.id,
      user_name: participant.name || participant.username || 'Unknown User',
      user_img: participant.avatar || participant.profile_image || `/images/avatar/${(participant.id || 1) % 12 + 1}.png`,
      last_message: lastMessage?.content || 'No messages yet',
      active_time: conversation.updated_at 
        ? new Date(conversation.updated_at).toLocaleDateString() 
        : '',
      is_active: { color: '#10b981' }, // Default to green
      is_message_read: conversation.unread_count === 0,
      unread_count: conversation.unread_count || 0,
    };
  };

  // Filter conversations by search query
  const filteredConversations = conversations
    .map(formatConversation)
    .filter(Boolean)
    .filter((conv) => 
      conv.user_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Filter users by search query (for new conversations)
  const filteredUsers = users.filter((user) =>
    (user.name || user.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort conversations based on selected option
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (selectOption === "Newest") {
      return new Date(b.active_time) - new Date(a.active_time);
    } else if (selectOption === "Oldest") {
      return new Date(a.active_time) - new Date(b.active_time);
    }
    return 0;
  });

  const handleConversationClick = (conversation) => {
    const fullConversation = conversations.find(c => c.id === conversation.id);
    if (fullConversation) {
      selectConversation(fullConversation);
    }
  };

  const handleUserClick = (user) => {
    selectUser(user);
  };

  return (
    <div className={`content-sidebar content-sidebar-xl ${sidebarOpen ? "app-sidebar-open" : ""}`}>
      <PerfectScrollbar>
        <div className="content-sidebar-header bg-white sticky-top hstack justify-content-between">
          <h4 className="fw-bolder mb-0">Chat</h4>
          <a 
            href="#" 
            className="app-sidebar-close-trigger d-flex" 
            onClick={(e) => {
              e.preventDefault();
              setSidebarOpen(false);
            }}
          >
            <FiX size={16} />
          </a>
        </div>
        <div className="content-sidebar-body">
          <div className="py-0 px-4 d-flex align-items-center justify-content-between border-bottom">
            <form className="sidebar-search">
              <input 
                type="search" 
                className="py-3 px-0 border-0" 
                id="chattingSearch" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <div className="filter-dropdown sidebar-filter">
              <a
                href="#"
                data-bs-toggle="dropdown"
                className="d-flex align-items-center justify-content-center dropdown-toggle"
                data-bs-offset="0, 15"
                onClick={(e) => e.preventDefault()}
              >
                {selectOption}
              </a>
              <ul className="dropdown-menu dropdown-menu-end overflow-auto">
                {filteringOptions.map((option, index) => (
                  <Fragment key={index}>
                    {index === 4 && <li className="dropdown-divider"></li>}
                    <li onClick={() => setSelectOption(option)}>
                      <Link 
                        to="#" 
                        className={`dropdown-item ${selectOption === option ? "active" : ""}`}
                        onClick={(e) => e.preventDefault()}
                      >
                        {option}
                      </Link>
                    </li>
                    {index === 5 && <li className="dropdown-divider"></li>}
                  </Fragment>
                ))}
              </ul>
            </div>
          </div>
          <div className="content-sidebar-items">
            {loading.conversations ? (
              <div className="d-flex align-items-center justify-content-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                {sortedConversations.length > 0 ? (
                  sortedConversations.map((conv) => {
                    const isSelected = selectedConversation?.id === conv.id;
                    return (
                      <div
                        key={conv.id}
                        className={`p-4 d-flex position-relative border-bottom c-pointer single-item chat-single-item ${isSelected ? 'bg-light' : ''}`}
                        onClick={() => handleConversationClick(conv)}
                      >
                        {conv.user_img ? (
                          <div className="avatar-image">
                            <img
                              src={conv.user_img}
                              className="img-fluid"
                              alt={conv.user_name}
                            />
                          </div>
                        ) : (
                          <div className="text-white avatar-text user-avatar-text">
                            {conv.user_name.substring(0, 1).toUpperCase()}
                          </div>
                        )}

                        <div className="ms-3 item-desc flex-grow-1">
                          <div className="w-100 d-flex align-items-center justify-content-between">
                            <a 
                              href="#" 
                              className="hstack gap-2 me-2"
                              onClick={(e) => e.preventDefault()}
                            >
                              <span>{conv.user_name}</span>
                              <div 
                                className="wd-5 ht-5 rounded-circle opacity-75 me-1" 
                                style={{ background: conv.is_active.color }}
                              ></div>
                              <span className="fs-10 fw-medium text-muted text-uppercase d-none d-sm-block">
                                {conv.active_time}
                              </span>
                            </a>
                            {conv.unread_count > 0 && (
                              <span className="badge bg-primary rounded-pill">
                                {conv.unread_count}
                              </span>
                            )}
                            <Dropdown dropdownItems={chatItems} />
                          </div>
                          <p 
                            className={`fs-12 fw-semibold mt-2 mb-0 text-truncate-2-line ${
                              conv.is_message_read ? "" : "text-dark fw-bold"
                            }`}
                          >
                            {conv.last_message}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : searchQuery && filteredUsers.length > 0 ? (
                  // Show users when searching
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 d-flex position-relative border-bottom c-pointer single-item chat-single-item"
                      onClick={() => handleUserClick(user)}
                    >
                      {user.avatar || user.profile_image ? (
                        <div className="avatar-image">
                          <img
                            src={user.avatar || user.profile_image}
                            className="img-fluid"
                            alt={user.name || user.username}
                          />
                        </div>
                      ) : (
                        <div className="text-white avatar-text user-avatar-text">
                          {(user.name || user.username || 'U').substring(0, 1).toUpperCase()}
                        </div>
                      )}

                      <div className="ms-3 item-desc">
                        <div className="w-100 d-flex align-items-center justify-content-between">
                          <a 
                            href="#" 
                            className="hstack gap-2 me-2"
                            onClick={(e) => e.preventDefault()}
                          >
                            <span>{user.name || user.username || 'Unknown User'}</span>
                          </a>
                        </div>
                        <p className="fs-12 fw-semibold mt-2 mb-0 text-truncate-2-line text-muted">
                          Click to start a conversation
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted">
                    {searchQuery ? 'No results found' : 'No conversations yet'}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </PerfectScrollbar>
    </div>
  )
}

export default ChatsUsers