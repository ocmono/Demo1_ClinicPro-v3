import React, { useState, useEffect } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'
import { projectsData } from '@/utils/fackData/projectsData'
import ImageGroup from '@/components/shared/ImageGroup'
import HorizontalProgress from '@/components/shared/HorizontalProgress';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import EditProfileModal from '../modals/EditProfileModal';

const TabOverviewContent = () => {
    const [clinicDetails, setClinicDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
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
                setClinicDetails(data);
                setLastUpdated(new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                }));
            } else {
                console.log('No clinic details found');
            }
        } catch (error) {
            console.error('Error fetching clinic details:', error);
            // toast.error('Failed to load clinic details');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEditModal = () => {
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleUpdateClinic = (updatedData) => {
        setClinicDetails(updatedData);
    };

    // Generate dynamic information data based on clinic details
    const getInformationData = () => {
        if (!clinicDetails) {
            return [
                { label: 'Clinic Name', value: 'Not provided' },
                { label: 'Email Address', value: 'Not provided' },
                { label: 'Phone Number', value: 'Not provided' },
                { label: 'Address', value: 'Not provided' },
                { label: 'Website', value: 'Not provided' },
                { label: 'GST/Registration', value: 'Not provided' },
            ];
        }

        return [
            { label: 'Clinic Name', value: clinicDetails.name || 'Not provided' },
            { label: 'Email Address', value: clinicDetails.email || 'Not provided' },
            { label: 'Phone Number', value: clinicDetails.phone || 'Not provided' },
            { label: 'Address', value: clinicDetails.address || 'Not provided' },
            { label: 'Website', value: clinicDetails.website || 'Not provided' },
            { label: 'GST/Registration', value: clinicDetails.gst_no || 'Not provided' },
            { label: 'Business Type', value: 'Healthcare Clinic' },
            { label: 'Status', value: 'Active' },
            { label: 'Communication', value: 'Email, Phone' },
            { label: 'Allow Changes', value: 'YES' },
        ];
    };

    if (loading) {
        return (
            <div className="tab-pane fade show active p-4" id="overviewTab" role="tabpanel">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading clinic overview...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="tab-pane fade show active p-4"
            id="overviewTab"
            role="tabpanel"
        >
            <div className="about-section mb-5">
                <div className="mb-4 d-flex align-items-center justify-content-between">
                    <h5 className="fw-bold mb-0">Clinic About:</h5>
                    <button
                        onClick={fetchClinicDetails}
                        className="btn btn-sm btn-light-brand"
                    >
                        Refresh
                    </button>
                </div>
                {clinicDetails ? (
                    <>
                        <p>
                            <strong>{clinicDetails.name}</strong> is a modern healthcare facility dedicated to providing
                            comprehensive medical services to our community. We are committed to delivering high-quality
                            healthcare with a focus on patient care and satisfaction.
                        </p>
                        <p>
                            Our clinic offers a wide range of medical services and treatments, utilizing the latest
                            medical technologies and best practices. We maintain the highest standards of healthcare
                            delivery while ensuring a comfortable and welcoming environment for all our patients.
                        </p>
                        {clinicDetails.address && (
                            <p>
                                Located at <strong>{clinicDetails.address}</strong>, we are easily accessible and
                                serve patients from the surrounding areas. Our team of qualified healthcare professionals
                                is dedicated to providing personalized care tailored to each patient's needs.
                            </p>
                        )}
                    </>
                ) : (
                    <p className="text-muted">
                        Clinic information is not available. Please update your clinic details to display
                        comprehensive information about your healthcare facility.
                    </p>
                )}
            </div>
            <div className="profile-details mb-5">
                <div className="mb-4 d-flex align-items-center justify-content-between">
                    <h5 className="fw-bold mb-0">Clinic Details:</h5>
                    <button onClick={handleOpenEditModal} className="btn btn-sm btn-light-brand">
                        Edit Details
                    </button>
                </div>
                {getInformationData().map((item, index) => (
                    <div key={index} className={`row g-0 ${index === getInformationData().length - 1 ? 'mb-0' : 'mb-4'}`}>
                        <div className="col-sm-6 text-muted">{item.label}:</div>
                        <div className="col-sm-6 fw-semibold">
                            {item.label === 'Website' && item.value !== 'Not provided' ? (
                                <a
                                    href={item.value.startsWith('http') ? item.value : `https://${item.value}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-decoration-none"
                                >
                                    {item.value}
                                </a>
                            ) : item.label === 'Email Address' && item.value !== 'Not provided' ? (
                                <a
                                    href={`mailto:${item.value}`}
                                    className="text-decoration-none"
                                >
                                    {item.value}
                                </a>
                            ) : item.label === 'Phone Number' && item.value !== 'Not provided' ? (
                                <a
                                    href={`tel:${item.value}`}
                                    className="text-decoration-none"
                                >
                                    {item.value}
                                </a>
                            ) : (
                                item.value
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div
                className={`alert alert-dismissible mb-4 p-4 d-flex profile-overview-alert ${clinicDetails ? 'alert-soft-success-message' : 'alert-soft-warning-message'
                    }`}
                role="alert"
            >
                <div className="me-4 d-none d-md-block">
                    <FiAlertTriangle className='fs-1' />
                </div>
                <div>
                    <p className="fw-bold mb-1 text-truncate-1-line">
                        {clinicDetails
                            ? 'Clinic details are up to date!'
                            : 'Your clinic details have not been updated yet!!!'
                        }
                    </p>
                    <p className="fs-10 fw-medium text-uppercase text-truncate-1-line">
                        Last Update: <strong>{lastUpdated || '26 Dec, 2023'}</strong>
                    </p>
                    <button
                        onClick={handleOpenEditModal}
                        className={`btn btn-sm d-inline-block ${clinicDetails
                            ? 'bg-soft-success text-success'
                            : 'bg-soft-warning text-warning'
                            }`}
                    >
                        {clinicDetails ? 'Edit Details' : 'Update Now'}
                    </button>
                    <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="alert"
                        aria-label="Close"
                    />
                </div>
            </div>
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                clinicData={clinicDetails}
                onUpdate={handleUpdateClinic}
            />
            {/* <div className="project-section">
                <div className="mb-4 d-flex align-items-center justify-content-between">
                    <h5 className="fw-bold mb-0">Clinic Services:</h5>
                    <a href="#" className="btn btn-sm btn-light-brand">
                        View All
                    </a>
                </div>
                <div className="row">
                    {
                        projectsData.runningProjects.slice(0, 2).map(({ id, progress, project_logo, project_category, project_name, status, team_members, progress_color, badge_color }) => (
                            <div key={id} className="col-xxl-6 col-xl-12 col-md-6">
                                <div className="border border-dashed border-gray-5 rounded mb-4 md-lg-0">
                                    <div className="p-4">
                                        <div className="d-sm-flex align-items-center">
                                            <div className="wd-50 ht-50 p-2 bg-gray-200 rounded-2">
                                                <img
                                                    src={project_logo}
                                                    className="img-fluid"
                                                    alt=""
                                                />
                                            </div>
                                            <div className="ms-0 mt-4 ms-sm-3 mt-sm-0">
                                                <a href="#" className="d-block">
                                                    {project_name}
                                                </a>
                                                <div className="fs-12 d-block text-muted">{project_category}</div>
                                            </div>
                                        </div>
                                        <div className="my-4 text-muted text-truncate-2-line">
                                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias
                                            dolorem necessitatibus temporibus nemo commodi eaque dignissimos
                                            itaque unde hic, sed rerum doloribus possimus minima nobis porro
                                            facilis voluptatum atque asperiores perspiciatis saepe laboriosam
                                            rem cupiditate libero sit.
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div className="img-group lh-0 ms-3">
                                                <ImageGroup data={team_members} avatarStyle={"bg-soft-primary"} />
                                            </div>
                                            <div className={`badge ${badge_color}`}>
                                                {status}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-4 py-3 border-top border-top-dashed border-gray-5 d-flex justify-content-between gap-2">
                                        <div className="w-75 d-none d-md-block">
                                            <small className="mb-1 fs-11 fw-medium text-uppercase text-muted d-flex align-items-center justify-content-between">
                                                <span>Progress</span>
                                                <span>{progress}%</span>
                                            </small>
                                            <HorizontalProgress progress={progress} barColor={progress_color} />
                                        </div>
                                        <span className="mx-2 text-gray-400 d-none d-md-block">|</span>
                                        <a href="#" className="fs-12 fw-bold">
                                            View →
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div> */}
        </div>
    )
}

export default TabOverviewContent