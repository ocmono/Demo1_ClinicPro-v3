import { FaSave, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const SaveDraftModal = ({
  showDraftDialog,
  setShowDraftDialog,
  saveToDraft,
  customer,
  patients,
  cart,
  roundedTotal
}) => {
  if (!showDraftDialog) return null;

  return (
    <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header d-flex justify-content-between align-items-center bg-white" style={{ borderBottom: '1px solid #e5e7eb' }}>
            <h4 className="fw-bold d-flex align-items-center mb-0" style={{ color: '#2d3748' }}>
              <FaSave className="me-2" />
              Save as Draft
            </h4>
            <button 
              type="button" 
              className="btn-close"
              onClick={() => setShowDraftDialog(false)}
            ></button>
          </div>
          <div className="modal-body">
            <p className="d-flex align-items-center">
              <FaExclamationTriangle className="me-2 text-warning" />
              Are you sure you want to save this sale as draft?
            </p>
            <div className="alert alert-info">
              <strong>Draft Summary:</strong>
              <div className="mt-2">
                <div>Customer: {patients.find(p => p.id === customer)?.name || 'Unknown'}</div>
                <div>Items: {cart.length}</div>
                <div>Total Amount: ₹{roundedTotal.toFixed(2)}</div>
                <div>This will clear the current session for new customer.</div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary d-flex align-items-center"
              onClick={() => setShowDraftDialog(false)}
            >
              <FaTimes className="me-1" />
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-success d-flex align-items-center"
              onClick={() => {
                saveToDraft();
                setShowDraftDialog(false);
              }}
            >
              <FaSave className="me-1" />
              Save Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveDraftModal;