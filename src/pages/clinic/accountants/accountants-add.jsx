import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import { FiArrowLeft, FiSave, FiX, FiUser, FiMail, FiPhone, FiBriefcase, FiInfo, FiAward } from 'react-icons/fi';
import { useAccountant } from '../../../context/AccountantContext';

const AccountantsAdd = () => {
  const navigate = useNavigate();
  const { addAccountant } = useAccountant();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    qualification: '',
    experience: '',
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
    
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      await addAccountant(formData);
      toast.success('Accountant added successfully!');
      navigate('/clinic/accountants');
    } catch (error) {
      console.error('Error adding accountant:', error);
      // toast.error('Failed to add accountant');
    }
  };

  const handleCancel = () => {
    navigate('/clinic/accountants');
  };

  return (
    <>
      <PageHeader>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <button 
              className="btn btn-icon btn-light"
              onClick={() => navigate('/clinic/accountants')}
            >
              <FiArrowLeft />
            </button>
            <div>
              <h4 className="mb-1 fw-bold">Add New Accountant</h4>
              <p className="text-muted mb-0">Create a new accountant profile</p>
            </div>
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
                    <FiUser size={24} className="text-white" />
                  </div>
                  <div>
                    <h5 className="mb-1 fw-bold">Accountant Information</h5>
                    <p className="text-muted mb-0">Enter the accountant details</p>
                  </div>
                </div>
              </div>
              
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="row g-4">
                    {/* Personal Information Section */}
                    <div className="col-12">
                      <h6 className="fw-semibold mb-3 text-primary">
                        <FiUser className="me-2" />
                        Personal Information
                      </h6>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-medium">
                          First Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          className="form-control"
                          value={formData.first_name}
                          onChange={handleChange}
                          placeholder="Enter first name"
                          required
                        />
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          Enter the accountant's first name
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-medium">
                          Last Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          className="form-control"
                          value={formData.last_name}
                          onChange={handleChange}
                          placeholder="Enter last name"
                          required
                        />
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          Enter the accountant's last name
                        </div>
                      </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className="col-12">
                      <h6 className="fw-semibold mb-3 text-primary">
                        <FiPhone className="me-2" />
                        Contact Information
                      </h6>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-medium">
                          Email <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          className="form-control"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter email address"
                          required
                        />
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          This email will be used for login and notifications
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-medium">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          className="form-control"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Enter phone number"
                        />
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          Enter contact phone number
                        </div>
                      </div>
                    </div>

                    {/* Professional Information Section */}
                    <div className="col-12">
                      <h6 className="fw-semibold mb-3 text-primary">
                        <FiAward className="me-2" />
                        Professional Information
                      </h6>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-medium">Qualification</label>
                        <select
                          name="qualification"
                          className="form-select"
                          value={formData.qualification}
                          onChange={handleChange}
                        >
                          <option value="">Select Qualification</option>
                          <option value="CA">Chartered Accountant (CA)</option>
                          <option value="CPA">Certified Public Accountant (CPA)</option>
                          <option value="ACCA">Association of Chartered Certified Accountants (ACCA)</option>
                          <option value="B.Com">Bachelor of Commerce (B.Com)</option>
                          <option value="M.Com">Master of Commerce (M.Com)</option>
                          <option value="MBA">Master of Business Administration (MBA)</option>
                          <option value="Other">Other</option>
                        </select>
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          Select the accountant's professional qualification
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-medium">Experience (Years)</label>
                        <input
                          type="number"
                          name="experience"
                          className="form-control"
                          value={formData.experience}
                          onChange={handleChange}
                          placeholder="Enter years of experience"
                          min="0"
                          max="50"
                        />
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          Total years of professional experience
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
                        </select>
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          Active accountants can access the system
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
                      Add Accountant
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

export default AccountantsAdd; 