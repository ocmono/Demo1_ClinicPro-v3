import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiArrowLeft,
    FiEdit3,
    FiTrash2,
    FiUser,
    FiPhone,
    FiMail,
    FiMapPin,
    FiCalendar,
    FiGlobe,
    FiFileText,
    FiActivity,
    FiPackage,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiAward
} from 'react-icons/fi';
import { MdOutlineFactory } from "react-icons/md";
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import { useManufacturers } from '../../../contentApi/ManufacturersProvider';
import ManufacturersEditModal from './manufacturers-edit';
import DeleteConfirmationModal from '../../../pages/clinic/settings/DeleteConfirmationModal';

const ManufacturersView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { manufacturers, deleteManufacturer, getManufacturer } = useManufacturers();
    const [manufacturer, setManufacturer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchManufacturerDetails = async () => {
            try {
                setLoading(true);
                // First try to find in local state
                const localManufacturer = manufacturers.find(m => String(m.id) === String(id));
                if (localManufacturer) {
                    setManufacturer(localManufacturer);
                } else {
                    // If not found locally, fetch from API
                    const fetchedManufacturer = await getManufacturer(id);
                    if (fetchedManufacturer) {
                        setManufacturer(fetchedManufacturer);
                    } else {
                        toast.error('Manufacturer not found');
                        navigate('/inventory/manufacturers/manufacturers-list');
                    }
                }
            } catch (error) {
                console.error('Error fetching manufacturer:', error);
                // toast.error('Failed to load manufacturer details');
                navigate('/inventory/manufacturers/manufacturers-list');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchManufacturerDetails();
        }
    }, [id, manufacturers, getManufacturer, navigate]);

    const handleEdit = () => {
        setIsEditOpen(true);
    };

    const handleDelete = () => {
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        try {
            setIsDeleting(true);
            await deleteManufacturer(id);
            toast.success('Manufacturer deleted successfully!');
            navigate('/inventory/manufacturers/manufacturers-list');
        } catch (error) {
            console.log('Failed to delete manufacturer');
            // toast.error('Failed to delete manufacturer');
        } finally {
            setIsDeleting(false);
            setIsDeleteOpen(false);
        }
    };

    const handleBack = () => {
        navigate('/inventory/manufacturers/manufacturers-list');
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!manufacturer) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                    <MdOutlineFactory size={48} className="text-muted mb-3" />
                    <h5 className="text-muted">Manufacturer not found</h5>
                    <button className="btn btn-primary mt-3" onClick={handleBack}>
                        <FiArrowLeft className="me-2" />
                        Back to Manufacturers
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center justify-content-between w-100 gap-2">
                    <div className="d-flex align-items-center gap-2">
                        <button 
                            className="btn btn-icon btn-light"
                            onClick={handleBack}
                        >
                            <FiArrowLeft size={15} />
                        </button>
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-primary"
                            onClick={handleEdit}
                        >
                            <FiEdit3 className="me-2" />
                            Edit
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={handleDelete}
                        >
                            <FiTrash2 className="me-2" />
                            Delete
                        </button>
                    </div>
                </div>
            </PageHeader>

            <div className="main-content">
                <div className="row">
                    {/* Manufacturer Header Card */}
                    <div className="col-12 mb-4">
                        <div className="card">
                            <div className="card-body">
                                <div className="row align-items-center">
                                    <div className="col-md-8">
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-text avatar-xl bg-primary text-white me-4">
                                                {manufacturer.name?.charAt(0)?.toUpperCase() || 'M'}
                                            </div>
                                            <div>
                                                <h3 className="mb-1 fw-bold">{manufacturer.name || 'Unknown Manufacturer'}</h3>
                                                <p className="text-muted mb-2">
                                                    <FiFileText className="me-2" />
                                                    Reg: {manufacturer.reg_no || 'Not provided'} |
                                                    License: {manufacturer.license_no || 'Not provided'}
                                                </p>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="d-flex align-items-center">
                                                        {manufacturer.mp_certified ? (
                                                            <FiCheckCircle className="text-success me-1" />
                                                        ) : (
                                                            <FiXCircle className="text-danger me-1" />
                                                        )}
                                                        <small className="text-muted">MP Certified</small>
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                        {manufacturer.o_certified ? (
                                                            <FiCheckCircle className="text-success me-1" />
                                                        ) : (
                                                            <FiXCircle className="text-danger me-1" />
                                                        )}
                                                        <small className="text-muted">O Certified</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4 text-md-end">
                                        <div className="text-muted">
                                            <small>
                                                <FiCalendar className="me-1" />
                                                Created: {manufacturer.created_at ? new Date(manufacturer.created_at).toLocaleDateString() : 'N/A'}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="col-lg-6 mb-4">
                        <div className="card h-100">
                            <div className="card-header">
                                <h5 className="card-title mb-0">
                                    <FiPhone className="me-2" />
                                    Contact Information
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label text-muted fw-medium">Email Address</label>
                                        <div className="d-flex align-items-center">
                                            <FiMail className="text-muted me-2" />
                                            <span>{manufacturer.email || 'Not provided'}</span>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label text-muted fw-medium">Phone Number</label>
                                        <div className="d-flex align-items-center">
                                            <FiPhone className="text-muted me-2" />
                                            <span>{manufacturer.phone || 'Not provided'}</span>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label text-muted fw-medium">Website</label>
                                        <div className="d-flex align-items-center">
                                            <FiGlobe className="text-muted me-2" />
                                            {manufacturer.website ? (
                                                <a
                                                    href={manufacturer.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary text-decoration-none"
                                                >
                                                    {manufacturer.website}
                                                </a>
                                            ) : (
                                                <span>Not provided</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Registration & License Information */}
                    <div className="col-lg-6 mb-4">
                        <div className="card h-100">
                            <div className="card-header">
                                <h5 className="card-title mb-0">
                                    <FiFileText className="me-2" />
                                    Registration & License
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label text-muted fw-medium">Registration Number</label>
                                        <p className="mb-0">{manufacturer.reg_no || 'Not provided'}</p>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label text-muted fw-medium">License Number</label>
                                        <p className="mb-0">{manufacturer.license_no || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="col-lg-6 mb-4">
                        <div className="card h-100">
                            <div className="card-header">
                                <h5 className="card-title mb-0">
                                    <FiMapPin className="me-2" />
                                    Address Information
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label text-muted fw-medium">Address</label>
                                        <p className="mb-0">{manufacturer.address || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Certifications */}
                    <div className="col-lg-6 mb-4">
                        <div className="card h-100">
                            <div className="card-header">
                                <h5 className="card-title mb-0">
                                    <FiAward className="me-2" />
                                    Certifications
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-12">
                                        <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
                                            <div className="d-flex align-items-center">
                                                {manufacturer.mp_certified ? (
                                                    <FiCheckCircle className="text-success me-2" />
                                                ) : (
                                                    <FiXCircle className="text-danger me-2" />
                                                )}
                                                <span className="fw-medium">MP Certified</span>
                                            </div>
                                            <span className={`badge ${manufacturer.mp_certified ? 'bg-success' : 'bg-danger'}`}>
                                                {manufacturer.mp_certified ? 'Certified' : 'Not Certified'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
                                            <div className="d-flex align-items-center">
                                                {manufacturer.o_certified ? (
                                                    <FiCheckCircle className="text-success me-2" />
                                                ) : (
                                                    <FiXCircle className="text-danger me-2" />
                                                )}
                                                <span className="fw-medium">O Certified</span>
                                            </div>
                                            <span className={`badge ${manufacturer.o_certified ? 'bg-success' : 'bg-danger'}`}>
                                                {manufacturer.o_certified ? 'Certified' : 'Not Certified'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="col-12 mb-4">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="card-title mb-0">
                                    <FiActivity className="me-2" />
                                    Quick Stats
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="text-center p-3 bg-light rounded">
                                            <FiPackage size={24} className="text-primary mb-2" />
                                            <h4 className="mb-1">0</h4>
                                            <small className="text-muted">Products</small>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="text-center p-3 bg-light rounded">
                                            <FiClock size={24} className="text-info mb-2" />
                                            <h4 className="mb-1">0</h4>
                                            <small className="text-muted">Orders</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="card-title mb-0">
                                    <FiActivity className="me-2" />
                                    Recent Activity
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="text-center py-5">
                                    <FiActivity size={48} className="text-muted mb-3" />
                                    <h6 className="text-muted">No recent activity</h6>
                                    <p className="text-muted mb-0">Activity will appear here once you start working with this manufacturer.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditOpen && (
                <ManufacturersEditModal
                    isOpen={isEditOpen}
                    manufacturerId={id}
                    onClose={() => {
                        setIsEditOpen(false);
                        // Refresh manufacturer data after edit
                        const updatedManufacturer = manufacturers.find(m => String(m.id) === String(id));
                        if (updatedManufacturer) {
                            setManufacturer(updatedManufacturer);
                        }
                    }}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Manufacturer"
                message="Are you sure you want to delete this manufacturer? This will also remove all associated data."
                itemName={manufacturer?.name}
                loading={isDeleting}
            />
        </>
    );
};

export default ManufacturersView;