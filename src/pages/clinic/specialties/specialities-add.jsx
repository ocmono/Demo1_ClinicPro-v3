import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import { FiArrowLeft, FiSave, FiX, FiBriefcase, FiInfo } from 'react-icons/fi';
import { useClinicManagement } from '../../../contentApi/ClinicMnanagementProvider';

const SpecialitiesAdd = () => {
  const navigate = useNavigate();
  const { addSpeciality } = useClinicManagement();
  const [formData, setFormData] = useState({
    speciality: '',
    description: '',
    category: 'Medical',
    appointmentDuration: '30',
    requirements: '',
    status: 'Active'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!formData.speciality.trim()) {
      toast.error('Please enter a specialty name');
      return;
    }

    if (formData.speciality.trim().length < 3) {
      toast.error('Specialty name must be at least 3 characters long');
      return;
    }

    if (formData.description && formData.description.trim().length > 500) {
      toast.error('Description cannot exceed 500 characters');
      return;
    }

    if (formData.requirements && formData.requirements.trim().length > 300) {
      toast.error('Requirements cannot exceed 300 characters');
      return;
    }

    // Prepare cleaned data
    const cleanedData = {
      ...formData,
      speciality: formData.speciality.trim(),
      description: formData.description.trim(),
      requirements: formData.requirements.trim()
    };

    try {
      await addSpeciality(cleanedData);
      toast.success('Specialty added successfully!');
      navigate('/clinic/specialities');
    } catch (error) {
      console.error('Error adding specialty:', error);
      toast.error('Failed to add specialty');
    }
  };

  const handleCancel = () => {
    navigate('/clinic/specialities');
  };

  return (
    <>
      <PageHeader>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <button 
              className="btn btn-icon btn-light"
              onClick={() => navigate('/clinic/specialities')}
            >
              <FiArrowLeft />
            </button>
            {/* <div>
              <h4 className="mb-1 fw-bold">Add New Specialty</h4>
              <p className="text-muted mb-0">Create a new medical specialty</p>
            </div> */}
          </div>
        </div>
      </PageHeader>
      
      <div className="main-content">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <div className="card shadow-sm">
              <div className="card-header bg-light border-bottom">
                <div className="d-flex align-items-center">
                  <div className="avatar-text user-avatar-text avatar-lg me-3 bg-primary">
                    <FiBriefcase size={24} className="text-white" />
                  </div>
                  <div>
                    <h5 className="mb-1 fw-bold">Specialty Information</h5>
                    <p className="text-muted mb-0">Enter the specialty details</p>
                  </div>
                </div>
              </div>
              
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="row g-4">
                    <div className="col-12">
                      <div className="form-group">
                        <label className="form-label fw-medium">
                          Specialty Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="speciality"
                          className="form-control"
                          value={formData.speciality}
                          onChange={handleChange}
                          placeholder="Enter specialty name (e.g., Cardiology, Neurology)"
                          required
                        />
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          Enter the full name of the medical specialty
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <div className="form-group">
                        <label className="form-label fw-medium">Description</label>
                        <textarea
                          name="description"
                          className="form-control"
                          rows={4}
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Enter a detailed description of the specialty, including common conditions treated and procedures performed"
                        />
                        <div className="d-flex justify-content-between">
                          <div className="form-text">
                            <FiInfo size={14} className="me-1" />
                            Provide a comprehensive description of the specialty
                          </div>
                          <small className="text-muted">
                            {formData.description.length}/500 characters
                          </small>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-medium">Category</label>
                        <select
                          name="category"
                          className="form-select"
                          value={formData.category}
                          onChange={handleChange}
                        >
                          <option value="Medical">Medical</option>
                          <option value="Surgical">Surgical</option>
                          <option value="Diagnostic">Diagnostic</option>
                          <option value="Therapeutic">Therapeutic</option>
                          <option value="Preventive">Preventive</option>
                        </select>
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          Select the primary category for this specialty
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-medium">Default Appointment Duration</label>
                        <select
                          name="appointmentDuration"
                          className="form-select"
                          value={formData.appointmentDuration}
                          onChange={handleChange}
                        >
                          <option value="15">15 minutes</option>
                          <option value="30">30 minutes</option>
                          <option value="45">45 minutes</option>
                          <option value="60">1 hour</option>
                          <option value="90">1.5 hours</option>
                          <option value="120">2 hours</option>
                        </select>
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          Typical duration for appointments in this specialty
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <div className="form-group">
                        <label className="form-label fw-medium">Prerequisites & Requirements</label>
                        <textarea
                          name="requirements"
                          className="form-control"
                          rows={3}
                          value={formData.requirements}
                          onChange={handleChange}
                          placeholder="Enter any specific requirements, qualifications, or prerequisites for this specialty"
                        />
                        <div className="d-flex justify-content-between">
                          <div className="form-text">
                            <FiInfo size={14} className="me-1" />
                            List any special requirements or qualifications needed
                          </div>
                          <small className="text-muted">
                            {formData.requirements.length}/300 characters
                          </small>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-medium">Status</label>
                        <select
                          name="status"
                          className="form-select"
                          value={formData.status}
                          onChange={handleChange}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Pending">Pending</option>
                        </select>
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          Active specialties will be available for doctor assignment
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="d-flex gap-3 mt-4 pt-4 border-top">
                    <button 
                      type="submit" 
                      className="btn btn-primary px-4"
                    >
                      <FiSave size={16} className='me-2' />
                      Add Specialty
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary px-4"
                      onClick={handleCancel}
                    >
                      <FiX size={16} className='me-2' />
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SpecialitiesAdd; 