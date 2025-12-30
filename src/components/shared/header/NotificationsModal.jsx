import React from 'react'
import { FiBell, FiCheck, FiX, FiCalendar, FiUser } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useNotifications } from '../../../context/NotificationContext'

const NotificationsModal = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

    // Format the time difference
    const formatTimeAgo = (createdAt) => {
        const created = new Date(createdAt);
        const now = new Date();
        const diffMs = now - created;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;

        return created.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Extract patient name from message
    const extractPatientName = (message) => {
        const match = message.match(/from\s+([^for]+)\s+for/);
        return match ? match[1].trim() : 'Patient';
    };

    // Extract appointment details from message
    const extractAppointmentDetails = (message) => {
        const dateMatch = message.match(/for\s+([^at]+)\s+at/);
        const timeMatch = message.match(/at\s+(.+)$/);

        return {
            date: dateMatch ? dateMatch[1].trim() : '',
            time: timeMatch ? timeMatch[1].trim() : ''
        };
    };

    return (
        <div className="dropdown nxl-h-item">
            <div className="nxl-head-link me-3" data-bs-toggle="dropdown" role="button" data-bs-auto-close="outside">
                <FiBell size={20} />
                {
                    unreadCount > 0 && (
                        <span className="badge bg-danger nxl-h-badge">{unreadCount}</span>
                    )
                }
            </div>
            <div className="dropdown-menu dropdown-menu-end nxl-h-dropdown nxl-notifications-menu">
                <div className="d-flex justify-content-between align-items-center notifications-head">
                    {/* <h6 className="fw-bold text-dark mb-0">Notifications ({unreadCount})</h6> */}
                    <h6 className="fw-bold text-dark mb-0">Notifications</h6>
                    {unreadCount > 0 && (
                        <button
                            className="btn btn-sm btn-outline-secondary gap-1"
                            data-bs-toggle="tooltip"
                            title="Mark all as Read"
                            onClick={markAllAsRead}
                        >
                            <FiCheck size={16} />
                            <span>Mark all as Read</span>
                        </button>
                    )}
                </div>

                <div className="notifications-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                        <div className="text-center py-4">
                            <FiBell size={32} className="text-muted mb-2" />
                            <p className="text-muted mb-0">No new notifications</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <NotificationCard
                                key={notification.id}
                                notification={notification}
                                formatTimeAgo={formatTimeAgo}
                                extractPatientName={extractPatientName}
                                extractAppointmentDetails={extractAppointmentDetails}
                                markAsRead={markAsRead}
                            />
                        ))
                    )}
                </div>

                <div className="text-center notifications-footer">
                    <Link to="/notifications" className="fs-13 fw-semibold text-dark">All Notifications</Link>
                </div>
            </div>
        </div>
    )
}

const NotificationCard = ({ notification, formatTimeAgo, extractPatientName, extractAppointmentDetails, markAsRead }) => {
    const patientName = extractPatientName(notification.message);
    const appointmentDetails = extractAppointmentDetails(notification.message);

    // Generate avatar based on patient name initials
    const getAvatarInitials = (name) => {
        return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
    };

    // Generate random background color for avatar
    const getAvatarColor = (name) => {
        const colors = ['#0d6efd', '#198754', '#dc3545', '#fd7e14', '#6f42c1', '#20c997'];
        const index = name.length % colors.length;
        return colors[index];
    };

    return (
        <div className="notifications-item ">
            <div
                className="rounded me-3 border d-flex align-items-center justify-content-center text-white fw-bold"
                style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: getAvatarColor(patientName),
                    fontSize: '14px'
                }}
            >
                {getAvatarInitials(patientName)}
            </div>
            <div className="notifications-desc flex-grow-1">
                <div className="d-flex align-items-start justify-content-between">
                    <div className="flex-grow-1">
                        <div className="font-body text-truncate-2-line text-decoration-none">
                            <span className="fw-semibold text-dark">{patientName}</span>
                            <span className="text-muted"> - {notification.message.split('from')[0]}</span>
                        </div>

                        {/* Appointment details */}
                        {(appointmentDetails.date || appointmentDetails.time) && (
                            <div className="mt-1 text-muted d-flex align-items-center" style={{ fontSize: '12px' }}>
                                <FiCalendar size={12} className="me-1" />
                                {appointmentDetails.date}
                                {appointmentDetails.time && ` at ${appointmentDetails.time}`}
                            </div>
                        )}

                        <div className="d-flex justify-content-between align-items-center mt-2">
                            <div className="notifications-date text-muted border-bottom border-bottom-dashed">
                                {formatTimeAgo(notification.created_at)}
                            </div>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-1 ms-2">
                        <button
                            className="btn btn-sm btn-outline-success p-1"
                            data-bs-toggle="tooltip"
                            title="Mark as Read"
                            onClick={() => markAsRead(notification.id)}
                        >
                            <FiCheck size={12} />
                        </button>
                        <button
                            className="btn btn-sm btn-outline-danger p-1"
                            data-bs-toggle="tooltip"
                            title="Dismiss"
                        >
                            <FiX size={12} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationsModal;