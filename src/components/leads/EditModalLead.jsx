import React, { useState, useEffect } from "react";
import Input from "@/components/shared/Input";
import TextArea from "@/components/shared/TextArea";
import SelectDropdown from "@/components/shared/SelectDropdown";
import { leadsSourceOptions, leadsStatusOptions } from "@/utils/options";
import { toast } from "react-toastify";
import Loading from "@/components/shared/Loading";
import { useLeads } from "../../context/LeadsContext";

const EditModalLead = ({ isOpen, onClose, lead }) => {
    const { updateLead, campaigns, loading } = useLeads();
    const [formData, setFormData] = useState({
        campaignId: null,
        fullName: "",
        mobile: "",
        leadDate: "",
        leadSource: null,
        leadStatus: null,
        comments: "",
    });

    const campaignOptions = campaigns.map((c) => ({
        label: c.displayName,
        value: String(c.id),
    }));

    useEffect(() => {
  if (lead && campaigns.length) {
    const normalize = (val) => val?.toString().trim().toLowerCase();

    const matchedCampaign = campaigns.find(
      (c) => normalize(c.id) === normalize(lead.campaignId)
    );

    const matchedSource = leadsSourceOptions.find(
      (opt) => normalize(opt.value) === normalize(lead.leadSource)
    );

    const matchedStatus = leadsStatusOptions.find(
      (opt) => normalize(opt.value) === normalize(lead.leadStatus)
    );

    setFormData({
      campaignId: matchedCampaign
        ? { label: matchedCampaign.displayName, value: String(matchedCampaign.id) }
        : null,
      fullName: lead.fullName || "",
      mobile: lead.mobile || "",
      leadDate: lead.leadDate || new Date().toISOString().split("T")[0],
      leadSource: matchedSource || null,
      leadStatus: matchedStatus || null,
      comments: lead.comments || "",
    });
  }
}, [lead, campaigns]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateLead(lead.id || lead._id, {
                campaignId: formData.campaignId?.value,
                fullName: formData.fullName,
                mobile: formData.mobile,
                leadDate: formData.leadDate,
                leadSource: formData.leadSource?.value,
                leadStatus: formData.leadStatus?.value,
                comments: formData.comments,
            });
            toast.success("Lead updated successfully!");
            onClose();
        } catch (error) {
            console.log("Failed to update lead");
            // toast.error("Failed to update lead");
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
                            <h5 className="modal-title">Edit Lead</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-lg-4 mb-4">
                                    <label className="form-label">Status</label>
                                    <SelectDropdown
                                        label="Status"
                                        options={leadsStatusOptions}
                                        selectedOption={formData.leadStatus}
                                        onSelectOption={(option) =>
                                            setFormData((prev) => ({ ...prev, leadStatus: option }))
                                        }
                                    />
                                </div>
                                <div className="col-lg-4 mb-4">
                                    <label className="form-label">Campaign</label>
                                    <SelectDropdown
                                        label="Campaign"
                                        options={campaignOptions}
                                        selectedOption={formData.campaignId}
                                        onSelectOption={(option) =>
                                            setFormData((prev) => ({ ...prev, campaignId: option }))
                                        }
                                    />
                                </div>
                                <div className="col-lg-4 mb-4">
                                    <label className="form-label">Source</label>
                                    <SelectDropdown
                                        label="Source"
                                        options={leadsSourceOptions}
                                        selectedOption={formData.leadSource}
                                        onSelectOption={(option) =>
                                            setFormData((prev) => ({ ...prev, leadSource: option }))
                                        }
                                    />
                                </div>
                            </div>
                            <Input
                                icon="feather-user"
                                label="Full Name"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                            <Input
                                icon="feather-phone"
                                label="Mobile"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                            />
                            <div className="row mb-4 align-items-center">
                                <div className="col-lg-4">
                                    <label className="fw-semibold">Lead Date:</label>
                                </div>
                                <div className="col-lg-8">
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="leadDate"
                                        value={formData.leadDate}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <TextArea
                                icon="feather-tag"
                                label="Comments"
                                name="comments"
                                value={formData.comments}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Update Lead
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditModalLead;
