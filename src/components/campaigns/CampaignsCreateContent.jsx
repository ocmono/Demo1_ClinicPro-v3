import React, { useState, useEffect, useCallback } from 'react';
import TextArea from '@/components/shared/TextArea';
import Loading from '@/components/shared/Loading';
import Input from '@/components/shared/Input';
import { toast } from "react-toastify";
import { useLeads } from '../../context/LeadsContext';

// Initial form state to avoid repetition
const INITIAL_FORM_STATE = {
  campaign: "",
  displayName: "",
  description: "",
  budget: "",
  startDate: "",
  endDate: "",
  platform: "meta",
  targetAudience: "",
  dailyBudget: "",
  status: "active",
};

const CampaignsCreateContent = ({ campaign = null, onSave = null, onCancel = null }) => {
  const { addCampaign, updateCampaign, loading } = useLeads();
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_STATE);
  }, []);

  // Update form data when campaign prop changes
  useEffect(() => {
    if (campaign) {
      setFormData({
        campaign: campaign.campaign || "",
        displayName: campaign.displayName || "",
        description: campaign.description || "",
        budget: campaign.budget || "",
        startDate: campaign.startDate || "",
        endDate: campaign.endDate || "",
        platform: campaign.platform || "meta",
        targetAudience: campaign.targetAudience || "",
        dailyBudget: campaign.dailyBudget || "",
        status: campaign.status || "active",
      });
    } else {
      resetForm();
    }
  }, [campaign, resetForm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.campaign?.trim() || !formData.displayName?.trim()) {
      toast.error("Campaign Name and Display Name are required");
      return;
    }

    try {
      if (campaign && onSave) {
        // Edit mode - use onSave callback
        await onSave(formData);
      } else if (campaign) {
        // Edit mode - direct update
        await updateCampaign(campaign.id, formData);
        toast.success("Campaign updated successfully!");
      } else {
        // Create mode
        await addCampaign(formData);
        toast.success("Campaign added successfully!");
        resetForm(); // Clear form after successful submission
      }
      
      // If not in create mode and no callback, reset form on edit
      if (campaign && !onSave) {
        resetForm();
      }
    } catch (error) {
      const errorMessage = campaign 
        ? "Failed to update campaign" 
        : "Failed to add campaign";
      toast.error(errorMessage);
      console.error("Campaign submission error:", error);
    }
  };

  return (
    <>
      {loading && <Loading />}
      <div className="col-lg-12">
        <form className="card stretch stretch-full" onSubmit={handleSubmit}>
          <div className="card-body general-info">
            <div className="mb-5 d-flex align-items-center justify-content-between">
              <h5 className="fw-bold mb-0 me-4">
                <span className="d-block mb-2">
                  {campaign ? 'Edit Campaign' : 'Create Campaign'}
                </span>
                <span className="fs-12 fw-normal text-muted text-truncate-1-line">
                  Launch a new Meta or Google ad campaign with advanced options.
                </span>
              </h5>
            </div>
            
            {/* Campaign Name */}
            <Input
              icon="feather-user"
              label="Campaign Name"
              labelId="campaignInput"
              placeholder="Campaign Name"
              value={formData.campaign}
              onChange={handleChange}
              name="campaign"
              required
            />
            
            {/* Display Name */}
            <Input
              icon="feather-type"
              label="Display Name"
              labelId="displayNameInput"
              placeholder="Display Name"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              required
            />
            
            {/* Description */}
            <TextArea
              icon="feather-file-text"
              label="Description"
              labelId="descriptionInput"
              placeholder="Campaign description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
            
            {/* Budget Section */}
            <div className="row">
              <div className="col-lg-6 mb-4">
                <Input
                  icon="feather-dollar-sign"
                  label="Total Budget"
                  labelId="budgetInput"
                  placeholder="Total Budget"
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-lg-6 mb-4">
                <Input
                  icon="feather-dollar-sign"
                  label="Daily Budget"
                  labelId="dailyBudgetInput"
                  placeholder="Daily Budget"
                  type="number"
                  name="dailyBudget"
                  value={formData.dailyBudget}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            {/* Platform & Status */}
            <div className="row">
              <div className="col-lg-6 mb-4">
                <label className="form-label">Platform</label>
                <select
                  className="form-select"
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                >
                  <option value="meta">Meta (Facebook/Instagram)</option>
                  <option value="google">Google Ads</option>
                  <option value="both">Both Platforms</option>
                </select>
              </div>
              <div className="col-lg-6 mb-4">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
            </div>
            
            {/* Date Range */}
            <div className="row">
              <div className="col-lg-6 mb-4">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-lg-6 mb-4">
                <label className="form-label">End Date (Optional)</label>
                <input
                  type="date"
                  className="form-control"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate}
                />
              </div>
            </div>
            
            {/* Target Audience */}
            <TextArea
              icon="feather-target"
              label="Target Audience"
              labelId="targetAudienceInput"
              placeholder="Describe your target audience (e.g., Age 25-45, Interested in healthcare)"
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleChange}
            />
            
            {/* Action Buttons */}
            <div className="mt-3 d-flex gap-3">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Processing...' : (campaign ? 'Update Campaign' : 'Create Campaign')}
              </button>
              {onCancel && (
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default CampaignsCreateContent;