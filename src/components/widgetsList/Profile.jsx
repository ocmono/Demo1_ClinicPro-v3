import React, { useState, useEffect } from 'react'
import { BsPatchCheckFill } from 'react-icons/bs'
import { FiEdit, FiMail, FiMapPin, FiPhone, FiGlobe, FiFileText } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { IoRefreshOutline } from "react-icons/io5";
import EditProfileModal from '../modals/EditProfileModal'

const Profile = () => {
    const [clinicDetails, setClinicDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        fetchClinicDetails();
    }, []);

    const fetchClinicDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://bkdemo1.clinicpro.cc/clinic-details/get-details');

            if (response.ok) {
                const data = await response.json();
                console.log('Fetched clinic details:', data);
                setClinicDetails(data);
            } else {
                console.log('No clinic details found, response status:', response.status);
                // Keep default structure if no data found
            }
        } catch (error) {
            console.error('Error fetching clinic details:', error);
            // toast.error('Failed to load clinic details');
        } finally {
            setLoading(false);
        }
    };

    const handleEditProfile = () => {
        console.log('Opening edit modal with clinic data:', clinicDetails);
        setIsEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
    };

    const handleUpdateProfile = (updatedData) => {
        console.log('Profile updated with data:', updatedData);
        setClinicDetails(updatedData);
        // Refresh data from server to get the latest
        fetchClinicDetails();
    };

    if (loading) {
        return (
            <div className="card stretch stretch-full">
                <div className="card-body">
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (

        <div className="card stretch stretch-full">
            <div className="card-body">
                <div className="mb-4 text-center">
                    <div className="wd-150 ht-150 mx-auto mb-3 position-relative">
                        <div className="avatar-image wd-150 ht-150 border border-5 border-gray-3">
                            <img
                                key={clinicDetails?.logo || 'default'} // Force re-render when logo changes
                                src={clinicDetails?.logo || "/images/avatar/1.png"}
                                alt="img"
                                className="img-fluid"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                    console.log('Image load error, falling back to default');
                                    e.target.src = "/images/avatar/1.png";
                                }}
                            />
                        </div>
                        <div className="wd-10 ht-10 text-success rounded-circle position-absolute translate-middle" style={{ top: "76%", right: "10px" }}>
                            <BsPatchCheckFill size={16} />
                        </div>
                    </div>
                    <div className="mb-4">
                        <a href="#" className="fs-14 fw-bold d-block">{clinicDetails?.name || 'Clinic Name'}</a>
                        <a href="#" className="fs-12 fw-normal text-muted d-block">{clinicDetails?.email || 'clinic@example.com'}</a>
                    </div>
                    <div className="fs-12 fw-normal text-muted text-center d-flex flex-wrap gap-3 mb-4">
                        <div className="flex-fill py-3 px-4 rounded-1 d-none d-sm-block border border-dashed border-gray-5">
                            <h6 className="fs-15 fw-bolder">28.65K</h6>
                            <p className="fs-12 text-muted mb-0">Followers</p>
                        </div>
                        <div className="flex-fill py-3 px-4 rounded-1 d-none d-sm-block border border-dashed border-gray-5">
                            <h6 className="fs-15 fw-bolder">38.85K</h6>
                            <p className="fs-12 text-muted mb-0">Following</p>
                        </div>
                        <div className="flex-fill py-3 px-4 rounded-1 d-none d-sm-block border border-dashed border-gray-5">
                            <h6 className="fs-15 fw-bolder">43.67K</h6>
                            <p className="fs-12 text-muted mb-0">Engagement</p>
                        </div>
                    </div>
                </div>
                <ul className="list-unstyled mb-4">
                    <li className="hstack justify-content-between mb-4">
                        <span className="text-muted fw-medium hstack gap-3"><FiMapPin size={16} />Location</span>
                        <span className="float-end text-end" style={{ maxWidth: '60%' }}>
                            {clinicDetails?.address || 'Address not provided'}
                        </span>
                    </li>
                    <li className="hstack justify-content-between mb-4">
                        <span className="text-muted fw-medium hstack gap-3"><FiPhone size={16} />Phone</span>
                        <a href={`tel:${clinicDetails?.phone || ''}`} className="float-end">
                            {clinicDetails?.phone || 'Phone not provided'}
                        </a>
                    </li>
                    <li className="hstack justify-content-between mb-4">
                        <span className="text-muted fw-medium hstack gap-3"><FiMail size={16} />Email</span>
                        <a href={`mailto:${clinicDetails?.email || ''}`} className="float-end">
                            {clinicDetails?.email || 'Email not provided'}
                        </a>
                    </li>
                    {clinicDetails?.website && (
                        <li className="hstack justify-content-between mb-4">
                            <span className="text-muted fw-medium hstack gap-3"><FiGlobe size={16} />Website</span>
                            <a
                                href={clinicDetails.website.startsWith('http') ? clinicDetails.website : `https://${clinicDetails.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="float-end"
                            >
                                {clinicDetails.website}
                            </a>
                        </li>
                    )}
                    {clinicDetails?.gst && (
                        <li className="hstack justify-content-between mb-0">
                            <span className="text-muted fw-medium hstack gap-3"><FiFileText size={16} />GST/Registration</span>
                            <span className="float-end">{clinicDetails.gst}</span>
                        </li>
                    )}
                </ul>
                <div className="d-flex gap-2 text-center pt-4">
                    <button
                        onClick={fetchClinicDetails}
                        className="w-50 btn btn-light-brand"
                    >
                        <IoRefreshOutline size={16} className='me-2' />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={handleEditProfile}
                        className="w-50 btn btn-primary"
                    >
                        <FiEdit size={16} className='me-2' />
                        <span>Edit Profile</span>
                    </button>
                </div>
            </div>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={handleCloseModal}
                clinicData={clinicDetails}
                onUpdate={() => fetchClinicDetails()}
            />
        </div>
    )
}

export default Profile