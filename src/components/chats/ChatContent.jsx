import React, { useState, useEffect, useRef } from 'react'
import ChartsHeader from './ChatHeader'
import MessageEditor from './MessageEditor'
import PerfectScrollbar from "react-perfect-scrollbar";
import ChatMessage from './ChatMessage';
import ChatsUsers from './ChatsUsers';
import { useChat } from '@/context/ChatContext';

const ChatContent = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { messages, selectedConversation, loading } = useChat();
    const messagesEndRef = useRef(null);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current && messages.length > 0) {
            // Small delay to ensure DOM is updated
            setTimeout(() => {
                try {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                } catch (error) {
                    // Silently fail if scrollIntoView doesn't work
                    console.log("Scroll error:", error);
                }
            }, 100);
        }
    }, [messages]);

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

    // Format messages for display
    const formatMessages = () => {
        return messages.map((message) => {
            const isReplay = message.sender_id === currentUser?.id;
            const sender = selectedConversation?.participants?.find(
                (p) => p.id === message.sender_id
            ) || { name: 'Unknown User', avatar: '/images/avatar/1.png' };

            return {
                id: message.id,
                avatar: sender.avatar || sender.profile_image || '/images/avatar/1.png',
                name: sender.name || sender.username || 'Unknown User',
                time: new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                messages: message.content ? [message.content] : [],
                isReplay,
                isTyping: false,
                attachments: message.attachments || [],
            };
        });
    };

    if (!selectedConversation) {
        return (
            <>
                <ChatsUsers sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <div className="content-area">
                    <div className="d-flex align-items-center justify-content-center h-100">
                        <div className="text-center">
                            <h5 className="text-muted">Select a conversation to start chatting</h5>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <ChatsUsers sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="content-area">
                <PerfectScrollbar>
                    <ChartsHeader setSidebarOpen={setSidebarOpen} />
                    <div className="content-area-body">
                        {loading.messages && messages.length === 0 ? (
                            <div className="d-flex align-items-center justify-content-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                {formatMessages().map((messageData) => (
                                    <ChatMessage
                                        key={messageData.id}
                                        avatar={messageData.avatar}
                                        name={messageData.name}
                                        time={messageData.time}
                                        messages={messageData.messages}
                                        isReplay={messageData.isReplay}
                                        isTyping={messageData.isTyping}
                                        attachments={messageData.attachments}
                                    />
                                ))}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>
                    <MessageEditor />
                </PerfectScrollbar>
            </div>
        </>
    )
}

export default ChatContent