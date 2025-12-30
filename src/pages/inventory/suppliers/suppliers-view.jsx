import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FiArrowLeft,
    FiEdit3,
    FiTrash2,
    FiTruck,
    FiUser,
    FiPhone,
    FiMail,
    FiMapPin,
    FiCalendar,
    FiDollarSign,
    FiFileText,
    FiActivity,
    FiPackage,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle
} from 'react-icons/fi';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import { useSuppliers } from '../../../contentApi/SuppliersProvider';
import SuppliersEditModal from './suppliers-edit';

const SuppliersView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { suppliers, deleteSupplier, getSupplier } = useSuppliers();
    const [supplier, setSupplier] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);

    useEffect(() => {
        const fetchSupplierDetails = async () => {
            try {
                setLoading(true);
                // First try to find in local state
                const localSupplier = suppliers.find(s => String(s.id) === String(id));
                if (localSupplier) {
                    setSupplier(localSupplier);
                } else {
                    // If not found locally, fetch from API
                    const fetchedSupplier = await getSupplier(id);
                    if (fetchedSupplier) {
                        setSupplier(fetchedSupplier);
                    } else {
                        toast.error('Supplier not found');
                        navigate('/inventory/suppliers/suppliers-list');
                    }
                }
            } catch (error) {
                console.error('Error fetching supplier:', error);
                // toast.error('Failed to load supplier details');
                navigate('/inventory/suppliers/suppliers-list');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchSupplierDetails();
        }
    }, [id, suppliers, getSupplier, navigate]);

    const handleEdit = () => {
        setIsEditOpen(true);
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
            deleteSupplier(id);
            toast.success('Supplier deleted successfully!');
            navigate('/inventory/suppliers/suppliers-list');
        }
    };

    const handleBack = () => {
        navigate('/inventory/suppliers/suppliers-list');
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

    if (!supplier) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                    <FiTruck size={48} className="text-muted mb-3" />
                    <h5 className="text-muted">Supplier not found</h5>
                    <button className="btn btn-primary mt-3" onClick={handleBack}>
                        <FiArrowLeft className="me-2" />
                        Back to Suppliers
                    </button>
                </div>
            </div>
        );
    }

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return <FiCheckCircle className="text-success" />;
            case 'inactive':
                return <FiXCircle className="text-danger" />;
            case 'pending':
                return <FiAlertCircle className="text-warning" />;
            default:
                return <FiActivity className="text-muted" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'success';
            case 'inactive':
                return 'danger';
            case 'pending':
                return 'warning';
            default:
                return 'secondary';
        }
    };

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center justify-content-between w-100 gap-2">
                    <div className="d-flex align-items-center gap-3">
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
                    {/* Supplier Header Card */}
                    <div className="col-12 mb-4">
                        <div className="card">
                            <div className="card-body">
                                <div className="row align-items-center">
                                    <div className="col-md-8">
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-text avatar-xl bg-primary text-white me-4">
                                                {supplier.supplier_name?.charAt(0)?.toUpperCase() || 'S'}
                                            </div>
                                            <div>
                                                <h3 className="mb-1 fw-bold">{supplier.supplier_name || 'Unknown Supplier'}</h3>
                                                <p className="text-muted mb-2">
                                                    <FiUser className="me-2" />
                                                    {supplier.supplier_contact || supplier.supplier_contact || 'No contact person'}
                                                </p>
                                                <div className="d-flex align-items-center">
                                                    {getStatusIcon(supplier.status)}
                                                    <span className={`badge bg-soft-${getStatusColor(supplier.status)} text-${getStatusColor(supplier.status)} ms-2`}>
                                                        {supplier.status || 'Unknown'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4 text-md-end">
                                        <div className="text-muted">
                                            <small>
                                                <FiCalendar className="me-1" />
                                                Created: {supplier.created_at ? new Date(supplier.created_at).toLocaleDateString() : 'N/A'}
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
                                            <span>{supplier.supplier_email || 'Not provided'}</span>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label text-muted fw-medium">Phone Number</label>
                                        <div className="d-flex align-items-center">
                                            <FiPhone className="text-muted me-2" />
                                            <span>{supplier.supplier_contact || 'Not provided'}</span>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label text-muted fw-medium">Contact Person</label>
                                        <div className="d-flex align-items-center">
                                            <FiUser className="text-muted me-2" />
                                            <span>{supplier.contactPerson || supplier.contact || 'Not provided'}</span>
                                        </div>
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
                                        <label className="form-label text-muted fw-medium">Street Address</label>
                                        <p className="mb-0">{supplier.supplier_address || 'Not provided'}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-muted fw-medium">City</label>
                                        <p className="mb-0">{supplier.city || 'Not provided'}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-muted fw-medium">State</label>
                                        <p className="mb-0">{supplier.state || 'Not provided'}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-muted fw-medium">ZIP Code</label>
                                        <p className="mb-0">{supplier.zipCode || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Business Information */}
                    <div className="col-lg-6 mb-4">
                        <div className="card h-100">
                            <div className="card-header">
                                <h5 className="card-title mb-0">
                                    <FiFileText className="me-2" />
                                    Business Information
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label text-muted fw-medium">Tax ID / GST Number</label>
                                        <p className="mb-0">{supplier.tax_no || 'Not provided'}</p>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label text-muted fw-medium">Payment Terms</label>
                                        <div className="d-flex align-items-center">
                                            <FiDollarSign className="text-muted me-2" />
                                            <span>
                                                {supplier.payment_terms === 'COD'
                                                    ? 'Cash on Delivery'
                                                    : `${supplier.payment_terms || 'N/A'}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="col-lg-6 mb-4">
                        <div className="card h-100">
                            <div className="card-header">
                                <h5 className="card-title mb-0">
                                    <FiActivity className="me-2" />
                                    Quick Stats
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-6">
                                        <div className="text-center p-3 bg-light rounded">
                                            <FiPackage size={24} className="text-primary mb-2" />
                                            <h4 className="mb-1">0</h4>
                                            <small className="text-muted">Products</small>
                                        </div>
                                    </div>
                                    <div className="col-6">
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
                                    <p className="text-muted mb-0">Activity will appear here once you start working with this supplier.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditOpen && (
                <SuppliersEditModal
                    isOpen={isEditOpen}
                    supplierId={id}
                    onClose={() => {
                        setIsEditOpen(false);
                        // Refresh supplier data after edit
                        const updatedSupplier = suppliers.find(s => String(s.id) === String(id));
                        if (updatedSupplier) {
                            setSupplier(updatedSupplier);
                        }
                    }}
                />
            )}
        </>
    );
};

export default SuppliersView;