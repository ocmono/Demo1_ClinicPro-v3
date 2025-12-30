import { FaFolderOpen, FaArchive, FaTrash, FaTimes } from 'react-icons/fa';

const DraftListModal = ({
  showDraftsList,
  setShowDraftsList,
  drafts,
  loadDraft,
  deleteDraft,
  formatDate,
  toast,
  setDrafts
}) => {
  if (!showDraftsList) return null;

  return (
    <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header text-white" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <h5 className="modal-title d-flex align-items-center">
              <FaFolderOpen className="me-2" />
              Saved Drafts ({drafts.length})
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white"
              onClick={() => setShowDraftsList(false)}
            ></button>
          </div>
          <div className="modal-body">
            {drafts.length === 0 ? (
              <div className="text-center py-5">
                <FaArchive className="display-4 text-muted mb-3" />
                <h5 className="text-muted">No drafts saved</h5>
                <p className="text-muted">Your saved drafts will appear here</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drafts.map((draft) => (
                      <tr key={draft.id}>
                        <td>
                          <strong>{draft.customerName}</strong>
                        </td>
                        <td>
                          <span className="badge bg-primary">{draft.cart.length} items</span>
                        </td>
                        <td>
                          <strong className="text-success">₹{draft.total.toFixed(2)}</strong>
                        </td>
                        <td>
                          <small className="text-muted">{formatDate(draft.createdAt)}</small>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary d-flex align-items-center"
                              onClick={() => loadDraft(draft)}
                              title="Load this draft"
                            >
                              <FaFolderOpen className="me-1" />
                              Load
                            </button>
                            <button
                              className="btn btn-outline-danger d-flex align-items-center"
                              onClick={() => deleteDraft(draft.id)}
                              title="Delete this draft"
                            >
                              <FaTrash className="me-1" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setShowDraftsList(false)}
            >
              Close
            </button>
            {drafts.length > 0 && (
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete all drafts? This action cannot be undone.')) {
                    localStorage.removeItem('posDrafts');
                    setDrafts([]);
                    toast.info('All drafts deleted successfully');
                  }
                }}
              >
                <FaTrash className="me-1" />
                Delete All Drafts
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftListModal;