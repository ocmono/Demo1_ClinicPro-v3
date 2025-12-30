import React, { useState, useEffect } from "react";
import Input from "@/components/shared/Input";
import TextArea from "@/components/shared/TextArea";
import Loading from "@/components/shared/Loading";
import { toast } from "react-toastify";
import { useLeads } from "../../context/LeadsContext";

const EditModalCampaign = ({ isOpen, onClose, campaign }) => {
  const { updateCampaign, loading } = useLeads();
  const [formData, setFormData] = useState({
    campaign: "",
    displayName: "",
    description: "",
    budget: "",
  });

  useEffect(() => {
    if (campaign) {
      setFormData({
        campaign: campaign.campaign || "",
        displayName: campaign.displayName || "",
        description: campaign.description || "",
        budget: campaign.budget || "",
      });
    }
  }, [campaign]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateCampaign(campaign.id || campaign._id, formData);
      toast.success("Campaign updated successfully!");
      onClose();
    } catch (error) {
      if (user.role === "super_Admin") {
        toast.error("Failed to update campaign");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            {loading && <Loading />}
            <div className="modal-header">
              <h5 className="modal-title">Edit Campaign</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <Input
                icon="feather-user"
                label="Campaign Name"
                name="campaign"
                value={formData.campaign}
                onChange={handleChange}
              />
              <Input
                icon="feather-type"
                label="Display Name"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
              />
              <TextArea
                icon="feather-file-text"
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
              <Input
                icon="feather-dollar-sign"
                label="Budget"
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Update Campaign
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditModalCampaign;
