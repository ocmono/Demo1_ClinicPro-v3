import React, { useContext } from 'react'
import { FiX } from 'react-icons/fi'
import { NavLink, useLocation } from 'react-router-dom'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { SidebarContext } from '../../contentApi/sideBarToggleProvider'
import getIcon from '@/utils/getIcon'

const navItems = [
    { label: "Clinic Details", path: "/settings/clinic", icon: "tb-list" },
    // { label: "General", path: "/settings/ganeral", icon: "feather-airplay" },
    // { label: "SEO", path: "/settings/seo", icon: "feather-search" },
    // { label: "Tags", path: "/settings/tags", icon: "feather-tag" },
    { label: "Email", path: "/settings/email", icon: "feather-mail" },
    // { label: "Tasks", path: "/settings/tasks", icon: "feather-check-circle" },
    // { label: "Leads", path: "/settings/leads", icon: "feather-crosshair" },
    // { label: "Support", path: "/settings/support", icon: "feather-life-buoy" },
    // { label: "Finance", path: "/settings/finance", icon: "feather-dollar-sign" },
    { label: "Gateways", path: "/settings/gateways", icon: "feather-git-branch" },
    { label: "Supplier & Manufacturer", path: "/settings/supplier-manufacturer", icon: "feather-users" },
    // { label: "Localization", path: "/settings/localization", icon: "feather-globe" },
    // { label: "reCaptcha", path: "/settings/recaptcha", icon: "feather-shield" },
    // { label: "Miscellaneous", path: "/settings/miscellaneous", icon: "feather-cast" },
    { label: "Generate Link", path: "/settings/genrate-link", icon: "feather-link" },
    { label: "Messages", path: "/settings/cutsom-message", icon: "feather-custom-message" },
    { label: "Communication", path: "/settings/communication", icon: "feather-message-square" },
    // { label: "WhatsApp", path: "/settings/whatsapp", icon: "feather-message-square" },
    // { label: "Email Messaging", path: "/settings/email-messaging", icon: "feather-mail" },
    // { label: "SMS", path: "/settings/sms", icon: "feather-send" },
    { label: "GPT Integration", path: "/settings/gpt", icon: "feather-zap" },
    { label: "User Settings", path: "/settings/user-settings", icon: "ri-setting" },
    { label: "Date & Time Format", path: "/settings/user-datetimeformat", icon: "feather-calendar" },
    { label: "Change Password", path: "/settings/change-password", icon: "ri-password" },
]
const SettingSidebar = () => {

    const { sidebarOpen, setSidebarOpen } = useContext(SidebarContext)
    return (
        <div className={`content-sidebar content-sidebar-md ${sidebarOpen ? "app-sidebar-open" : ""} `}>
            <PerfectScrollbar>
                <div className="content-sidebar-header bg-white sticky-top hstack justify-content-between">
                    <h4 className="fw-bolder mb-0">Settings</h4>
                    <a href="#" className="app-sidebar-close-trigger d-flex" onClick={()=>setSidebarOpen(false)}>
                        <FiX size={16} />
                    </a>
                </div>
                <div className="content-sidebar-body">
                    <ul className="nav flex-column nxl-content-sidebar-item">
                        {
                            navItems.map(({ label, path, icon }, index) => (
                                <li key={index} className="nav-item">
                                    <NavLink
                                        className={({ isActive }) => `nav-link${isActive ? ' active fw-bold text-primary' : ''}`}
                                        to={path}
                                        end
                                    >
                                        <i className='lh-1 fs-16'>{getIcon(icon)} </i>
                                        <span>{label}</span>
                                    </NavLink>
                                </li>
                            ))
                        }
                    </ul>
                </div>
            </PerfectScrollbar>
        </div>

    )
}

export default SettingSidebar