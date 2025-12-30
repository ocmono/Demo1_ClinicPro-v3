import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useReceptionist } from "../../context/ReceptionistContext"
import { BsPatchCheckFill } from 'react-icons/bs'
import { FiEdit, FiMail, FiMapPin, FiPhone, FiUser, FiCalendar } from 'react-icons/fi'

const ReceptionistProfileContent = () => {
    const { id } = useParams();
    const { receptionists } = useReceptionist();
    const [activeTab, setActiveTab] = useState('overview');
    
    // Find the receptionist by ID
    const receptionist = receptionists.find(r => r.id == id);

    if (!receptionist) {
        return (
            <div className="col-12">
                <div className="card stretch stretch-full">
                    <div className="card-body">
                        <div className="text-center py-5">
                            <h6 className="text-muted">Receptionist not found</h6>
                            <p className="text-muted small">The receptionist you're looking for doesn't exist or has been removed.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const fullName = `${receptionist.firstName || ''} ${receptionist.lastName || ''}`.trim() || 'Not specified';
    // Use phone from receptionist data
    const phone = receptionist.phone || receptionist.mobile || 'Not specified';

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Active': { class: 'bg-success', text: 'Active' },
            'Inactive': { class: 'bg-secondary', text: 'Inactive' },
            'On Leave': { class: 'bg-warning', text: 'On Leave' }
        };
        const config = statusConfig[status] || statusConfig['Active'];
        return <span className={`badge ${config.class} small`}>{config.text}</span>;
    };

    const getGenderBadge = (gender) => {
        const genderConfig = {
            'Male': { class: 'bg-info-subtle text-info', text: 'Male' },
            'Female': { class: 'bg-warning-subtle text-warning', text: 'Female' },
            'Other': { class: 'bg-secondary-subtle text-secondary', text: 'Other' }
        };
        const config = genderConfig[gender] || genderConfig['Other'];
        return <span className={`badge ${config.class} small`}>{config.text}</span>;
    };

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'activity', label: 'Activity' },
        { id: 'settings', label: 'Settings' }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="p-4">
                        <h6 className="fw-bold mb-3">Personal Information</h6>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label text-muted small">Full Name</label>
                                <p className="fw-medium">{fullName || 'Not specified'}</p>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-muted small">Gender</label>
                                <p>{getGenderBadge(receptionist.gender)}</p>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-muted small">Email</label>
                                <p>
                                    <a href={`mailto:${receptionist.email}`} className="text-decoration-none">
                                        {receptionist.email || 'Not specified'}
                                    </a>
                                </p>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-muted small">Phone</label>
                                <p>
                                    <a href={`tel:${receptionist.phone}`} className="text-decoration-none">
                                        {receptionist.phone || 'Not specified'}
                                    </a>
                                </p>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-muted small">Status</label>
                                <p>{getStatusBadge(receptionist.status)}</p>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-muted small">Role</label>
                                <p className="fw-medium">Receptionist</p>
                            </div>
                        </div>
                    </div>
                );
            case 'activity':
                return (
                    <div className="p-4">
                        <h6 className="fw-bold mb-3">Recent Activity</h6>
                        <div className="text-center py-4">
                            <p className="text-muted">No activity data available</p>
                        </div>
                    </div>
                );
            case 'settings':
                return (
                    <div className="p-4">
                        <h6 className="fw-bold mb-3">Account Settings</h6>
                        <div className="text-center py-4">
                            <p className="text-muted">Settings functionality coming soon</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <div className="col-xxl-4 col-xl-6">
                <div className="card stretch stretch-full">
                    <div className="card-body">
                        <div className="mb-4 text-center">
                            <div className="wd-150 ht-150 mx-auto mb-3 position-relative">
                                <div className="avatar-image wd-150 ht-150 border border-5 border-gray-3">
                                    <div className="avatar-title bg-primary rounded-circle w-100 h-100 d-flex align-items-center justify-content-center text-white" style={{ fontSize: '3rem' }}>
                                        {fullName.substring(0, 1).toUpperCase()}
                                    </div>
                                </div>
                                <div className="wd-10 ht-10 text-success rounded-circle position-absolute translate-middle" style={{ top: "76%", right: "10px" }}>
                                    <BsPatchCheckFill size={16} />
                                </div>
                            </div>
                            <div className="mb-4">
                                <h6 className="fs-16 fw-bold d-block">{fullName}</h6>
                                <p className="fs-12 fw-normal text-muted d-block">Receptionist</p>
                                <div className="mt-2">
                                    {getStatusBadge(receptionist.status)}
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h6 className="fw-bold mb-3">Contact Information</h6>
                            <div className="hstack gap-3 mb-3">
                                <div className="avatar-text avatar-md bg-soft-primary text-primary">
                                    <FiMail size={16} />
                                </div>
                                <div className="flex-fill">
                                    <span className="d-block fw-medium">Email</span>
                                    <a href={`mailto:${receptionist.email}`} className="fs-12 text-muted text-decoration-none">
                                        {receptionist.email || 'Not specified'}
                                    </a>
                                </div>
                            </div>
                            <div className="hstack gap-3 mb-3">
                                <div className="avatar-text avatar-md bg-soft-success text-success">
                                    <FiPhone size={16} />
                                </div>
                                <div className="flex-fill">
                                    <span className="d-block fw-medium">Phone</span>
                                    <a href={`tel:${receptionist.phone}`} className="fs-12 text-muted text-decoration-none">
                                        {receptionist.phone || 'Not specified'}
                                    </a>
                                </div>
                            </div>
                            <div className="hstack gap-3">
                                <div className="avatar-text avatar-md bg-soft-info text-info">
                                    <FiUser size={16} />
                                </div>
                                <div className="flex-fill">
                                    <span className="d-block fw-medium">Gender</span>
                                    <span className="fs-12 text-muted">
                                        {receptionist.gender || 'Not specified'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-xxl-8 col-xl-6">
                <div className="card border-top-0">
                    <div className="card-header p-0">
                        <ul className="nav nav-tabs flex-wrap w-100 text-center customers-nav-tabs" id="receptionistTab" role="tablist">
                            {tabs.map((tab) => (
                                <li className="nav-item flex-fill border-top" role="presentation" key={tab.id}>
                                    <a
                                        className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                                        onClick={() => setActiveTab(tab.id)}
                                        type="button"
                                    >
                                        {tab.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="tab-content">
                        <div className="tab-pane fade show active">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ReceptionistProfileContent