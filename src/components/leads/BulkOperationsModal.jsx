import React, { useState } from 'react';
import { FiX, FiTrash2, FiEdit, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useLeads } from '../../context/LeadsContext';
import { detectDuplicates, calculateLeadScore } from '@/utils/leadIntegrations';

const BulkOperationsModal = ({ isOpen, onClose, selectedLeads, onBulkComplete }) => {
    const { bulkDeleteLeads, bulkUpdateLeads } = useLeads();
    const [operation, setOperation] = useState('delete'); // 'delete' or 'update'
    const [updateData, setUpdateData] = useState({
        leadStatus: '',
        leadSource: '',
        campaignId: ''
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen || selectedLeads.length === 0) return null;

    const handleBulkDelete = async () => {
        setLoading(true);
        try {
            const leadIds = selectedLeads.map(lead => lead.id || lead._id);
            const result = await bulkDeleteLeads(leadIds);
            toast.success(`Successfully deleted ${result.successCount} lead(s)`);
            if (result.errorCount > 0) {
                toast.warning(`${result.errorCount} lead(s) failed to delete`);
            }
            onBulkComplete();
            onClose();
        } catch (error) {
            console.log(`Bulk delete failed: ${error.message}`);
            // toast.error(`Bulk delete failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleBulkUpdate = async () => {
        if (!updateData.leadStatus && !updateData.leadSource && !updateData.campaignId) {
            toast.error('Please select at least one field to update');
            return;
        }

        setLoading(true);
        try {
            const updates = selectedLeads.map(lead => ({
                id: lead.id || lead._id,
                data: {
                    ...lead,
                    ...(updateData.leadStatus && { leadStatus: updateData.leadStatus }),
                    ...(updateData.leadSource && { leadSource: updateData.leadSource }),
                    ...(updateData.campaignId && { campaignId: updateData.campaignId })
                }
            }));

            const result = await bulkUpdateLeads(updates);
            toast.success(`Successfully updated ${result.successCount} lead(s)`);
            if (result.errorCount > 0) {
                toast.warning(`${result.errorCount} lead(s) failed to update`);
            }
            onBulkComplete();
            onClose();
        } catch (error) {
            // toast.error(`Bulk update failed: ${error.message}`);
            console.log(`Bulk update failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Check for duplicates in selected leads
    const duplicateInfo = selectedLeads.length > 1 ? detectDuplicates(selectedLeads, selectedLeads[0]) : null;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Bulk Operations</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="modal-body">
                        <div className="alert alert-info mb-3">
                            <strong>{selectedLeads.length} lead(s)</strong> selected for bulk operation
                        </div>

                        {duplicateInfo && duplicateInfo.hasDuplicates && (
                            <div className="alert alert-warning mb-3">
                                <strong>Warning:</strong> {duplicateInfo.count} duplicate(s) detected in selected leads
                            </div>
                        )}

                        <div className="mb-3">
                            <label className="form-label">Operation Type</label>
                            <div className="btn-group w-100" role="group">
                                <input
                                    type="radio"
                                    className="btn-check"
                                    name="operation"
                                    id="operationDelete"
                                    checked={operation === 'delete'}
                                    onChange={() => setOperation('delete')}
                                />
                                <label className="btn btn-outline-danger" htmlFor="operationDelete">
                                    <FiTrash2 className="me-1" />
                                    Delete
                                </label>

                                <input
                                    type="radio"
                                    className="btn-check"
                                    name="operation"
                                    id="operationUpdate"
                                    checked={operation === 'update'}
                                    onChange={() => setOperation('update')}
                                />
                                <label className="btn btn-outline-primary" htmlFor="operationUpdate">
                                    <FiEdit className="me-1" />
                                    Update
                                </label>
                            </div>
                        </div>

                        {operation === 'update' && (
                            <div className="mb-3">
                                <label className="form-label">Update Status (Optional)</label>
                                <select
                                    className="form-select"
                                    value={updateData.leadStatus}
                                    onChange={(e) => setUpdateData({ ...updateData, leadStatus: e.target.value })}
                                >
                                    <option value="">-- Keep Current --</option>
                                    <option value="New">New</option>
                                    <option value="Contacted">Contacted</option>
                                    <option value="Qualified">Qualified</option>
                                    <option value="Converted">Converted</option>
                                    <option value="Lost">Lost</option>
                                </select>
                            </div>
                        )}

                        {operation === 'update' && (
                            <div className="mb-3">
                                <label className="form-label">Update Source (Optional)</label>
                                <select
                                    className="form-select"
                                    value={updateData.leadSource}
                                    onChange={(e) => setUpdateData({ ...updateData, leadSource: e.target.value })}
                                >
                                    <option value="">-- Keep Current --</option>
                                    <option value="Website">Website</option>
                                    <option value="Referral">Referral</option>
                                    <option value="Social Media">Social Media</option>
                                    <option value="Google Ads">Google Ads</option>
                                    <option value="Facebook Ads">Facebook Ads</option>
                                    <option value="Email">Email</option>
                                    <option value="Phone">Phone</option>
                                </select>
                            </div>
                        )}

                        <div className="table-responsive" style={{ maxHeight: '200px' }}>
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Mobile</th>
                                        <th>Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedLeads.slice(0, 5).map((lead, index) => (
                                        <tr key={index}>
                                            <td>{lead.fullName || 'N/A'}</td>
                                            <td>{lead.mobile || 'N/A'}</td>
                                            <td>
                                                <span className="badge bg-info">
                                                    {calculateLeadScore(lead)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {selectedLeads.length > 5 && (
                                        <tr>
                                            <td colSpan="3" className="text-center text-muted">
                                                ... and {selectedLeads.length - 5} more
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className={`btn ${operation === 'delete' ? 'btn-danger' : 'btn-primary'}`}
                            onClick={operation === 'delete' ? handleBulkDelete : handleBulkUpdate}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {operation === 'delete' ? (
                                        <>
                                            <FiTrash2 className="me-1" />
                                            Delete {selectedLeads.length} Lead(s)
                                        </>
                                    ) : (
                                        <>
                                            <FiCheck className="me-1" />
                                            Update {selectedLeads.length} Lead(s)
                                        </>
                                    )}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkOperationsModal;


