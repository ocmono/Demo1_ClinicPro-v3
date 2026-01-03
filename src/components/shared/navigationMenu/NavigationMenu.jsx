import React, { useContext, useEffect, useState, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiSunrise, FiLogOut, FiUser, FiSettings, FiActivity, FiBell, FiCheck, FiMenu } from "react-icons/fi";
import PerfectScrollbar from "react-perfect-scrollbar";
import Menus from './Menus';
import './NavigationMenu.css';
import { NavigationContext } from '../../../contentApi/navigationProvider';
import { useAuth } from '@/contentApi/AuthContext';
import { useNotifications } from '@/context/NotificationContext';

const NavigationManu = () => {
    const { navigationOpen, setNavigationOpen, navigationExpend, setNavigationExpend } = useContext(NavigationContext)
    const pathName = useLocation().pathname
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotificationSidebar, setShowNotificationSidebar] = useState(false);
    const profileMenuRef = useRef(null);
    const notificationRef = useRef(null);
    const { user, logout } = useAuth();
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        isLoading,
        error
    } = useNotifications();
    useEffect(() => {
        setNavigationOpen(false)
    }, [pathName])
    const handleLogout = () => {
        logout();
        setNavigationOpen(false);
    }
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
            if (notificationRef.current &&
                !notificationRef.current.contains(event.target) &&
                !event.target.closest('.nav-notification-btn')) {
                setShowNotificationSidebar(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const formatTimeAgo = (createdAt) => {
        if (!createdAt) return 'Recently';
        const created = new Date(createdAt);
        const now = new Date();
        const diffMs = now - created;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return created.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short'
        });
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'appointment':
                return '📅';
            case 'prescription':
                return '💊';
            case 'vaccine':
                return '💉';
            case 'patient':
                return '👤';
            default:
                return '🔔';
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'appointment':
                return '#0d6efd';
            case 'prescription':
                return '#198754';
            case 'vaccine':
                return '#ff6b35';
            case 'patient':
                return '#6f42c1';
            default:
                return '#6c757d';
        }
    };
    return (
        <>
        <nav className={`nxl-navigation ${navigationOpen ? "mob-navigation-active" : ""}`}>
            <div className="navbar-wrapper">
                <div className="m-header">
                    <Link to="/" className="b-brand">
                        {/* <!-- ========   change your logo hear   ============ --> */}
                        <img src="/images/logo-full-clinicpro.png" alt="logo" className="logo logo-lg clinicpro-logo" />
                        <img src="/images/logo-clinicpro.png" alt="logo" className="logo logo-sm" />
                    </Link>
                </div>

                <div className={`navbar-content`}>
                    <PerfectScrollbar>
                        <ul className="nxl-navbar">
                            <li className="nxl-item nxl-caption">
                                <label>Navigation</label>
                            </li>
                            <Menus />
                        </ul>
                            <div className="nav-user-profile mt-auto" ref={profileMenuRef}>
                                <div className="nav-user-content">
                                    {/* Left Side: User Avatar and Name (Full Sidebar) */}
                                    <div className="nav-user-info d-flex align-items-center cursor-pointer" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                                        <div className={`nav-user-avatar`}>
                                            <img
                                                src="/images/avatar/1.png"
                                                alt={user?.name || 'User'}
                                                className="img-fluid rounded-circle"
                                                style={{ width: '42px', height: '42px', objectFit: 'cover' }}
                                            />
                                        </div>
                                        {/* {!navigationExpend && ( */}
                                            <div className="nav-user-details ms-2">
                                                <div className="nav-user-name fw-semibold text-truncate"
                                                    style={{ maxWidth: '120px' }}>
                                                    {user?.name || user?.username || 'User'}
                                                </div>
                                                <div className="nav-user-role text-muted text-truncate mt-1"
                                                    style={{ fontSize: '11px', maxWidth: '120px' }}>
                                                    {user?.role ? user.role.replace('_', ' ').toUpperCase() : 'USER'}
                                                </div>
                                            </div>
                                        {/* )} */}
                                    </div>

                                    {/* Right Side: Icons */}
                                    <div className="nav-user-icons">
                                        <button
                                            className="nav-notification-btn btn btn-link text-muted position-relative"
                                            onClick={() => setShowNotificationSidebar(!showNotificationSidebar)}
                                            title="Notifications"
                                        >
                                            <FiBell size={20} />
                                            {unreadCount > 0 && (
                                                <span className="position-absolute translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px', minWidth: '18px', height: '18px', paddingTop: '3px', top: '5px', right: '-10px' }}>
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </span>
                                            )}
                                        </button>
                                        <button
                                            className="nav-user-logout btn btn-link text-muted"
                                            onClick={() => {
                                                const isMinimized = document.documentElement.classList.contains('minimenu');
                                                if (isMinimized) {
                                                    document.documentElement.classList.remove('minimenu');
                                                    setNavigationExpend(false);
                                                } else {
                                                    document.documentElement.classList.add('minimenu');
                                                    setNavigationExpend(true);
                                                }
                                            }}
                                            title={navigationExpend ? "Show full sidebar" : "Minimize sidebar"}
                                        >
                                            <FiMenu size={20} />
                                        </button>
                                    </div>
                                </div>
                                {showProfileMenu && (
                                    <div className="nav-profile-dropdown">
                                        <Link
                                            to="/profile/view"
                                            className="dropdown-item"
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <i className="me-2"><FiUser size={14} /></i>
                                            <span>Profile</span>
                                        </Link>
                                        <Link
                                            to="/settings/clinic"
                                            className="dropdown-item"
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <i className="me-2"><FiSettings size={14} /></i>
                                            <span>Settings</span>
                                        </Link>
                                        <Link to="/clinic/activity" className="dropdown-item">
                                            <i className="me-2"><FiActivity size={14} /></i>
                                            <span>Activity Feed</span>
                                        </Link>
                                        <div className="dropdown-divider"></div>
                                        <button
                                            className="dropdown-item text-danger"
                                            onClick={handleLogout}
                                        >
                                            <i className="me-2"><FiLogOut size={14} /></i>
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        {/* <div className="card text-center">
                            <div className="card-body">
                                <i className="fs-4 text-dark"><FiSunrise /></i>
                                <h6 className="mt-4 text-dark fw-bolder">Downloading Center</h6>
                                <p className="fs-11 my-3 text-dark">OCMONO is a production ready CRM to get started up and running easily.</p>
                                <Link to="#" className="btn btn-primary text-dark w-100">Download Now</Link>
                            </div>
                        </div> */}
                            {/* <div style={{ height: "18px" }}></div> */}
                    </PerfectScrollbar>
                </div>
            </div>
            <div onClick={() => setNavigationOpen(false)} className={`${navigationOpen ? "nxl-menu-overlay" : ""}`}></div>
            </nav>
            <div
                ref={notificationRef}
                className={`notification-sidebar ${showNotificationSidebar ? 'open' : ''}`}
            >
                <div className="notification-sidebar-header">
                    <div className="d-flex align-items-center justify-content-between">
                        <h5 className="mb-0">Notifications</h5>
                        <div className="d-flex align-items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={markAllAsRead}
                                >
                                    <FiCheck size={16} className='me-2' />
                                    Mark all read
                                </button>
                            )}
                            <button
                                className="btn btn-sm btn-link text-muted p-0"
                                onClick={() => setShowNotificationSidebar(false)}
                            >
                                <FiLogOut size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="mt-2">
                        <small className="text-muted">
                            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                        </small>
                    </div>
                </div>

                <div className="notification-sidebar-content">
                    <PerfectScrollbar>
                        {isLoading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="text-muted mt-2">Loading notifications...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-5">
                                <FiBell size={48} className="text-muted mb-3" />
                                <p className="text-danger">Failed to load notifications</p>
                                <button
                                    className="btn btn-sm btn-outline-primary mt-2"
                                    onClick={() => window.location.reload()}
                                >
                                    Retry
                                </button>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-5">
                                <FiBell size={48} className="text-muted mb-3" />
                                <p className="text-muted">No notifications</p>
                                <small className="text-muted">You're all caught up!</small>
                            </div>
                        ) : (
                            <div className="notification-list">
                                {notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div
                                            className="notification-icon"
                                            style={{ backgroundColor: `${getNotificationColor(notification.type)}20`, color: getNotificationColor(notification.type) }}
                                        >
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="notification-content">
                                            <div className="notification-title fw-semibold">
                                                {notification.title || 'Notification'}
                                            </div>
                                            <div className="notification-message text-muted">
                                                {notification.message || notification.description}
                                            </div>
                                            <div className="notification-time">
                                                {formatTimeAgo(notification.created_at || notification.createdAt)}
                                                {notification.patient_name && (
                                                    <span className="ms-2 text-primary">• {notification.patient_name}</span>
                                                )}
                                            </div>
                                        </div>
                                        {!notification.is_read && (
                                            <div className="notification-status">
                                                <span className="badge bg-danger"></span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </PerfectScrollbar>
                </div>

                {/* <div className="notification-sidebar-footer">
                    <Link
                        to="/notifications"
                        className="btn btn-outline-primary w-100"
                        onClick={() => setShowNotificationSidebar(false)}
                    >
                        View All Notifications
                    </Link>
                </div> */}
                {showNotificationSidebar && (
                    <div
                        className="notification-sidebar-overlay"
                        onClick={() => setShowNotificationSidebar(false)}
                    ></div>
                )}
            </div>
        </>
    )
}

export default NavigationManu