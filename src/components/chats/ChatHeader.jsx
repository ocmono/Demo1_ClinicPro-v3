import React, { useState } from 'react'
import { FiAlignLeft, FiBell, FiBellOff, FiInfo, FiPhoneCall, FiPlus, FiSlash, FiStar, FiTrash2, FiUserPlus, FiVideo } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import Dropdown from '@/components/shared/Dropdown'
import topTost from '@/utils/topTost';
import { useChat } from '@/context/ChatContext';

const chatItemsHeader = [
    { label: "Join Group", icon: <FiPlus /> },
    { label: "Invite People", icon: <FiUserPlus /> },
    { label: "Add to Favorite", icon: <FiStar /> },
    { label: "Mute Conversion", icon: <FiBellOff /> },
    { type: "divider" },
    { label: "Group Audio Call", icon: <FiPhoneCall />, },
    { label: "Group Video Call", icon: <FiVideo />, },
    { type: "divider" },
    { label: "Block Conversion", icon: <FiSlash /> },
    { label: "Delete Chat", icon: <FiTrash2 /> },
];
const ChatHeader = ({setSidebarOpen}) => {
    const { selectedConversation } = useChat();

    const handleClick = () => {
        topTost()
    };

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
    const otherParticipant = selectedConversation?.participants?.find(
        (p) => p.id !== currentUser?.id
    ) || selectedConversation?.participants?.[0];

    const participantName = otherParticipant?.name || otherParticipant?.username || 'Select a conversation';
    const participantAvatar = otherParticipant?.avatar || otherParticipant?.profile_image || '/images/avatar/1.png';

    return (
        <>
            <div className="content-area-header sticky-top">
                <div className="page-header-left hstack gap-4">
                    <Link 
                        to="#" 
                        className="app-sidebar-open-trigger" 
                        onClick={(e) => {
                            e.preventDefault();
                            setSidebarOpen(true);
                        }}
                    >
                        <FiAlignLeft className='fs-20' />
                    </Link>
                    {selectedConversation && (
                        <Link 
                            to="#" 
                            className="d-flex align-items-center justify-content-center gap-3" 
                            data-bs-toggle="offcanvas" 
                            data-bs-target="#userProfileDetails"
                            onClick={(e) => e.preventDefault()}
                        >
                            <div className="avatar-image">
                                <img src={participantAvatar} className="img-fluid" alt={participantName} />
                            </div>
                            <div className="d-none d-sm-block">
                                <div className="fw-bold d-flex align-items-center">{participantName}</div>
                                <div className="d-flex align-items-center mt-1">
                                    <span className="wd-7 ht-7 rounded-circle opacity-75 me-2 bg-success"></span>
                                    <span className="fs-9 text-uppercase fw-bold text-success">Active Now</span>
                                </div>
                            </div>
                        </Link>
                    )}
                </div>
                <div className="page-header-right ms-auto">
                    <div className="d-flex align-items-center justify-content-center gap-2">
                        <Link to="#" className="d-flex" data-bs-toggle="modal" data-bs-target="#voiceCallingModalScreen">
                            <div className="avatar-text avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Voice Call">
                                <FiPhoneCall />
                            </div>
                        </Link>
                        <Link to="#" className="d-flex d-flex" data-bs-toggle="modal" data-bs-target="#videoCallingModalScreen">
                            <div className="avatar-text avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Video Call">
                                <FiVideo />
                            </div>
                        </Link>
                        <Link to="#" className="d-flex d-none d-sm-block" onClick={handleClick}>
                            <div className="avatar-text avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Add to Favorite">
                                <FiStar />
                            </div>
                        </Link>
                        <Link to="#" className="ac-info-sidebar-open-trigger" data-bs-toggle="offcanvas" data-bs-target="#userProfileDetails">
                            <div className="avatar-text avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Profile Info">
                                <FiInfo />
                            </div>
                        </Link>

                        <Dropdown dropdownItems={chatItemsHeader} triggerClass={"avatar-md"} triggerPosition={"0,22"} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default ChatHeader