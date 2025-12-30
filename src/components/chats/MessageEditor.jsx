import React, { useState, useRef } from 'react'
import Dropdown from '@/components/shared/Dropdown'
import { FiHash, FiLink, FiPhoneCall, FiSend, FiVideo, } from 'react-icons/fi'
import { initMessage, uploadAttachments } from '../emails/ComposeMailFooter';
import EmojiPicker from 'emoji-picker-react';
import useEmojiPicker from '@/hooks/useEmojiPicker';
import { useChat } from '@/context/ChatContext';


const callingOptions = [
    { icon: <FiPhoneCall />, label: "Audio Call", modalTarget: "#voiceCallingModalScreen" },
    { icon: <FiVideo />, label: "Video Call", modalTarget: "#videoCallingModalScreen" },
]

const MessageEditor = () => {
    const { emoji, setEmoji, toggleEmojiPicker, emojiPickerRefs, showEmojiPicker } = useEmojiPicker()
    const [message, setMessage] = useState('');
    const [attachments, setAttachments] = useState([]);
    const fileInputRef = useRef(null);
    const { selectedConversation, sendMessage, loading } = useChat();

    const handleSend = async (e) => {
        e.preventDefault();
        if (!selectedConversation?.id || (!message.trim() && attachments.length === 0)) {
            return;
        }

        try {
            await sendMessage(selectedConversation.id, message.trim(), attachments);
            setMessage('');
            setAttachments([]);
            setEmoji([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setAttachments((prev) => [...prev, ...files]);
    };

    const handleEmojiClick = (emojiData) => {
        setMessage((prev) => prev + emojiData.emoji);
        setEmoji([...emoji, emojiData.emoji]);
    };

    // Enhanced upload attachments with file selection
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const enhancedUploadAttachments = [
        ...uploadAttachments,
        {
            label: "Upload File",
            icon: <FiLink />,
            onClick: handleUploadClick,
        }
    ];

    if (!selectedConversation) {
        return null;
    }

    return (
        <div className="d-flex align-items-center justify-content-between border-top border-gray-5 bg-white sticky-bottom">
            <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileSelect}
            />
            <div className="d-flex align-center">
                <Dropdown
                    dropdownItems={initMessage}
                    triggerIcon={<FiHash size={16} />}
                    dropdownMenuStyle='wd-300'
                    dropdownParentStyle={"border-end border-gray-5"}
                    triggerClass='wd-60 ht-60 d-flex align-items-center justify-content-center'
                    tooltipTitle="Pick Template"
                    isAvatar={false}
                />
                <Dropdown
                    dropdownItems={enhancedUploadAttachments}
                    triggerIcon={<FiLink size={16} />}
                    dropdownMenuStyle='wd-300'
                    dropdownParentStyle={"border-end border-gray-5"}
                    triggerClass='wd-60 ht-60 d-flex align-items-center justify-content-center'
                    tooltipTitle="Upload Attachments"
                    isAvatar={false}
                />
                <Dropdown
                    dropdownItems={callingOptions}
                    triggerIcon={<FiPhoneCall size={16} />}
                    dropdownMenuStyle='wd-300'
                    dropdownParentStyle={"border-end border-gray-5 d-none d-sm-block"}
                    triggerClass='wd-60 ht-60 d-flex align-items-center justify-content-center'
                    tooltipTitle="Calling Options"
                    isAvatar={false}
                />
            </div>
            <div className='position-relative form-control border-0 flex-grow-1'>
                {attachments.length > 0 && (
                    <div className="d-flex gap-2 p-2 flex-wrap">
                        {attachments.map((file, index) => (
                            <span key={index} className="badge bg-secondary">
                                {file.name}
                                <button
                                    type="button"
                                    className="btn-close btn-close-white ms-2"
                                    style={{ fontSize: '0.7em' }}
                                    onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}
                                ></button>
                            </span>
                        ))}
                    </div>
                )}
                <input
                    className="w-100 border-0"
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading.sending}
                />
                <div className='position-absolute emoji-clicker emoji fs-18 c-pointer' onClick={toggleEmojiPicker}>
                    😊
                </div>
            </div>
            {showEmojiPicker && (
                <div className='emoji' ref={emojiPickerRefs}>
                    <EmojiPicker 
                        onEmojiClick={handleEmojiClick} 
                        className='position-absolute emoji-picker' 
                    />
                </div>
            )}
            <div className="border-start border-gray-5 send-message">
                <a
                    href="#"
                    className="wd-60 d-flex align-items-center justify-content-center"
                    data-bs-toggle="tooltip"
                    data-bs-trigger="hover"
                    title="Send Message"
                    style={{ height: 59 }}
                    onClick={handleSend}
                    disabled={loading.sending || (!message.trim() && attachments.length === 0)}
                >
                    {loading.sending ? (
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                            <span className="visually-hidden">Sending...</span>
                        </div>
                    ) : (
                        <FiSend size={16} strokeWidth={1.7} />
                    )}
                </a>
            </div>
        </div>
    )
}

export default MessageEditor